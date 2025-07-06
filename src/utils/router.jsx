import {createBrowserRouter, Navigate} from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Nurse from "../pages/nurse/Nurse";
import ForgotPassword from "../pages/ForgotPassword";
import UpdatePassword from "../pages/UpdatePassword";
import PrivateRouter from "./privaterouter";
import NoRole from "../pages/NoRole";
import AuthCallback from "../pages/AuthCallback";
import ParentDashboard from "../pages/parent/ParentDashboard";
import Manager from "../pages/manager/Manager";
import AdminDashboard from "../pages/admin/AdminDashboard";
import StudentInfo from "../pages/parent/StudentInfo";
import MedicalRecord from "../pages/parent/MedicalRecord";
import Vaccination from "../pages/parent/Vaccination";
import HealthCheck from "../pages/parent/HealthCheck";
import MedicationRequest from "../pages/parent/MedicationRequest.jsx";
import MedicationRequestForm from "../pages/parent/MedicationRequestForm.jsx";
import { Student as NurseStudent } from "../pages/nurse/sub-pages/student/index";
import {
	VaccineList as NurseVaccineList,
	VaccineEventDetail as NurseVaccineEventDetail,
	StudentListInEvent as NurseStudentListInEvent,
	ConsentDetail as NurseConsentDetail,
	VaccineRecord as NurseVaccineRecord,
	Vaccination as NurseVaccination,
	VaccinationLayout as VaccinationLayout,
} from "../pages/nurse/sub-pages/vaccine/index";
import ManagerHome from "../pages/manager/sub-pages/Home";
import { HealthCheckup as NurseHealthCheck } from "../pages/nurse/sub-pages/health-checkup/index";
import MedicationRequestPending from "../pages/nurse/sub-pages/medication-requests/MedicationRequestPending.jsx";
import MedicationRequestApproved from "../pages/nurse/sub-pages/medication-requests/MedicationRequestApproved.jsx";
import MedicationRequestAll from "../pages/nurse/sub-pages/medication-requests/MedicationRequestAll.jsx";
import MedicationLayout from "../pages/nurse/sub-pages/medication-requests/MedicationLayout.jsx";
import MedicationEvent from "../pages/nurse/sub-pages/medication-event/MedicationEvent";
import MedicationRequestDetail from '../components/MedicationRequestDetail.jsx'
import MedicationRequestCreate from '../pages/parent/MedicationRequestCreate.jsx'
import MedicationRequestUpdate from '../pages/parent/MedicationRequestUpdate.jsx'
import MedicationRequestPage from '../pages/nurse/sub-pages/medication-requests/MedicationRequestPage.jsx'
const router = createBrowserRouter([
	{ path: "/", element: <Navigate to="/login" replace /> },
	{ path: "/login", element: <Login /> },
	{ path: "/signup", element: <Signup /> },
	{ path: "/forgot-password", element: <ForgotPassword /> },
	{ path: "/update-password", element: <UpdatePassword /> },
	{
		path: "/nurse",
		element: (
			<PrivateRouter requiredRole="NURSE">
				<Nurse />
			</PrivateRouter>
		),
		children: [
			{ index: true, element: <NurseStudent /> },
			{ path: "student", element: <NurseStudent /> },
			{ path: "health-checkup", element: <NurseHealthCheck /> },
			{
				path: "vaccination",
				element: <VaccinationLayout />,
				children: [
					{ index: true, element: <NurseVaccination /> },
					{ path: "vaccine-list", element: <NurseVaccineList /> },
					{ path: "vaccine-event/:id", element: <NurseVaccineEventDetail /> },
					{
						path: "vaccine-event/:id/students",
						element: <NurseStudentListInEvent />,
					},
					{
						path: "vaccine-event/consent/:consentId",
						element: <NurseConsentDetail />,
					},
					{
						path: "vaccine-event/:id/records",
						element: <NurseVaccineRecord />,
					},
				],
			},
			{
				path: "/nurse/medication-requests",
				element: <MedicationLayout />,
				children: [
					{ path: "pending", element: <MedicationRequestPending /> },
					{ path: "approved", element: <MedicationRequestApproved /> },
					{ path: "all", element: <MedicationRequestAll /> },
					{ path: ":id", element: <MedicationRequestPage /> },
				],
			},
			{ path: "medication-event", element: <MedicationEvent /> },
		],
	},
	{
		path: "/parent",
		element: (
			<PrivateRouter requiredRole="PARENT">
				<ParentDashboard />
			</PrivateRouter>
		),
		children: [
			{ index: true, element: <StudentInfo /> },
			{ path: "info", element: <StudentInfo /> },
			{ path: "medical-record", element: <MedicalRecord /> },
			{ path: "vaccination", element: <Vaccination /> },
			{ path: "health-check", element: <HealthCheck /> },
			{ path: "medication-requests", element: <MedicationRequest /> }
		],
	},
	{
		path: "/manager",
		element: (
			<PrivateRouter requiredRole="MANAGER">
				<Manager />
			</PrivateRouter>
		),
		children: [
			{ index: true, element: <ManagerHome /> },
			{ path: "home", element: <ManagerHome /> },
			{
				path: "vaccination",
				element: <VaccinationLayout />,
				children: [
					{ index: true, element: <NurseVaccination /> },
					{
						path: "vaccine-list",
						element: <NurseVaccineList actor="manager" />,
					},
					{
						path: "vaccine-event/:id",
						element: <NurseVaccineEventDetail actor="manager" />,
					},
					{
						path: "vaccine-event/:id/students",
						element: <NurseStudentListInEvent actor="manager" />,
					},
					{
						path: "vaccine-event/consent/:consentId",
						element: <NurseConsentDetail actor="manager" />,
					},
					{
						path: "vaccine-event/:id/records",
						element: <NurseVaccineRecord actor="manager" />,
					},
				],
			},
		],
	},
	{
		path: "/admin",
		element: (
			<PrivateRouter requiredRole="ADMIN">
				<AdminDashboard />
			</PrivateRouter>
		),
	},
	{ path: "/no-role", element: <NoRole /> },
	{ path: "/auth/callback", element: <AuthCallback /> },
	{ path: "medication-requests/:id", element:<MedicationRequestDetail/>},
	{ path: "medication-requests/create", element: <MedicationRequestCreate /> },
	{ path: "medication-requests/:id/update", element: <MedicationRequestUpdate /> }
]);

export default router;
