import React, { useState } from 'react'
import { Upload, Download, X, AlertCircle, CheckCircle, FileX, Server, Wifi } from 'lucide-react'
import { message } from 'antd'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import api from '@/utils/api'

const ImportExcelModal = ({ isOpen, onClose, onImport, title = 'Import Excel', type = 'student' }) => {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = event => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ]

      if (!validTypes.includes(selectedFile.type)) {
        setError({
          type: 'validation',
          title: 'Định dạng file không hợp lệ',
          message: 'Vui lòng chọn file Excel (.xlsx hoặc .xls)',
          details: `File hiện tại: ${selectedFile.type}`
        })
        return
      }

      setFile(selectedFile)
      setImportResult(null)
      setError(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError({
        type: 'validation',
        title: 'Chưa chọn file',
        message: 'Vui lòng chọn file Excel để import'
      })
      return
    }

    setIsUploading(true)
    setError(null)
    setImportResult(null)

    try {
      const response = await onImport(file)

      setImportResult(response)

      if (response?.success === true) {
        message.success(`Import thành công! ${response.successCount} bản ghi đã được thêm.`)
        onClose()
      } else if (response?.success === false) {
        setError({
          type: 'validation',
          title: 'Import thất bại',
          message: response?.message || 'Import không thành công',
          details: response?.details || 'Vui lòng kiểm tra lại file Excel'
        })
      }
    } catch (error) {
      console.error('Import error caught:', error)

      let errorInfo = {
        type: 'unknown',
        title: 'Lỗi không xác định',
        message: 'Có lỗi xảy ra khi import file Excel',
        details: error.message || 'Không có thông tin chi tiết'
      }

      if (error.response) {
        const status = error.response.status
        const data = error.response.data

        if (status === 400) {
          errorInfo = {
            type: 'validation',
            title: 'Dữ liệu không hợp lệ',
            message: data?.message || 'File Excel có định dạng hoặc dữ liệu không hợp lệ',
            details: data?.details || data?.message || 'Vui lòng kiểm tra lại định dạng file và dữ liệu'
          }
        } else if (status === 401) {
          errorInfo = {
            type: 'auth',
            title: 'Phiên đăng nhập hết hạn',
            message: 'Vui lòng đăng nhập lại để tiếp tục',
            details: 'Phiên làm việc của bạn đã hết hạn'
          }
        } else if (status === 403) {
          errorInfo = {
            type: 'permission',
            title: 'Không có quyền truy cập',
            message: 'Bạn không có quyền thực hiện thao tác này',
            details: 'Liên hệ quản trị viên để được cấp quyền'
          }
        } else if (status === 413) {
          errorInfo = {
            type: 'validation',
            title: 'File quá lớn',
            message: 'Kích thước file vượt quá giới hạn cho phép',
            details: `Kích thước file hiện tại: ${(file.size / 1024 / 1024).toFixed(2)} MB`
          }
        } else if (status >= 500) {
          errorInfo = {
            type: 'server',
            title: 'Lỗi máy chủ',
            message: 'Máy chủ đang gặp sự cố, vui lòng thử lại sau',
            details: data?.message || 'Lỗi nội bộ máy chủ'
          }
        } else {
          errorInfo = {
            type: 'server',
            title: `Lỗi HTTP ${status}`,
            message: data?.message || 'Có lỗi xảy ra từ máy chủ',
            details: data?.details || data?.message || `HTTP Status: ${status}`
          }
        }
      } else if (error.request) {
        errorInfo = {
          type: 'network',
          title: 'Lỗi kết nối mạng',
          message: 'Không thể kết nối đến máy chủ',
          details: 'Vui lòng kiểm tra kết nối internet và thử lại'
        }
      } else {
        errorInfo = {
          type: 'unknown',
          title: 'Lỗi không xác định',
          message: error.message || 'Có lỗi xảy ra khi import file Excel',
          details: 'Vui lòng thử lại hoặc liên hệ hỗ trợ'
        }
      }

      setError(errorInfo)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const endpoint = type === 'user' ? '/admin/users/import/template' : '/admin/students/import/template'

      const filename = type === 'user' ? 'user_import_template.xlsx' : 'student_import_template.xlsx'

      const { data: blob } = await api.get(endpoint, {
        responseType: 'blob'
      })

      if (blob) {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        message.success('Template đã được tải xuống thành công!')
      }
    } catch (error) {
      console.error('Download template error:', error)
      message.error('Có lỗi xảy ra khi tải template. Vui lòng thử lại.')
    }
  }

  const handleClose = () => {
    setFile(null)
    setImportResult(null)
    setError(null)
    onClose()
  }

  const getErrorIcon = errorType => {
    switch (errorType) {
      case 'validation':
        return <FileX className="h-4 w-4" />
      case 'server':
        return <Server className="h-4 w-4" />
      case 'network':
        return <Wifi className="h-4 w-4" />
      case 'auth':
      case 'permission':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getErrorVariant = errorType => {
    switch (errorType) {
      case 'validation':
        return 'destructive'
      case 'server':
        return 'destructive'
      case 'network':
        return 'destructive'
      case 'auth':
        return 'default'
      case 'permission':
        return 'default'
      default:
        return 'destructive'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Tải lên file Excel để import dữ liệu. Hãy đảm bảo file có định dạng đúng.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Display */}
          {error && (
            <Alert variant={getErrorVariant(error.type)}>
              <div className="flex items-start gap-2">
                {getErrorIcon(error.type)}
                <div className="flex-1">
                  <div className="font-semibold">{error.title}</div>
                  <AlertDescription className="mt-1">{error.message}</AlertDescription>
                  {error.details && (
                    <div className="bg-background/50 mt-2 rounded p-2 text-sm">
                      <div className="text-muted-foreground mb-1 text-xs font-medium">Chi tiết lỗi:</div>
                      <div className="text-xs">{error.details}</div>
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          )}

          {/* Template Download */}
          <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-4">
            <div>
              <h4 className="font-medium">Template Excel</h4>
              <p className="text-muted-foreground text-sm">Tải xuống template để xem định dạng file Excel chuẩn</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Tải Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Chọn file Excel</Label>
            <Input id="file" type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={isUploading} />
            {file && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          {/* Import Results */}
          {importResult && (
            <div className="space-y-3">
              <h4 className="font-medium">Kết quả import:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Thành công: {importResult?.successCount || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Lỗi: {importResult?.errorCount || 0}</span>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Chi tiết lỗi:</h5>
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded border p-2">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="rounded border border-red-200 bg-red-50 p-2 text-xs">
                        <div className="font-medium">Dòng {error.rowNumber}:</div>
                        <div className="text-red-600">{error.errorMessage}</div>
                        {error.field && <div className="mt-1 text-xs text-red-500">Trường: {error.field}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {importResult.message && <div className="text-muted-foreground text-sm">{importResult.message}</div>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            <X className="mr-2 h-4 w-4" />
            Hủy
          </Button>
          <Button onClick={handleImport} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Đang import...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ImportExcelModal
