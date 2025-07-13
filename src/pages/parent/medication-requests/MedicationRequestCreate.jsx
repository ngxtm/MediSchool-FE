import { useLocation } from "react-router-dom";
import MedicationRequestForm from "./MedicationRequestForm.jsx";

export default function MedicationRequestCreate() {
	const location = useLocation();
	const studentId = location.state?.studentId;
	if (!studentId) return <div className="p-6 text-red-500">Không tìm thấy học sinh để tạo đơn.</div>;
	return <MedicationRequestForm isEdit={false} studentId={studentId} />;
}
