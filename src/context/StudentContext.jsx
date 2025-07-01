import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentsList, setStudentsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch students list khi component mount
    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/me/students');
            const students = response.data;
            setStudentsList(students);
            
            // Auto select first student if available
            if (students.length > 0 && !selectedStudent) {
                setSelectedStudent(students[0]);
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const selectStudent = (student) => {
        setSelectedStudent(student);
    };

    const value = {
        selectedStudent,
        studentsList,
        loading,
        error,
        selectStudent,
        fetchStudents
    };

    return (
        <StudentContext.Provider value={value}>
            {children}
        </StudentContext.Provider>
    );
};

export const useStudent = () => {
    const context = useContext(StudentContext);
    if (!context) {
        throw new Error('useStudent must be used within a StudentProvider');
    }
    return context;
}; 