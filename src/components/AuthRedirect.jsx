import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import api from '../utils/api'
import Loading from './Loading'
import { clearExpiredSession } from '../utils/auth'

const AuthRedirect = () => {
  const [loading, setLoading] = useState(true)
  const [redirectTo, setRedirectTo] = useState('/login')

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const projectRef = supabase.supabaseUrl.split('https://')[1].split('.')[0]
        const session = localStorage.getItem(`sb-${projectRef}-auth-token`)
        const tempSession = sessionStorage.getItem('tempSession')

        if (session || tempSession) {
          const { data: userData } = await api.get('/me')
          if (userData && userData.role) {
            switch (userData.role) {
              case 'NURSE':
                setRedirectTo('/nurse')
                break
              case 'MANAGER':
                setRedirectTo('/manager')
                break
              case 'ADMIN':
                setRedirectTo('/admin')
                break
              case 'PARENT':
                setRedirectTo('/parent')
                break
              default:
                setRedirectTo('/no-role')
            }
          } else {
            setRedirectTo('/login')
          }
        } else {
          setRedirectTo('/login')
        }
      } catch (error) {
        console.error('Error in AuthRedirect session check:', error)
        clearExpiredSession()
        setRedirectTo('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndRedirect()
  }, [])

  if (loading) {
    return <Loading />
  }

  return <Navigate to={redirectTo} replace />
}

export default AuthRedirect
