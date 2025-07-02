import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../utils/api";
import MedicationRequestList from "./MedicationRequestList";
import Loading from "../../../../components/Loading";

const MedicationRequestApproved = () => {
	const { search } = useOutletContext();

	const { data: requests = [], isLoading } = useQuery({
		queryKey: ["approved-medication-requests"],
		queryFn: async () => {
			const res = await api.get("/medication-requests/approved");
			return Array.isArray(res.data) ? res.data : [res.data];
		},
	});

	if (isLoading) return <Loading />;

	const filteredRequests = !search?.trim()
		? requests
		: requests.filter((req) =>
			req.student?.fullName?.toLowerCase().includes(search.trim().toLowerCase())
		);


	return <MedicationRequestList data={filteredRequests} />;
};

export default MedicationRequestApproved;
