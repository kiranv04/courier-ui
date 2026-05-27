import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, LogOut, User, Settings, Bell } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../hooks/useLogout";
import { menuConfig } from "../config/menuConfig";

function NavItem({ item }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const hasChildren = !!item.children;
  const timeoutRef = useRef(null);
  const triggerRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  const isActive =
    pathname === item.to ||
    item.children?.some((c) => pathname === c.to);

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={item.to || "#"}
        onClick={(e) => hasChildren && e.preventDefault()}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
          ${isActive
            ? "bg-black/20 text-white"
            : "text-white/80 hover:bg-black/10 hover:text-white"
          }`}
      >
        {item.icon && <item.icon size={16} />}
        <span>{item.label}</span>
        {hasChildren && (
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </Link>

      {hasChildren && open && (
        <div
          className="fixed bg-white rounded-xl shadow-2xl border border-gray-100 py-2 min-w-52 z-50"
          style={{
            top: "64px", // height of your navbar
            left: triggerRef.current?.getBoundingClientRect().left ?? 0,
          }}
        >
          <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
            {item.label}
          </div>
          {item.children.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                ${pathname === child.to
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              {child.icon && <child.icon size={16} className="text-gray-400" />}
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { data: user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const logout = useLogout();

  const role = user?.roles?.[0]?.name || "super-admin";
  const menuItems = menuConfig[role] || [];
  const name = user?.name || "User";
  const email = user?.email || "";

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-linear-to-r from-blue-950 to-indigo-800 shadow-lg flex items-center px-6 gap-1">
      {/* Logo */}
      <Link to="/" className="text-white font-bold text-sm shrink-0">
        VK Enterprises
      </Link>

      <div className="w-px h-6 bg-white/20" />

      {/* Nav Items */}
      <nav
        className="flex items-center gap-1 flex-1 min-w-0"
        style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY;
            e.preventDefault();
          }
        }}
      >
        {menuItems.map((item) => (
          <NavItem key={item.to || item.label} item={item} />
        ))}
      </nav>

      {/* Right: Bell + User */}
      <div className="flex items-center gap-3 shrink-0 ml-auto pl-4">
        <button className="relative p-2 hover:bg-white/10 rounded-lg transition">
          <Bell size={18} className="text-white/80" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 hover:bg-white/10 px-3 py-2 rounded-lg transition cursor-pointer"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-white leading-tight">{name}</p>
              <p className="text-xs text-white/60 leading-tight">{email}</p>
            </div>
            <ChevronDown
              size={16}
              className={`text-white/60 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                onClick={() => setDropdownOpen(false)}
              >
                <User size={16} className="text-gray-400" />
                Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings size={16} className="text-gray-400" />
                Settings
              </Link>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={() => logout.mutate()}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}