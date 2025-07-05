import ParentTaskBar from "./ParentTaskBar.jsx";
import StudentBox from "../../components/StudentBox";
import NavToggle from "../../components/NavToggle";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { StudentProvider } from "../../context/StudentContext";
import Loading from "../../components/Loading";

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
        return (
            <Loading />
        )
    }

    return (
        <StudentProvider>
            <div className="min-h-screen font-inter">
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
        </StudentProvider>
    );
}

export default ParentDashboard;