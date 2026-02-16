import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { data: user, isLoading, isError } = useAuth();

  // This is the key addition
  if (!user || isError) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
        <Topbar collapsed={collapsed} />
        <main className="flex-1 overflow-y-auto p-6 mt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}