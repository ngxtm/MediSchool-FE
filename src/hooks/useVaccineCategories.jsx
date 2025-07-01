import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'

export const useVaccineCategories = () => {
	return useQuery({
		queryKey: ['vaccine-categories'],
		queryFn: async () => {
			try {
				return await api.get('/vaccines/categories')
			} catch (error) {
				console.log('🔍 New endpoint failed, trying old endpoint:', error.message)
				return await api.get('/vaccine-categories')
			}
		},
		staleTime: 1000 * 60 * 15,
		cacheTime: 1000 * 60 * 60,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false
	})
}