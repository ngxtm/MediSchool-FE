import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import PrivateRouter from './privaterouter'
import LazyComponent from '../components/LazyComponent'

const Login = lazy(() => import('../pages/Login'))
const Signup = lazy(() => import('../pages/Signup'))
const Nurse = lazy(() => import('../pages/nurse/Nurse'))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'))
const UpdatePassword = lazy(() => import('../pages/UpdatePassword'))
const NoRole = lazy(() => import('../pages/NoRole'))
const AuthCallback = lazy(() => import('../pages/AuthCallback'))
const ParentDashboard = lazy(() => import('../pages/parent/ParentDashboard'))
const Manager = lazy(() => import('../pages/manager/Manager'))
const ManagerStudent = lazy(() => import('../pages/manager/sub-pages/student/StudentList.jsx'))
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout.jsx'))
const StudentInfo = lazy(() => import('../pages/parent/StudentInfo'))
const MedicalRecord = lazy(() => import('../pages/parent/MedicalRecord'))
const Vaccination = lazy(() => import('../pages/parent/Vaccination'))
const HealthCheck = lazy(() => import('../pages/parent/health-checkups/HealthCheckup.jsx'))
const MedicationRequest = lazy(() => import('../pages/parent/medication-requests/MedicationRequest.jsx'))
const AuthRedirect = lazy(() => import('../components/AuthRedirect'))

const NurseStudent = lazy(() =>
  import('../pages/nurse/sub-pages/student/index').then(module => ({ default: module.Student }))
)
const NurseVaccineList = lazy(() =>
  import('../pages/nurse/sub-pages/vaccine/index').then(module => ({ default: module.VaccineList }))
)
const NurseVaccineEventDetail = lazy(() =>
  import('../pages/nurse/sub-pages/vaccine/index').then(module => ({ default: module.VaccineEventDetail }))
)
const NurseStudentListInEvent = lazy(() =>
  import('../pages/nurse/sub-pages/vaccine/index').then(module => ({ default: module.StudentListInEvent }))
)
const NurseConsentDetail = lazy(() =>
  import('../pages/nurse/sub-pages/vaccine/index').then(module => ({ default: module.ConsentDetail }))
)
const NurseVaccineRecord = lazy(() =>
  import('../pages/nurse/sub-pages/vaccine/index').then(module => ({ default: module.VaccineRecord }))
)
const NurseVaccination = lazy(() =>
  import('../pages/nurse/sub-pages/vaccine/index').then(module => ({ default: module.Vaccination }))
)
const VaccinationLayout = lazy(() =>
  import('../pages/nurse/sub-pages/vaccine/index').then(module => ({ default: module.VaccinationLayout }))
)

const ManagerVaccination = lazy(() =>
  import('../pages/manager/sub-pages/vaccine/index').then(module => ({ default: module.Vaccination }))
)
const ManagerVaccineEventDetail = lazy(() =>
  import('../pages/manager/sub-pages/vaccine/index').then(module => ({ default: module.VaccineEventDetail }))
)
const ManagerStudentListInEvent = lazy(() =>
  import('../pages/manager/sub-pages/vaccine/index').then(module => ({ default: module.StudentListInEvent }))
)
const ManagerConsentDetail = lazy(() =>
  import('../pages/manager/sub-pages/vaccine/index').then(module => ({ default: module.ConsentDetail }))
)
const ManagerVaccineLayout = lazy(() =>
  import('../pages/manager/sub-pages/vaccine/index').then(module => ({ default: module.VaccinationLayout }))
)
const ManagerVaccineRecord = lazy(() =>
  import('../pages/manager/sub-pages/vaccine/index').then(module => ({ default: module.VaccineRecord }))
)
const ManagerVaccineList = lazy(() =>
  import('../pages/manager/sub-pages/vaccine/index').then(module => ({ default: module.VaccineList }))
)

const NurseHealthEventDetail = lazy(() =>
  import('../pages/nurse/sub-pages/medication-event/index.js').then(module => ({ default: module.HealthEventDetail }))
)
const NurseMedicationEvent = lazy(() =>
  import('../pages/nurse/sub-pages/medication-event/index.js').then(module => ({ default: module.MedicationEvent }))
)

const ManagerHealthEvent = lazy(() =>
  import('../pages/manager/sub-pages/health-event/index.js').then(module => ({ default: module.HealthEvent }))
)
const ManagerHealthEventDetail = lazy(() =>
  import('../pages/manager/sub-pages/health-event/index.js').then(module => ({ default: module.HealthEventDetail }))
)

