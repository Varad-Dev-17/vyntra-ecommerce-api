import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Box, ShoppingCart, UserCheck, DollarSign, Loader2, AlertCircle } from "lucide-react";
import api from "../../api/axiosConfig";

const DashboardSection = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/dashboard/stats");
      if (res.data.success) {
        setData(res.data.data);
      } else {
        setError("Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#4648d4] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading dashboard stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 h-[50vh] flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <p className="text-gray-800 font-bold mb-2">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-[#4648d4] text-white rounded-lg text-sm font-medium hover:bg-[#3a3cb8] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Fallback data structure if backend is empty
  const counts = data?.counts || { totalProducts: 0, totalOrders: 0, totalUsers: 0 };
  const revenue = data?.revenue || { total: 0, growth: 0 };

  const stats = [
    {
      label: "Total Products",
      value: counts.totalProducts.toLocaleString(),
      change: null, // Backend doesn't provide historical product growth yet
      icon: Box,
      color: "from-[#4648d4] to-[#6b38d4]",
    },
    {
      label: "Total Orders",
      value: counts.totalOrders.toLocaleString(),
      change: null,
      icon: ShoppingCart,
      color: "from-emerald-400 to-emerald-600",
    },
    {
      label: "Total Users",
      value: counts.totalUsers.toLocaleString(),
      change: null,
      icon: UserCheck,
      color: "from-amber-400 to-amber-600",
    },
    {
      label: "Revenue",
      value: `₹${revenue.total.toLocaleString()}`,
      change: `${revenue.growth > 0 ? "+" : ""}${revenue.growth}%`,
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
          const isPositive = stat.change && stat.change.startsWith("+");
          
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
                {stat.change && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      isPositive
                        ? "text-emerald-500 bg-emerald-50"
                        : "text-rose-500 bg-rose-50"
                    }`}
                  >
                    {stat.change}
                  </span>
                )}
                {!stat.change && (
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                    Live
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-[#1a1a2e] font-['Manrope'] truncate">
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
