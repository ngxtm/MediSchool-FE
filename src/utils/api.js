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
				console.error('Error parsing tempSession:', e);
			}
			return config;
		}

		try {
			if (supabase?.supabaseUrl) {
				const url = supabase.supabaseUrl.startsWith('https://') 
					? supabase.supabaseUrl.replace('https://', '') 
					: supabase.supabaseUrl.replace('http://', '');
				const projectRef = url.split('.')[0];
				const session = localStorage.getItem(`sb-${projectRef}-auth-token`);
				if (session) {
					const parsedToken = JSON.parse(session);
					if (parsedToken?.access_token) {
						config.headers.Authorization = `Bearer ${parsedToken.access_token}`;
					}
				}
			}
		} catch (e) {
			console.error('Error setting up auth header:', e);
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
		const originalRequest = error.config;
		if (error.response.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			try {
				const { data } = await api.post("auth/refresh-token");
				const rememberMe =
					localStorage.getItem("rememberMeReference") === "true";
				if (rememberMe) {
					const url = supabase.supabaseUrl.startsWith('https://') 
					? supabase.supabaseUrl.replace('https://', '') 
					: supabase.supabaseUrl.replace('http://', '');
				const projectRef = url.split('.')[0];
					const session = localStorage.getItem(`sb-${projectRef}-auth-token`);
					if (session) {
						const parsedToken = JSON.parse(session);
						parsedToken.access_token = data.token;
						localStorage.setItem(
							`sb-${projectRef}-auth-token`,
							JSON.stringify(parsedToken)
						);
					}
				} else {
					const tempSession = sessionStorage.getItem("tempSession");
					if (tempSession) {
						const parsedToken = JSON.parse(tempSession);
						parsedToken.access_token = data.token;
						sessionStorage.setItem("tempSession", JSON.stringify(parsedToken));
					}
				}

				originalRequest.headers.Authorization = `Bearer ${data.token}`;
				return axios(originalRequest);
			} catch (refreshError) {
				window.location.href = "/login";
				return Promise.reject(refreshError);
			}
		}
	}
);

export default api;
