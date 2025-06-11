import React from 'react';

const StudentBox = ({ student, onClick, className = '' }) => {
    return (
        <div 
            className={`font-inter rounded-lg p-4 flex items-center gap-5 cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors max-w-fit`} 
            onClick={onClick}
        >
            <img 
                src={student?.avatar || "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg"} 
                alt={`${student?.name || 'Student'}'s avatar`} 
                className="w-14 h-14 rounded-full object-cover" 
            />
            <div className="flex flex-col">
                <p className="font-bold">{student?.name || 'Nguyễn Văn A'}</p>
                <p className="text-sm text-gray-600 pr-20">Mã học sinh: {student?.id || 'M1001'}</p>
            </div>
        </div>
    );
}

export default StudentBox;