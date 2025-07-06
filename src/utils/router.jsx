import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import Nurse from '../pages/nurse/Nurse'
import ForgotPassword from '../pages/ForgotPassword'
import UpdatePassword from '../pages/UpdatePassword'
import PrivateRouter from './privaterouter'
import NoRole from '../pages/NoRole'
import AuthCallback from '../pages/AuthCallback'
import ParentDashboard from '../pages/parent/ParentDashboard'
import Manager from '../pages/manager/Manager'
import AdminDashboard from '../pages/admin/AdminDashboard'
import StudentInfo from '../pages/parent/StudentInfo'
import MedicalRecord from '../pages/parent/MedicalRecord'
import Vaccination from '../pages/parent/Vaccination'
import HealthCheck from '../pages/parent/HealthCheck'
import MedicationRequest from '../pages/parent/MedicationRequest.jsx'
import { Student as NurseStudent } from '../pages/nurse/sub-pages/student/index'
import {
	VaccineList as NurseVaccineList,
	VaccineEventDetail as NurseVaccineEventDetail,
	StudentListInEvent as NurseStudentListInEvent,
	ConsentDetail as NurseConsentDetail,
	VaccineRecord as NurseVaccineRecord,
	Vaccination as NurseVaccination,
	VaccinationLayout as VaccinationLayout
} from '../pages/nurse/sub-pages/vaccine/index'
import {
	Vaccination as ManagerVaccination,
	VaccineEventDetail as ManagerVaccineEventDetail,
	StudentListInEvent as ManagerStudentListInEvent,
	ConsentDetail as ManagerConsentDetail,
	VaccinationLayout as ManagerVaccineLayout,
	VaccineRecord as ManagerVaccineRecord,
	VaccineList as ManagerVaccineList
} from '../pages/manager/sub-pages/vaccine/index'
import {
	HealthEventDetail as NurseHealthEventDetail,
	MedicationEvent as NurseMedicationEvent
} from '../pages/nurse/sub-pages/medication-event/index.js'
import {
	HealthEvent as ManagerHealthEvent,
	HealthEventDetail as ManagerHealthEventDetail
} from '../pages/manager/sub-pages/health-event/index.js'
import ManagerHome from '../pages/manager/sub-pages/Home'
import { HealthCheckup as NurseHealthCheck } from '../pages/nurse/sub-pages/health-checkup/index'
import MedicationRequestPending from '../pages/nurse/sub-pages/medication-request/MedicationRequestPending.jsx'
import MedicationRequestApproved from '../pages/nurse/sub-pages/medication-request/MedicationRequestApproved.jsx'
import MedicationRequestAll from '../pages/nurse/sub-pages/medication-request/MedicationRequestAll.jsx'
import MedicationLayout from '../pages/nurse/sub-pages/medication-request/MedicationLayout.jsx'
import MedicationEvent from "../pages/nurse/sub-pages/medication-event/MedicationEvent";
import MedicationRequestDetail from '../components/MedicationRequestDetail.jsx'
import MedicationRequestCreate from '../pages/parent/MedicationRequestCreate.jsx'
import MedicationRequestUpdate from '../pages/parent/MedicationRequestUpdate.jsx'
import MedicationRequestPage from '../pages/nurse/sub-pages/medication-requests/MedicationRequestPage.jsx'
const router = createBrowserRouter([
	{ path: '/', element: <Navigate to="/login" replace /> },
	{ path: '/login', element: <Login /> },
	{ path: '/signup', element: <Signup /> },
	{ path: '/forgot-password', element: <ForgotPassword /> },
	{ path: '/update-password', element: <UpdatePassword /> },
	{
		path: '/nurse',
		element: (
			<PrivateRouter requiredRole="NURSE">
				<Nurse />
			</PrivateRouter>
		),
		children: [
			{ index: true, element: <NurseStudent /> },
			{ path: 'student', element: <NurseStudent /> },
			{ path: 'health-checkup', element: <NurseHealthCheck /> },
			{
				path: 'vaccination',
				element: <VaccinationLayout />,
				children: [
					{ index: true, element: <NurseVaccination /> },
					{ path: 'vaccine-list', element: <NurseVaccineList /> },
					{ path: 'vaccine-event/:id', element: <NurseVaccineEventDetail /> },
					{
						path: 'vaccine-event/:id/students',
						element: <NurseStudentListInEvent />
					},
					{
						path: 'vaccine-event/consent/:consentId',
						element: <NurseConsentDetail />
					},
					{
						path: 'vaccine-event/:id/records',
						element: <NurseVaccineRecord />
					}
				]
			},
			{
				path: '/nurse/medication-request',
				path: "/nurse/medication-requests",
				element: <MedicationLayout />,
				children: [
					{ path: 'pending', element: <MedicationRequestPending /> },
					{ path: 'approved', element: <MedicationRequestApproved /> },
					{ path: 'all', element: <MedicationRequestAll /> }
				]
					{ path: "pending", element: <MedicationRequestPending /> },
					{ path: "approved", element: <MedicationRequestApproved /> },
					{ path: "all", element: <MedicationRequestAll /> },
					{ path: ":id", element: <MedicationRequestPage /> },
				],
			},
			{ path: 'medication-event', element: <NurseMedicationEvent /> },
			{ path: 'medication-event/:id', element: <NurseHealthEventDetail /> }
		]
	},
	{
		path: '/parent',
		element: (
			<PrivateRouter requiredRole="PARENT">
				<ParentDashboard />
			</PrivateRouter>
		),
		children: [
			{ index: true, element: <StudentInfo /> },
			{ path: 'info', element: <StudentInfo /> },
			{ path: 'medical-record', element: <MedicalRecord /> },
			{ path: 'vaccination', element: <Vaccination /> },
			{ path: 'health-check', element: <HealthCheck /> },
			{ path: 'medication-request', element: <MedicationRequest /> }
		]
			{ path: "info", element: <StudentInfo /> },
			{ path: "medical-record", element: <MedicalRecord /> },
			{ path: "vaccination", element: <Vaccination /> },
			{ path: "health-check", element: <HealthCheck /> },
			{ path: "medication-requests", element: <MedicationRequest /> }
		],
	},
	{
		path: '/manager',
		element: (
			<PrivateRouter requiredRole="MANAGER">
				<Manager />
			</PrivateRouter>
		),
		children: [
			{ index: true, element: <ManagerHome /> },
			{ path: 'home', element: <ManagerHome /> },
			{
				path: 'vaccination',
				element: <ManagerVaccineLayout />,
				children: [
					{ index: true, element: <ManagerVaccination /> },
					{
						path: 'vaccine-list',
						element: <ManagerVaccineList />
					},
					{
						path: 'vaccine-event/:id',
						element: <ManagerVaccineEventDetail />
					},
					{
						path: 'vaccine-event/:id/students',
						element: <ManagerStudentListInEvent />
					},
					{
						path: 'vaccine-event/consent/:consentId',
						element: <ManagerConsentDetail />
					},
					{
						path: 'vaccine-event/:id/records',
						element: <ManagerVaccineRecord />
					}
				]
			},
			{ path: 'medication-event', element: <ManagerHealthEvent /> },
			{ path: 'medication-event/:id', element: <ManagerHealthEventDetail /> }
		]
	},
	{
		path: '/admin',
		element: (
			<PrivateRouter requiredRole="ADMIN">
				<AdminDashboard />
			</PrivateRouter>
		)
	},
	{ path: '/no-role', element: <NoRole /> },
	{ path: '/auth/callback', element: <AuthCallback /> },
	{ path: 'medication-request/:id', element: <MedicationRequestDetail /> }
])
	{ path: "/no-role", element: <NoRole /> },
	{ path: "/auth/callback", element: <AuthCallback /> },
	{ path: "medication-requests/:id", element:<MedicationRequestDetail/>},
	{ path: "medication-requests/create", element: <MedicationRequestCreate /> },
	{ path: "medication-requests/:id/update", element: <MedicationRequestUpdate /> }
]);

export default router
