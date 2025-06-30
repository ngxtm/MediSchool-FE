import { CircleAlert, FileText, Package, Search, User } from "lucide-react";
import DetailBox from "../../components/DetailBox";
import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Input, DatePicker, Select } from "antd";
import { Dialog } from "radix-ui";
import { Zoom, toast } from "react-toastify";
import api from "../../../../utils/api";

const StudentCreateDialog = ({ open, onOpenChange, onCreateSuccess }) => {
	const [formData, setFormData] = useState({
		studentCode: "",
		fullName: "",
		classCode: "",
		grade: null,
		dateOfBirth: null,
		address: "",
		gender: "",
		enrollmentDate: null,
		emergencyContact: "",
		emergencyPhone: "",
		status: "ACTIVE"
	});
	const [classes, setClasses] = useState([]);
	const [loading, setLoading] = useState(false);

	const queryClient = useQueryClient();

	const toastErrorPopup = (message) => {
		toast.error(message, {
			position: "bottom-center",
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: false,
			draggable: true,
			progress: undefined,
			theme: "light",
			transition: Zoom,
		});
	};

	const toastSuccessPopup = (message) => {
		toast.success(message, {
			position: "bottom-center",
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: false,
			draggable: true,
			progress: undefined,
			theme: "light",
			transition: Zoom,
		});
	};

	useEffect(() => {
		let isMounted = true;
		const fetchClasses = async () => {
			try {
				const response = await api.get("/classes");
				if (isMounted) setClasses(response.data);
			} catch (error) {
				console.error("Error fetching classes:", error);
				if (isMounted) {
					toastErrorPopup("Lỗi khi tải danh sách lớp: " + error.message);
				}
			}
		};

		if (open) {
			fetchClasses();
		}

		return () => {
			isMounted = false;
		};
	}, [open]);

	const createStudentMutation = useMutation({
		mutationFn: (newStudent) => {
			// Convert date arrays to proper format for API
			const studentData = {
				...newStudent,
				dateOfBirth: newStudent.dateOfBirth ? [
					newStudent.dateOfBirth.year(),
					newStudent.dateOfBirth.month() + 1,
					newStudent.dateOfBirth.date()
				] : null,
				enrollmentDate: newStudent.enrollmentDate ? [
					newStudent.enrollmentDate.year(),
					newStudent.enrollmentDate.month() + 1,
					newStudent.enrollmentDate.date()
				] : null
			};
			return api.post("/students", studentData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["students"] });
			toastSuccessPopup("Thêm học sinh mới thành công!");
			setFormData({
				studentCode: "",
				fullName: "",
				classCode: "",
				grade: null,
				dateOfBirth: null,
				address: "",
				gender: "",
				enrollmentDate: null,
				emergencyContact: "",
				emergencyPhone: "",
				status: "ACTIVE"
			});
			if (onCreateSuccess) onCreateSuccess();
		},
		onError: (error) => {
			toastErrorPopup("Lỗi khi thêm học sinh: " + error.message);
		}
	});

	const handleSubmit = () => {
		// Validate required fields
		if (!formData.studentCode || !formData.fullName || !formData.classCode || !formData.gender) {
			toastErrorPopup("Vui lòng điền đầy đủ thông tin bắt buộc!");
			return;
		}

		setLoading(true);
		createStudentMutation.mutate(formData);
		setLoading(false);
	};

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange} className="font-inter">
			<Dialog.Trigger asChild>
				<button className="bg-[#023E73] text-white px-7 py-1.5 rounded-lg font-bold text-base transition-all duration-200 ease-in-out hover:bg-[#01294d] hover:scale-105 hover:shadow-lg active:scale-95">
					Thêm học sinh mới
				</button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/60 data-[state=open]:animate-overlayShow" />
				<Dialog.Content className="fixed left-1/2 top-1/2 max-h-[90vh] w-[90vw] max-w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white py-8 px-6 shadow-lg focus:outline-none data-[state=open]:animate-contentShow overflow-y-auto">
					<Dialog.Title className="m-0 text-2xl font-bold text-[#023E73] text-center mb-2">
						Thêm học sinh mới
					</Dialog.Title>
					<Dialog.Description className="mb-6 text-[15px] leading-normal text-gray-600 text-center">
						Điền thông tin để thêm học sinh mới vào hệ thống
					</Dialog.Description>

					<div className="grid grid-cols-2 gap-4">
						{/* Mã học sinh */}
						<div className="flex flex-col gap-2">
							<label className="text-[14px] font-semibold text-gray-700" htmlFor="studentCode">
								Mã học sinh <span className="text-red-500">*</span>
							</label>
							<input
								className="h-[36px] rounded-md px-3 text-[14px] border-gray-300 leading-none border outline-none focus:border-[#1676fb] focus:border-2 placeholder:text-[#bfbfbf]"
								id="studentCode"
								value={formData.studentCode}
								onChange={(e) => handleInputChange("studentCode", e.target.value)}
								placeholder="Ví dụ: HS0001"
							/>
						</div>

						{/* Họ và tên */}
						<div className="flex flex-col gap-2">
							<label className="text-[14px] font-semibold text-gray-700" htmlFor="fullName">
								Họ và tên <span className="text-red-500">*</span>
							</label>
							<input
								className="h-[36px] rounded-md px-3 text-[14px] border-gray-300 leading-none border outline-none focus:border-[#1676fb] focus:border-2 placeholder:text-[#bfbfbf]"
								id="fullName"
								value={formData.fullName}
								onChange={(e) => handleInputChange("fullName", e.target.value)}
								placeholder="Nguyễn Văn A"
							/>
						</div>

						{/* Lớp */}
						<div className="flex flex-col gap-2">
							<label className="text-[14px] font-semibold text-gray-700">
								Lớp <span className="text-red-500">*</span>
							</label>
							<Select
								className="custom-select"
								placeholder="Chọn lớp"
								value={formData.classCode}
								onChange={(value) => {
									handleInputChange("classCode", value);
									const selectedClass = classes.find(c => c.name === value);
									if (selectedClass && selectedClass.name) {
										// Extract grade from class name (e.g., "2.1" -> grade 2)
										const grade = parseInt(selectedClass.name.split('.')[0]);
										handleInputChange("grade", grade);
									}
								}}
								options={classes.map((c) => {
									const grade = c.name ? parseInt(c.name.split('.')[0]) : '';
									return {
										value: c.name,
										label: `Lớp ${c.name}${grade ? ` - Khối ${grade}` : ''}`,
									};
								})}
								getPopupContainer={(trigger) => trigger.parentNode}
							/>
						</div>

						{/* Giới tính */}
						<div className="flex flex-col gap-2">
							<label className="text-[14px] font-semibold text-gray-700">
								Giới tính <span className="text-red-500">*</span>
							</label>
							<Select
								className="custom-select"
								placeholder="Chọn giới tính"
								value={formData.gender}
								onChange={(value) => handleInputChange("gender", value)}
								options={[
									{ value: "MALE", label: "Nam" },
									{ value: "FEMALE", label: "Nữ" },
								]}
								getPopupContainer={(trigger) => trigger.parentNode}
							/>
						</div>

						{/* Ngày sinh */}
						<div className="flex flex-col gap-2">
							<label className="text-[14px] font-semibold text-gray-700">
								Ngày sinh
							</label>
							<DatePicker
								className="custom-picker h-[36px]"
								format="DD/MM/YYYY"
								placeholder="Chọn ngày sinh"
								value={formData.dateOfBirth}
								onChange={(date) => handleInputChange("dateOfBirth", date)}
								getPopupContainer={(trigger) => trigger.parentNode}
							/>
						</div>

						{/* Ngày nhập học */}
						<div className="flex flex-col gap-2">
							<label className="text-[14px] font-semibold text-gray-700">
								Ngày nhập học
							</label>
							<DatePicker
								className="custom-picker h-[36px]"
								format="DD/MM/YYYY"
								placeholder="Chọn ngày nhập học"
								value={formData.enrollmentDate}
								onChange={(date) => handleInputChange("enrollmentDate", date)}
								getPopupContainer={(trigger) => trigger.parentNode}
							/>
						</div>

						{/* Người liên hệ khẩn cấp */}
						<div className="flex flex-col gap-2">
							<label className="text-[14px] font-semibold text-gray-700" htmlFor="emergencyContact">
								Người liên hệ khẩn cấp
							</label>
							<input
								className="h-[36px] rounded-md px-3 text-[14px] border-gray-300 leading-none border outline-none focus:border-[#1676fb] focus:border-2 placeholder:text-[#bfbfbf]"
								id="emergencyContact"
								value={formData.emergencyContact}
								onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
								placeholder="Ví dụ: Bố, Mẹ, ..."
							/>
						</div>

						{/* Số điện thoại khẩn cấp */}
						<div className="flex flex-col gap-2">
							<label className="text-[14px] font-semibold text-gray-700" htmlFor="emergencyPhone">
								Số điện thoại khẩn cấp
							</label>
							<input
								className="h-[36px] rounded-md px-3 text-[14px] border-gray-300 leading-none border outline-none focus:border-[#1676fb] focus:border-2 placeholder:text-[#bfbfbf]"
								id="emergencyPhone"
								value={formData.emergencyPhone}
								onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
								placeholder="0798896743"
							/>
						</div>
					</div>

					{/* Địa chỉ - full width */}
					<div className="flex flex-col gap-2 mt-4">
						<label className="text-[14px] font-semibold text-gray-700" htmlFor="address">
							Địa chỉ
						</label>
						<textarea
							className="min-h-[60px] rounded-md px-3 py-2 text-[14px] border-gray-300 leading-none border outline-none focus:border-[#1676fb] focus:border-2 placeholder:text-[#bfbfbf] resize-none"
							id="address"
							value={formData.address}
							onChange={(e) => handleInputChange("address", e.target.value)}
							placeholder="Ví dụ: BS16, Vinhomes Grand Park, P. Long Bình, TP. Thủ Đức, TP.HCM"
							rows={3}
						/>
					</div>

					{/* Buttons */}
					<div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
						<Dialog.Close asChild>
							<button className="px-6 py-2 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors font-medium">
								Hủy
							</button>
						</Dialog.Close>
						<button
							className="px-6 py-2 rounded-md bg-[#023E73] text-white hover:bg-[#01294d] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={handleSubmit}
							disabled={loading || createStudentMutation.isPending}
						>
							{loading || createStudentMutation.isPending ? "Đang thêm..." : "Thêm học sinh"}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

