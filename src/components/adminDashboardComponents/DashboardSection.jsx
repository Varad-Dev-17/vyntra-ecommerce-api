import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Users,
  Box,
  WalletCards,
  Loader2,
  AlertCircle,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import api from "../../api/axiosConfig";

const DashboardSection = () => {
  const navigate = useNavigate();
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

  const counts = data?.counts || {
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
  };
  const revenue = data?.revenue || { total: 0, growth: 0 };
  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];
  const salesChart = data?.salesChart || [];
  const orderStats = data?.orders || {};
  const salesByCategory = data?.salesByCategory || [];

  const stats = [
    {
      label: "Total Revenue",
      value: `₹${revenue.total.toLocaleString()}`,
      change: `${revenue.growth > 0 ? "+" : ""}${revenue.growth}% vs last month`,
      isPositive: revenue.growth >= 0,
      icon: WalletCards,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Total Orders",
      value: counts.totalOrders.toLocaleString(),
      change: "+8.7% vs last month", // mock change
      isPositive: true,
      icon: ShoppingCart,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Total Customers",
      value: counts.totalUsers.toLocaleString(),
      change: "+15.3% vs last month", // mock change
      isPositive: true,
      icon: Users,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-500",
    },
    {
      label: "Total Products",
      value: counts.totalProducts.toLocaleString(),
      change: "+4.6% vs last month", // mock change
      isPositive: true,
      icon: Box,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
    },
  ];

  // Prepare data for Order Overview Donut
  const orderPieData = [
    { name: "Delivered", value: orderStats.delivered || 0, color: "#10b981" },
    { name: "Processing", value: orderStats.processing || 0, color: "#3b82f6" },
    { name: "Shipped", value: orderStats.shipped || 0, color: "#f59e0b" },
    { name: "Pending", value: orderStats.pending || 0, color: "#8b5cf6" },
  ].filter((item) => item.value > 0);
  
  if (orderPieData.length === 0) {
    orderPieData.push({ name: "No Orders", value: 1, color: "#e5e7eb" });
  }

  const COLORS = orderPieData.map((d) => d.color);

  // Status badge colors
  const statusColors = {
    delivered: "text-emerald-600 bg-emerald-50",
    processing: "text-blue-600 bg-blue-50",
    shipped: "text-amber-600 bg-amber-50",
    pending: "text-purple-600 bg-purple-50",
    cancelled: "text-rose-600 bg-rose-50",
  };

  const catColors = [
    "bg-purple-500",
    "bg-emerald-400",
    "bg-orange-400",
    "bg-rose-400",
    "bg-indigo-400",
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-purple-100 p-4 lg:pl-17 lg:pr-17 lg:pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-700 tracking-tight">Dashboard Overview</h2>
          <p className="text-base text-slate-500 font-medium">
            Welcome back, admin! Here's what's happening with your store today.
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex items-center gap-3 bg-slate-50 border border-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
          <CalendarDays size={18} className="text-purple-500" />
          <span>
            {(() => {
              const today = new Date();
              const lastWeek = new Date(today);
              lastWeek.setDate(today.getDate() - 6);
              return `${lastWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            })()}
          </span>
        </div>
      </div>

      {/* Top Stats Flowing Panel */}
      <div className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-start text-left p-5 border border-slate-200 bg-white"
              >
                <div className="flex items-center justify-start gap-3 mb-3">
                  <div className={`w-10 h-10 flex items-center justify-center ${stat.iconBg}`}>
                    <Icon size={20} className={stat.iconColor} />
                  </div>
                  <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                </div>
                <div className="w-full flex flex-col items-center">
                  <h3 className="text-xl font-bold text-slate-700 mb-1">{stat.value}</h3>
                  <div className="flex items-center justify-center text-xs font-medium">
                    <span className={`mr-1 ${stat.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {stat.change.split(' ')[0]}
                    </span>
                    <span className="text-slate-400">{stat.change.split(' ').slice(1).join(' ')}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Charts Section 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 mb-10">
        {/* Revenue Overview Chart */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-xl font-bold text-slate-700 tracking-tight">Revenue Overview</h3>
            <div className="flex items-center gap-1 text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 border border-slate-100 cursor-pointer">
              This Year <ChevronDown size={14} />
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#8b5cf6', fontWeight: 600 }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Overview Donut */}
        <div className="flex flex-col">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-xl font-bold text-slate-700 tracking-tight">Orders Overview</h3>
            <div className="flex items-center gap-1 text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 border border-slate-100 cursor-pointer">
              This Month <ChevronDown size={14} />
            </div>
          </div>
          
          <div className="relative h-[200px] flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {orderPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">{counts.totalOrders}</span>
              <span className="text-xs text-slate-400 font-medium mt-1">Total Orders</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {orderPieData.map((item, index) => {
              if (item.name === "No Orders") return null;
              const total = orderPieData.reduce((sum, d) => sum + d.value, 0);
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-600 font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-slate-800">{item.value}</span>
                    <span className="text-slate-400 w-10 text-right">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 mb-10 border-t border-slate-100 pt-10">
        {/* Top Selling Products */}
        <div className="lg:border-r lg:border-slate-400 lg:pr-8">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-xl font-bold text-slate-700 tracking-tight">Top Products</h3>
            <span onClick={() => navigate('/admin/products')} className="text-sm font-bold text-purple-600 hover:text-purple-700 cursor-pointer">View All</span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100">
              <span>Product</span>
              <div className="flex gap-6 text-right">
                <span className="w-12">Sold</span>
                <span className="w-20">Revenue</span>
              </div>
            </div>
            {topProducts.slice(0, 4).map((product, index) => (
              <div key={index} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover"  loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full h-full bg-slate-200"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{product.title}</h4>
                    <p className="text-xs text-slate-500">Popular</p>
                  </div>
                </div>
                <div className="flex gap-6 text-right text-sm">
                  <span className="font-medium text-slate-600 w-12">{product.totalSold}</span>
                  <span className="font-bold text-slate-800 w-20">₹{Math.round(product.totalRevenue).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="overflow-hidden lg:border-r lg:border-slate-300 lg:pr-8">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-xl font-bold text-slate-700 tracking-tight">Recent Orders</h3>
            <span onClick={() => navigate('/admin/orders')} className="text-sm font-bold text-purple-600 hover:text-purple-700 cursor-pointer">View All</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium text-right pr-6">Amount</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.slice(0, 4).map((order) => (
                  <tr key={order._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 font-medium text-slate-800">#{order.orderId || order._id.toString().substring(0,6)}</td>
                    <td className="py-3 text-slate-600">{order.user?.username || 'Guest'}</td>
                    <td className="py-3 font-semibold text-slate-800 text-right pr-6">₹{Math.round(order.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right">
                      <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${statusColors[order.status] || "text-slate-600 bg-slate-100"}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="lg:pr-8">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-xl font-bold text-slate-700 tracking-tight">Sales by Category</h3>
            <span onClick={() => navigate('/admin/catalog')} className="text-sm font-bold text-purple-600 hover:text-purple-700 cursor-pointer">View All</span>
          </div>
          <div className="space-y-6">
            {salesByCategory.slice(0, 5).map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex justify-center items-center bg-slate-50 text-slate-500">
                      <Box size={14} />
                    </div>
                    <span className="font-semibold text-slate-700">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-500">{item.percentage}%</span>
                    <span className="font-bold text-slate-800 w-20 text-right">₹{Math.round(item.revenue).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-1.5">
                  <div className={`h-1.5 ${catColors[index % catColors.length]}`} style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
            {salesByCategory.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No category sales data.</p>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="border-t border-slate-100 pt-10">
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-xl font-bold text-slate-700 tracking-tight">Sales Analytics</h3>
          <div className="flex items-center gap-1 text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
            This Year <ChevronDown size={16} />
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
              <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val/1000}k`} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Legend 
                verticalAlign="top" 
                align="left" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 500 }}
              />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#8b5cf6" maxBarSize={12} />
              <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#3b82f6" maxBarSize={12} />
              <Bar yAxisId="right" dataKey="customers" name="Customers" fill="#10b981" maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;

