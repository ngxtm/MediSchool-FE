import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../utils/api";
import dayjs from "dayjs";
import { toast, Zoom } from "react-toastify";
import { ArrowLeft } from 'lucide-react'

const MedicationRequestForm = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const [studentId, setStudentId] = useState(null);
	const [editData, setEditData] = useState(null);

	const [title, setTitle] = useState("");
	const [note, setNote] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [reason, setReason] = useState("")
	const [loading, setLoading] = useState(true);
	const [medicineCount, setMedicineCount] = useState(1);
	const [medicines, setMedicines] = useState([
		{ name: "", dosage: "", quantity: "", unit: "", note: "" },
	]);

	useEffect(() => {
		if (!id) {
			const fromState = location.state?.studentId;
			if (fromState) setStudentId(fromState);
		}
	}, [id, location.state]);

	useEffect(() => {
		if (id) {
			api.get(`/medication-requests/${id}`)
				.then((res) => {
					const data = res.data;
					setEditData(data);

					if (data.student && data.student.studentId) {
						setStudentId(data.student.studentId);
					} else {
						toast.error("Không tìm thấy học sinh trong đơn thuốc.");
						navigate("/parent/medication-requests");
						return;
					}

					setTitle(data.title || "");
					setNote(data.note || "");
					setStartDate(dayjs(data.startDate).format("YYYY-MM-DD"));
					setEndDate(dayjs(data.endDate).format("YYYY-MM-DD"));
					setReason(data.reason || "");

					const loaded = data.items?.map((i) => ({
						itemId: i.itemId,
						name: i.medicineName,
						dosage: i.dosage,
						quantity: i.quantity,
						unit: i.unit,
						note: i.note,
					})) || [];

					setMedicineCount(loaded.length || 1);
					setMedicines(loaded.length ? loaded : [{ name: "", dosage: "", quantity: "", unit: "", note: "" }]);

					setLoading(false);
				})
				.catch((err) => {
					console.error("Không tải được đơn thuốc:", err);
					toast.error("Không tải được thông tin đơn thuốc.");
					navigate("/parent/medication-requests");
				});
		} else {
			setLoading(false);
		}
	}, [id]);

	const handleMedicineChange = (index, field, value) => {
		const newList = [...medicines];
		newList[index][field] = value;
		setMedicines(newList);
	};

	const handleMedicineCountChange = (e) => {
		const count = Math.max(1, parseInt(e.target.value));
		setMedicineCount(count);
		const list = [...medicines];
		while (list.length < count) list.push({ name: "", dosage: "", quantity: "", unit: "", note: "" });
		while (list.length > count) list.pop();
		setMedicines(list);
	};

	const validateForm = () => {
		let errorCount = 0;
		let firstError = "";

		if (!title.trim()) {
			errorCount++;
			firstError = "Vui lòng nhập tiêu đề đơn thuốc.";
		}
		if (!startDate) {
			errorCount++;
			if (!firstError) firstError = "Vui lòng chọn ngày bắt đầu.";
		}
		if (!endDate) {
			errorCount++;
			if (!firstError) firstError = "Vui lòng chọn ngày kết thúc.";
		}
		if (!reason.trim()) {
			errorCount++;
			if (!firstError) firstError = "Vui lòng nhập lý do gửi thuốc.";
		}

		if (startDate && endDate) {
			const start = new Date(startDate);
			const end = new Date(endDate);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const minStart = new Date(today);
			minStart.setDate(minStart.getDate() + 3);

			if (start < minStart) {
				return "Ngày bắt đầu phải sau hôm nay ít nhất 3 ngày.";
			}
			if (end < start) {
				return "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.";
			}
		}

		for (let i = 0; i < medicines.length; i++) {
			const m = medicines[i];
			if (!m.name.trim()) {
				errorCount++;
				firstError = `Thuốc #${i + 1}: Tên thuốc không được để trống.`;
			}
			if (!m.dosage.trim()) {
				errorCount++;
				firstError = `Thuốc #${i + 1}: Vui lòng nhập liều dùng.`;
			}
			if (!m.quantity || isNaN(m.quantity) || parseInt(m.quantity) <= 0) {
				errorCount++;
				firstError = `Thuốc #${i + 1}: Số lượng phải là số dương.`;
			}
			if (!m.unit.trim()) {
				errorCount++;
				firstError = `Thuốc #${i + 1}: Vui lòng nhập đơn vị.`;
			}
		}

		if (errorCount >= 2) return "Vui lòng điền đầy đủ các mục.";
		return firstError || null;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const err = validateForm();
		if (err) {
			toast.error(err);
			return;
		}

		const payload = {
			title,
			note,
			reason,
			startDate,
			endDate,
			studentId,
			items: medicines.map(m => {
				const obj = {
					medicineName: m.name,
					dosage: m.dosage,
					quantity: parseInt(m.quantity),
					unit: m.unit,
					note: m.note,
				};
				if (id && m.itemId) obj.itemId = m.itemId;
				return obj;
			}),

		};

		try {
			if (id) {
				await api.put(`/medication-requests/${id}/update`, payload);
				toast.success("Cập nhật thành công!", { transition: Zoom });
			} else {
				await api.post("/medication-requests/create", payload);
				toast.success("Gửi đơn thuốc thành công!", { transition: Zoom });
			}
			navigate("/parent/medication-requests");
		} catch (err) {
			console.error(err);
			toast.error("Có lỗi xảy ra khi gửi đơn.");
		}
	};

	if (loading) return <div className="p-6 text-gray-600">Đang tải dữ liệu...</div>;
	if (!studentId) return <div className="p-6 text-red-500">Không tìm thấy học sinh để tạo đơn.</div>;

	return (
		<div className="max-w-4xl mx-auto p-6 font-inter">
			<div className="mb-5">
			<button
				onClick={() => navigate(-1)}
				className={`group border px-8 py-1 rounded-3xl font-bold text-base flex items-center gap-4 transition-all duration-200 bg-[#023E73] text-white`}
			>
				<ArrowLeft
					size={20}
					className="transition-transform duration-200 group-hover:-translate-x-1 text-white"
				/>
				Trở về
			</button>
			</div>
			<h1 className="text-2xl font-bold mb-6">{id ? "Chỉnh sửa đơn thuốc" : "Tạo đơn dặn thuốc"}</h1>
			<form onSubmit={handleSubmit} className="space-y-6 font-inter">
				<div>
					<label className="block font-medium">* Tiêu đề đơn thuốc</label>
					<input value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="border rounded w-full px-3 py-2 mt-1" />
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block font-medium">* Ngày bắt đầu</label>
						<input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" className="border rounded w-full px-3 py-2 mt-1" />
					</div>
					<div>
						<label className="block font-medium">* Ngày kết thúc</label>
						<input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" className="border rounded w-full px-3 py-2 mt-1" />
					</div>
				</div>
				<div>
					<label className="block font-medium">* Lý do gửi thuốc</label>
					<textarea value={reason} onChange={(e) => setReason(e.target.value)} className="border rounded w-full px-3 py-2 mt-1" />
				</div>
				<div>
					<label className="block font-medium">Ghi chú</label>
					<textarea value={note} onChange={(e) => setNote(e.target.value)} className="border rounded w-full px-3 py-2 mt-1" />
				</div>
				<div>
					<label className="block font-medium">Số lượng thuốc gửi</label>
					<input type="number" min={1} value={medicineCount} onChange={handleMedicineCountChange} className="border rounded px-3 py-2 mt-1 w-32" />
				</div>

				{medicines.map((med, index) => (
					<div key={index} className="bg-gray-50 border rounded p-4 space-y-2">
						<h3 className="font-semibold mb-2">Thuốc #{index + 1}</h3>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="text-sm block">* Tên thuốc</label>
								<input type="text" className="w-full border rounded px-3 py-1 mt-1" value={med.name} onChange={(e) => handleMedicineChange(index, "name", e.target.value)} />
							</div>
							<div>
								<label className="text-sm block">* Liều dùng</label>
								<input type="text" className="w-full border rounded px-3 py-1 mt-1" value={med.dosage} onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)} />
							</div>
							<div>
								<label className="text-sm block">* Số lượng</label>
								<input type="number" min={1} className="w-full border rounded px-3 py-1 mt-1" value={med.quantity} onChange={(e) => handleMedicineChange(index, "quantity", e.target.value)} />
							</div>
							<div>
								<label className="text-sm block">* Đơn vị</label>
								<input type="text" className="w-full border rounded px-3 py-1 mt-1" value={med.unit} onChange={(e) => handleMedicineChange(index, "unit", e.target.value)} />
							</div>
						</div>
						<div>
							<label className="text-sm block">Ghi chú</label>
							<textarea className="w-full border rounded px-3 py-1 mt-1" value={med.note} onChange={(e) => handleMedicineChange(index, "note", e.target.value)} />
						</div>
					</div>
				))}

				<button type="submit" className="bg-[#023E73] text-white font-semibold px-5 py-3 text-m rounded-lg hover:bg-[#034a8a]">
					{id ? "Cập nhật đơn thuốc" : "Gửi đơn thuốc"}
				</button>
			</form>
		</div>
	);
};

export default MedicationRequestForm;
