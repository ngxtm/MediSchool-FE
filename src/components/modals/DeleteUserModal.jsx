import React, { useState } from 'react'
import { Modal, Input as AntInput } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

const { TextArea } = AntInput

const DeleteUserModal = ({ isVisible, onClose, onConfirm, user, loading = false }) => {
  const [deleteReason, setDeleteReason] = useState('')

  const handleConfirm = async () => {
    if (!deleteReason?.trim()) {
      return
    }

    const result = await onConfirm(user?.id, deleteReason)
    if (result?.success) {
      setDeleteReason('')
      onClose()
    }
  }

  const handleClose = () => {
    setDeleteReason('')
    onClose()
  }

  return (
    <Modal
      title="Xác nhận xóa người dùng"
      open={isVisible}
      onOk={handleConfirm}
      onCancel={handleClose}
      okText="Xóa"
      okType="danger"
      cancelText="Hủy"
      width={500}
      confirmLoading={loading}
      okButtonProps={{
        disabled: !deleteReason?.trim()
      }}
    >
      <div>
        <p style={{ marginBottom: 16 }}>
          <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
          Bạn có chắc muốn xóa người dùng <strong>{user?.fullName || user?.email}</strong>?
        </p>

        <div>
          <label style={{ fontWeight: 'bold', marginBottom: 8, display: 'block' }}>
            Lý do xóa <span style={{ color: 'red' }}>*</span>
          </label>
          <TextArea
            rows={3}
            placeholder="Nhập lý do xóa người dùng này..."
            value={deleteReason}
            onChange={e => setDeleteReason(e.target.value)}
            maxLength={500}
            showCount
          />
        </div>

        <div
          style={{
            marginTop: 12,
            padding: 8,
            background: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: 4
          }}
        >
          <p style={{ margin: 0, fontSize: '12px' }}>
            <strong>Lưu ý:</strong> Đây là thao tác xóa mềm. Người dùng có thể được khôi phục sau này.
          </p>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteUserModal
