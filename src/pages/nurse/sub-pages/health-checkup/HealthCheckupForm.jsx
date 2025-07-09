import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import api from "../../../../utils/api.js";

export default function HealthCheckupForm() {
	const navigate = useNavigate();

	const [eventTitle, setEventTitle] = useState("");
	const [schoolYear, setSchoolYear] = useState(() => {
		const now = new Date();
		const year = now.getFullYear();
		return `${year}-${year + 1}`;
	});
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [scope, setScope] = useState("SCHOOL"); // default
	const [categories, setCategories] = useState([]);
	const [selectedCategories, setSelectedCategories] = useState([]);

	const [grades, setGrades] = useState([]);
	const [selectedGrade, setSelectedGrade] = useState("");
	const [classes, setClasses] = useState([]);
	const [selectedClasses, setSelectedClasses] = useState([]);

	// fetch categories
	useEffect(() => {
		api.get("/checkup-categories")
			.then((res) => setCategories(res.data))
			.catch(() => toast.error("Không thể tải danh sách hạng mục khám"));
	}, []);

	// fetch all grades
	useEffect(() => {
		api.get("/classes/grades")
			.then((res) => setGrades(res.data))
			.catch(() => toast.error("Không thể tải danh sách khối"));
	}, []);

	// fetch classes of selected grade
	useEffect(() => {
		if (scope === "GRADE" && selectedGrade) {
			api.get(`/classes/by-grade?grade=${selectedGrade}`)
				.then((res) => setSelectedClasses(res.data.map(c => c.classCode)))
				.catch(() => toast.error("Không thể tải danh sách lớp theo khối"));
		}
	}, [selectedGrade, scope]);

	const toggleCategory = (id) => {
		setSelectedCategories((prev) =>
			prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
		);
	};

	const selectAllCategories = () => {
		if (selectedCategories.length === categories.length) {
			setSelectedCategories([]);
		} else {
			setSelectedCategories(categories.map((c) => c.id));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!eventTitle || !startDate || !endDate || selectedCategories.length === 0) {
			toast.error("Vui lòng điền đầy đủ thông tin và chọn ít nhất 1 hạng mục.");
			return;
		}

		let classCodes = [];

		if (scope === "GRADE" && selectedGrade) {
			const res = await api.get(`/classes/by-grade?grade=${selectedGrade}`);
			classCodes = res.data.map(c => c.classCode);
		} else if (scope === "CLASS") {
			classCodes = [...selectedClasses];
		}

		const payload = {
			eventTitle,
			schoolYear,
			startDate,
			endDate,
			scope,
			categoryIds: selectedCategories,
			classCodes
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

			<h1 className="text-3xl font-bold mb-8 text-center">THÔNG TIN SỰ KIỆN KHÁM SỨC KHỎE</h1>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="text-lg font-semibold block mb-2">Tên sự kiện</label>
					<input
						type="text"
						value={eventTitle}
						onChange={(e) => setEventTitle(e.target.value)}
						className="border rounded px-4 py-2 w-full"
						placeholder="VD: Khám sức khỏe đầu năm học"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="text-lg font-semibold block mb-2">Năm học</label>
						<input type="text" value={schoolYear} readOnly className="border rounded px-4 py-2 w-full bg-gray-100" />
					</div>
					<div>
						<label className="text-lg font-semibold block mb-2">Phạm vi</label>
						<select
							value={scope}
							onChange={(e) => {
								setScope(e.target.value);
								setSelectedGrade("");
								setSelectedClasses([]);
							}}
							className="border rounded px-4 py-2 w-full"
						>
							<option value="SCHOOL">Toàn trường</option>
							<option value="GRADE">Theo khối</option>
							<option value="CLASS">Theo lớp</option>
						</select>
					</div>
				</div>

				{scope === "GRADE" && (
					<div>
						<label className="text-lg font-semibold block mb-2">Chọn khối</label>
						<select
							value={selectedGrade}
							onChange={(e) => setSelectedGrade(e.target.value)}
							className="border rounded px-4 py-2 w-full"
						>
							<option value="">-- Chọn khối --</option>
							{grades.map((g) => (
								<option key={g} value={g}>{g}</option>
							))}
						</select>
					</div>
				)}

				{scope === "CLASS" && (
					<div>
						<label className="text-lg font-semibold block mb-2">Chọn lớp</label>
						<select
							multiple
							value={selectedClasses}
							onChange={(e) =>
								setSelectedClasses(Array.from(e.target.selectedOptions, (opt) => opt.value))
							}
							className="border rounded px-4 py-2 w-full h-40"
						>
							{classes.map((c) => (
								<option key={c.classCode} value={c.classCode}>{c.classCode}</option>
							))}
						</select>
					</div>
				)}

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="text-lg font-semibold block mb-2">Ngày bắt đầu</label>
						<input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="border rounded px-4 py-2 w-full"
						/>
					</div>
					<div>
						<label className="text-lg font-semibold block mb-2">Ngày kết thúc</label>
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
						<label className="text-lg font-semibold">Hạng mục khám</label>
						<button
							type="button"
							onClick={selectAllCategories}
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