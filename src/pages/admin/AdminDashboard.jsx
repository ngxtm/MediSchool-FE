import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { toast } from "react-toastify";
import { Zoom } from "react-toastify";
const AdminDashboard = () => {
	const adminSupabase = createClient(
		import.meta.env.VITE_SUPABASE_URL,
		import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		}
	);
	const [userId, setUserId] = useState("");
	const handleDeleteUser = async () => {
		const { error } = await adminSupabase.auth.admin.deleteUser(userId);
		if (!error) {
			toast.success("User deleted successfully", {
				position: "bottom-center",
				autoClose: 2000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: "light",
				transition: Zoom,
			});
		}
		if (error) {
			console.error("Error deleting user:", error);
			toast.error("Error deleting user: " + error.message, {
				position: "bottom-center",
				autoClose: 2000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: "light",
				transition: Zoom,
			});
		}
	};
	return (
		<div className="admin-dashboard">
			<h1>Admin Dashboard</h1>
			<p>
				Welcome to the admin dashboard. Here you can manage users, view reports,
				and configure settings.
			</p>
			<button
				className="bg-red-500 text-white px-4 py-2 rounded-md"
				onClick={handleDeleteUser}
				disabled={!userId}
			>
				Delete User
			</button>
			<input
				className="border border-gray-300 rounded-md p-2"
				type="text"
				placeholder="User ID"
				onChange={(e) => setUserId(e.target.value)}
			/>
		</div>
	);
};

export default AdminDashboard;
