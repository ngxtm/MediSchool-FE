import React from "react";
import { UserAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
const PrivateRouter = ({children}) => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
        return <Navigate to="/update-password" replace/>
    }
    const { session } = UserAuth();
    if (session === undefined) {
        return <p>Loading...</p>
    }
    return session ? children : <Navigate to="/login" replace/>
}

export default PrivateRouter;