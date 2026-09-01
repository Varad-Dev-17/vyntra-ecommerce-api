import os

file_path = r"v:\render\vyntra-ecommerce-api\src\components\adminDashboardComponents\DashboardSection.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# The user's new layout starts at line 33.
# We need to insert the missing logic between line 31 (FilterSelect declaration) and line 33.

missing_logic = """  return (
    <div className="relative inline-block">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none bg-slate-50 border border-slate-100 text-slate-500 font-medium ${
          large ? 'px-4 py-2 font-bold text-sm' : 'px-3 py-1.5 text-sm'
        } pr-8 rounded cursor-pointer focus:outline-none hover:bg-slate-100 transition-colors`}
      >
        <option value="This Year">This Year</option>
        <option value="This Month">This Month</option>
        <option value="This Week">This Week</option>
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  );
};

const DashboardSection = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [revenueFilter, setRevenueFilter] = useState("This Week");
  const [ordersFilter, setOrdersFilter] = useState("This Week");
  const [analyticsFilter, setAnalyticsFilter] = useState("This Week");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/dashboard/stats", {
        params: {
          revenueTime: revenueFilter,
          ordersTime: ordersFilter,
          analyticsTime: analyticsFilter
        }
      });
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
  }, [revenueFilter, ordersFilter, analyticsFilter]);

  if (loading && !data) {
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
  const revenueChart = data?.revenueChart || [];
  const analyticsChart = data?.analyticsChart || [];
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
"""

# The file from lines 1 to 31 is fine.
# Line 32 is "  return (\n"
# Line 33 is "<div className="min-h-screen bg-[#f8f9fc]..."

new_lines = lines[:31] + [missing_logic] + lines[32:]

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)
