import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

export default function DashboardLayout() {
  const { data: user, isLoading, isError } = useAuth();

  if (!user || isError) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-20 p-6">
        <Outlet />
      </main>
    </div>
  );
}