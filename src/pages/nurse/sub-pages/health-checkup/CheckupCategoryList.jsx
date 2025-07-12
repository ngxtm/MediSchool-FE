import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../../utils/api.js";
import { ArrowLeft, Pencil, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";

export default function CheckupCategoryList() {
	const [categories, setCategories] = useState([]);
	const [openDialog, setOpenDialog] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({ name: "", description: "" });
	const [editingId, setEditingId] = useState(null);
	const navigate = useNavigate();

	const fetchCategories = () => {
		api.get("/checkup-categories")
			.then((res) => setCategories(res.data))
			.catch(() => toast.error("Không thể tải danh sách hạng mục khám"));
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	const handleOpenCreate = () => {
		setFormData({ name: "", description: "" });
		setIsEditing(false);
		setOpenDialog(true);
	};

	const handleEdit = (cat) => {
		setFormData({ name: cat.name || "", description: cat.description || "" });
		setEditingId(cat.id);
		setIsEditing(true);
		setOpenDialog(true);
	};

	const handleDelete = (id) => {
		if (toast.isActive("confirm-delete")) return;

		toast(
			({ closeToast }) => (
				<div>
					<p className="mb-3 font-medium font-inter text-black">
						Bạn có chắc chắn muốn xoá <span className="font-bold">hạng mục khám</span> này không?
					</p>
					<div className="flex justify-end gap-2">
						<button
							className="px-3 py-2 text-sm text-black rounded bg-gray-300 hover:bg-gray-400 font-inter"
							onClick={closeToast}
						>
							Hủy
						</button>
						<button
							className="px-3 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 font-inter"
							onClick={async () => {
								try {
									await api.delete(`/checkup-categories/${id}`);
									toast.dismiss("confirm-delete");
									toast.success("Đã xoá hạng mục thành công!");

									const res = await api.get("/checkup-categories");
									setCategories(res.data);
								} catch (err) {
									console.error("Lỗi khi xóa hạng mục:", err);
									toast.error("Không thể xoá hạng mục. Vui lòng thử lại.");
								}
							}}
						>
							Xác nhận
						</button>
					</div>
				</div>
			),
			{
				autoClose: false,
				closeOnClick: false,
				position: "top-center",
				toastId: "confirm-delete",
			}
		);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (isEditing) {
				await api.put(`/checkup-categories/${editingId}`, formData);
				toast.success("Đã cập nhật hạng mục");
			} else {
				await api.post("/checkup-categories", formData);
				toast.success("Đã tạo hạng mục");
			}
			setOpenDialog(false);
			fetchCategories();
		} catch {
			toast.error("Lỗi khi lưu dữ liệu");
		}
	};

	return (
		<div className="max-w-[80%] mx-auto font-inter">
			<div className="mb-10">
				<button
					onClick={() => navigate(-1)}
					className="group border px-8 py-1 rounded-3xl font-bold text-base flex items-center gap-4 bg-[#023E73] text-white"
				>
					<ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
					Trở về
				</button>
			</div>

			<h1 className="text-3xl font-bold mb-5 text-left">DANH SÁCH HẠNG MỤC KHÁM SỨC KHỎE</h1>

			<Dialog.Root open={openDialog} onOpenChange={setOpenDialog}>
				<Dialog.Trigger asChild>
					<button
						onClick={handleOpenCreate}
						className="flex items-center gap-2 bg-[#023E73] hover:bg-[#034a8a] text-white text-lg font-semibold px-6 py-3 rounded-lg mb-8"
					>
						<Plus size={18} />
						Tạo hạng mục mới
					</button>
				</Dialog.Trigger>

				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 bg-black/30" />
					<Dialog.Content className="fixed bg-white p-10 rounded-lg shadow-xl w-full max-w-[60%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
						<Dialog.Title className="text-2xl font-bold mb-2">
							{isEditing ? "Chỉnh sửa hạng mục" : "Thêm hạng mục khám sức khỏe"}
						</Dialog.Title>
						<Dialog.Description className="text-md text-gray-500 mb-6">
							Vui lòng nhập tên và ý nghĩa của hạng mục khám sức khỏe.
						</Dialog.Description>

						<form onSubmit={handleSubmit} className="space-y-6">
							<div>
								<label className="font-semibold text-lg block mb-2">Tên hạng mục</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									placeholder="VD: Tai - mũi - họng, Da liễu,..."
									className="w-full border px-4 py-2 rounded-md"
								/>
							</div>

							<div>
								<label className="font-semibold text-lg block mb-2">Ý nghĩa hạng mục</label>
								<textarea
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									placeholder="VD: Phát hiện một số bệnh lý bất thường về Tai - mũi - họng,..."
									className="w-full border px-4 py-2 rounded-md"
								/>
							</div>

							<div className="flex justify-center gap-6 pt-1">
								<Dialog.Close asChild>
									<button type="button" className="px-8 py-3 rounded-xl text-lg font-semibold bg-gray-200 hover:bg-gray-300">
										Hủy
									</button>
								</Dialog.Close>
								<button
									type="submit"
									className="px-8 py-3 rounded-xl text-lg font-semibold bg-[#023E73] text-white hover:bg-[#034a8a]"
								>
									{isEditing ? "Cập nhật" : "Tạo"}
								</button>
							</div>
						</form>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>

			{categories.length === 0 ? (
				<p className="text-center text-gray-500">Không có dữ liệu.</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{categories.map((cat) => (
						<div
							key={cat.id}
							className="relative bg-[#E3F2FD] px-6 py-4 rounded-md shadow-sm border border-[#90CAF9] w-[90%]"
						>
							<div className="absolute top-5 right-5 flex gap-2">
								<button onClick={() => handleEdit(cat)}>
									<Pencil size={20} className="text-black hover:text-gray-700" />
								</button>
								<button onClick={() => handleDelete(cat.id)}>
									<Trash2 size={20} className="text-red-600 hover:text-red-800" />
								</button>
							</div>
							<div className="text-lg font-semibold text-black">{cat.name || "Trống"}</div>
							<p className="text-gray-700 mt-1">
								{cat.description || "Không có mô tả"}
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}