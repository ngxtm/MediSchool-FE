import { useParams } from "react-router-dom";
import MedicationRequestDetail from "src/components/MedicationRequestDetail.jsx";

const MedicationRequestPage = () => {
	const { id } = useParams();

	return <MedicationRequestDetail id={id} />;
};

export default MedicationRequestPage;