const ManagerHome = lazy(() => import('../pages/manager/sub-pages/Home'))

const MedicationRequestAll = lazy(() => import('../pages/nurse/sub-pages/medication-requests/MedicationRequestAll.jsx'))
const MedicationRequestPending = lazy(
  () => import('../pages/nurse/sub-pages/medication-requests/MedicationRequestPending.jsx')
)
const MedicationRequestApproved = lazy(
  () => import('../pages/nurse/sub-pages/medication-requests/MedicationRequestApproved.jsx')
)
const MedicationRequestPage = lazy(
  () => import('../pages/nurse/sub-pages/medication-requests/MedicationRequestPage.jsx')
)
const MedicationLayout = lazy(() => import('../pages/nurse/sub-pages/medication-requests/MedicationLayout.jsx'))
const MedicationRequestDetail = lazy(
  () => import('../pages/nurse/sub-pages/medication-requests/MedicationRequestDetail.jsx')
)
const MedicationRequestCreate = lazy(() => import('../pages/parent/medication-requests/MedicationRequestCreate.jsx'))
const MedicationRequestUpdate = lazy(() => import('../pages/parent/medication-requests/MedicationRequestUpdate.jsx'))

const ManagerMedicationLayout = lazy(
  () => import('../pages/manager/sub-pages/medication-requests/ManagerMedicationLayout.jsx')
)
const ManagerRequestAll = lazy(() => import('../pages/manager/sub-pages/medication-requests/ManagerRequestAll.jsx'))
const ManagerRequestPending = lazy(
  () => import('../pages/manager/sub-pages/medication-requests/ManagerRequestPending.jsx')
)
const ManagerRequestPage = lazy(() => import('../pages/manager/sub-pages/medication-requests/ManagerRequestPage.jsx'))
const ManagerRequestApproved = lazy(
  () => import('../pages/manager/sub-pages/medication-requests/ManagerRequestApproved.jsx')
)

const ManagerCheckupLayout = lazy(() => import('../pages/manager/sub-pages/health-checkup/./ManagerHealthCheckupLayout'))
const ManagerCheckupList = lazy(() => import('../pages/manager/sub-pages/health-checkup/./ManagerHealthCheckupList'))
const ManagerCheckupForm = lazy(() => import('../pages/manager/sub-pages/health-checkup/./ManagerHealthCheckupForm'))
const ManagerCheckupDetail = lazy(() => import('../pages/manager/sub-pages/health-checkup/./ManagerHealthCheckupDetail'))
const ManagerCategoryList = lazy(() => import('../pages/manager/sub-pages/health-checkup/./ManagerCheckupCategoryList'))
const ManagerCheckupConsentDetail = lazy(() => import('../pages/manager/sub-pages/health-checkup/./ManagerCheckupConsentDetail'))

const HealthCheckupList = lazy(() => import('../pages/nurse/sub-pages/health-checkup/HealthCheckupList.jsx'))
const HealthCheckupLayout = lazy(() => import('../pages/nurse/sub-pages/health-checkup/HealthCheckupLayout.jsx'))
const HealthCheckupForm = lazy(() => import('../pages/nurse/sub-pages/health-checkup/HealthCheckupForm.jsx'))
const HealthCheckupDetail = lazy(() => import('../pages/nurse/sub-pages/health-checkup/HealthCheckupDetail.jsx'))
const CheckupCategoryList = lazy(() => import('../pages/nurse/sub-pages/health-checkup/CheckupCategoryList.jsx'))
const CheckupConsentDetail = lazy(() => import('../pages/nurse/sub-pages/health-checkup/CheckupConsentDetail.jsx'))
const CheckupResultDetail = lazy(() => import('../pages/nurse/sub-pages/health-checkup/CheckupResultDetail.jsx'))

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const UserManagement = lazy(() => import('../pages/admin/UserManagement'))
const StudentManagement = lazy(() => import('../pages/admin/StudentManagement'))
const EmailSending = lazy(() => import('../pages/admin/EmailSending'))
const PdfExport = lazy(() => import('../pages/admin/PdfExport'))
const UserGuide = lazy(() => import('../pages/admin/UserGuide'))
const ApiDocumentation = lazy(() => import('../pages/admin/ApiDocumentation'))
const LoginHistory = lazy(() => import('../pages/admin/LoginHistory'))
const ParentStudentManagement = lazy(() => import('../pages/admin/ParentStudentManagement'))

