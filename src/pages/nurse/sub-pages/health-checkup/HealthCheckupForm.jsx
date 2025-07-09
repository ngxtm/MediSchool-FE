import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import api from '../../../../utils/api.js'

export default function HealthCheckupForm() {
	const navigate = useNavigate();

	const [eventTitle, setEventTitle] = useState("");
	const [schoolYear, setSchoolYear] = useState(() => {
		const now = new Date();
		const year = now.getFullYear();
		return `${year} - ${year + 1}`;
	});
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [categories, setCategories] = useState([]);
	const [selectedCategories, setSelectedCategories] = useState([]);

	useEffect(() => {
		api.get("/checkup-categories")
			.then((res) => setCategories(res.data))
			.catch(() => toast.error("Không thể tải danh sách hạng mục khám"));
	}, []);

	const toggleCategory = (id) => {
		setSelectedCategories((prev) =>
			prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
		);
	};

	const selectAll = () => {
		if (selectedCategories.length === categories.length) {
			setSelectedCategories([]);
		} else {
			setSelectedCategories(categories.map((c) => c.id));
		}
	};

	const validateForm = () => {
		let errors = [];

		if (!eventTitle.trim()) errors.push("Vui lòng nhập tên sự kiện.");
		if (!startDate) errors.push("Vui lòng chọn ngày bắt đầu.");
		if (!endDate) errors.push("Vui lòng chọn ngày kết thúc.");
		if (selectedCategories.length === 0) errors.push("Vui lòng chọn ít nhất 1 hạng mục khám.");

		const start = new Date(startDate);
		const end = new Date(endDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const minStart = new Date(today);
		minStart.setDate(minStart.getDate() + 3);

		if (startDate && endDate) {
			if (start < minStart) errors.push("Ngày bắt đầu phải sau hôm nay ít nhất 3 ngày.");
			if (end < start) errors.push("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.");
		}

		if (errors.length >= 2) return "Vui lòng điền đầy đủ các mục.";
		return errors[0] || null;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const error = validateForm();
		if (error) {
			toast.error(error);
			return;
		}

		const payload = {
			eventTitle,
			schoolYear,
			startDate,
			endDate,
			categoryIds: selectedCategories,
			scope: "SCHOOL_WIDE",
		};

		try {
			await api.post("/health-checkup/create", payload);
			toast.success("Tạo sự kiện thành công!");
			navigate("/nurse/health-checkup");
		} catch (err) {
			console.error(err);
			toast.error("Lỗi khi tạo sự kiện.");
		}
	};

	return (
		<div className="max-w-4xl mx-auto px-6 py-10 font-inter">
			<button
				onClick={() => navigate(-1)}
				className="group border px-8 py-1 rounded-3xl font-bold text-base flex items-center gap-4 mb-8 bg-[#023E73] text-white"
			>
				<ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
				Trở về
			</button>

			<h1 className="text-3xl font-bold mb-8 text-center">THÔNG TIN SỰ KIỆN KHÁM SỨC KHỎE ĐỊNH KỲ</h1>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="text-xl font-bold block mb-2">Tên sự kiện</label>
					<input
						type="text"
						value={eventTitle}
						onChange={(e) => setEventTitle(e.target.value)}
						placeholder="VD: Khám sức khỏe đầu năm học..."
						className="border rounded px-4 py-2 w-full"
					/>
				</div>

				<div>
					<label className="text-xl font-bold block mb-2">Năm học</label>
					<input
						type="text"
						value={schoolYear}
						readOnly
						className="border rounded px-4 py-2 w-full bg-gray-100"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="text-xl font-bold block mb-2">Ngày bắt đầu</label>
						<input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="border rounded px-4 py-2 w-full"
						/>
					</div>
					<div>
						<label className="text-xl font-bold block mb-2">Ngày kết thúc</label>
						<input
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="border rounded px-4 py-2 w-full"
						/>
					</div>
				</div>

				<div>
					<div className="flex justify-between items-center mb-2">
						<label className="text-xl font-bold">Hạng mục khám</label>
						<button
							type="button"
							onClick={selectAll}
							className="text-sm text-[#023E73] hover:underline"
						>
							{selectedCategories.length === categories.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
						</button>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
						{categories.map((c) => (
							<label key={c.id} className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={selectedCategories.includes(c.id)}
									onChange={() => toggleCategory(c.id)}
								/>
								{c.name}
							</label>
						))}
					</div>
				</div>

				<div className="flex justify-center pt-6">
					<button
						type="submit"
						className="bg-[#023E73] text-white rounded-xl px-6 py-3 text-lg font-bold hover:bg-[#034a8a]"
					>
						Xác nhận
					</button>
				</div>
			</form>
		</div>
	);
}