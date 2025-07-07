import { supabase } from './supabase'

export const clearExpiredSession = () => {
	try {
		const projectRef = supabase.supabaseUrl.split('https://')[1].split('.')[0]
		localStorage.removeItem(`sb-${projectRef}-auth-token`)
		sessionStorage.removeItem('tempSession')
		sessionStorage.removeItem('cameFromLogin')
		sessionStorage.removeItem('preventBackToLogin')
		localStorage.removeItem('rememberMePreference')
		localStorage.removeItem('intendedUrl')
		console.log('Cleared expired session storage')
	} catch (error) {
		console.error('Error clearing expired session:', error)
	}
}


export const hasStoredSession = () => {
	try {
		const projectRef = supabase.supabaseUrl.split('https://')[1].split('.')[0]
		const session = localStorage.getItem(`sb-${projectRef}-auth-token`)
		const tempSession = sessionStorage.getItem('tempSession')
		return !!(session || tempSession)
	} catch (error) {
		console.error('Error checking stored session:', error)
		return false
	}
} 