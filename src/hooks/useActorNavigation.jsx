import { useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const SESSION_KEYS = {
	CAME_FROM_LOGIN: 'cameFromLogin',
	PREVENT_BACK_TO_LOGIN: 'preventBackToLogin'
}

const useActorNavigation = (actor) => {
	const navigate = useNavigate()
	const location = useLocation()
	const listenerRef = useRef(null)

	const isInActorSpace = useMemo(() => {
		return location.pathname === `/${actor}` || location.pathname.startsWith(`/${actor}/`)
	}, [location.pathname, actor])

	const isMainActorPage = useMemo(() => {
		return location.pathname === `/${actor}` || location.pathname === `/${actor}/`
	}, [location.pathname, actor])

	const preventBackToLogin = useCallback((event) => {
		if (isMainActorPage) {
			event.preventDefault()
			window.history.pushState(null, '', location.pathname)
		}
	}, [location.pathname, isMainActorPage])

	useEffect(() => {
		if (!isInActorSpace) {
			if (listenerRef.current) {
				window.removeEventListener('popstate', listenerRef.current)
				listenerRef.current = null
			}
			return
		}

		const cameFromLogin = sessionStorage.getItem(SESSION_KEYS.CAME_FROM_LOGIN)
		if (cameFromLogin === 'true') {
			sessionStorage.removeItem(SESSION_KEYS.CAME_FROM_LOGIN)
			sessionStorage.setItem(SESSION_KEYS.PREVENT_BACK_TO_LOGIN, 'true')
		}

		const shouldPreventBack = sessionStorage.getItem(SESSION_KEYS.PREVENT_BACK_TO_LOGIN) === 'true'
		
		if (shouldPreventBack) {
			if (listenerRef.current) {
				window.removeEventListener('popstate', listenerRef.current)
			}

			window.addEventListener('popstate', preventBackToLogin)
			listenerRef.current = preventBackToLogin

			if (cameFromLogin === 'true' && isMainActorPage) {
				window.history.pushState(null, '', location.pathname)
			}
		}

		return () => {
			if (listenerRef.current) {
				window.removeEventListener('popstate', listenerRef.current)
				listenerRef.current = null
			}
		}
	}, [isInActorSpace, preventBackToLogin, location.pathname, isMainActorPage])

	const navigateWithHistory = useCallback((to, options = {}) => {
		if (to.includes('/login')) {
			sessionStorage.removeItem(SESSION_KEYS.PREVENT_BACK_TO_LOGIN)
			navigate(to, options)
			return
		}

		const isFromAuthPage = location.pathname.includes('/login') || location.pathname.includes('/auth-callback')
		const isToActorApp = to.includes(`/${actor}/`)

		if (isFromAuthPage && isToActorApp) {
			sessionStorage.setItem(SESSION_KEYS.CAME_FROM_LOGIN, 'true')
			navigate(to, { ...options, replace: true })
		} else {
			navigate(to, options)
		}
	}, [navigate, location.pathname, actor])

	return { navigateWithHistory }
}

export default useActorNavigation
