import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Nurse from "../pages/nurse/Nurse";
import ForgotPassword from "../pages/ForgotPassword";
import UpdatePassword from "../pages/UpdatePassword";
import PrivateRouter from "./privaterouter";
import NoRole from "../pages/NoRole";
import AuthCallback from "../pages/AuthCallback";
import ParentDashboard from "../pages/parent/ParentDashboard";
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import StudentInfo from "../pages/parent/StudentInfo";
import MedicalRecord from "../pages/parent/MedicalRecord";
import Vaccination from "../pages/parent/Vaccination";
import Prescription from "../pages/parent/Prescription";
import NurseMedicalRequest from "../pages/nurse/sub-pages/medical-request/MedicalRequest";
import NurseHealthCheck from "../pages/nurse/sub-pages/Healthcheck";
import NurseMedicationEvent from "../pages/nurse/sub-pages/medication-event/MedicationEvent";
import NurseVaccinationLayout from "../pages/nurse/sub-pages/vaccine/VaccinationLayout";
import {

	Student as NurseStudent,
	VaccineList as NurseVaccineList,
	VaccineEventDetail as NurseVaccineEventDetail,
	StudentListInEvent as NurseStudentListInEvent,
	ConsentDetail as NurseConsentDetail,
	VaccineRecord as NurseVaccineRecord,
	Vaccination as NurseVaccination,
} from "../pages/nurse/sub-pages/vaccine";
import HealthCheck from "../pages/parent/HealthCheck";

const router = createBrowserRouter([
	{ path: "/", element: <Home /> },
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
				element: <NurseVaccinationLayout />,
				children: [
					{ index: true, element: <NurseVaccination /> },
					{ path: "vaccine-list", element: <NurseVaccineList /> },
					{ path: "vaccine-event/:id", element: <NurseVaccineEventDetail /> },
					{ path: "vaccine-event/:id/students", element: <NurseStudentListInEvent /> },
					{ path: "vaccine-event/consent/:consentId", element: <NurseConsentDetail /> },
					{ path: "vaccine-event/:id/records", element: <NurseVaccineRecord /> },
				],
			},
            { path: "medical-request", element: <NurseMedicalRequest /> },
            { path: "medication-event", element: <NurseMedicationEvent /> },
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
			{ path: "prescription", element: <Prescription /> },
		],
	},
	{
		path: "/manager",
		element: (
			<PrivateRouter requiredRole="MANAGER">
				<ManagerDashboard />
			</PrivateRouter>
		),
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
]);

export default router;
