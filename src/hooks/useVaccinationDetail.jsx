import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import api from '../utils/api'

export function useVaccinationDetail(id) {
  // Fetch vaccination data
  const {
    data: vaccination,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['vaccination-history', id],
    queryFn: async () => {
      const { data } = await api.get(`/vaccination-history/${id}`)
      return data
    },
    enabled: !!id, // Only fetch if id exists
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error?.response?.status === 404) {
        return false
      }
      return failureCount < 2
    }
  })

  const eventId = vaccination?.eventId

  const { data: vaccineEvent } = useVaccineEvent(eventId)

  const statusDisplay = useMemo(() => {
    if (!vaccineEvent?.status) {
      return { text: 'Tiêm chủng ngoài trường', bgColor: 'bg-[#DAEAF7]' }
    }

    const today = new Date().toLocaleDateString()
    const vaccinationDate = vaccination?.vaccinationDate

    switch (vaccineEvent.status.toUpperCase()) {
      case 'APPROVED':
        if (vaccinationDate === today) {
          return { text: 'Đang diễn ra', bgColor: 'bg-[#DAEAF7]' }
        }
        return { text: 'Đã duyệt', bgColor: 'bg-[#DAEAF7]' }
      case 'PENDING':
        return { text: 'Chờ duyệt', bgColor: 'bg-[#FFF694]' }
      case 'CANCELLED':
        return { text: 'Đã hủy', bgColor: 'bg-[#FFCCCC]' }
      case 'COMPLETED':
        return { text: 'Hoàn thành', bgColor: 'bg-[#D1FAE5]' }
      default:
        return { text: 'Trạng thái lạ', bgColor: 'bg-[#DAEAF7]' }
    }
  }, [vaccination?.vaccinationDate, vaccineEvent?.status])

  return {
    vaccination,
    isLoading,
    error,
    statusDisplay,
    refetch
  }
}

export function useUserData() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/me')
      return data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })
}

export function useVaccineEvent(id) {
  return useQuery({
    queryKey: ['vaccine-event', id],
    queryFn: async () => {
      const { data } = await api.get(`/vaccine-events/${id}`)
      return data
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000
  })
}

export function useVaccineCategory(id) {
  return useQuery({
    queryKey: ['vaccine-category', id],
    queryFn: async () => {
      const { data } = await api.get(`/vaccine-categories/${id}`)
      return data
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000
  })
}

export function useStudentDetail(id) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      const { data } = await api.get(`/students/${id}`)
      return data
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000
  })
}
