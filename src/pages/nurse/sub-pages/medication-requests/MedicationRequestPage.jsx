import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MedicationRequestDetail from "../../../../components/MedicationRequestDetail";

const MedicationRequestDetailPage = () => {
	const navigate = useNavigate();
	const { id } = useParams();

	return (
		<div className="p-6">
			<button
				onClick={() => navigate(-1)}
				className="flex items-center gap-2 mb-6 px-4 py-2 border border-black rounded-full text-sm text-black"
			>
				<ArrowLeft className="w-4 h-4" />
				Trở về
			</button>

			<MedicationRequestDetail id={id} />
		</div>
	);
};

export default MedicationRequestDetailPage;