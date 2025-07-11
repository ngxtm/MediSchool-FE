import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import api from '../utils/api'

const MESSAGES = {
  FETCH_ERROR: 'Lỗi khi tải danh sách người dùng',
  CREATE_SUCCESS: 'Tạo người dùng thành công',
  UPDATE_SUCCESS: 'Cập nhật người dùng thành công',
  SAVE_ERROR: 'Lỗi khi lưu người dùng',
  DELETE_SUCCESS: 'Xóa người dùng thành công',
  DELETE_ERROR: 'Lỗi khi xóa người dùng',
  RESTORE_SUCCESS: 'Khôi phục người dùng thành công',
  RESTORE_ERROR: 'Lỗi khi khôi phục người dùng',
  HARD_DELETE_SUCCESS: 'Xóa vĩnh viễn thành công khỏi cả Supabase và database local',
  REQUIRE_DELETE_REASON: 'Vui lòng nhập lý do xóa',
  IMPORT_SUCCESS: 'Import thành công',
  IMPORT_ERROR: 'Import thất bại. Vui lòng kiểm tra lại file Excel.'
}

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
}

export const useUserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/users', {
        params: {
          keyword: searchText,
          includeDeleted: includeDeleted
        }
      })
      setUsers(response.data)
    } catch (error) {
      message.error(MESSAGES.FETCH_ERROR)
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [searchText, includeDeleted])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const saveUser = useCallback(
    async (userData, isEdit = false, userId = null) => {
      try {
        if (isEdit && userId) {
          await api.put(`/admin/users/${userId}`, userData)
          message.success(MESSAGES.UPDATE_SUCCESS)
        } else {
          await api.post('/admin/users', userData)
          message.success(MESSAGES.CREATE_SUCCESS)
        }
        await fetchUsers()
        return { success: true }
      } catch (error) {
        message.error(MESSAGES.SAVE_ERROR)
        console.error('Error saving user:', error)
        return { success: false, error }
      }
    },
    [fetchUsers]
  )

  const softDeleteUser = useCallback(
    async (userId, reason) => {
      if (!reason?.trim()) {
        message.error(MESSAGES.REQUIRE_DELETE_REASON)
        return { success: false }
      }

      try {
        await api.delete(`/admin/users/${userId}`, {
          data: { reason: reason.trim() }
        })
        message.success(MESSAGES.DELETE_SUCCESS)
        await fetchUsers()
        return { success: true }
      } catch (error) {
        console.error('Error deleting user:', error)

        let errorMessage = MESSAGES.DELETE_ERROR
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          errorMessage = 'Không có quyền thực hiện thao tác này'
        } else if (error.response?.status === HTTP_STATUS.NOT_FOUND) {
          errorMessage = 'Không tìm thấy người dùng'
        } else if (error.response?.data?.message) {
          errorMessage = `Lỗi khi xóa người dùng: ${error.response.data.message}`
        }

        message.error(errorMessage)
        return { success: false, error }
      }
    },
    [fetchUsers]
  )

  const restoreUser = useCallback(
    async userId => {
      try {
        await api.post(`/admin/users/${userId}/restore`)
        message.success(MESSAGES.RESTORE_SUCCESS)
        await fetchUsers()
        return { success: true }
      } catch (error) {
        message.error(MESSAGES.RESTORE_ERROR)
        console.error('Error restoring user:', error)
        return { success: false, error }
      }
    },
    [fetchUsers]
  )

  const hardDeleteUser = useCallback(
    async userId => {
      try {
        const response = await api.delete(`/admin/users/${userId}/hard`)

        const { data } = response
        if (data?.success === true) {
          message.success(data.message || MESSAGES.HARD_DELETE_SUCCESS)
        } else if (response.status >= 200 && response.status < 300) {
          message.success(MESSAGES.HARD_DELETE_SUCCESS)
        } else {
          message.warning('Có thể đã xóa thành công, vui lòng kiểm tra danh sách')
        }

        await fetchUsers()
        return { success: true }
      } catch (error) {
        console.error('Hard delete error:', error)

        let errorMessage = 'Lỗi khi xóa vĩnh viễn người dùng'
        let showDetailedModal = false

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
          if (
            errorMessage.includes('Supabase') ||
            errorMessage.includes('permissions') ||
            errorMessage.includes('auth.users')
          ) {
            showDetailedModal = true
          }
        } else if (error.response?.status) {
          switch (error.response.status) {
            case HTTP_STATUS.UNAUTHORIZED:
              errorMessage = 'Không có quyền thực hiện thao tác này'
              break
            case HTTP_STATUS.FORBIDDEN:
              errorMessage = 'Bị cấm thực hiện thao tác này - kiểm tra quyền admin'
              break
            case HTTP_STATUS.NOT_FOUND:
              errorMessage = 'Không tìm thấy người dùng'
              break
            case HTTP_STATUS.INTERNAL_ERROR:
              errorMessage = 'Lỗi server - Có thể do vấn đề với Supabase Auth API'
              showDetailedModal = true
              break
            default:
              errorMessage = `Lỗi HTTP ${error.response.status}: ${error.response.statusText || 'Unknown error'}`
          }
        }

        try {
          await fetchUsers()
        } catch (refreshError) {
          console.error('Failed to refresh user list:', refreshError)
        }

        return {
          success: false,
          error,
          errorMessage,
          showDetailedModal
        }
      }
    },
    [fetchUsers]
  )

  const importUsersFromExcel = useCallback(
    async formData => {
      try {
        const response = await api.post('/admin/users/import', formData)
        await fetchUsers()
        return { success: true, data: response.data }
      } catch (error) {
        console.error('Import error:', error)

        let errorMessage = MESSAGES.IMPORT_ERROR
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }

        message.error(errorMessage)
        return { success: false, error, errorMessage }
      }
    },
    [fetchUsers]
  )

  return {
    users,
    loading,
    searchText,
    includeDeleted,

    setSearchText,
    setIncludeDeleted,

    fetchUsers,
    saveUser,
    softDeleteUser,
    restoreUser,
    hardDeleteUser,
    importUsersFromExcel
  }
}
