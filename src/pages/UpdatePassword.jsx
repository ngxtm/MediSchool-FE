import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabase";

const UpdatePassword = () => {
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(true);
	const [isRecoverySession, setIsRecoverySession] = useState(false);

	const location = useLocation();
	const navigate = useNavigate();
	const { updatePassword, signOut } = UserAuth();

	useEffect(() => {
		const checkSession = async () => {
			setLoading(true);

			const hash = window.location.hash;
			if (hash && hash.includes("type=recovery")) {
				try {
					const accessToken = hash.match(/access_token=([^&]*)/)?.[1];
					const refreshToken = hash.match(/refresh_token=([^&]*)/)?.[1] || "";

					if (!accessToken) {
						setError(
							"Không tìm thấy token trong URL. Vui lòng yêu cầu link mới."
						);
						setLoading(false);
						return false;
					}

					sessionStorage.setItem("recoveryToken", accessToken);

					const { data, error } = await supabase.auth.setSession({
						access_token: accessToken,
						refresh_token: refreshToken,
					});

					if (error) {
						console.error("Error setting session:", error);
						setError(
							"Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới."
						);
						setLoading(false);
						return false;
					}

					if (!data.session) {
						setError("Không thể thiết lập phiên làm việc. Vui lòng thử lại.");
						setLoading(false);
						return false;
					}

					setIsRecoverySession(true);
					setLoading(false);
					return true;
				} catch (err) {
					console.error("Error processing recovery token:", err);

					if (err.message?.includes("network")) {
						setError(
							"Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn."
						);
					} else {
						setError("Không thể xử lý token khôi phục. Vui lòng thử lại sau.");
					}

					setLoading(false);
					return false;
				}
			}

			if (location.state?.recovery) {
				setIsRecoverySession(true);
				setLoading(false);
				return true;
			}

			const projectRef = supabase.supabaseUrl.split("http://")[1].split(".")[0];
			const localSession = localStorage.getItem(`sb-${projectRef}-auth-token`);
			const tempSession = sessionStorage.getItem("tempSession");

			if (!localSession && !tempSession) {
				setError("Bạn cần đăng nhập hoặc link reset đã hết hạn.");
				setLoading(false);
				return false;
			}

			try {
				const { data, error: sessionError } = await supabase.auth.getSession();
				if (sessionError || !data.session) {
					setError("Bạn cần đăng nhập hoặc link reset đã hết hạn.");
					if (localSession)
						localStorage.removeItem(`sb-${projectRef}-auth-token`);
					if (tempSession) sessionStorage.removeItem("tempSession");
				}
			} catch (error) {
				console.error("Error verifying session:", error);
				setError("Có lỗi xảy ra khi kiểm tra phiên đăng nhập.");
			}
			setLoading(false);
			return true;
		};

		checkSession();
	}, [location, navigate]);

	const handleUpdatePassword = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess(false);

		if (newPassword.length < 6) {
			setError("Mật khẩu phải có ít nhất 6 ký tự");
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("Mật khẩu mới và xác nhận mật khẩu không khớp");
			return;
		}

		setLoading(true);

		try {
			let updateResult;
			if (isRecoverySession) {
				const { error } = await supabase.auth.updateUser({
					password: newPassword,
				});
				if (error) throw error;
				updateResult = { success: true };
			} else {
				updateResult = await updatePassword(newPassword);
			}

			if (updateResult.success) {
				setSuccess(true);

				if (!isRecoverySession) {
					await signOut();
				} else {
					localStorage.clear();
					sessionStorage.clear();
				}
				setTimeout(() => navigate("/login"), 3000);
			} else if (updateResult.error) {
				setError(
					updateResult.error ||
						"Không thể cập nhật mật khẩu. Vui lòng thử lại sau."
				);
			}
		} catch (err) {
			setError("Có lỗi xảy ra. Vui lòng thử lại.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen w-full bg-[#E8F4FB] relative overflow-hidden">
			<div className="absolute top-0 left-0 z-20 p-6 sm:p-8">
				<p className="mb-1 text-2xl font-semibold text-gray-800 sm:text-3xl">
					MediSchool
				</p>
				<p className="text-xl font-semibold text-gray-800 sm:text-2xl">
					Thay đổi mật khẩu
				</p>
			</div>

			<div className="flex relative z-10 justify-center items-center min-h-screen">
				<div className="p-8 mx-4 w-full max-w-md bg-white rounded-lg shadow-lg">
					<h1 className="mb-4 text-2xl font-bold text-center text-gray-800">
						Thiết lập mật khẩu mới
					</h1>

					{success ? (
						<div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
							Cập nhật mật khẩu thành công! Đang chuyển hướng đến trang đăng
							nhập...
						</div>
					) : error && !error.includes("token") ? (
						<div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
							{error}
						</div>
					) : null}

					{error && error.includes("token") ? (
						<div className="text-center">
							<div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
								{error}
							</div>
							<a
								href="/forgot-password"
								className="text-sm text-blue-600 hover:underline"
							>
								Request a new reset link
							</a>
						</div>
					) : (
						<form onSubmit={handleUpdatePassword} className="space-y-4">
							<div className="mb-4">
								<div className="flex relative items-center">
									<Lock className="absolute left-3 text-gray-500" size={24} />
									<input
										type={showNewPassword ? "text" : "password"}
										placeholder="Mật khẩu mới"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
									/>
									<button
										type="button"
										className="absolute right-3 text-gray-500 hover:text-gray-700"
										onClick={() => setShowNewPassword(!showNewPassword)}
									>
										{showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
									</button>
								</div>
							</div>

							<div className="mb-4">
								<div className="flex relative items-center">
									<Lock className="absolute left-3 text-gray-500" size={24} />
									<input
										type={showConfirmPassword ? "text" : "password"}
										placeholder="Xác nhận mật khẩu mới"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
									/>
									<button
										type="button"
										className="absolute right-3 text-gray-500 hover:text-gray-700"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									>
										{showConfirmPassword ? (
											<EyeOff size={20} />
										) : (
											<Eye size={20} />
										)}
									</button>
								</div>
							</div>

							<button
								className="w-full bg-[#0A3D62] text-base font-semibold text-white py-2.5 rounded-md hover:bg-[#093352] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
								type="submit"
								disabled={loading}
							>
								{loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
							</button>
						</form>
					)}

					<div className="mt-6 text-center">
						<a href="/login" className="text-sm text-blue-600 hover:underline">
							Quay lại trang đăng nhập
						</a>
					</div>
				</div>
			</div>

			<footer className="absolute bottom-0 py-3 w-full text-sm text-center text-gray-600">
				{new Date().getFullYear()} MediSchool Bản quyền. Tất cả các quyền được
				bảo lưu.
			</footer>
		</div>
	);
};

export default UpdatePassword;
