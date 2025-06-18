import ParentTaskBar from "../../components/ParentTaskBar";
import StudentBox from "../../components/StudentBox";
import NavToggle from "../../components/NavToggle";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api";

const ParentDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            setLoading(false);
            const { data } = await api.get('me');
            setUser(data);
        } catch (err) {
            console.error("Error fetching user: ", err);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            <ParentTaskBar userData={user}/>
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