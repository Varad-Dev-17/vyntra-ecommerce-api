import React from "react";
import { motion } from "framer-motion";
import { Box, ShoppingCart, UserCheck, DollarSign } from "lucide-react";

const DashboardSection = () => {
  const stats = [
    {
      label: "Total Products",
      value: "156",
      change: "+12%",
      icon: Box,
      color: "from-[#4648d4] to-[#6b38d4]",
    },
    {
      label: "Total Orders",
      value: "1,284",
      change: "+8%",
      icon: ShoppingCart,
      color: "from-emerald-400 to-emerald-600",
    },
    {
      label: "Total Users",
      value: "3,429",
      change: "+24%",
      icon: UserCheck,
      color: "from-amber-400 to-amber-600",
    },
    {
      label: "Revenue",
      value: "₹12.4L",
      change: "+18%",
      icon: DollarSign,
      color: "from-rose-400 to-rose-600",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#1a1a2e] font-['Manrope'] mb-6">
        Dashboard Overview
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center`}
                >
                  <Icon size={18} className="text-white" />
                </div>
                <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-[#1a1a2e] font-['Manrope']">
                {stat.value}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardSection;
