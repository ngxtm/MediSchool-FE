import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import api from "../utils/api";
import { Cardio } from "ldrs/react";

const PrivateRouter = ({ children, requiredRole }) => {
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState(null);

	useEffect(() => {
		const checkUserRole = async () => {
			try {
				const projectRef = supabase.supabaseUrl.split("https://")[1].split(".")[0];
				const session = localStorage.getItem(`sb-${projectRef}-auth-token`);
				const tempSession = sessionStorage.getItem("tempSession");

				if (!session && !tempSession) {
					setLoading(false);
					return;
				}

				const { data } = await api.get("/me");
				setUser(data);
				setLoading(false);
			} catch (error) {
				console.error("Error checking user role:", error);
				setLoading(false);
			}
		};

		checkUserRole();
	}, []);

	const projectRef = supabase.supabaseUrl.split("https://")[1].split(".")[0];
	const session = localStorage.getItem(`sb-${projectRef}-auth-token`);
	const tempSession = sessionStorage.getItem("tempSession");

	if (!session && !tempSession) {
		return <Navigate to="/login" replace />;
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Cardio size="100" stroke="4" speed="2" color="#0A3D62" />
			</div>
		);
	}

	if (requiredRole && user && user.role !== requiredRole) {
		return <Navigate to="/no-role" replace />;
	}

	return children;
};

export default PrivateRouter;
