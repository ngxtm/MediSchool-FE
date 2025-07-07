import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CATEGORY_OPTIONS = [
	"Chiều cao - Cân nặng",
	"Thị lực",
	"Tai - mũi - họng",
	"Xét nghiệm máu",
	"Xét nghiệm vi chất",
	"Tim mạch",
	"Nha khoa",
	"Da liễu",
	"Hô hấp",
];

const SCHOOL_YEARS = [
	"2023 - 2024",
	"2024 - 2025",
	"2025 - 2026",
];

export default function HealthCheckupForm() {
	const navigate = useNavigate();

	const [title, setTitle] = useState("");
	const [schoolYear, setSchoolYear] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [selectedCategories, setSelectedCategories] = useState([]);

	const toggleCategory = (category) => {
		setSelectedCategories((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category]
		);
	};

	const selectAll = () => {
		if (selectedCategories.length === CATEGORY_OPTIONS.length) {
			setSelectedCategories([]);
		} else {
			setSelectedCategories(CATEGORY_OPTIONS);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!title || !schoolYear || !startDate || !endDate || selectedCategories.length === 0) {
			toast.error("Vui lòng điền đầy đủ thông tin!");
			return;
		}

		const payload = {
			title,
			schoolYear,
			startDate,
			endDate,
			categoryNames: selectedCategories,
		};

		// await api.post("/checkup-events", payload);
		toast.success("Tạo đợt khám thành công!");
		navigate("/nurse/health-checkup");
	};

	return (
		<div className="max-w-2xl mx-auto px-6 py-10 font-inter">
			<h1 className="text-2xl font-bold mb-6 text-center">THÔNG TIN SỰ KIỆN KHÁM SỨC KHỎE ĐỊNH KỲ</h1>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="font-medium block mb-1">Tên sự kiện</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Ví dụ: Khám sức khỏe đầu/giữa/cuối năm học"
						className="border rounded px-4 py-2 w-full"
					/>
				</div>

				<div>
					<label className="font-medium block mb-1">Năm học</label>
					<select
						value={schoolYear}
						onChange={(e) => setSchoolYear(e.target.value)}
						className="border rounded px-4 py-2 w-full"
					>
						<option value="">Chọn năm học</option>
						{SCHOOL_YEARS.map((y) => (
							<option key={y} value={y}>{y}</option>
						))}
					</select>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="font-medium block mb-1">Ngày bắt đầu</label>
						<input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="border rounded px-4 py-2 w-full"
						/>
					</div>
					<div>
						<label className="font-medium block mb-1">Ngày kết thúc</label>
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
						<label className="font-medium">Hạng mục khám</label>
						<button
							type="button"
							className="text-sm text-blue-600 hover:underline"
							onClick={selectAll}
						>
							Chọn tất cả
						</button>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
						{CATEGORY_OPTIONS.map((c) => (
							<label key={c} className="text-sm flex items-center gap-2">
								<input
									type="checkbox"
									checked={selectedCategories.includes(c)}
									onChange={() => toggleCategory(c)}
								/>
								{c}
							</label>
						))}
					</div>
				</div>

				<div className="flex justify-center gap-4 pt-4">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="bg-gray-100 border rounded px-6 py-2 font-semibold"
					>
						Huỷ
					</button>
					<button
						type="submit"
						className="bg-[#023E73] text-white rounded px-6 py-2 font-semibold hover:bg-[#034a8a]"
					>
						Xác nhận
					</button>
				</div>
			</form>
		</div>
	);
}