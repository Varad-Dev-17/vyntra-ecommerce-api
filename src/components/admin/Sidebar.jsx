import React from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Tags,
  Ticket,
  MessageSquare,
  PackageCheck
} from "lucide-react";

const Sidebar = ({ onClose }) => {
  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/catalog", label: "Catalog", icon: Tags },
    { path: "/admin/products", label: "Products", icon: Package },
    { path: "/admin/stock-management", label: "Stock Management", icon: PackageCheck },
    { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/coupons", label: "Coupons", icon: Ticket },
    { path: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  ];

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-65 min-h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-40"
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#4648d4] to-[#6b38d4] flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#4648d4] -mt-1">
              Vyntra
            </h1>
            <p className="text-[13px] text-gray-500 font-extrabold">
              Admin Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#4648d4]/10 text-[#4648d4]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
