import React from "react";
import { useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import LoginImage from "../assets/login-image.png";

const Signup = () => {
  const navigate = useNavigate();
  const { signUpWithEmail } = UserAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await signUpWithEmail(email, password);
    if (result.success) {
      navigate("/nurse");
    } else {
      setError(result.error.message);
    }
    setLoading(false);
  };

  const navigateToSignIn = () => {
    navigate("/login");
  };

  const handleSignUpWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      setLoading(false);
    } catch (error) {
      console.error("Error starting Google OAuth:", error);
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#E8F4FB] relative overflow-hidden">
      <div className="absolute top-0 left-0 z-20 p-6 sm:p-8">
        <p className="mb-1 text-2xl font-semibold text-gray-800 sm:text-3xl">
          MediSchool
        </p>
        <p className="text-xl font-semibold text-gray-800 sm:text-2xl">
          Chào mừng!
        </p>
      </div>
      <div className="flex relative z-10 min-h-screen">
        <div className="flex flex-col justify-center p-6 pt-20 w-full md:w-1/2 sm:p-8 md:p-10 md:pt-20">
          <form onSubmit={handleSignUp} className="mx-auto w-full max-w-md">
            <h1 className="mb-2 text-2xl font-bold text-center text-gray-800 sm:text-3xl">
              Đăng ký
            </h1>
            <p className="mb-8 text-sm text-center text-gray-600 sm:text-base">
              Đăng ký để truy cập hồ sơ y tế của con bạn một cách an toàn
            </p>
            <p className="mb-8 text-sm text-center text-gray-600">
              Đã có tài khoản?{" "}
              <a
                onClick={navigateToSignIn}
                className="text-blue-600 hover:underline">
                Đăng nhập
              </a>
            </p>
            <div className="mb-4">
              <div className="flex relative items-center">
                <User className="absolute left-3 text-gray-500" size={24} />
                <input
                  type="email"
                  placeholder="Địa chỉ email"
                  pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex relative items-center">
                <Lock className="absolute left-3 text-gray-500" size={24} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  className="absolute right-3 text-gray-500 hover:cursor-pointer hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="mt-2 mb-4 text-sm text-red-500">{error}</p>}

            <div className="flex items-center mb-6">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  required
                  className="mr-2 w-4 h-4 text-blue-600"
                />
                Tôi đồng ý với <a href="https://policies.google.com/terms?hl=vi" className="text-blue-600 hover:underline">Điều khoản dịch vụ</a>{" "} và{" "}<a href="https://policies.google.com/privacy?hl=vi" className="text-blue-600 hover:underline">Chính sách bảo mật</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hover:cursor-pointer w-full bg-[#0A3D62] text-base font-semibold text-white py-2.5 rounded-md hover:bg-[#093352] transition-colors">
              Register
            </button>

            <div className="flex gap-3 items-center my-6 w-full">
              <div className="flex-1 h-[1px] bg-gray-300"></div>
              <span className="text-sm text-gray-500">hoặc</span>
              <div className="flex-1 h-[1px] bg-gray-300"></div>
            </div>

            <button onClick={handleSignUpWithGoogle} className="hover:cursor-pointer w-full bg-white border border-gray-300 text-base font-medium text-gray-700 py-2.5 rounded-md flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Tiếp tục với Google
            </button>
          </form>
        </div>

        {/* Image Section - positioned in the middle right */}
        <div className="hidden relative w-1/2 md:block">
          <div className="flex absolute inset-0 justify-center items-center">
            <img
              src={LoginImage}
              alt="Minh họa y tế"
              className="object-contain z-10 max-w-full h-auto"
            />
          </div>
        </div>
      </div>

      <footer className="absolute bottom-0 py-3 w-full text-sm text-center text-gray-600">
        © {new Date().getFullYear()} MediSchool Bản quyền. Tất cả các quyền được bảo lưu.
      </footer>
    </div>
  );
};

export default Signup;
