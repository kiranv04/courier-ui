import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLE_HOME } from "../config/roleConfig";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { data: user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;

  const role = user.roles?.[0]?.name;

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their own home, not a 403 page
    return <Navigate to={ROLE_HOME[role] || "/login"} replace />;
  }

  return <Outlet />;
}