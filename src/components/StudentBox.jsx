import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentBox = () => {
	const API_URL = import.meta.env.VITE_API_URL;

	const [studentData, setStudentData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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

	if (error) return <p>{error.message}</p>;
	if (loading) return <p>Loading...</p>;

	return (
		<div
			className={`font-inter rounded-lg p-4 flex items-center gap-5 cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors max-w-fit`}
		>
			<img
				src={
					studentData?.avatar ||
					"https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg"
				}
				alt={`${studentData?.fullName || "Student"}'s avatar`}
				className="w-14 h-14 rounded-full object-cover"
			/>
			<div className="flex flex-col">
				<p className="font-bold">{studentData?.fullName || "Nguyễn Văn A"}</p>
				<p className="text-sm text-gray-600 pr-20">
					Mã học sinh: {studentData?.studentCode || "M1001"}
				</p>
			</div>
		</div>
	);
};

export default StudentBox;
