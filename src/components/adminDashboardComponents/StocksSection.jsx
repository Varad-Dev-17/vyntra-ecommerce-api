import React, { useState, useEffect } from "react";
import { Search, PackageCheck, AlertCircle, Check } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosConfig";

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a2e] font-['Manrope']">
            Stocks Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage and update your product inventory levels</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[250px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] transition-colors text-sm"
            />
          </div>

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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">
                  Product Name
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                  Current Stock
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-10">
                    <div className="w-8 h-8 border-4 border-[#4648d4] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-gray-400">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      product.status === "inactive" ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                          />
                        )}
                        <span className="font-medium text-[#1a1a2e] line-clamp-2">
                          {product.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.status === "active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {product.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingStockId === product._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            autoFocus
                            value={stockInputValue}
                            onChange={(e) => setStockInputValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, product._id)}
                            className="w-20 px-2 py-1 text-sm border-2 border-[#4648d4] rounded-md outline-none"
                          />
                          <button
                            onClick={() => handleStockUpdate(product._id)}
                            className="p-1.5 bg-[#4648d4] text-white rounded-md hover:bg-[#3b3db0] transition-colors"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => {
                            setEditingStockId(product._id);
                            setStockInputValue(product.stock);
                          }}
                        >
                          <span
                            className={`text-sm font-bold ${
                              product.stock < 5 ? "text-red-500" : "text-gray-700"
                            }`}
                          >
                            {product.stock}
                          </span>
                          <span className="text-xs text-[#4648d4] opacity-0 group-hover:opacity-100 transition-opacity">
                            Edit
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StocksSection;
