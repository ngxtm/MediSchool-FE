import { useParams } from "react-router-dom";
import MedicationRequestDetail from "../../../../components/MedicationRequestDetail";

const MedicationRequestPage = () => {
	const { id } = useParams();

	return <MedicationRequestDetail id={id} />;
};

export default MedicationRequestPage;