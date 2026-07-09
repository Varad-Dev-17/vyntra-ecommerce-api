import React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Tags,
  ListTree,
  Star,
  Sliders,
  List,
  PackageCheck
} from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab, onClose }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "categories", label: "Categories", icon: Tags },
    { id: "subcategories", label: "SubCategories", icon: ListTree },
    { id: "brands", label: "Brands", icon: Star },
    { id: "attributes", label: "Attributes", icon: Sliders },
    { id: "attributeOptions", label: "Attr Options", icon: List },
    { id: "products", label: "Products", icon: Package },
    { id: "stocks", label: "Stocks", icon: PackageCheck },
    { id: "orders", label: "Orders", icon: ShoppingCart },
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
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                onClose?.();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#4648d4]/10 text-[#4648d4]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
