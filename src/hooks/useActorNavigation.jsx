import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const useActorNavigation = actor => {
	const location = useLocation()
	const navigate = useNavigate()

	useEffect(() => {
		const isOnHomePage = () => {
			const currentPath = location.pathname
			
			switch (actor) {
				case 'manager':
					return currentPath === '/manager' || currentPath === '/manager/home'
				case 'nurse':
					return currentPath === '/nurse' || currentPath === '/nurse/student'
				case 'parent':
					return currentPath === '/parent' || currentPath === '/parent/info'
				default:
					return false
			}
		}

		const handlePopState = (event) => {
			if (isOnHomePage()) {
				event.preventDefault()
				window.history.pushState(null, null, location.pathname)
			}
		}

		window.history.pushState(null, null, location.pathname)
		
		window.addEventListener('popstate', handlePopState)

		return () => {
			window.removeEventListener('popstate', handlePopState)
		}
	}, [location.pathname, actor])

	const navigateWithHistory = (to, options = {}) => {
		navigate(to, options)
	}

	return { navigateWithHistory }
}

export default useActorNavigation
