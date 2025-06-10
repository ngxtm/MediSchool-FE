import React from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
const PrivateRouter = ({children}) => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
        return <Navigate to="/update-password" replace/>
    }
    const projectRef = supabase.supabaseUrl.split("https://")[1].split(".")[0];
    const session = localStorage.getItem(`sb-${projectRef}-auth-token`);
    if (session === null) {
        return <Navigate to="/login" replace/>
    }
    return children;
}

export default PrivateRouter;