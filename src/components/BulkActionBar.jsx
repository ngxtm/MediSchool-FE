import React from "react";
import { Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Mail, X, Users, Check, AlertTriangle, FileText } from 'lucide-react'

const BulkActionBar = ({
  selectedCount,
  onBulkNormal,
  onBulkAbnormal,
  onBulkTemplate,
  templates = [],
  onCancel,
  onSendEmail,
  isSending = false,
  theme = 'teal'
}) => {
  const themeStyles = {
    teal: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-800',
      button: 'bg-teal-600 hover:bg-teal-700 text-white',
      buttonDisabled: 'bg-teal-400 text-teal-100 cursor-not-allowed',
      clearButton: 'text-teal-600 hover:text-teal-800 hover:bg-teal-100',
      secondaryButton: 'bg-white border border-teal-600 text-teal-600 hover:bg-teal-50'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      buttonDisabled: 'bg-blue-400 text-blue-100 cursor-not-allowed',
      clearButton: 'text-blue-600 hover:text-blue-800 hover:bg-blue-100',
      secondaryButton: 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50'
    }
  }

  const styles = themeStyles[theme] || themeStyles.teal

  const isVaccineMode = onBulkNormal || onBulkAbnormal || onBulkTemplate
  const isEmailMode = onSendEmail

  const templateMenu = (
    <Menu>
      {templates.map((tpl) => (
        <Menu.Item key={tpl.id} onClick={() => onBulkTemplate(tpl)}>
          <div>
            <div className="font-medium">{tpl.name}</div>
            <div className="text-xs text-gray-500 truncate">{tpl.followUpNote}</div>
          </div>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-lg p-4 mb-4 flex items-center justify-between shadow-sm`}>
      <div className="flex items-center gap-3">
        <Users className={`w-5 h-5 ${styles.text}`} />
        <span className={`font-medium ${styles.text}`}>
          {isVaccineMode ? `Đã chọn ${selectedCount} bản ghi` : `Đã chọn ${selectedCount} học sinh chưa phản hồi`}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        {isVaccineMode && onBulkNormal && (
          <button
            onClick={onBulkNormal}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${styles.secondaryButton}`}
          >
            <Check className="w-4 h-4" />
            Đánh dấu bình thường
          </button>
        )}
        
        {isVaccineMode && onBulkAbnormal && (
          <button
            onClick={onBulkAbnormal}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${styles.secondaryButton}`}
          >
            <AlertTriangle className="w-4 h-4" />
            Đánh dấu bất thường
          </button>
        )}
        
        {isVaccineMode && onBulkTemplate && templates.length > 0 && (
          <Dropdown overlay={templateMenu} trigger={['click']}>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${styles.secondaryButton}`}
            >
              <FileText className="w-4 h-4" />
              Áp dụng mẫu <DownOutlined />
            </button>
          </Dropdown>
        )}

        {isEmailMode && (
          <button
            onClick={onSendEmail}
            disabled={isSending}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              isSending ? styles.buttonDisabled : styles.button
            }`}
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            {isSending ? 'Đang gửi...' : `Gửi email (${selectedCount})`}
          </button>
        )}
        
        <button
          onClick={onCancel}
          disabled={isSending}
          className={`p-2 rounded-md transition-all duration-200 ${styles.clearButton} ${
            isSending ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Bỏ chọn tất cả"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BulkActionBar;
