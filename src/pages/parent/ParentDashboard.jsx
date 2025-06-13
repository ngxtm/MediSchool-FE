import TaskBar from "../../components/TaskBar";
import StudentBox from "../../components/StudentBox";
import NavToggle from "../../components/NavToggle";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api";

const ParentDashboard = () => {
    const [user, setUser] = useState(null);
    const fetchUser = async () => {
        try {
            const { data } = await api.get('me');
            setUser(data);
        } catch (err) {
            console.error("Error fetching user: ", err);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            <TaskBar userData={user}/>
            <div className="px-20 py-6">
                <StudentBox />
                <div className="mt-6">
                    <NavToggle />
                </div>
                <div className="mt-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default ParentDashboard;