import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api";
import MedicationRequestForm from "./MedicationRequestForm";

export default function MedicationRequestUpdate() {
	const { id } = useParams();

	const { data, isLoading, isError } = useQuery({
		queryKey: ["medication-update", id],
		queryFn: () => api.get(`/medication-requests/${id}`).then(res => res.data),
		enabled: !!id,
	});

	if (isLoading) return <div className="p-6">Đang tải dữ liệu...</div>;
	if (isError) return <div className="p-6 text-red-500">Không thể tải dữ liệu.</div>;

	return <MedicationRequestForm isEdit={true} editData={data} />;
}