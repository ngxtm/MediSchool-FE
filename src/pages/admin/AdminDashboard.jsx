import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
const AdminDashboard = () => {
    const adminSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
    const [userId, setUserId] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const handleDeleteUser = async () => {
        const { data, error } = await adminSupabase.auth.admin.deleteUser(userId)
        if (data) {
            setSuccess("User deleted successfully")
        }
        if (error) {
            console.error("Error deleting user:", error)
            setError(error)
        }
    }
    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <p>Welcome to the admin dashboard. Here you can manage users, view reports, and configure settings.</p>
            <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={handleDeleteUser} disabled={!userId}>Delete User</button>
            <input className="border border-gray-300 rounded-md p-2" type="text" placeholder="User ID" onChange={(e) => setUserId(e.target.value)} />
            {error && <p className="text-red-500">{error?.message}</p>}
            {success && <p className="text-green-500">{success}</p>}
        </div>
    );
}

export default AdminDashboard;