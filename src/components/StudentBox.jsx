import React, { useState } from 'react'
import { useStudent } from '../context/StudentContext'

const StudentBox = () => {
  const { selectedStudent, studentsList, loading, error, selectStudent } = useStudent()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  if (loading) return <p>Loading students...</p>
  if (error) return <p>Error loading students: {error.message}</p>
  if (studentsList.length === 0) return <p>No students found</p>

  const handleStudentSelect = student => {
    selectStudent(student)
    setIsDropdownOpen(false)
  }

  return (
    <div className="relative">
      <div
        className={`font-inter flex max-w-fit cursor-pointer items-center gap-5 rounded-lg bg-gray-100 p-4 transition-colors hover:bg-gray-200 ${isDropdownOpen ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <img
          src={
            selectedStudent?.avatar ||
            'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg'
          }
          alt={`${selectedStudent?.fullName || 'Student'}'s avatar`}
          className="h-14 w-14 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <p className="font-bold">{selectedStudent?.fullName || 'Chọn học sinh'}</p>
          <p className="pr-20 text-sm text-gray-600">Mã học sinh: {selectedStudent?.studentCode || 'N/A'}</p>
        </div>
        {studentsList.length > 1 && (
          <svg
            className={`h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {isDropdownOpen && studentsList.length > 1 && (
        <div className="absolute top-full left-0 z-10 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg">
          {studentsList.map(student => (
            <div
              key={student.id}
              className={`flex cursor-pointer items-center gap-3 p-4 hover:bg-gray-50 ${
                selectedStudent?.id === student.id ? 'border-l-4 border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleStudentSelect(student)}
            >
              <img
                src={
                  student.avatar ||
                  'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg'
                }
                alt={`${student.fullName}'s avatar`}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <p className="font-medium">{student.fullName}</p>
                <p className="text-sm text-gray-600">Mã HS: {student.studentCode || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudentBox
