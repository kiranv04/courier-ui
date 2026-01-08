import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex mx-auto items-center justify-center">
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
}