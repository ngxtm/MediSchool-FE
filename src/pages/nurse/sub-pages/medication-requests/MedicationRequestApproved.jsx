import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import api from "../../../../utils/api.js";
import MedicationRequestList from "./MedicationRequestList.jsx";
import Loading from "../../../../components/Loading.jsx";

const MedicationRequestApproved = () => {
	const { search } = useOutletContext();
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedSearch(search), 400); // debounce
		return () => clearTimeout(timeout);
	}, [search]);

	const { data: requests = [], isLoading } = useQuery({
		queryKey: ["approved-medication-requests", debouncedSearch],
		queryFn: async () => {
			if (!debouncedSearch.trim()) {
				const res = await api.get("/medication-requests/approved");
				return res.data;
			}
			const res = await api.get(`/medication-requests/search?keyword=${debouncedSearch}`);

			return res.data.filter((r) => r.medicationStatus === "APPROVED" || "DISPENSING");
		},
		enabled: true,
	});

	if (isLoading) return <Loading />;

	return <MedicationRequestList data={requests} />;
};

export default MedicationRequestApproved;
