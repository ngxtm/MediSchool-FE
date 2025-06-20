import axios from "axios";
import { supabase } from "./supabase";

const api = axios.create({
	baseURL: "/api",
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use(
	(config) => {
		const tempSession = sessionStorage.getItem("tempSession");
		if (tempSession) {
			try {
				const parsedSession = JSON.parse(tempSession);
				if (parsedSession?.access_token) {
					config.headers.Authorization = `Bearer ${parsedSession.access_token}`;
				}
			} catch (e) {
				console.error("Error parsing tempSession:", e);
			}
			return config;
		}

		try {
			if (supabase?.supabaseUrl) {
				const projectRef = supabase.supabaseUrl.split("https://")[1].split(".")[0];
				const session = localStorage.getItem(`sb-${projectRef}-auth-token`);
				if (session) {
					const parsedToken = JSON.parse(session);
					if (parsedToken?.access_token) {
						config.headers.Authorization = `Bearer ${parsedToken.access_token}`;
					}
				}
			}
		} catch (e) {
			console.error("Error setting up auth header:", e);
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response.status === 401 && !error.config._retry) {
			error.config._retry = true;
			try {
				let currentToken;
				const projectRef = supabase.supabaseUrl.split("https://")[1].split(".")[0];
				const tempSession = sessionStorage.getItem("tempSession");
				const localSession = localStorage.getItem(
					`sb-${projectRef}-auth-token`
				);

				if (localSession) {
					const parsedToken = JSON.parse(localSession);
					currentToken = parsedToken.access_token;
				} else if (tempSession) {
					const parsedToken = JSON.parse(tempSession);
					currentToken = parsedToken.access_token;
				}

				if (!currentToken) {
					throw new Error("No token available for refresh");
				}

				const config = {
					headers: { Authorization: `Bearer ${currentToken}` },
				};

				const { data } = await axios.post(
					"/api/auth/refresh-token",
					{},
					config
				);

				const rememberMe =
					localStorage.setItem("rememberMePreference") === "true";
				if (rememberMe && localSession) {
					const parsedToken = JSON.parse(localSession);
					parsedToken.access_token = data.token;
					localStorage.setItem(
						`sb-${projectRef}-auth-token`,
						JSON.stringify(parsedToken)
					);
				} else if (tempSession) {
					const parsedToken = JSON.parse(tempSession);
					parsedToken.access_token = data.token;
					sessionStorage.setItem("tempSession", JSON.stringify(parsedToken));
				}

				error.config.headers.Authorization = `Bearer ${data.token}`;
				return axios(error.config);
			} catch (refreshError) {
				console.error("Token refresh failed:", refreshError);
				window.location.href = "/login";
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);

export default api;
