import { Outlet } from 'react-router-dom'
import ManagerTaskBar from './components/ManagerTaskbar'
import { useState } from 'react'
import api from '../../utils/api'
import { useEffect } from 'react'
import useActorNavigation from '../../hooks/useActorNavigation'
import Loading from '../../components/Loading'

const Manager = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useActorNavigation('manager')

  const fetchUser = async () => {
    try {
      setLoading(false)
      const { data } = await api.get('/me')
      setUser(data)
    } catch (err) {
      console.error('Error fetching user: ', err)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-[#eefdf8]">
      <ManagerTaskBar userData={user} />
      <div className="p-4">
        <div className="px-28 pt-5">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Manager
