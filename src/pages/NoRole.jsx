import { useEffect, useState } from "react";
import api from "../utils/api";
import { clearExpiredSession } from "../utils/auth";

const NoRole = () => {
	const [userRole, setUserRole] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUserRole = async () => {
			try {
				const { data } = await api.get("/me");
				setUserRole(data.role);
			} catch (error) {
				console.error("Error fetching user role:", error);
				clearExpiredSession()
			} finally {
				setLoading(false);
			}
		};

		fetchUserRole();
	}, []);

	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
			<div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
				<h1 className="text-3xl font-bold text-red-600 mb-4">
					Không có quyền truy cập
				</h1>

				{loading ? (
					<p className="text-gray-600 mb-4">Đang tải thông tin...</p>
				) : (
					<>
						<p className="text-lg text-gray-700 mb-2">
							Tài khoản của bạn có vai trò:{" "}
							<span className="font-semibold">
								{userRole || "Chưa xác định"}
							</span>
						</p>
						<p className="text-gray-600 mb-6">
							Bạn không có quyền truy cập vào trang này. Vui lòng quay lại trang
							phù hợp với vai trò của bạn.
						</p>
					</>
				)}

				{userRole && (
					<a
						href={`/${userRole.toLowerCase()}`}
						className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded transition-colors"
					>
						Đi đến trang {userRole}
					</a>
				)}

				<div className="mt-4">
					<a href="/login" className="text-blue-500 hover:underline">
						Đăng nhập lại
					</a>
				</div>
			</div>
		</div>
	);
};

export default NoRole;
