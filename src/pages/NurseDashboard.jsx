import { UserAuth } from "../context/AuthContext";
import { useNavigate, Outlet, Link } from "react-router-dom";
import { useState } from "react";
const NurseDashboard = () => {
    const [error, setError] = useState("");
    const { signOut } = UserAuth();
    const navigate = useNavigate();
    
    const handleSignOut = async () => {
      try {
        await signOut();
        navigate("/login");
      } catch (error) {
        setError(error.message);
        console.log(error);
      }
    }
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Nurse Dashboard</h1>
                <button 
                    onClick={handleSignOut}
                    className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                >
                    Sign Out
                </button>
            </div>
            
            <div className="mb-6">
                <h2 className="mb-3 text-xl font-semibold">Nurse Actions</h2>
                <nav className="flex gap-4">
                    <Link 
                        to="/nurse" 
                        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                        Dashboard
                    </Link>
                    <Link 
                        to="/nurse/update-medicine" 
                        className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                    >
                        Update Medicine
                    </Link>
                </nav>
            </div>
            
            {/* Đây là nơi các nested routes sẽ được render */}
            <div className="pt-4 border-t">
                <Outlet />
            </div>
        </div>
    );
  };
  
  export default NurseDashboard;