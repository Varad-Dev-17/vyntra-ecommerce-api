import { useState, useEffect, useCallback } from "react";
import { Package, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosConfig";
import PageCard from "../admin/ui/PageCard";
import SearchToolbar from "../admin/ui/SearchToolbar";
import DataTable from "../admin/ui/DataTable";
import Pagination from "../admin/ui/Pagination";

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page,
        limit: 10,
      });

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (statusFilter) params.append("status", statusFilter);

      const res = await api.get(`/admin/orders?${params.toString()}`);
      if (res.data.success) {
        setOrders(res.data.data.orders);
        setTotalPages(res.data.data.pagination.pages);
        setTotalOrders(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}`, { status: newStatus });
      if (res.data.success) {
        toast.success("Order status updated");
        // Update local state to reflect change without full re-fetch
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-50 text-amber-600 border-amber-200",
      processing: "bg-blue-50 text-blue-600 border-blue-200",
      shipped: "bg-purple-50 text-purple-600 border-purple-200",
      delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",
      cancelled: "bg-rose-50 text-rose-600 border-rose-200",
    };
    const style = styles[status] || "bg-gray-50 text-gray-600 border-gray-200";
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${style} uppercase tracking-wider`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      header: 'Order ID',
      accessor: 'orderId',
      render: (row) => (
        <span className="font-medium text-[#1a1a2e] font-['Geist']">
          {row.orderId || row._id.slice(-8).toUpperCase()}
        </span>
      )
    },
    {
      header: 'Customer',
      accessor: 'customer',
      render: (row) => (
        <div>
          <p className="font-medium text-[#1a1a2e]">{row.user?.username || "Unknown"}</p>
          <p className="text-xs text-gray-500 mt-0.5">{row.user?.email || "No email"}</p>
        </div>
      )
    },
    {
      header: 'Products',
      accessor: 'products',
      render: (row) => (
        <div>
          <p className="text-[#1a1a2e] truncate max-w-[150px]" title={row.items?.[0]?.product?.title}>
            {row.items?.[0]?.product?.title || "Product Unavailable"}
          </p>
          {row.items?.length > 1 && (
            <p className="text-xs text-gray-500 mt-0.5">
              + {row.items.length - 1} more item(s)
            </p>
          )}
        </div>
      )
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => (
        <span className="font-bold text-[#1a1a2e] font-['Manrope']">
          ₹{row.totalAmount?.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-gray-500">
          {new Date(row.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      header: 'Action',
      align: 'right',
      render: (row) => (
        row.status !== "cancelled" ? (
          <select
            value={row.status}
            onChange={(e) => handleStatusUpdate(row._id, e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4648d4]/20 focus:border-[#4648d4] text-[#1a1a2e] cursor-pointer shadow-sm hover:border-gray-300 transition-all"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled" className="text-rose-500">Cancel</option>
          </select>
        ) : (
          <span className="text-xs text-gray-400 italic">No actions</span>
        )
      )
    }
  ];

  return (
    <PageCard>
      <SearchToolbar
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(1);
        }}
        searchPlaceholder="Search ID, Name, Email..."
        extraFilters={
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4648d4]/20 focus:border-[#4648d4] transition-all text-sm text-[#1a1a2e] cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        }
      />
      <div className="flex-1 overflow-y-auto">
        {error && orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <p className="text-gray-800 font-medium mb-2">{error}</p>
            <button
              onClick={fetchOrders}
              className="text-[#4648d4] hover:underline text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={orders}
            isLoading={loading && orders.length === 0}
            emptyMessage={
              <div className="text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-800 font-medium">No orders found</p>
                <p className="text-gray-500 text-sm mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            }
          />
        )}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={totalOrders}
        itemsPerPage={10}
      />
    </PageCard>
  );
};

export default OrdersSection;
