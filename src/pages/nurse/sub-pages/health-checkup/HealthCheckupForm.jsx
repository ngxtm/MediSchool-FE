import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from 'lucide-react'

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

	const validateForm = () => {
		let errorCount = 0;
		let firstError = "";

		if (!title.trim()) {
			errorCount++;
			firstError = "Vui lòng nhập tên sự kiện.";
		}
		if (!schoolYear) {
			errorCount++;
			if (!firstError) firstError = "Vui lòng chọn năm học.";
		}
		if (!startDate) {
			errorCount++;
			if (!firstError) firstError = "Vui lòng chọn ngày bắt đầu.";
		}
		if (!endDate) {
			errorCount++;
			if (!firstError) firstError = "Vui lòng chọn ngày kết thúc.";
		}
		if (selectedCategories.length === 0) {
			errorCount++;
			if (!firstError) firstError = "Vui lòng chọn ít nhất 1 hạng mục khám.";
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
			schoolYear,
			startDate,
			endDate,
			categoryNames: selectedCategories,
		};

		navigate("/nurse/health-checkup");
	};

	return (
		<div className="max-w-5xl mx-auto px-6 py-10 font-inter">
			<button
				onClick={() => navigate(-1)}
				className={`group border px-8 py-1 rounded-3xl font-bold text-base flex items-center gap-4 mb-8 transition-all duration-200 bg-[#023E73] text-white`}
			>
				<ArrowLeft
					size={20}
					className="transition-transform duration-200 group-hover:-translate-x-1 text-white"
				/>
				Trở về
			</button>
			<h1 className="text-3xl font-bold mb-8 text-center">THÔNG TIN SỰ KIỆN KHÁM SỨC KHỎE ĐỊNH KỲ</h1>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="text-xl font-bold block mb-2">Tên sự kiện</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Ví dụ: Khám sức khỏe đầu/giữa/cuối năm học,..."
						className="border rounded px-4 py-2 w-full"
					/>
				</div>

				<div>
					<label className="text-xl font-bold block mb-2">Năm học</label>
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
						<label className="font-lg text-xl font-bold mb-2">Hạng mục khám</label>
						<button
							type="button"
							className="text-m text-[#023E73] hover:underline"
							onClick={selectAll}
						>
							Chọn tất cả
						</button>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
						{CATEGORY_OPTIONS.map((c) => (
							<label key={c} className="text-m flex items-center gap-2 mb-1">
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
						type="submit"
						className="bg-[#023E73] text-white rounded px-6 py-3 rounded-xl text-lg font-bold hover:bg-[#034a8a]"
					>
						Xác nhận
					</button>
				</div>
			</form>
		</div>
	);
}