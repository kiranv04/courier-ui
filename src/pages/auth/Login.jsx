// src/pages/auth/Login.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (data) => {
    setLoading(true);
    setError("");

    try {
      // 1. Get CSRF cookie
      await api.get("/sanctum/csrf-cookie");

      // // 2. Login
      await api.post("/api/login", {
        email: data.email,
        password: data.password,
      });

      toast.success("Login Successful!");

      // 3. Get current user + role
      const userRes = await api.get("/api/me");
      const role = userRes.data.roles[0]?.name;
      const mustChangePassword = userRes.data.must_change_password;

      if(mustChangePassword){
        if(role !== "super-admin"){
          navigate("/reset-password", { state: { user: userRes.data } }, { replace: true });
        }
      }else{
        if (role === "super-admin" || role === "admin") {
          navigate("/superadmin/dashboard",  { replace: true });
        } else if (role === "warehouse-admin" || role === "warehouse-employee") {
          navigate("/warehouse/dashboard", { replace: true });
        } else if (role === "branch-admin" || role === "branch-employee") {
          navigate("/branch/dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid email or password";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-blue-500 to-teal-300 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          VK Enterprises
        </h2>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(login)} className="space-y-6">
          <div>
            <input
              {...register("email", { required: true })}
              type="email"
              placeholder="Email address"
              disabled={loading}
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition disabled:opacity-70"
            />
          </div>

          <div>
            <input
              {...register("password", { required: true })}
              type="password"
              placeholder="Password"
              disabled={loading}
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition disabled:opacity-70"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-900 transition flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Welcome back! Please sign in to continue.
        </p>
      </div>
    </div>
  );
}