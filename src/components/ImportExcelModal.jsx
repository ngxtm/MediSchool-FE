import React, { useState } from 'react'
import { Upload, Download, X, AlertCircle, CheckCircle } from 'lucide-react'
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
import api from '@/utils/api'

const ImportExcelModal = ({ isOpen, onClose, onImport, title = 'Import Excel' }) => {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [importResult, setImportResult] = useState(null)

  const handleFileChange = event => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ]

      if (!validTypes.includes(selectedFile.type)) {
        message.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)')
        return
      }

      setFile(selectedFile)
      setImportResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      message.error('Vui lòng chọn file Excel')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await onImport(formData)
      setImportResult(response)

      if (response.success) {
        message.success(`Import thành công! ${response.successCount} bản ghi đã được thêm.`)
        onClose()
      } else {
        message.warning(`Import hoàn thành với ${response.errorCount} lỗi.`)
      }
    } catch (error) {
      console.error('Import error:', error)
      message.error('Có lỗi xảy ra khi import file Excel')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const { data: blob } = await api.get('/admin/users/import/template', {
        responseType: 'blob'
      })

      if (blob) {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'user_import_template.xlsx'
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
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
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
                  <span className="text-sm">Thành công: {importResult.successCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Lỗi: {importResult.errorCount}</span>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Chi tiết lỗi:</h5>
                  <div className="max-h-32 space-y-1 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="rounded border border-red-200 bg-red-50 p-2 text-xs">
                        <div className="font-medium">Dòng {error.rowNumber}:</div>
                        <div className="text-red-600">{error.errorMessage}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
