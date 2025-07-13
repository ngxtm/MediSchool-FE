import React from 'react'
import { useUserData } from '../hooks/useUserData'

const UserInfoTest = () => {
  const { user, loading, error } = useUserData()

  if (loading) {
    return <div>Loading user data...</div>
  }

  if (error) {
    return <div>Error loading user data: {error.message}</div>
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>User Data Test</h3>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}

export default UserInfoTest
