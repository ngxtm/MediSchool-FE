import { useParams } from "react-router-dom";
import MedicationRequestDetail from "../../../../components/MedicationRequestDetail";
import ReturnButton from "../../../../components/ReturnButton";

const MedicationRequestDetailPage = () => {
	const { id } = useParams();

	return (
		<div className="p-6">
			<div className="space-y-3 mb-6">
			<ReturnButton
				linkNavigate="/nurse/medication-requests/pending"
				actor="nurse"
			/>
			</div>
			<MedicationRequestDetail id={id} />
		</div>
	);
};

export default MedicationRequestDetailPage;