import TaskBar from "../../components/TaskBar";
import StudentBox from "../../components/StudentBox";
import NavToggle from "../../components/NavToggle";
import { Outlet } from "react-router-dom";

const ParentDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            <TaskBar />
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