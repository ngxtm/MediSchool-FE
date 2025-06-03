import React, { useState } from "react";
import { User } from "lucide-react";
import { UserAuth } from "../context/AuthContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { resetPassword } = UserAuth();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(email);

      if (result.success) {
        setSuccess(true);
        setEmail("");
      } else {
        setError(
          result.error.message || "Failed to send reset link. Please try again."
        );
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
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
          Khôi phục mật khẩu
        </p>
      </div>
      <div className="flex relative z-10 justify-center items-center min-h-screen">
        <div className="p-8 mx-4 w-full max-w-md bg-white rounded-lg shadow-lg">
          <h1 className="mb-4 text-2xl font-bold text-center text-gray-800">
            Quên mật khẩu
          </h1>
          <p className="mb-6 text-sm text-center text-gray-600">
            Nhập email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại
            mật khẩu
          </p>

          {success && (
            <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
              Đã gửi liên kết khôi phục! Vui lòng kiểm tra hộp thư email của bạn
              và làm theo hướng dẫn để đặt lại mật khẩu.
            </div>
          )}

          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="mb-4">
              <div className="flex relative items-center">
                <User className="absolute left-3 text-gray-500" size={24} />
                <input
                  type="email"
                  placeholder="Địa chỉ email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              className="w-full bg-[#0A3D62] text-base font-semibold text-white py-2.5 rounded-md hover:bg-[#093352] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading || !email}>
              {loading ? "Đang gửi..." : "Gửi liên kết khôi phục"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-sm text-blue-600 hover:underline">
              Quay lại trang đăng nhập
            </a>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-0 py-3 w-full text-sm text-center text-gray-600">
        © {new Date().getFullYear()} MediSchool Bản quyền. Tất cả các quyền
        được bảo lưu.
      </footer>
    </div>
  );
};

export default ForgotPassword;
