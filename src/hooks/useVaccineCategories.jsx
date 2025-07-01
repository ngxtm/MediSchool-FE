import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'

export const useVaccineCategories = () => {
	return useQuery({
		queryKey: ['vaccine-categories'],
		queryFn: async () => {
			return await api.get('/vaccines/categories')
		},
		staleTime: 1000 * 60 * 15,
		cacheTime: 1000 * 60 * 60,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false
	})
}
