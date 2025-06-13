import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import NurseDashboard from "../pages/nurse/NurseDashboard";
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
import HealthCheck from "../pages/parent/HealthCheck";
import Prescription from "../pages/parent/Prescription";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/update-password", element: <UpdatePassword /> },
  { path: "/nurse", element: <PrivateRouter><NurseDashboard /></PrivateRouter> },
  { path: "/parent", element: <PrivateRouter><ParentDashboard /></PrivateRouter>, children: [
    { index: true, element: <StudentInfo /> },
    { path: "info", element: <StudentInfo /> },
    { path: "medical-record", element: <MedicalRecord /> },
    { path: "vaccination", element: <Vaccination /> },
    { path: "health-check", element: <HealthCheck /> },
    { path: "prescription", element: <Prescription /> },
  ]},
  { path: "/manager", element: <PrivateRouter><ManagerDashboard /></PrivateRouter> },
  { path: "/admin", element: <PrivateRouter><AdminDashboard /></PrivateRouter> },
  { path: "/no-role", element: <NoRole /> },
  { path: "/auth/callback", element: <AuthCallback/> },
]);

export default router;
