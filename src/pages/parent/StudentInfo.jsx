import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";
import { useEffect, useState } from "react";
import axios from "axios";

const StudentInfo = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [studentData, setStudentData] = useState(null);

	const API_URL = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const fetchStudentData = async () => {
			try {
				const response = await axios.get(`${API_URL}/api/students/21`);
				setStudentData(response.data);
			} catch (err) {
				console.error("Error fetching student data:", err);
				setError(err);
			} finally {
				setLoading(false);
			}
		};
		fetchStudentData();
	}, [API_URL]);

	if (loading)
		return (
			<div className="flex justify-center items-start h-screen mt-40">
				<Cardio size="100" stroke="4" speed="2" color="#0A3D62" />
			</div>
		);
	if (error) return <p>{error.message}</p>;

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
					<p className="w-fit">Mã học sinh</p>
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
