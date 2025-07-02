import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";
import { useQuery } from '@tanstack/react-query';
import { useStudent } from "../../context/StudentContext";
import api from "../../utils/api";
import Loading from "../../components/Loading";

const StudentInfo = () => {
	const { selectedStudent } = useStudent();
	
	const {
		data: studentData,
		isLoading: loading,
		isError: error,
		error: errorMessage
	} = useQuery({
		queryKey: ['studentDetails', selectedStudent?.studentId],
		queryFn: async () => {
			if (!selectedStudent?.studentId) return null;
			const response = await api.get(`/students/${selectedStudent.studentId}`);
			return response.data;
		},
		enabled: !!selectedStudent?.studentId,
		staleTime: 5 * 60 * 1000,
		cacheTime: 10 * 60 * 1000,
	});

	if (!selectedStudent) {
		return (
			<div className="flex justify-center items-center h-64">
				<p className="text-gray-600">Vui lòng chọn học sinh để xem thông tin</p>
			</div>
		);
	}

	if (loading)
		return <Loading />
	if (error) return <p className="text-red-600 text-center p-4">Có lỗi xảy ra: {errorMessage?.message || 'Không thể tải thông tin học sinh'}</p>;

	const rowBlue =
		"flex justify-between flex-col md:flex-row bg-[#DAEAF7] px-6 py-3 rounded-xl";
	const rowWhite = "flex justify-between flex-col md:flex-row px-6 py-3";
	const header = "font-bold mb-4 text-2xl mb-6";
	return (
		<div className="flex justify-between gap-4 md:gap-30 md:flex-row flex-col">
			<div className="md:w-1/2">
				<h1 className={header}>Thông tin học sinh</h1>
				<div className={rowBlue}>
					<p className="w-fit font-bold">Họ và tên</p>
					<p className="w-fit">{studentData?.fullName || "N/A"}</p>
				</div>
				<div className={rowWhite}>
					<p className="w-fit font-bold">Mã học sinh</p>
					<p className="w-fit">{studentData?.studentCode || "N/A"}</p>
				</div>
				<div className={rowBlue}>
					<p className="w-fit font-bold">Giới tính</p>
					<p className="w-fit">
						{studentData?.gender === "MALE"
							? "Nam"
							: studentData?.gender === "FEMALE"
							? "Nữ"
							: "N/A"}
					</p>
				</div>
				<div className={rowWhite}>
					<p className="w-fit font-bold">Ngày sinh</p>
					<p className="w-fit">
						{studentData?.dateOfBirth
							? new Date(studentData.dateOfBirth).toLocaleDateString("vi-VN")
							: "N/A"}
					</p>
				</div>
				<div className={rowBlue}>
					<p className="w-fit font-bold">Lớp</p>
					<p className="w-fit">{studentData?.classCode || "N/A"}</p>
				</div>
				<div className={rowWhite}>
					<p className="w-fit font-bold">Ngày nhập học</p>
					<p className="w-fit">
						{studentData?.enrollmentDate
							? new Date(studentData.enrollmentDate).toLocaleDateString("vi-VN")
							: "N/A"}
					</p>
				</div>
			</div>
			<div className="md:w-1/2">
				<h1 className={header}>Thông tin liên hệ</h1>
				<div className={rowBlue}>
					<p className="w-fit font-bold">Bố</p>
					<p className="w-fit">{studentData?.fatherName || "N/A"}</p>
				</div>
				<div className={rowWhite}>
					<p className="w-fit font-bold">Số điện thoại</p>
					<p className="w-fit">{studentData?.fatherPhone || "N/A"}</p>
				</div>
				<div className={rowBlue}>
					<p className="w-fit font-bold">Mẹ</p>
					<p className="w-fit">{studentData?.motherName || "N/A"}</p>
				</div>
				<div className={rowWhite}>
					<p className="w-fit font-bold">Số điện thoại</p>
					<p className="w-fit">{studentData?.motherPhone || "N/A"}</p>
				</div>
				<div className={rowBlue}>
					<p className="w-fit font-bold">Liên hệ khẩn cấp</p>
					<p className="w-fit">
						{studentData?.emergencyPhone || "N/A"} (
						{studentData?.emergencyContact || "N/A"})
					</p>
				</div>
				<div className={rowWhite}>
					<p className="w-fit font-bold">Địa chỉ</p>
					<p className="w-fit">{studentData?.address || "N/A"}</p>
				</div>
			</div>
		</div>
	);
};

export default StudentInfo;
