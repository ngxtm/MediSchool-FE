import ParentTaskBar from "../../components/ParentTaskBar";
import StudentBox from "../../components/StudentBox";
import NavToggle from "../../components/NavToggle";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

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
            <Cardio size="100" stroke="4" speed="2" color="#0A3D62" />
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