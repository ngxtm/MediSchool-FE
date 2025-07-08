import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import api from '../utils/api'
import Loading from '../components/Loading'
import { clearExpiredSession } from '../utils/auth'

const PrivateRouter = ({ children, requiredRole }) => {
	const [loading, setLoading] = useState(true)
	const [user, setUser] = useState(null)
	const location = useLocation()

	useEffect(() => {
		const checkUserRole = async () => {
			try {
				const projectRef = supabase.supabaseUrl.split('https://')[1].split('.')[0]
				const session = localStorage.getItem(`sb-${projectRef}-auth-token`)
				const tempSession = sessionStorage.getItem('tempSession')

				if (!session && !tempSession) {
					setLoading(false)
					return
				}

				const { data } = await api.get('/me')
				setUser(data)
				setLoading(false)
			} catch (error) {
				console.error('Error checking user role:', error)
				clearExpiredSession()
				setUser(null)
				setLoading(false)
			}
		}

		checkUserRole()
	}, [])

	const projectRef = supabase.supabaseUrl.split('https://')[1].split('.')[0]
	const session = localStorage.getItem(`sb-${projectRef}-auth-token`)
	const tempSession = sessionStorage.getItem('tempSession')

	if (!session && !tempSession) {
		const intendedUrl = location.pathname + location.search
		localStorage.setItem('intendedUrl', intendedUrl)
		return <Navigate to="/login" replace />
	}

	if (loading) {
		return <Loading />
	}

	if (requiredRole && user && user.role !== requiredRole) {
		return <Navigate to="/no-role" replace />
	}

	return children
}

export default PrivateRouter
