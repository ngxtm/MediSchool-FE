import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import NurseDashboard from "../pages/NurseDashboard";
import ForgotPassword from "../pages/ForgotPassword";
import UpdatePassword from "../pages/UpdatePassword";
import PrivateRouter from "./PrivateRouter";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/update-password", element: <UpdatePassword /> },
  { path: "/nurse", element: <PrivateRouter><NurseDashboard /></PrivateRouter>}
]);

export default router;
