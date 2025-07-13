import { useState, useEffect } from 'react'
import api from '../utils/api'

export const useUserData = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/me')
      console.log('User data from backend:', response.data)
      setUser(response.data)
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError(err)
      setUser({
        fullName: 'User',
        email: 'user@example.com',
        role: 'USER'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const refreshUserData = () => {
    fetchUserData()
  }

  return {
    user,
    loading,
    error,
    refreshUserData
  }
}
