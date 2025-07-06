import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import api from "../../../../utils/api";
import MedicationRequestList from "./MedicationRequestList";
import Loading from "../../../../components/Loading";

const MedicationRequestPending = () => {
	const { search } = useOutletContext();
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedSearch(search), 400);
		return () => clearTimeout(timeout);
	}, [search]);

	const { data: requests = [], isLoading } = useQuery({
		queryKey: ["pending-medication-requests", debouncedSearch],
		queryFn: async () => {
			if (!debouncedSearch.trim()) {
				const res = await api.get("/medication-requests/pending");
				return res.data;
			}
			const res = await api.get(`/medication-requests/search?keyword=${debouncedSearch}`);
			return res.data.filter((r) => r.medicationStatus === "PENDING");
		},
		enabled: true,
	});

	if (isLoading) return <Loading />;
	return <MedicationRequestList data={requests} />;
};

export default MedicationRequestPending;
