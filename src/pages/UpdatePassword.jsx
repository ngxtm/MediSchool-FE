import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { UserAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'

const UpdatePassword = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isRecoverySession, setIsRecoverySession] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const { updatePassword, signOut } = UserAuth()

  useEffect(() => {
    return () => {
      if (isRecoverySession) {
        supabase.auth.signOut().catch(console.error)
        sessionStorage.removeItem('recoveryToken')
        sessionStorage.removeItem('recoveryRefreshToken')
      }
    }
  }, [isRecoverySession])

  useEffect(() => {
    const checkSession = async () => {
      setInitialLoading(true)

      const hash = window.location.hash
      if (hash && hash.includes('type=recovery')) {
        try {
          const accessToken = hash.match(/access_token=([^&]*)/)?.[1]
          const refreshToken = hash.match(/refresh_token=([^&]*)/)?.[1] || ''

          if (!accessToken) {
            setError('Không tìm thấy token trong URL. Vui lòng yêu cầu link mới.')
            setInitialLoading(false)
            return false
          }

          sessionStorage.setItem('recoveryToken', accessToken)
          sessionStorage.setItem('recoveryRefreshToken', refreshToken)

          try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                apikey: import.meta.env.VITE_SUPABASE_ANON_KEY
              }
            })

            if (!response.ok) {
              throw new Error('Token không hợp lệ')
            }
          } catch (validationError) {
            console.error('Error validating token:', validationError)
            setError('Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.')
            setInitialLoading(false)
            return false
          }

          setIsRecoverySession(true)
          setInitialLoading(false)
          return true
        } catch (err) {
          console.error('Error processing recovery token:', err)

          if (err.message?.includes('network')) {
            setError('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.')
          } else {
            setError('Không thể xử lý token khôi phục. Vui lòng thử lại sau.')
          }

          setInitialLoading(false)
          return false
        }
      }

      if (location.state?.recovery) {
        setIsRecoverySession(true)
        setInitialLoading(false)
        return true
      }

      try {
        const { data, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !data.session) {
          setError('Bạn cần đăng nhập hoặc link reset đã hết hạn.')
          setInitialLoading(false)
          return false
        }
        setInitialLoading(false)
        return true
      } catch (error) {
        console.error('Error verifying session:', error)
        setError('Có lỗi xảy ra khi kiểm tra phiên đăng nhập.')
        setInitialLoading(false)
        return false
      }
    }

    checkSession()
  }, [location, navigate])

  const handleUpdatePassword = async e => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp')
      return
    }

    setLoading(true)

    try {
      let updateResult
      if (isRecoverySession) {
        const recoveryToken = sessionStorage.getItem('recoveryToken')
        const recoveryRefreshToken = sessionStorage.getItem('recoveryRefreshToken')

        if (!recoveryToken) {
          throw new Error('Token khôi phục không tồn tại')
        }

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: recoveryToken,
          refresh_token: recoveryRefreshToken
        })

        if (sessionError) {
          throw new Error('Không thể xác thực token khôi phục')
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        })

        if (updateError) {
          throw updateError
        }

        await supabase.auth.signOut()

        updateResult = { success: true }
      } else {
        updateResult = await updatePassword(newPassword)
      }

      if (updateResult.success) {
        setSuccess(true)

        if (!isRecoverySession) {
          await signOut()
        } else {
          sessionStorage.removeItem('recoveryToken')
          sessionStorage.removeItem('recoveryRefreshToken')
        }
        setTimeout(() => navigate('/login'), 3000)
      } else if (updateResult.error) {
        const errorMessage =
          typeof updateResult.error === 'string'
            ? updateResult.error
            : updateResult.error.message || 'Không thể cập nhật mật khẩu. Vui lòng thử lại sau.'
        setError(errorMessage)
      }
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : err.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
      setError(errorMessage)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-[#E8F4FB]">
        <div className="absolute top-0 left-0 z-20 p-6 sm:p-8">
          <p className="mb-1 text-2xl font-semibold text-gray-800 sm:text-3xl">MediSchool</p>
          <p className="text-xl font-semibold text-gray-800 sm:text-2xl">Thay đổi mật khẩu</p>
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              </div>
              <p className="text-gray-600">Đang xác thực...</p>
            </div>
          </div>
        </div>

        <footer className="absolute bottom-0 w-full py-3 text-center text-sm text-gray-600">
          {new Date().getFullYear()} MediSchool Bản quyền. Tất cả các quyền được bảo lưu.
        </footer>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#E8F4FB]">
      <div className="absolute top-0 left-0 z-20 p-6 sm:p-8">
        <p className="mb-1 text-2xl font-semibold text-gray-800 sm:text-3xl">MediSchool</p>
        <p className="text-xl font-semibold text-gray-800 sm:text-2xl">Thay đổi mật khẩu</p>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-4 text-center text-2xl font-bold text-gray-800">Thiết lập mật khẩu mới</h1>

          {success ? (
            <div className="mb-4 rounded-lg bg-green-100 p-4 text-sm text-green-700">
              Cập nhật mật khẩu thành công! Đang chuyển hướng đến trang đăng nhập...
            </div>
          ) : (
            (() => {
              const shouldShowError = error && !(typeof error === 'string' && error.includes('token'))
              return shouldShowError ? (
                <div className="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">
                  {typeof error === 'string' ? error : 'Có lỗi xảy ra'}
                </div>
              ) : null
            })()
          )}

          {error && typeof error === 'string' && error.includes('token') ? (
            <div className="text-center">
              <div className="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">{error}</div>
              <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Request a new reset link
              </a>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="mb-4">
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 text-gray-500" size={24} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2.5 pr-10 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="absolute right-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 text-gray-500" size={24} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2.5 pr-10 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="absolute right-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                className="w-full rounded-md bg-[#0A3D62] py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#093352] disabled:cursor-not-allowed disabled:bg-gray-400"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <a href="/login" className="text-sm text-blue-600 hover:underline">
              Quay lại trang đăng nhập
            </a>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-0 w-full py-3 text-center text-sm text-gray-600">
        {new Date().getFullYear()} MediSchool Bản quyền. Tất cả các quyền được bảo lưu.
      </footer>
    </div>
  )
}

export default UpdatePassword
