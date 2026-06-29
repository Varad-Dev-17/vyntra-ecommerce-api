import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, KeyRound, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminProfileDropdown = ({ adminEmail, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChangePassword = () => {
    setIsOpen(false);
    navigate("/change-password");
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 pl-3 border-l border-gray-100 hover:bg-gray-50 rounded-lg transition-colors py-1 px-2"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-[#1a1a2e]">Admin</p>
          <p className="text-[10px] text-gray-400">{adminEmail}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#4648d4] to-[#6b38d4] flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:shadow-lg hover:shadow-[#4648d4]/25 transition-all">
          A
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-50">
              <p className="text-sm font-semibold text-[#1a1a2e]">Admin</p>
              <p className="text-xs text-gray-400 mt-0.5">{adminEmail}</p>
            </div>
            <div className="p-2">
              <button
                onClick={handleChangePassword}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-[#4648d4] transition-colors"
              >
                <KeyRound size={16} />
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProfileDropdown;
