import { useEffect, useRef } from 'react'
import { supabase } from '../utils/supabase'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const AuthCallback = () => {
	const navigate = useNavigate()
	const isProcessing = useRef(false)
	useEffect(() => {
		const handleRedirect = async () => {
			if (isProcessing.current) {
				return
			}
			isProcessing.current = true

			try {
				const rememberMePreference = localStorage.getItem('rememberMePreference') === 'true'
				const { data, error } = await supabase.auth.getSession()
				if (error || !data.session) {
					console.error('No session found in AuthCallback: ', error?.message)
					isProcessing.current = false
					navigate('/login')
					return
				}
				if (rememberMePreference) {
					const projectRef = supabase.supabaseUrl.split('https://')[1].split('.')[0]
					localStorage.setItem(`sb-${projectRef}-auth-token`, JSON.stringify(data.session))
				} else {
					sessionStorage.setItem('tempSession', JSON.stringify(data.session))
				}

				const { data: backendData } = await api.post('/auth/google-callback', {
					supabaseSession: data.session,
					rememberMe: rememberMePreference
				})

				if (!rememberMePreference) {
					const projectRef = supabase.supabaseUrl.split('https://')[1].split('.')[0]
					localStorage.removeItem(`sb-${projectRef}-auth-token`)
				}

				const role = backendData.user.role

				const intendedUrl = localStorage.getItem('intendedUrl')

				if (intendedUrl) {
					localStorage.removeItem('intendedUrl')
					const roleBasePaths = {
						NURSE: '/nurse',
						MANAGER: '/manager',
						ADMIN: '/admin',
						PARENT: '/parent'
					}

					if (intendedUrl.startsWith(roleBasePaths[role])) {
						navigate(intendedUrl, { replace: true })
						return
					}
				}

				switch (role) {
					case 'NURSE':
						navigate('/nurse', { replace: true })
						break
					case 'PARENT':
						navigate('/parent', { replace: true })
						break
					case 'ADMIN':
						navigate('/admin', { replace: true })
						break
					case 'MANAGER':
						navigate('/manager', { replace: true })
						break
					default:
						navigate('/no-role', { replace: true })
				}
			} catch (error) {
				console.error('❌ AuthCallback: Error during authentication:', error)
				isProcessing.current = false
				navigate('/login')
			}
		}
		handleRedirect()
	}, [navigate])

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<p className="text-lg text-gray-700">Đang xác thực, vui lòng chờ...</p>
		</div>
	)
}

export default AuthCallback
