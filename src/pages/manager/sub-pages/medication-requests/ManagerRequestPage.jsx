import { useParams } from "react-router-dom";
import ReturnButton from "../../../../components/ReturnButton";
import MedicationRequestDetail from '../../../nurse/sub-pages/medication-requests/MedicationRequestDetail.jsx'

const MedicationRequestDetailPage = () => {
	const { id } = useParams();

	return (
		<div className="p-6">
			<div className="space-y-3 mb-6">
			<ReturnButton
				linkNavigate="/manager/medication-requests/pending"
				actor="nurse"
			/>
			</div>
			<MedicationRequestDetail id={id} />
		</div>
	);
};

export default MedicationRequestDetailPage;