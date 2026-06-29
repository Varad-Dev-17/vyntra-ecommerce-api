import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Settings,
  Menu,
  ShoppingBag,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/adminDashboardComponents/SideBar";
import AdminProfileDropdown from "../components/adminDashboardComponents/AdminProfileDropdown";
import DashboardSection from "../components/adminDashboardComponents/DashboardSection";
import ProductsSection from "../components/adminDashboardComponents/ProductsSection";
import UsersSection from "../components/adminDashboardComponents/UsersSection";
import OrdersSection from "../components/adminDashboardComponents/OrdersSection";

const AdminDashBoard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const adminEmail = user?.email || "admin@vyntra.com";

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardSection />;
      case "users":
        return <UsersSection />;
      case "products":
        return <ProductsSection />;
      case "orders":
        return <OrdersSection />;
      default:
        return <ProductsSection />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7fc]">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed left-0 top-0 z-50 lg:hidden"
          >
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onClose={() => setSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:ml-65 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Hamburger + User Nav Links */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu size={20} className="text-gray-600" />
              </button>

              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/products"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#4648d4] hover:bg-[#4648d4]/5 transition-all"
                >
                  <ShoppingBag size={16} />
                  Shop Now
                </Link>
                <Link
                  to="/trending"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#4648d4] hover:bg-[#4648d4]/5 transition-all"
                >
                  <TrendingUp size={16} />
                  Trending Products
                </Link>
                <Link
                  to="/new-arrivals"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#4648d4] hover:bg-[#4648d4]/5 transition-all"
                >
                  <Sparkles size={16} />
                  New Arrivals
                </Link>
              </nav>
            </div>

            {/* Center: Search */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20 outline-none transition-all text-sm placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Right: Bell, Settings, Admin Profile Dropdown */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Bell size={20} className="text-gray-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Settings size={20} className="text-gray-500" />
              </button>

              <AdminProfileDropdown
                adminEmail={adminEmail}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <motion.main
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.main>
      </div>
    </div>
  );
};

export default AdminDashBoard;
