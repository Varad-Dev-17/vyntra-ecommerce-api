import { useState, useEffect } from "react";
import { AlertCircle, Check } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosConfig";
import PageCard from "../admin/ui/PageCard";
import SearchToolbar from "../admin/ui/SearchToolbar";
import DataTable from "../admin/ui/DataTable";

const StocksSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [editingStockId, setEditingStockId] = useState(null);
  const [stockInputValue, setStockInputValue] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/products");
      if (res.data.success) {
        setProducts(res.data.data.products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockUpdate = async (id) => {
    if (stockInputValue === "" || isNaN(stockInputValue)) {
      toast.error("Please enter a valid stock number");
      return;
    }

    const newStock = Number(stockInputValue);
    if (newStock < 0) {
      toast.error("Stock cannot be negative");
      return;
    }

    try {
      const res = await api.put(`/admin/products/${id}`, { stock: newStock });
      if (res.data.success) {
        toast.success("Stock updated successfully");
        setProducts(
          products.map((p) => (p._id === id ? { ...p, stock: newStock } : p))
        );
        setEditingStockId(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update stock");
    }
  };

  const handleKeyDown = (e, id) => {
    if (e.key === "Enter") {
      handleStockUpdate(id);
    } else if (e.key === "Escape") {
      setEditingStockId(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase());
    const matchesLowStock = showLowStockOnly ? product.stock < 5 : true;
    return matchesSearch && matchesLowStock;
  });

  const columns = [
    {
      header: 'Product Name',
      accessor: 'title',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.images && row.images[0] && (
            <img
              src={row.images[0]}
              alt={row.title}
              className="w-10 h-10 rounded-lg object-cover border border-gray-100"
             loading="lazy" decoding="async" />
          )}
          <span className="font-medium text-[#1a1a2e] line-clamp-2">
            {row.title}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
            row.status === "active"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {row.status === "active" ? "Active" : "Inactive"}
        </span>
      )
    },
    {
      header: 'Current Stock',
      accessor: 'stock',
      render: (row) => (
        editingStockId === row._id ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              autoFocus
              value={stockInputValue}
              onChange={(e) => setStockInputValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, row._id)}
              className="w-20 px-2 py-1 text-sm border-2 border-[#4648d4] rounded-md outline-none"
            />
            <button
              onClick={() => handleStockUpdate(row._id)}
              className="p-1.5 bg-[#4648d4] text-white rounded-md hover:bg-[#3b3db0] transition-colors"
            >
              <Check size={14} />
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              setEditingStockId(row._id);
              setStockInputValue(row.stock);
            }}
          >
            <span
              className={`text-sm font-bold ${
                row.stock < 5 ? "text-red-500" : "text-gray-700"
              }`}
            >
              {row.stock}
            </span>
            <span className="text-xs text-[#4648d4] opacity-0 group-hover:opacity-100 transition-opacity">
              Edit
            </span>
          </div>
        )
      )
    }
  ];

  return (
    <PageCard>
      <SearchToolbar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by product name..."
        extraFilters={
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="w-4 h-4 text-[#4648d4] rounded border-gray-300 focus:ring-[#4648d4] cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <AlertCircle size={16} className="text-amber-500" />
              Low Stock Only (&lt; 5)
            </span>
          </label>
        }
      />
      <div className="flex-1 overflow-y-auto">
        <DataTable
          columns={columns}
          data={filteredProducts}
          isLoading={loading}
          emptyMessage="No products found"
        />
      </div>
    </PageCard>
  );
};

export default StocksSection;
