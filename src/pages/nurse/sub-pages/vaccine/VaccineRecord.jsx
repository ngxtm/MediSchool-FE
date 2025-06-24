import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ReturnButton from "../../../../components/ReturnButton";
import { useParams } from "react-router-dom";
import api from "../../../../utils/api";
import Loading from "../../../../components/Loading";
import { Table, Input, Button, Tag } from "antd";
import AbnormalDetailModal from "../../../../components/AbnormalDetailModal";


const VaccineRecord = () => {
	const { id } = useParams();
	const {
		data: vaccineEvent,
		isLoading: isVaccineEventLoading,
		isError: isVaccineEventError,
	} = useQuery({
		queryKey: ["vaccine-event", id],
		queryFn: async () => {
			const response = await api.get(`/vaccine-events/${id}`);
			return response.data;
		},
	});

	const isLoading = isVaccineEventLoading;
	const isError = isVaccineEventError;

  // inline edit states for "Bất thường"
  const [editingRow, setEditingRow] = useState(null); // vaccineId being edited
  const [editingValue, setEditingValue] = useState("");
  const [showAbModal, setShowAbModal] = useState(false);
  const [pendingRowForNote, setPendingRowForNote] = useState(null);

  // table data state & pagination
  const [filteredVaccines, setFilteredVaccines] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  // load vaccine records when api data available (adjust key if different)
  useEffect(() => {
    if (vaccineEvent?.records) {
      setFilteredVaccines(vaccineEvent.records);
    }
  }, [vaccineEvent]);

  // helper to update a record locally – in real app should call API
  const updateLocalRecord = (id, payload) => {
    setFilteredVaccines(prev => prev.map(rec => (rec.vaccineId === id ? { ...rec, ...payload } : rec)));
  };

  // ----- handlers -----
  const handleSaveAbnormal = (record) => {
    const trimmed = editingValue.trim().toLowerCase();
    const isAbnormal = trimmed === "true" || trimmed === "có";

    if (isAbnormal) {
      setPendingRowForNote(record.vaccineId);
      setShowAbModal(true);
    } else {
      updateLocalRecord(record.vaccineId, { abnormal: false, followUpNote: "" });
    }
    setEditingRow(null);
    setEditingValue("");
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditingValue("");
  };

	if (isLoading) {
		return <Loading />;
	}

	if (isError) {
		return <div>Error fetching api & load data</div>;
	}

	const getStatusDisplay = (status, date) => {
		if (!status) return { text: "Lỗi trạng thái", bgColor: "bg-[#DAEAF7]" };

		switch (status.toUpperCase()) {
			case "APPROVED":
				if (date === new Date().toLocaleDateString()) {
					return { text: "Đang diễn ra", bgColor: "bg-[#DAEAF7]" };
				}
				return { text: "Đã duyệt", bgColor: "bg-[#DAEAF7]" };
			case "PENDING":
				return { text: "Chờ duyệt", bgColor: "bg-[#DAEAF7]" };
			case "CANCELLED":
				return { text: "Đã hủy", bgColor: "bg-[#FFCCCC]" };
			case "COMPLETED":
				return { text: "Hoàn thành", bgColor: "bg-[#D1FAE5]" };
			default:
				return { text: "Trạng thái lạ", bgColor: "bg-[#DAEAF7]" };
		}
	};

	const { text: statusText, bgColor } = getStatusDisplay(
		vaccineEvent?.status,
		vaccineEvent?.event_date
	);

    const columns = [
        {
            title: "Học sinh",
			dataIndex: "student",
			key: "student",
			align: "center",
			width: 180,
			render: (text) => <span className="font-semibold">{text}</span>,
        },
        {
            title: "Lớp",
            dataIndex: "class",
            key: "class",
            align: "center",
            width: 180,
        },
        {
            title: "Vaccine",
            dataIndex: "vaccine",
            key: "vaccine",
            align: "center",
            width: 180,
        },
        {
            title: "Ngày tiêm",
            dataIndex: "recordDate",
            key: "recordDate",
            align: "center",
            width: 180,
        },
        {
            title: "Bất thường",
            dataIndex: "abnormal",
            key: "abnormal",
            align: "center",
            width: 180,
            render: (_, record) => {
                const isEditing = editingRow === record.vaccineId;
                if (isEditing) {
                    return (
                        <div className="flex gap-2 items-center">
                            <Input
                                style={{ width: 80, height: 30 }}
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onPressEnter={() => handleSaveAbnormal(record)}
                                autoFocus
                            />
                            <Button size="small" type="primary" onClick={() => handleSaveAbnormal(record)}>✓</Button>
                            <Button size="small" onClick={handleCancelEdit}>✕</Button>
                        </div>
                    );
                }
                return (
                    <Tag
                        color={record.abnormal ? "red" : "green"}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            setEditingRow(record.vaccineId);
                            setEditingValue(record.abnormal ? "true" : "false");
                        }}
                    >
                        {record.abnormal ? "Có" : "Không"}
                    </Tag>
                );
            },
        }

    ]

	return (
		<div className="font-inter">
			<ReturnButton linkNavigate={`/nurse/vaccination/vaccine-event/${id}`} />
			<div>
				<div className="flex flex-col mt-10 gap-4">
					<h1 className="font-bold text-2xl">
						Chiến dịch: {vaccineEvent?.eventTitle || "N/A"}
					</h1>
					<p
						className={`text-center ${bgColor} font-bold px-6 py-1 w-fit rounded-lg`}
					>
						{statusText}
					</p>
				</div>
			</div>
            <Table
				columns={columns}
				dataSource={filteredVaccines}
				loading={isLoading}
				onChange={(pagination) => setPagination(pagination)}
				pagination={pagination}
				rowKey="vaccineId"
			/>

      <AbnormalDetailModal
        open={showAbModal}
        recordCount={1}
        onCancel={() => setShowAbModal(false)}
        onSubmit={(note) => {
          if (pendingRowForNote) {
            updateLocalRecord(pendingRowForNote, { abnormal: true, followUpNote: note });
            setPendingRowForNote(null);
          }
          setShowAbModal(false);
        }}
      />
		</div>
	);
};




export default VaccineRecord;
