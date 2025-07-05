import { Outlet } from "react-router-dom";
import NurseTaskBar from "./components/NurseTaskbar.jsx";
import { useState } from "react";
import api from "../../utils/api";
import { useEffect } from "react";
import { Cardio } from "ldrs/react";
import Loading from "../../components/Loading.jsx";
import useActorNavigation from "../../hooks/useActorNavigation.jsx";

const NurseDashboard = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useActorNavigation('nurse')

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
		return <Loading />
	}

	return (
		<div className="min-h-screen">
			<NurseTaskBar userData={user} />
			<div className="p-4">
				<div className="px-28 pt-5">
					<Outlet />
				</div>
			</div>
		</div>
	);
};

export default NurseDashboard;
