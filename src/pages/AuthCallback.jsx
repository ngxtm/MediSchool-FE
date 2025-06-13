import { useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const AuthCallback = () => {
	const navigate = useNavigate();

	useEffect(() => {
		const handleRedirect = async () => {
			try {
				const rememberMePreference =
					localStorage.getItem("rememberMePreference") === "true";

				const { data, error } = await supabase.auth.getSession();
				if (error || !data.session) {
					console.error("No session found in AuthCallback: ", error?.message);
					navigate("/login");
					return;
				}

				const { data: backendData } = await api.post("/auth/google-callback", {
					supabaseSession: data.session,
					rememberMe: rememberMePreference,
				});

				if (!rememberMePreference) {
					sessionStorage.setItem("tempSession", JSON.stringify(data.session));

					const projectRef = supabase.supabaseUrl
						.split("https://")[1]
						.split(".")[0];
					localStorage.removeItem(`sb-${projectRef}-auth-token`);

					const role = backendData.user.role;
					switch (role) {
						case "NURSE":
							navigate("/nurse");
							break;
						case "PARENT":
							navigate("/parent");
							break;
						case "ADMIN":
							navigate("/admin");
							break;
						case "MANAGER":
							navigate("/manager");
							break;
						default:
							navigate("/no-role");
					}
				}
			} catch (error) {
				console.error("Error in AuthCallback:", error);
				navigate("/login");
			}
		};
		handleRedirect();
	}, [navigate]);

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<p className="text-lg text-gray-700">Đang xác thực, vui lòng chờ...</p>
		</div>
	);
};

export default AuthCallback;