const router = createBrowserRouter([
  { path: '/', element: <LazyComponent component={AuthRedirect} /> },
  { path: '/login', element: <LazyComponent component={Login} /> },
  { path: '/signup', element: <LazyComponent component={Signup} /> },
  { path: '/forgot-password', element: <LazyComponent component={ForgotPassword} /> },
  { path: '/update-password', element: <LazyComponent component={UpdatePassword} /> },
  {
    path: '/nurse',
    element: (
      <PrivateRouter requiredRole="NURSE">
        <LazyComponent component={Nurse} />
      </PrivateRouter>
    ),
    children: [
      { index: true, element: <LazyComponent component={NurseStudent} /> },
      { path: 'student', element: <LazyComponent component={NurseStudent} /> },
      {
        path: 'health-checkup',
        element: <LazyComponent component={HealthCheckupLayout} />,
        children: [
          { index: true, element: <LazyComponent component={HealthCheckupList} /> },
          {
            path: ':id',
            element: <LazyComponent component={HealthCheckupDetail} />,
            children: [
              { index: true, element: <LazyComponent component={HealthCheckupDetail} /> },
              { path: 'consents', element: <LazyComponent component={HealthCheckupDetail} /> },
              { path: 'results', element: <LazyComponent component={HealthCheckupDetail} /> }
            ]
          },
          {
            path: 'consent/:id',
            element: <LazyComponent component={CheckupConsentDetail} />
          }
        ]
      },
      { path: 'checkup-categories', element: <LazyComponent component={CheckupCategoryList} /> },
      { path: 'health-checkup/create', element: <LazyComponent component={HealthCheckupForm} /> },
      { path: 'health-checkup/:id', element: <LazyComponent component={HealthCheckupDetail} /> },
      { path: 'checkup-results/:resultId', element: <LazyComponent component={CheckupResultDetail} /> },
      {
        path: 'vaccination',
        element: <LazyComponent component={VaccinationLayout} />,
        children: [
          { index: true, element: <LazyComponent component={NurseVaccination} /> },
          { path: 'vaccine-list', element: <LazyComponent component={NurseVaccineList} /> },
          { path: 'vaccine-event/:id', element: <LazyComponent component={NurseVaccineEventDetail} /> },
          {
            path: 'vaccine-event/:id/students',
            element: <LazyComponent component={NurseStudentListInEvent} />
          },
          {
            path: 'vaccine-event/consent/:consentId',
            element: <LazyComponent component={NurseConsentDetail} />
          },
          {
            path: 'vaccine-event/:id/records',
            element: <LazyComponent component={NurseVaccineRecord} />
          }
        ]
      },
      {
        path: 'medication-requests',
        element: <LazyComponent component={MedicationLayout} />,
        children: [
          { index: true, element: <LazyComponent component={MedicationRequestAll} /> },
          { path: 'all', element: <LazyComponent component={MedicationRequestAll} /> },
          { path: 'pending', element: <LazyComponent component={MedicationRequestPending} /> },
          { path: 'approved', element: <LazyComponent component={MedicationRequestApproved} /> },
          { path: ':id', element: <LazyComponent component={MedicationRequestPage} /> }
        ]
      },
      { path: 'medication-event', element: <LazyComponent component={NurseMedicationEvent} /> },
      { path: 'medication-event/:id', element: <LazyComponent component={NurseHealthEventDetail} /> },
    ]
  },
  {
    path: '/parent',
    element: (
      <PrivateRouter requiredRole="PARENT">
        <LazyComponent component={ParentDashboard} />
      </PrivateRouter>
    ),
    children: [
      { index: true, element: <LazyComponent component={StudentInfo} /> },
      { path: 'info', element: <LazyComponent component={StudentInfo} /> },
      { path: 'medical-record', element: <LazyComponent component={MedicalRecord} /> },
      { path: 'vaccination', element: <LazyComponent component={Vaccination} /> },
      { path: 'health-check', element: <LazyComponent component={HealthCheck} /> },
      { path: 'medication-requests', element: <LazyComponent component={MedicationRequest} /> }
    ]
  },
  {
    path: '/manager',
    element: (
      <PrivateRouter requiredRole="MANAGER">
        <LazyComponent component={Manager} />
      </PrivateRouter>
    ),
    children: [
      { index: true, element: <LazyComponent component={ManagerHome} /> },
      { path: 'home', element: <LazyComponent component={ManagerHome} /> },
      { path: 'student', element: <LazyComponent component={ManagerStudent} /> },
      {
        path: 'vaccination',
        element: <LazyComponent component={ManagerVaccineLayout} />,
        children: [
          { index: true, element: <LazyComponent component={ManagerVaccination} /> },
          {
            path: 'vaccine-list',
            element: <LazyComponent component={ManagerVaccineList} />
          },
          {
            path: 'vaccine-event/:id',
            element: <LazyComponent component={ManagerVaccineEventDetail} />
          },
          {
            path: 'vaccine-event/:id/students',
            element: <LazyComponent component={ManagerStudentListInEvent} />
          },
          {
            path: 'vaccine-event/consent/:consentId',
            element: <LazyComponent component={ManagerConsentDetail} />
          },
          {
            path: 'vaccine-event/:id/records',
            element: <LazyComponent component={ManagerVaccineRecord} />
          }
        ]
      },
      { path: 'medication-event', element: <LazyComponent component={ManagerHealthEvent} /> },
      { path: 'medication-event/:id', element: <LazyComponent component={ManagerHealthEventDetail} /> },
      {
        path: 'medication-requests',
        element: <LazyComponent component={ManagerMedicationLayout} />,
        children: [
          { index: true, element: <LazyComponent component={ManagerRequestPending} /> },
          { path: 'all', element: <LazyComponent component={ManagerRequestAll} /> },
          { path: 'pending', element: <LazyComponent component={ManagerRequestPending} /> },
          { path: 'approved', element: <LazyComponent component={ManagerRequestApproved} /> },
          { path: ':id', element: <LazyComponent component={ManagerRequestPage} /> }
        ]
      },
      {
        path: 'health-checkup',
        element: <LazyComponent component={ManagerCheckupLayout} />,
          children: [
            { index: true, element: <LazyComponent component={ManagerCheckupList} /> },
            {
              path: ':id',
              element: <LazyComponent component={ManagerCheckupDetail} />,
              children: [
                { index: true, element: <LazyComponent component={ManagerCheckupDetail} /> },
                { path: 'consents', element: <LazyComponent component={ManagerCheckupDetail} /> },
                { path: 'results', element: <LazyComponent component={ManagerCheckupDetail} /> }
              ]
            },
            {
              path: 'consent/:id',
              element: <LazyComponent component={ManagerCheckupConsentDetail} />
            }
          ]
          },
          { path: 'checkup-categories', element: <LazyComponent component={ManagerCategoryList} /> },
          { path: 'health-checkup/create', element: <LazyComponent component={ManagerCheckupForm} /> },
          { path: 'health-checkup/:id', element: <LazyComponent component={ManagerCheckupDetail} /> },
        ]
      },
    {
    path: '/admin',
    element: (
      <PrivateRouter requiredRole="ADMIN">
        <LazyComponent component={AdminLayout} />
      </PrivateRouter>
    ),
    children: [
      { index: true, element: <LazyComponent component={AdminDashboard} /> },
      { path: 'dashboard', element: <LazyComponent component={AdminDashboard} /> },
      { path: 'user-management', element: <LazyComponent component={UserManagement} /> },
      { path: 'student-management', element: <LazyComponent component={StudentManagement} /> },
      { path: 'parent-student-management', element: <LazyComponent component={ParentStudentManagement} /> },
      { path: 'login-history', element: <LazyComponent component={LoginHistory} /> },
      { path: 'email-sending', element: <LazyComponent component={EmailSending} /> },
      { path: 'pdf-export', element: <LazyComponent component={PdfExport} /> },
      { path: 'user-guide', element: <LazyComponent component={UserGuide} /> },
      { path: 'api-documentation', element: <LazyComponent component={ApiDocumentation} /> }
    ]
  },
  { path: '/no-role', element: <LazyComponent component={NoRole} /> },
  { path: '/auth/callback', element: <LazyComponent component={AuthCallback} /> },
  { path: '/medication-requests/:id', element: <LazyComponent component={MedicationRequestDetail} /> },
  { path: '/medication-requests/create', element: <LazyComponent component={MedicationRequestCreate} /> },
  { path: '/medication-requests/:id/update', element: <LazyComponent component={MedicationRequestUpdate} /> }
])

export default router
