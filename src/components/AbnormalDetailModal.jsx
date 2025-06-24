import React, { useState } from "react";
import { Modal, Input, Alert, Button } from "antd";

/**
 * AbnormalDetailModal
 * A small modal prompting the nurse to provide follow-up notes when a record is
 * marked "Bất thường" (abnormal).
 *
 * Props:
 *  - open: boolean – modal visibility
 *  - onCancel: () => void – close without saving
 *  - onSubmit: (note: string) => void – save handler
 *  - recordCount?: number – how many records being updated (for display only)
 */
const AbnormalDetailModal = ({ open, onCancel, onSubmit, recordCount = 1 }) => {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const templates = [
    "Trẻ có biểu hiện sốt nhẹ 37.5°C, đã theo dõi và cho uống paracetamol",
    "Đau nhẹ và sưng tại vị trí tiêm, đã hướng dẫn chườm lạnh",
    "Trẻ có biểu hiện mệt mỏi, đã cho nghỉ ngơi và theo dõi",
    "Phản ứng dị ứng nhẹ (ngứa, nổi mẩn), đã xử lý và theo dõi",
  ];

  const handleOk = () => {
    if (!note.trim()) return;
    setLoading(true);
    // delegate saving to caller – keep loading indicator for UX polish
    Promise.resolve(onSubmit(note.trim())).finally(() => {
      setNote("");
      setLoading(false);
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={<span className="flex items-center gap-2 text-red-600 font-semibold">⚠️ Báo cáo sự kiện bất lợi</span>}
      footer={null}
      width={680}
      destroyOnClose
    >
      <div className="space-y-4">
        <Alert
          message={
            <span>
              <strong>Quan trọng:</strong> Khi đánh dấu "Có bất thường", bạn phải cung cấp mô
              tả chi tiết về phản ứng của trẻ theo quy định báo cáo sự kiện bất lợi sau tiêm
              chủng.
            </span>
          }
          type="error"
          showIcon
        />

        <div>
          <span className="font-medium text-sm">
            Số bản ghi được cập nhật: <span className="text-blue-600">{recordCount}</span>
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="followUpNote" className="font-medium text-sm">
            Mô tả chi tiết phản ứng bất thường <span className="text-red-500">*</span>
          </label>
          <Input.TextArea
            id="followUpNote"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Vui lòng mô tả chi tiết về phản ứng bất thường của trẻ, bao gồm: triệu chứng, mức độ, thời gian xuất hiện, và biện pháp xử lý đã thực hiện..."
          />
        </div>

        <div>
          <span className="font-medium text-sm block mb-2">Các mẫu ghi chú thường dùng:</span>
          <div className="grid grid-cols-1 gap-2">
            {templates.map((tpl, idx) => (
              <Button key={idx} onClick={() => setNote(tpl)} className="text-left">
                {tpl}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={onCancel} disabled={loading}>
            Huỷ
          </Button>
          <Button
            type="primary"
            danger
            onClick={handleOk}
            disabled={!note.trim()}
            loading={loading}
          >
            Xác nhận và lưu
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AbnormalDetailModal;
