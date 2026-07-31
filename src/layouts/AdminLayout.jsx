import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import Sidebar from "../components/admin/Sidebar";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f7fc] text-[13px]">
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

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          onClose={() => setSidebarOpen(false)} 
          isCollapsed={isCollapsed}
          toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            className="fixed left-0 top-0 z-50 lg:hidden h-full"
          >
            <Sidebar onClose={() => setSidebarOpen(false)} isCollapsed={false} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className={`transition-all duration-300 min-h-screen flex flex-col relative ${isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[240px]'}`}>
        
        {/* Toggle Button (Outside Sidebar) */}
        <div className="sticky top-0 z-30 flex items-center pt-4 lg:pt-6 px-2 lg:px-2 pb-0 bg-transparent pointer-events-none">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setSidebarOpen(true);
              } else {
                setIsCollapsed(!isCollapsed);
              }
            }}
            className="pointer-events-auto p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden p-4 lg:pr-6 lg:pl-12 lg:pb-6 lg:-mt-[34px] flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
