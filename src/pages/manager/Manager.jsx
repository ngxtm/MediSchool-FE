import { Outlet } from "react-router-dom";
import ManagerTaskBar from "./components/ManagerTaskbar";
import { useState } from "react";
import api from "../../utils/api";
import { useEffect } from "react";
import { Cardio } from "ldrs/react";

const Manager = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const fetchUser = async () => {
		try {
			setLoading(false);
			const { data } = await api.get("me");
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
			<div className="flex items-center justify-center h-screen">
				<Cardio size="100" stroke="4" speed="2" color="#0A3D62" />
			</div>
		);
	}

	return (
		<>
			<ManagerTaskBar userData={user} />
			<div className="p-4">
				<div className="px-28 pt-5">
					<Outlet />
				</div>
			</div>
		</>
	);
};

export default Manager;