const Student = () => {
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

	const queryClient = useQueryClient();

    const handleCreateSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ["students"] });
        setIsDialogOpen(false);
    };

    return (
        <div className="font-inter">
            <div className="flex max-w-full justify-between mb-16">
				<DetailBox
					title="Tổng số học sinh"
					icon={<User size={28} />}
					number={79}
                    subText={"toàn trường"}
				/>
				<DetailBox
					title="Giấy đồng thuận"
					icon={<FileText size={28} />}
					number={79}
                    subText={"đang xử lý"}
				/>
				<DetailBox
					title="Đơn dặn thuốc"
					icon={<Package size={28} />}
					number={15}
                    subText={"đang xử lý"}
				/>
				<DetailBox
					title="Sự kiện y tế"
					icon={<CircleAlert size={28} />}
					number={4}
                    subText={"tuần này"}
				/>
			</div>
            <div className="flex px-[100px] justify-between">
				<div className="flex items-center max-w-fit gap-8">
					<Input
						prefix={<Search size={16} className="text-gray-400 mr-4" />}
						placeholder="Tìm kiếm học sinh"
						style={{ width: 300 }}
						className="h-[38px] rounded-[8px] !border-[#d9d9d9]"
						allowClear
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<div className="flex gap-10">
					<StudentCreateDialog
						open={isDialogOpen}
						onOpenChange={setIsDialogOpen}
						onCreateSuccess={handleCreateSuccess}
					/>
				</div>
			</div>
        </div>
    );
}

export default Student;