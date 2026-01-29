import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();
  const { state } = useLocation();

  const user = state?.user;

  const mutation = useMutation({
    mutationFn: () => api.post("/api/change-password", { current_password: currentPassword, password, password_confirmation: confirm }),
    onSuccess: () => {
      toast.success("Password updated successfully!");
      
      window.location.href = "/login";
    },
    onError: () => toast.error("Failed to update password"),
  });

  const handleSubmit = () => {
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    mutation.mutate();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-blue-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 text-center">
          <p className="text-red-600">Invalid session. Please log in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-4">Welcome, {user.name}!</h2>
        <p className="text-gray-600 text-center mb-8">
          For security, please set a new password to continue.
        </p>

        <div className="space-y-6">
            <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Old Password"
            className="w-full px-5 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password (min 8 characters)"
            className="w-full px-5 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm New Password"
            className="w-full px-5 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={mutation.isPending || password.length < 8 || password !== confirm}
          className="w-full mt-8 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-900 disabled:opacity-50 flex items-center justify-center gap-3 transition"
        >
          {mutation.isPending && <Loader2 className="animate-spin" size={24} />}
          {mutation.isPending ? "Updating..." : "Set Password & Continue"}
        </button>
      </div>
    </div>
  );
}