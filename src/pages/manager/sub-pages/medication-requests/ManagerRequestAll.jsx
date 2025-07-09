import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import api from "../../../../utils/api.js";
import ManagerRequestList from "./ManagerRequestList.jsx";
import Loading from "../../../../components/Loading.jsx";

const ManagerRequestAll = () => {
	const { search } = useOutletContext();
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedSearch(search), 400);
		return () => clearTimeout(timeout);
	}, [search]);

	const { data: requests = [], isLoading } = useQuery({
		queryKey: ["all-medication-requests", debouncedSearch],
		queryFn: async () => {
			if (!debouncedSearch.trim()) {
				const res = await api.get("/medication-requests/all");
				return res.data;
			}
			const res = await api.get(`/medication-requests/search?keyword=${debouncedSearch}`);
			return res.data;
		},
		enabled: true,
	});

	if (isLoading) return <Loading />;
	return <ManagerRequestList data={requests} />;
};

export default ManagerRequestAll;
