import React, { useState } from "react";
import { useStudent } from "../context/StudentContext";

const StudentBox = () => {
	const { selectedStudent, studentsList, loading, error, selectStudent } = useStudent();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	if (loading) return <p>Loading students...</p>;
	if (error) return <p>Error loading students: {error.message}</p>;
	if (studentsList.length === 0) return <p>No students found</p>;

	const handleStudentSelect = (student) => {
		selectStudent(student);
		setIsDropdownOpen(false);
	};

	return (
		<div className="relative">
			<div
				className={`font-inter rounded-lg p-4 flex items-center gap-5 cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors max-w-fit ${isDropdownOpen ? 'ring-2 ring-blue-500' : ''}`}
				onClick={() => setIsDropdownOpen(!isDropdownOpen)}
			>
				<img
					src={
						selectedStudent?.avatar ||
						"https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg"
					}
					alt={`${selectedStudent?.fullName || "Student"}'s avatar`}
					className="w-14 h-14 rounded-full object-cover"
				/>
				<div className="flex flex-col">
					<p className="font-bold">{selectedStudent?.fullName || "Chọn học sinh"}</p>
					<p className="text-sm text-gray-600 pr-20">
						Mã học sinh: {selectedStudent?.studentCode || "N/A"}
					</p>
				</div>
				{studentsList.length > 1 && (
					<svg
						className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				)}
			</div>

			{isDropdownOpen && studentsList.length > 1 && (
				<div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
					{studentsList.map((student) => (
						<div
							key={student.id}
							className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 ${
								selectedStudent?.id === student.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
							}`}
							onClick={() => handleStudentSelect(student)}
						>
							<img
								src={
									student.avatar ||
									"https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg"
								}
								alt={`${student.fullName}'s avatar`}
								className="w-10 h-10 rounded-full object-cover"
							/>
							<div className="flex flex-col">
								<p className="font-medium">{student.fullName}</p>
								<p className="text-sm text-gray-600">
									Mã HS: {student.studentCode || "N/A"}
								</p>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default StudentBox;
