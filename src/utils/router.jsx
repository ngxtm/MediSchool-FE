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
import AdminLayout from '../pages/admin/AdminLayout.jsx'
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
import MedicationRequestAll from '../pages/nurse/sub-pages/medication-requests/MedicationRequestAll.jsx'
import MedicationRequestPending from '../pages/nurse/sub-pages/medication-requests/MedicationRequestPending.jsx'
import MedicationRequestApproved from '../pages/nurse/sub-pages/medication-requests/MedicationRequestApproved.jsx'
import MedicationRequestPage from '../pages/nurse/sub-pages/medication-requests/MedicationRequestPage.jsx'
import MedicationLayout from '../pages/nurse/sub-pages/medication-requests/MedicationLayout.jsx'
import MedicationRequestDetail from '../pages/nurse/sub-pages/medication-requests/MedicationRequestDetail.jsx'
import MedicationRequestCreate from '../pages/parent/MedicationRequestCreate.jsx'
import MedicationRequestUpdate from '../pages/parent/MedicationRequestUpdate.jsx'
import AuthRedirect from '../components/AuthRedirect'
import ManagerMedicationLayout from '../pages/manager/sub-pages/medication-requests/ManagerMedicationLayout.jsx'
import ManagerRequestAll from '../pages/manager/sub-pages/medication-requests/ManagerRequestAll.jsx'
import ManagerRequestPending from '../pages/manager/sub-pages/medication-requests/ManagerRequestPending.jsx'
import ManagerRequestPage from '../pages/manager/sub-pages/medication-requests/ManagerRequestPage.jsx'
import ManagerRequestApproved from '../pages/manager/sub-pages/medication-requests/ManagerRequestApproved.jsx'
import HealthCheckupList from '../pages/nurse/sub-pages/health-checkup/HealthCheckupList.jsx'
import HealthCheckupLayout from '../pages/nurse/sub-pages/health-checkup/HealthCheckupLayout.jsx'
import HealthCheckupForm from '../pages/nurse/sub-pages/health-checkup/HealthCheckupForm.jsx'
import HealthCheckupDetail from '../pages/nurse/sub-pages/health-checkup/HealthCheckupDetail.jsx'
import CheckupCategoryList from '../pages/nurse/sub-pages/health-checkup/CheckupCategoryList.jsx'
import UserManagement from '../pages/admin/UserManagement.jsx'
const router = createBrowserRouter([
  { path: '/', element: <AuthRedirect /> },
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
      {
        path: 'health-checkup',
        element: <HealthCheckupLayout />,
        children: [
          {
            index: true,
            element: <HealthCheckupList />,
          },
        ],
      },
      {
        path: 'checkup-categories',
        element: <CheckupCategoryList/>,
      },
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
        path: 'medication-requests',
        element: <MedicationLayout />,
        children: [
          { index: true, element: <MedicationRequestAll /> },
          { path: 'all', element: <MedicationRequestAll /> },
          { path: 'pending', element: <MedicationRequestPending /> },
          { path: 'approved', element: <MedicationRequestApproved /> },
          { path: ':id', element: <MedicationRequestPage /> },
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
      { path: 'medication-requests', element: <MedicationRequest /> }
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
      { path: 'medication-event/:id', element: <ManagerHealthEventDetail /> },
      {
        path: 'medication-requests',
        element: <ManagerMedicationLayout />,
        children: [
          { index: true, element: <ManagerRequestPending /> },
          { path: 'all', element: <ManagerRequestAll /> },
          { path: 'pending', element: <ManagerRequestPending /> },
          { path: 'approved', element: <ManagerRequestApproved /> },
          { path: ':id', element: <ManagerRequestPage /> },
        ],
      }
    ]
  },
  {
    path: '/admin',
    element: (
      <PrivateRouter requiredRole="ADMIN">
        <AdminLayout />
      </PrivateRouter>
    ),
    children: [
      { index: true, element: <UserManagement /> },
      { path: 'user-management', element: <UserManagement /> }
    ]
  },
  { path: '/no-role', element: <NoRole /> },
  { path: '/auth/callback', element: <AuthCallback /> },
  { path: '/medication-requests/:id', element: <MedicationRequestDetail /> },
  { path: '/medication-requests/create', element: <MedicationRequestCreate /> },
  { path: '/medication-requests/:id/update', element: <MedicationRequestUpdate /> },
  { path: '/nurse/health-checkup/create', element: <HealthCheckupForm/>},
  { path: '/nurse/health-checkup/:id', element: <HealthCheckupDetail /> }
]);

export default router
