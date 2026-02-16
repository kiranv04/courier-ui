import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LogOut, User, Settings, Bell } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../hooks/useLogout";

export default function Topbar({collapsed}) {
  const { data: user, isLoading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const logout = useLogout();

  const handleLogout = async () => {
    logout.mutate();
  };

  const name = user?.name || "User";
  const email = user?.email || "";

  return (
    <header className={`fixed top-4 transition-all duration-300 ${collapsed ? "left-24" : "left-72"} right-8 z-40 mx-auto max-w-7xl`}>
      <div className="bg-white/75 border border-white/20 rounded-full shadow-lg px-4 py-1 flex items-center justify-between backdrop-blur-xl">
        {/* Left: Page Title or Breadcrumbs (optional later) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="w-3 h- h-3 bg-blue-600 rounded-full" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome back, {name}
          </h2>
        </div>

        {/* Right: Notifications + User Dropdown */}
        <div className="flex items-center gap-4">
          {/* Notification Bell (optional) */}
          <button className="relative p-2 hover:bg-gray-100 rounded-xl transition">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Avatar + Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{name}</p>
                <p className="text-xs text-gray-500">{email}</p>
              </div>
              <ChevronDown size={18} className={`text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}