import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../utils/api";
import MedicationRequestList from "./MedicationRequestList";
import Loading from "../../../../components/Loading";

const MedicationRequestPending = () => {
	const { search } = useOutletContext();

	const { data: requests = [], isLoading } = useQuery({
		queryKey: ["pending-medication-requests"],
		queryFn: async () => (await api.get("/medication-requests/pending")).data,
	});

	const filteredRequests = requests.filter((req) =>
		req.student?.fullName?.toLowerCase().includes(search.toLowerCase())
	);

	if (isLoading) return <Loading />;

	return <MedicationRequestList data={filteredRequests} />;
};

export default MedicationRequestPending;
