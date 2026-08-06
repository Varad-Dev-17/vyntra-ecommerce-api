import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Tags,
  Ticket,
  MessageSquare,
  PackageCheck,
  LogOut,
  KeyRound,
  ChevronUp,
  User as UserIcon,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCcw
} from "lucide-react";

const Sidebar = ({ onClose, isCollapsed, toggleCollapse }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/catalog", label: "Catalog", icon: Tags },
    { path: "/admin/products", label: "Products", icon: Package },
    { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { path: "/admin/returns", label: "Returns", icon: RefreshCcw },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/coupons", label: "Coupons", icon: Ticket },
    { path: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  ];

  return (
    <motion.aside
      initial={{ x: -240 }}
      animate={{ x: 0, width: isCollapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-40 overflow-hidden"
    >
      {/* Logo & Toggle */}
      <div className={`pt-6 pb-4 flex items-center overflow-hidden ${isCollapsed ? "justify-center px-0" : "px-6 justify-between"}`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#4648d4] to-[#6b38d4] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-xl font-extrabold text-[#4648d4] mt-0.5 tracking-tight">Vyntra Admin</h1>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 overflow-y-auto flex flex-col">
        <div className="space-y-1 w-full my-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 py-3.5 rounded-xl text-base transition-all duration-200 ${
                    isCollapsed ? "justify-center px-0" : "px-5"
                  } ${
                    isActive
                      ? "bg-[#4648d4] text-white font-semibold shadow-sm"
                      : "text-gray-600 font-medium hover:bg-[#4648d4]/5 hover:text-[#4648d4]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={isCollapsed ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Profile Section */}
      <div className={`border-t border-gray-100 relative ${isCollapsed ? "p-3 flex justify-center" : "p-4"}`} ref={profileRef}>
        <AnimatePresence>
          {isProfileOpen && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 w-48"
            >
              <div className="p-4 border-b border-gray-50">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.username || "Admin"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "admin@vyntra.com"}
                </p>
              </div>
              <div className="p-2">
                <Link
                  to="/change-password"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#4648d4] hover:bg-[#4648d4]/10 rounded-lg transition-colors"
                >
                  <KeyRound size={16} />
                  Change Password
                </Link>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => {
            if (isCollapsed && toggleCollapse) {
              toggleCollapse();
            } else {
              setIsProfileOpen(!isProfileOpen);
            }
          }}
          className={`w-full flex items-center rounded-xl transition-all duration-200 ${
            isProfileOpen && !isCollapsed ? "bg-gray-50" : "hover:bg-gray-50"
          } ${isCollapsed ? "justify-center p-2" : "justify-between p-3"}`}
          title={isCollapsed ? (user?.username || "Admin") : undefined}
        >
          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : "overflow-hidden"}`}>
            <div className="w-9 h-9 rounded-full bg-[#4648d4]/10 flex items-center justify-center shrink-0">
              <UserIcon size={18} className="text-[#4648d4]" />
            </div>
            {!isCollapsed && (
              <div className="text-left truncate">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.username || "Admin"}
                </p>
                <p className="text-xs text-gray-500 truncate">Admin</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <motion.div animate={{ rotate: isProfileOpen ? 180 : 0 }}>
              <ChevronUp size={18} className="text-gray-400 shrink-0" />
            </motion.div>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
