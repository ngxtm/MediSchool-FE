import React, { useState } from 'react'
import { Form, Modal } from 'antd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
import { createColumns } from '../../components/user-table/columns'
import { DataTable } from '../../components/user-table/data-table'
import ConfirmDialog from '../../components/ConfirmDialog'
import ImportExcelModal from '@/components/ImportExcelModal'
import UserFormModal from '@/components/modals/UserFormModal'
import DeleteUserModal from '@/components/modals/DeleteUserModal'
import { useUserManagement } from '@/hooks/useUserManagement'

const UserManagementOptimized = () => {
  const {
    users,
    loading,
    searchText,
    includeDeleted,
    setSearchText,
    setIncludeDeleted,
    saveUser,
    softDeleteUser,
    restoreUser,
    hardDeleteUser,
    importUsersFromExcel
  } = useUserManagement()

  const [modals, setModals] = useState({
    userForm: { isVisible: false, isEdit: false, currentUser: null },
    delete: { isVisible: false, currentUser: null },
    hardDelete: { isVisible: false, currentUser: null },
    import: { isVisible: false }
  })

  const [form] = Form.useForm()

  const openModal = (modalName, data = {}) => {
    setModals(prev => ({
      ...prev,
      [modalName]: { ...prev[modalName], isVisible: true, ...data }
    }))
  }

  const closeModal = modalName => {
    setModals(prev => ({
      ...prev,
      [modalName]: { ...prev[modalName], isVisible: false }
    }))

    if (modalName === 'userForm') {
      form.resetFields()
      setModals(prev => ({
        ...prev,
        userForm: { isVisible: false, isEdit: false, currentUser: null }
      }))
    }
  }

  const handleCreateUser = () => {
    form.resetFields()
    openModal('userForm', { isEdit: false, currentUser: null })
  }

  const handleEditUser = user => {
    form.setFieldsValue(user)
    openModal('userForm', { isEdit: true, currentUser: user })
  }

  const handleSaveUser = async userData => {
    const { isEdit, currentUser } = modals.userForm
    return await saveUser(userData, isEdit, currentUser?.id)
  }

  const handleSoftDelete = user => {
    console.log('handleSoftDelete called with user:', user)
    openModal('delete', { currentUser: user })
  }

  const handleDeleteConfirm = async (userId, reason) => {
    console.log('handleDeleteConfirm called with userId:', userId, 'reason:', reason)
    const result = await softDeleteUser(userId, reason)
    console.log('softDeleteUser result:', result)
    return result
  }

  const handleRestore = async user => {
    return await restoreUser(user.id)
  }

  const handleHardDelete = user => {
    openModal('hardDelete', { currentUser: user })
  }

  const handleHardDeleteConfirm = async () => {
    const user = modals.hardDelete.currentUser
    const result = await hardDeleteUser(user.id)

    if (result.success) {
      closeModal('hardDelete')
    } else if (result.showDetailedModal) {
      Modal.error({
        title: 'Chi tiết lỗi xóa user',
        content: (
          <div>
            <p>
              <strong>Lỗi:</strong> {result.errorMessage}
            </p>
            {result.error?.response?.data?.userId && (
              <p>
                <strong>User ID:</strong> {result.error.response.data.userId}
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
              {JSON.stringify(result.error?.response?.data || result.error?.message, null, 2)}
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
  }

  const handleImportExcel = async formData => {
    return await importUsersFromExcel(formData)
  }

  const columns = createColumns({
    onEdit: handleEditUser,
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
              onCreateUser={handleCreateUser}
              onImportExcel={() => openModal('import')}
              loading={loading}
            />
          </TooltipProvider>
        </CardContent>
      </Card>

      <UserFormModal
        isVisible={modals.userForm.isVisible}
        onClose={() => closeModal('userForm')}
        onSubmit={handleSaveUser}
        isEdit={modals.userForm.isEdit}
        form={form}
        loading={loading}
      />

      <DeleteUserModal
        isVisible={modals.delete.isVisible}
        onClose={() => closeModal('delete')}
        onConfirm={handleDeleteConfirm}
        user={modals.delete.currentUser}
        loading={loading}
      />

      <ConfirmDialog
        open={modals.hardDelete.isVisible}
        onOpenChange={open => !open && closeModal('hardDelete')}
        title="CẢNH BÁO: Xóa vĩnh viễn"
        confirmText="XÓA VĨNH VIỄN"
        cancelText="Hủy"
        onConfirm={handleHardDeleteConfirm}
        onCancel={() => closeModal('hardDelete')}
        confirmButtonProps={{ variant: 'destructive' }}
      >
        <div className="space-y-4">
          <p className="font-semibold text-red-600">
            <strong>NGUY HIỂM:</strong> Hành động này sẽ xóa vĩnh viễn người dùng khỏi cả Supabase và database local!
          </p>
          <div className="space-y-2 rounded-lg bg-gray-50 p-4">
            <p>
              <strong>Người dùng:</strong> {modals.hardDelete.currentUser?.fullName || 'N/A'}
            </p>
            <p>
              <strong>Email:</strong> {modals.hardDelete.currentUser?.email}
            </p>
            <p>
              <strong>ID:</strong> {modals.hardDelete.currentUser?.id}
            </p>
          </div>
          <p className="text-sm text-red-600">
            <strong>Lưu ý:</strong> Nếu user vẫn còn trong auth.users của Supabase, quá trình sẽ thất bại để đảm bảo
            tính nhất quán dữ liệu.
          </p>
        </div>
      </ConfirmDialog>

      <ImportExcelModal
        isOpen={modals.import.isVisible}
        onClose={() => closeModal('import')}
        onImport={handleImportExcel}
        title="Import người dùng từ Excel"
        type="user"
      />
    </div>
  )
}

export default UserManagementOptimized
