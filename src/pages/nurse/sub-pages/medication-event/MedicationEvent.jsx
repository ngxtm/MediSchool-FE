import { Outlet } from "react-router-dom";
import NurseTaskBar from "../NurseTaskbar.jsx";
import { useState, useEffect } from "react";
import api from "../../../../utils/api";
import Loading from "../../../../components/Loading";

const MedicationEvent = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const fetchUser = async () => {
		try {
			const { data } = await api.get("me");
			setUser(data);
		} catch (err) {
			console.error("Error fetching user:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUser();
	}, []);

	if (loading) {
		return <Loading />;
	}

	return (
		<>
			<NurseTaskBar userData={user} />
			<div className="p-4">
				<div className="px-28 pt-5">
					<Outlet />
				</div>
			</div>
		</>
	);
};

export default MedicationEvent;
