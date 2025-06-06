import { useEffect } from "react"
import { supabase } from "../utils/supabase"
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {

    const navigate = useNavigate();
    useEffect(() => {
        const handleRedirect = async () => {
            const rememberMe = sessionStorage.getItem("rememberMe");

            const { data, error } = await supabase.auth.getSession();
            if (error || !data.session) {
                console.error("No session found in AuthCallback: " + error.message);
                navigate("/login");
                return;
            }

            const userId = data.session.user.id;

            const { data: profile, error: profileError } = await supabase.from("user_profile")
                .select("role")
                .eq("id", userId)
                .single();

            if (profileError || !profile?.role) {
                console.error("Cannot get user role: ", profileError);
                navigate("/no-role");
                return;
            }

            const role = profile.role;

            switch (role) {
                case "NURSE":
                    navigate("/nurse");
                    break;
                case "ADMIN":
                    navigate("/admin");
                    break;
                case "PARENT":
                    navigate("/parent");
                    break;
                case "MANAGER":
                    navigate("/manager");
                    break;
                default:
                    navigate("/no-role");
            }

            if (rememberMe === "false") {
                sessionStorage.setItem("supabase.session", JSON.stringify(data.session));
                const projectRef = supabase.supabaseUrl.split("https://")[1].split(".")[0];
                localStorage.removeItem(`sb-${projectRef}-auth-token`);
                sessionStorage.removeItem("rememberMe");
            }
        }
        handleRedirect();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <p className="text-lg text-gray-700">Đang xác thực, vui lòng chờ...</p>
        </div>
    );
}

export default AuthCallback;