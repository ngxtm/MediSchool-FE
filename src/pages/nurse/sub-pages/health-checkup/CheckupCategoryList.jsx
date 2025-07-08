import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from '../../../../utils/api.js'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CheckupCategoryList() {
	const [categories, setCategories] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		api
			.get("/checkup-categories")
			.then((res) => setCategories(res.data))
			.catch(() => toast.error("Không thể tải danh sách hạng mục khám"));
	}, []);

	return (
		<div className="max-w-[80%] mx-auto font-inter">
			<div className="mb-10">
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
			<h1 className="text-3xl font-bold mb-5 text-left">DANH SÁCH HẠNG MỤC KHÁM SỨC KHỎE</h1>

			<button
				onClick={() => navigate("/nurse/health-checkup/create")}
				className="flex items-center gap-2 bg-[#023E73] hover:bg-[#034a8a] text-white font-semibold px-5 py-2 rounded-lg mb-8"
			>
				Tạo hạng mục mới
			</button>

			{categories.length === 0 ? (
				<p className="text-center text-gray-500">Không có dữ liệu.</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{categories.map((cat) => (
						<div
							key={cat.id}
							className="bg-[#E3F2FD] w-[90%] px-6 py-4 rounded-md shadow-sm border border-[#90CAF9]"
						>
							<div className="flex justify-between mb-2 text-lg font-semibold">
								<span className="text-black text-left">{cat.name || "Trống"}</span>
							</div>
							<div className="flex justify-between text-md">
								<span className="text-gray-800 text-left max-w-[60%]">
									{cat.description || "Không có mô tả"}
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}