import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../utils/supabase";
import api from "../utils/api";
const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);

	const signInWithEmail = async (email, password, rememberMe = true) => {
		try {
			const { data, error } = await api.post("/auth/signin", {
				email,
				password,
				rememberMe,
			});
			if (error) {
				console.log("Error in signInWithEmail: ", error);
				return { success: false, error };
			}

			if (rememberMe) {
				const projectRef = supabase.supabaseUrl
					.split("https://")[1]
					.split(".")[0];
				localStorage.setItem(
					`sb-${projectRef}-auth-token`,
					JSON.stringify(data.session)
				);
			} else {
				sessionStorage.setItem("tempSession", JSON.stringify(data.session));
			}
			setSession(data.session);
			return { success: true, data };
		} catch (error) {
			console.error("Error in signInWithEmail: ", error);
			return { success: false, error };
		}
	};

	const signUpWithEmail = async (email, password) => {
		try {
			const { data, error } = await api.post("/auth/signup", {
				email,
				password,
			});
			if (error) {
				console.log("Error in signUpWithEmail: ", error);
				return { success: false, error };
			}

			return { success: true, data };
		} catch (error) {
			console.error("Error in signUpWithEmail:", error);
			return { success: false, error };
		}
	};

	const signInWithGoogle = async (rememberMe = true) => {
		localStorage.setItem("rememberMePreference", rememberMe.toString());
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
			},
		});
		if (error) {
			console.log("Error in signInWithGoogle: ", error);
			return { success: false, error };
		}
		return { success: true, data };
	};

	const signOut = async () => {
		try {
			await api.post("/auth/signout");
			setSession(null);

			sessionStorage.removeItem("tempSession");
			localStorage.removeItem("rememberMePreference");

			const projectRef = supabase.supabaseUrl.split("https://")[1].split(".")[0];
			localStorage.removeItem(`sb-${projectRef}-auth-token`);
		} catch (error) {
			console.error("Error in signOut:", error);
			return { success: false, error };
		}
	};

	const resetPassword = async (email) => {
		try {
			const { data, error } = await api.post("/auth/reset-password", {
				email,
			});

			if (error) {
				return { success: false, error };
			}
			return { success: true, data };
		} catch (error) {
			console.error("Error in resetPassword: ", error);
			return { success: false, error };
		}
	};

	const updatePassword = async (newPassword) => {
		try {
			const { data, error } = await api.post("/auth/update-password", {
				newPassword,
			});
			if (error) {
				console.log("Error in updatePassword: ", error);
				return { success: false, error };
			}
			return { success: true, data };
		} catch (err) {
			console.error("Unexpected error in updatePassword:", err);
			return { success: false, error: err };
		}
	};

	useEffect(() => {
		const checkSession = async () => {
			try {
				setLoading(true);
				const projectRef = supabase.supabaseUrl
					.split("https://")[1]
					.split(".")[0];
				const localSession = localStorage.getItem(
					`sb-${projectRef}-auth-token`
				);
				if (localSession) {
					setSession(JSON.parse(localSession));
					setLoading(false);
					return;
				}

				const tempSession = sessionStorage.getItem("tempSession");
				if (tempSession) {
					setSession(JSON.parse(tempSession));
					setLoading(false);
					return;
				}

				setLoading(false);
				setSession(null);
			} catch (error) {
				console.error("Error in checkSession:", error);
				setLoading(false);
				setSession(null);
			}
		};
		checkSession();
	}, []);

	return (
		<AuthContext.Provider
			value={{
				session,
				loading,
				signUpWithEmail,
				signOut,
				signInWithEmail,
				signInWithGoogle,
				resetPassword,
				updatePassword,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const UserAuth = () => {
	return useContext(AuthContext);
};
