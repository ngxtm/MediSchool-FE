import React from "react";
import { Button, Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";

/**
 * BulkActionBar component displayed when records are selected in VaccineRecord table.
 * Adapts the design provided by user but implemented with Ant Design components.
 *
 * Props:
 *  - selectedCount: number
 *  - onBulkNormal: () => void
 *  - onBulkAbnormal: () => void (this should trigger abnormal modal in parent)
 *  - onBulkTemplate: (template) => void
 *  - templates: array<{ id: number|string, name: string, followUpNote: string }>
 *  - onCancel: () => void (clear selection)
 */
const BulkActionBar = ({
  selectedCount,
  onBulkNormal,
  onBulkAbnormal,
  onBulkTemplate,
  templates = [],
  onCancel,
}) => {
  const menu = (
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
    <div className="sticky top-0 z-10 bg-white border border-blue-200 rounded-lg shadow-lg p-4 mb-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <span className="font-medium text-blue-700">
            Đã chọn {selectedCount} bản ghi
          </span>

          <div className="flex gap-2">
            <Button onClick={onBulkNormal} type="primary" size="small" className="bg-green-600 border-none hover:bg-green-700">
              Đặt "Không bất thường"
            </Button>

            <Button onClick={onBulkAbnormal} danger size="small">
              Đặt "Có bất thường"
            </Button>

            <Dropdown overlay={menu} placement="bottomLeft" trigger={["click"]}>
              <Button size="small" icon={<DownOutlined />}>Áp dụng mẫu</Button>
            </Dropdown>
          </div>
        </div>

        <Button onClick={onCancel} size="small">
          Hủy chọn
        </Button>
      </div>
    </div>
  );
};

export default BulkActionBar;
