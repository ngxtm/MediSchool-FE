import React, { useState, useEffect, useCallback } from 'react'
import { Modal, Form, message, Select, Input as AntInput, Space } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import api from '../../utils/api'
import ConfirmDialog from '../../components/ConfirmDialog'
import { createColumns } from '../../components/user-table/columns'
import { DataTable } from '../../components/user-table/data-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
import ImportExcelModal from '@/components/ImportExcelModal'
import UserFormModal from '@/components/modals/UserFormModal'
import { errorToast, successToast } from '../../components/ToastPopup'

const { TextArea } = AntInput

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [searchText, setSearchText] = useState('')
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [form] = Form.useForm()
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [isHardDeleteModalVisible, setIsHardDeleteModalVisible] = useState(false)
  const [userToHardDelete, setUserToHardDelete] = useState(null)
  const [isImportModalVisible, setIsImportModalVisible] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/admin/users', {
        params: {
          keyword: searchText,
          includeDeleted: includeDeleted
        }
      })
      setUsers(response.data)
    } catch (error) {
      message.error('Lỗi khi tải danh sách người dùng')
      console.error('Error fetching users:', error)
    }
  }, [searchText, includeDeleted])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSubmit = async values => {
    try {
      if (isEdit) {
        const { password: _password, ...updateData } = values
        await api.put(`/admin/users/${currentUser.id}`, updateData)
        successToast('Cập nhật người dùng thành công', 'top-right', 4000)
        setIsModalVisible(false)
      } else {
        if (values.role === 'PARENT') {
          await api.post('/admin/parent-user', values)
          successToast('Tạo phụ huynh thành công', 'top-right', 4000)
          setIsModalVisible(false)
        } else if (values.password && values.password.trim() !== '') {
          await api.post('/admin/users/with-password', values)
          successToast('Tạo người dùng thành công', 'top-right', 4000)
          setIsModalVisible(false)
          try {
            await api.post('/activity-log', {
              actionType: 'CREATE',
              entityType: 'USER',
              description: `Tạo tài khoản cho người dùng mới`,
              details: `Tên: ${values.fullName}, Email: ${values.email}`
            })
          } catch (logErr) {
            console.error('Ghi log hoạt động thất bại:', logErr)
          }
        } else {
          const { password: _password, ...createData } = values
          await api.post('/admin/users', createData)
          successToast('Tạo người dùng thành công', 'top-right', 4000)
          setIsModalVisible(false)
          try {
            await api.post('/activity-log', {
              actionType: 'CREATE',
              entityType: 'USER',
              description: `Tạo tài khoản cho người dùng mới`,
              details: `Tên: ${values.fullName}, Email: ${values.email}`
            })
          } catch (logErr) {
            console.error('Ghi log hoạt động thất bại:', logErr)
          }
        }
      }
      fetchUsers()
      return { success: true }
    } catch (error) {
      errorToast(
        error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Lỗi khi lưu người dùng',
        'bottom-center'
      )
      return { success: false }
    }
  }

  const handleSoftDelete = user => {
    console.log('handleSoftDelete called for user:', user)
    setUserToDelete(user)
    setDeleteReason('')
    setIsDeleteModalVisible(true)
  }

  const handleDeleteConfirm = async () => {
    console.log('Delete confirm clicked, reason:', deleteReason)

    if (!deleteReason || deleteReason.trim() === '') {
      console.log('No reason provided, showing error')
      message.error('Vui lòng nhập lý do xóa')
      return
    }

    console.log('Sending delete request for user:', userToDelete.id)
    console.log('Request data:', { reason: deleteReason.trim() })

    try {
      const response = await api.delete(`/admin/users/${userToDelete.id}`, {
        data: { reason: deleteReason.trim() }
      })
      console.log('Delete response:', response)
      successToast('Xóa người dùng thành công', 'top-right', 4000)
      setIsDeleteModalVisible(false)
      setUserToDelete(null)
      setDeleteReason('')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user - full error:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)

      if (error.response?.status === 401) {
        errorToast('Không có quyền thực hiện thao tác này', 'top-right', 5000)
      } else if (error.response?.status === 404) {
        errorToast('Không tìm thấy người dùng', 'top-right', 5000)
      } else {
        errorToast(`Lỗi khi xóa người dùng: ${error.response?.data?.message || error.message}`, 'top-right', 5000)
      }
    }
  }

  const handleDeleteCancel = () => {
    console.log('Delete cancelled')
    setIsDeleteModalVisible(false)
    setUserToDelete(null)
    setDeleteReason('')
  }

  const handleRestore = async user => {
    try {
      await api.post(`/admin/users/${user.id}/restore`)
      successToast('Khôi phục người dùng thành công', 'top-right', 4000)
      fetchUsers()
    } catch (error) {
      errorToast('Lỗi khi khôi phục người dùng', 'top-right', 5000)
      console.error('Error restoring user:', error)
    }
  }

  const handleHardDelete = user => {
    console.log('🔥 handleHardDelete called with user:', user)
    setUserToHardDelete(user)
    setIsHardDeleteModalVisible(true)
  }

  const handleHardDeleteConfirm = async () => {
    const user = userToHardDelete
    console.log('🚀 === HARD DELETE CONFIRMED === onOk called for user:', user.id)

    try {
      console.log('📡 Making API call to:', `/admin/users/${user.id}/hard`)

      const startTime = Date.now()

      const response = await api.delete(`/admin/users/${user.id}/hard`)

      const endTime = Date.now()
      console.log(`✅ API Response received in ${endTime - startTime}ms:`, response)
      console.log('✅ Response status:', response.status)
      console.log('✅ Response statusText:', response.statusText)
      console.log('✅ Response headers:', response.headers)
      console.log('✅ Response data:', response.data)
      console.log('✅ Response data type:', typeof response.data)
      console.log('✅ Response data keys:', response.data ? Object.keys(response.data) : 'No data')

      const { data } = response
      if (response.status === 204) {
        console.log('✅ HTTP 204 - No Content (Success)')
        successToast('Xóa vĩnh viễn thành công', 'top-right', 4000)
      } else if (data && data.success === true) {
        console.log('✅ Explicit success from backend:', data.message)
        successToast(data.message || 'Xóa vĩnh viễn thành công khỏi cả Supabase và database local', 'top-right', 4000)
      } else if (response.status >= 200 && response.status < 300) {
        console.log('✅ HTTP success status, treating as successful')
        successToast('Xóa vĩnh viễn thành công', 'top-right', 4000)
      } else {
        console.warn('⚠️ Unexpected response format:', data)
        successToast('Có thể đã xóa thành công, vui lòng kiểm tra danh sách', 'top-right', 4000)
      }

      console.log('🔄 Refreshing user list...')
      await fetchUsers()
      console.log('✅ User list refreshed successfully')
    } catch (error) {
      console.error('❌ === HARD DELETE ERROR ===')
      console.error('❌ Full error object:', error)
      console.error('❌ Error name:', error.name)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)

      if (error.response) {
        console.error('❌ Response exists:', error.response)
        console.error('❌ Response status:', error.response.status)
        console.error('❌ Response statusText:', error.response.statusText)
        console.error('❌ Response headers:', error.response.headers)
        console.error('❌ Response data:', error.response.data)
      } else if (error.request) {
        console.error('❌ Request was made but no response:', error.request)
      } else {
        console.error('❌ Error setting up request:', error.message)
      }

      let errorMessage = 'Lỗi khi xóa vĩnh viễn người dùng'
      let showDetailedModal = false

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
        console.log('🔍 Using backend error message:', errorMessage)

        if (
          errorMessage.includes('Supabase') ||
          errorMessage.includes('permissions') ||
          errorMessage.includes('auth.users')
        ) {
          showDetailedModal = true
        }
      } else if (error.response?.status) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Không có quyền thực hiện thao tác này'
            break
          case 403:
            errorMessage = 'Bị cấm thực hiện thao tác này - kiểm tra quyền admin'
            break
          case 404:
            errorMessage = 'Không tìm thấy người dùng'
            break
          case 500:
            errorMessage = 'Lỗi server - Có thể do vấn đề với Supabase Auth API'
            showDetailedModal = true
            break
          default:
            errorMessage = `Lỗi HTTP ${error.response.status}: ${error.response.statusText || 'Unknown error'}`
            break
        }
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = 'Lỗi kết nối mạng - Kiểm tra kết nối internet và backend server'
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Timeout - Server phản hồi quá chậm'
      }

      console.log('📢 === SHOWING ERROR TOAST ===')
      console.log('📢 Error message:', errorMessage)
      console.log('📢 Error toast function:', typeof errorToast)
      errorToast(errorMessage, 'top-right', 5000)

      if (showDetailedModal) {
        console.log('🔍 Showing detailed error modal')
        Modal.error({
          title: 'Chi tiết lỗi xóa user',
          content: (
            <div>
              <p>
                <strong>Lỗi:</strong> {errorMessage}
              </p>
              {error.response?.data?.userId && (
                <p>
                  <strong>User ID:</strong> {error.response.data.userId}
                </p>
              )}
              <div
                style={{
                  marginTop: 16,
                  fontSize: '12px',
                  background: '#f5f5f5',
                  padding: '8px',
                  borderRadius: '4px'
                }}
              >
                <strong>Raw error:</strong>
                <br />
                {JSON.stringify(error.response?.data || error.message, null, 2)}
              </div>
              <div style={{ marginTop: 16 }}>
                <strong>Hướng dẫn khắc phục:</strong>
                <ul style={{ marginTop: 8 }}>
                  <li>Kiểm tra Service Role Key có quyền admin trên Supabase Dashboard</li>
                  <li>Xác nhận user tồn tại trong bảng auth.users</li>
                  <li>Kiểm tra logs backend để biết chi tiết</li>
                  <li>Thử refresh trang và kiểm tra lại danh sách user</li>
                </ul>
              </div>
            </div>
          ),
          width: 600
        })
      }

      console.log('🔄 Refreshing user list despite error...')
      try {
        await fetchUsers()
        console.log('✅ User list refreshed after error')
      } catch (refreshError) {
        console.error('❌ Failed to refresh user list:', refreshError)
        errorToast('Lỗi khi tải lại danh sách người dùng', 'top-right', 3000)
      }
    } finally {
      setIsHardDeleteModalVisible(false)
      setUserToHardDelete(null)
    }
  }

  const handleHardDeleteCancel = () => {
    console.log('❌ User cancelled hard delete confirmation')
    setIsHardDeleteModalVisible(false)
    setUserToHardDelete(null)
  }

  const handleImportExcel = async formData => {
    try {
      const response = await api.post('/admin/users/import', formData)
      console.log('User import response:', response.data)

      if (response.data.success) {
        fetchUsers()
        return response.data
      } else {
        return {
          success: false,
          message: response.data.message || 'Import không thành công',
          errorCount: response.data.errorCount || 0,
          errors: response.data.errors || []
        }
      }
    } catch (error) {
      console.error('Import error:', error)
      throw error
    }
  }

  const columns = createColumns({
    onEdit: user => {
      setCurrentUser(user)
      setIsEdit(true)
      form.setFieldsValue(user)
      setIsModalVisible(true)
    },
    onSoftDelete: handleSoftDelete,
    onRestore: handleRestore,
    onHardDelete: handleHardDelete
  })

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <CardHeader>
          <CardTitle>Quản lý người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <DataTable
              columns={columns}
              data={users}
              searchText={searchText}
              onSearchChange={setSearchText}
              includeDeleted={includeDeleted}
              onIncludeDeletedChange={setIncludeDeleted}
              onCreateUser={() => {
                setIsEdit(false)
                setCurrentUser(null)
                form.resetFields()
                setIsModalVisible(true)
              }}
              onImportExcel={() => {
                setIsImportModalVisible(true)
              }}
            />
          </TooltipProvider>
        </CardContent>
      </Card>

      <UserFormModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        onSubmit={handleSubmit}
        isEdit={isEdit}
        form={form}
        loading={false}
      />

      <Modal
        title="Xác nhận xóa người dùng"
        open={isDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        okType="danger"
        cancelText="Hủy"
        width={500}
        confirmLoading={false}
      >
        <div>
          <p style={{ marginBottom: 16 }}>
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
            Bạn có chắc muốn xóa người dùng <strong>{userToDelete?.fullName || userToDelete?.email}</strong>?
          </p>

          <div>
            <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>
              Lý do xóa <span style={{ color: 'red' }}>*</span>
            </label>
            <TextArea
              rows={3}
              placeholder="Nhập lý do xóa người dùng này..."
              value={deleteReason}
              onChange={e => {
                console.log('Reason input changed:', e.target.value)
                setDeleteReason(e.target.value)
              }}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={isHardDeleteModalVisible}
        onOpenChange={setIsHardDeleteModalVisible}
        title="CẢNH BÁO: Xóa vĩnh viễn"
        confirmText="XÓA VĨNH VIỄN"
        cancelText="Hủy"
        onConfirm={handleHardDeleteConfirm}
        onCancel={handleHardDeleteCancel}
        confirmButtonProps={{ variant: 'destructive' }}
      >
        <div className="space-y-4">
          <p className="font-semibold text-red-600">
            <strong>NGUY HIỂM:</strong> Hành động này sẽ xóa vĩnh viễn người dùng khỏi cả Supabase và database local!
          </p>
          <div className="space-y-2 rounded-lg bg-gray-50 p-4">
            <p>
              <strong>Người dùng:</strong> {userToHardDelete?.fullName || 'N/A'}
            </p>
            <p>
              <strong>Email:</strong> {userToHardDelete?.email}
            </p>
            <p>
              <strong>ID:</strong> {userToHardDelete?.id}
            </p>
          </div>
          <p className="text-sm text-red-600">
            <strong>Lưu ý:</strong> Nếu user vẫn còn trong auth.users của Supabase, quá trình sẽ thất bại để đảm bảo
            tính nhất quán dữ liệu.
          </p>
        </div>
      </ConfirmDialog>

      <ImportExcelModal
        isOpen={isImportModalVisible}
        onClose={() => setIsImportModalVisible(false)}
        onImport={handleImportExcel}
        title="Import người dùng từ Excel"
        type="user"
      />
    </div>
  )
}

export default UserManagement
