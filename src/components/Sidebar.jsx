import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
// import { useAuth } from "../hooks/useAuth";
import { menuConfig } from "../config/menuConfig";
import { useState } from "react";

function MenuItem({ item, isActive, depth = 0, openState }) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!item.children;
  const location = useLocation();

  return (
    <>
      <Link
        to={item.to || "#"}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            if (openState) {
              // Collapsed mode → toggle floating dropdown
              setOpen(!open);
            }
          }
        }}
        className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all
          ${isActive ? "bg-black text-white shadow-lg" : "text-gray-300 hover:bg-gray-800 hover:text-white"}
          ${depth > 0 ? "pl-12" : ""}
        `}
      >
        <div className="flex items-center gap-3">
          {item.icon && <item.icon size={20} />}
          {openState? (
            <div className="fixed z-100">
              <div className="absolute left-full ml-3 top-2 -translate-y-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity shadow-2xl border border-gray-700">
                {item.label}
                {hasChildren && <span className="ml-2 text-gray-400">({item.children.length})</span>}
              </div>
            </div>
            ):(
            <span className="font-medium">{item.label}</span>
            )
          }
        </div>

        {hasChildren && !openState && (
          <button onClick={() => setOpen(!open)} className="p-1 cursor-pointer">
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
      </Link>

      {/* Floating dropdown when collapsed */}
      {openState && hasChildren && open && (
        <div className="fixed z-50">
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-14 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 py-2 min-w-56">
            <div className="px-4 py-2 text-xs font-medium text-gray-400 border-b border-gray-700">
              {item.label}
            </div>
            {item.children.map((child) => (
              <Link
                key={child.to}
                to={child.to}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition ${
                  location.pathname === child.to ? "bg-gray-700 text-white" : ""
                }`}
              >
                <span className="flex items-center gap-3">
                  {child.icon && <child.icon size={18} />}
                  <span>{child.label}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!openState && hasChildren && open && (
        <div className="mt-1 space-y-1">
          {item.children.map((child) => (
            <MenuItem
              key={child.to}
              item={child}
              isActive={location.pathname === child.to}
              depth={depth + 1}
              openState={openState}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function Sidebar({ collapsed = false, onToggle }) {
//   const { user } = useAuth();
  const { pathname } = useLocation();

  const role = "super-admin";
  const menuItems = menuConfig[role] || [];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-linear-to-b from-blue-500 to-teal-300 text-black flex flex-col transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 justify-between border-b border-gray-800">
        <h1 className={`font-bold transition-all ${collapsed ? "text-2xl" : "text-xl"}`}>
          {collapsed ? "VK" : "VK Enterprises"}
        </h1>
        <button
					onClick={onToggle}
					className="p-2 rounded-lg hover:bg-gray-800 transition-all group cursor-pointer"
        >
					{collapsed ? (
					<ChevronRight size={20} className="text-gray-900 group-hover:text-white" />
					) : (
					<ChevronLeft size={20} className="text-gray-900 group-hover:text-white" />
					)}
        </button>
      </div>

      {/* Scrollable Menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.to || item.label}>
              <MenuItem item={item} isActive={pathname === item.to} openState={collapsed} />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}