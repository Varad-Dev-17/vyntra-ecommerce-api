import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  ChevronDown,
  Filter,
  Package,
  Edit2,
  Trash2,
} from "lucide-react";
import api from "../../api/axiosConfig";
import ProductModal from "./ProductModal";
import DeleteModal from "./DeleteModal";

const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [sortBy, setSortBy] = useState("Newest");
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/products");
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (formData) => {
    try {
      const res = await api.post("/admin/products", formData);
      if (res.data.success) {
        setProducts([res.data.product, ...products]);
      }
    } catch (err) {
      console.error("Error adding product:", err);
      const newProduct = {
        _id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
      };
      setProducts([newProduct, ...products]);
    }
  };

  const handleUpdateProduct = async (formData) => {
    try {
      const res = await api.put(
        `/admin/products/${editingProduct._id}`,
        formData
      );
      if (res.data.success) {
        setProducts(
          products.map((p) =>
            p._id === editingProduct._id ? res.data.product : p
          )
        );
      }
    } catch (err) {
      console.error("Error updating product:", err);
      setProducts(
        products.map((p) =>
          p._id === editingProduct._id ? { ...p, ...formData } : p
        )
      );
    }
    setEditingProduct(null);
  };

  const handleDeleteProduct = async () => {
    try {
      await api.delete(`/admin/products/${deletingProduct._id}`);
      setProducts(products.filter((p) => p._id !== deletingProduct._id));
    } catch (err) {
      console.error("Error deleting product:", err);
      setProducts(products.filter((p) => p._id !== deletingProduct._id));
    }
    setDeletingProduct(null);
    setIsDeleteModalOpen(false);
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === "active" ? "inactive" : "active";
    try {
      await api.put(`/admin/products/${product._id}`, { status: newStatus });
      setProducts(
        products.map((p) =>
          p._id === product._id ? { ...p, status: newStatus } : p
        )
      );
    } catch (err) {
      setProducts(
        products.map((p) =>
          p._id === product._id ? { ...p, status: newStatus } : p
        )
      );
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.desc?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      product.categories === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        color: "text-red-500",
        dot: "bg-red-500",
      };
    if (stock <= 5)
      return {
        label: `Low Stock: ${stock} Units`,
        color: "text-amber-500",
        dot: "bg-amber-500",
      };
    return {
      label: `In Stock: ${stock} Units`,
      color: "text-emerald-500",
      dot: "bg-emerald-500",
    };
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a2e] font-['Manrope']">
            Product Inventory
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage your luxury product catalog and stock levels.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-[#4648d4] to-[#6b38d4] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#4648d4]/25 transition-all"
        >
          <Plus size={16} /> Add Product
        </motion.button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-50 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20 outline-none transition-all text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20 outline-none transition-all text-sm bg-white cursor-pointer"
          >
            <option>All Categories</option>
            <option>Fashion</option>
            <option>Tech</option>
            <option>Lifestyle</option>
            <option>Home</option>
            <option>Sports</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20 outline-none transition-all text-sm bg-white cursor-pointer"
          >
            <option>Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Name: A-Z</option>
          </select>
          <Filter
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        <span className="text-xs text-gray-400 ml-auto">
          SHOWING {filteredProducts.length} PRODUCTS
        </span>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#4648d4] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => {
              const stockInfo = getStockStatus(parseInt(product.stock) || 0);
              return (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-gray-50">
                    <img
                      src={
                        product.img ||
                        "https://via.placeholder.com/400x300?text=No+Image"
                      }
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400x300?text=No+Image";
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                        {product.categories}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setIsModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-[#4648d4] hover:text-white transition-colors shadow-sm"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingProduct(product);
                          setIsDeleteModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-[#1a1a2e] line-clamp-2 font-['Manrope'] mb-1">
                      {product.title}
                    </h3>
                    <p className="text-lg font-bold text-[#4648d4] mb-2">
                      ₹{product.price}
                    </p>
                    <div className="flex items-center gap-1.5 mb-3">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${stockInfo.dot}`}
                      />
                      <span className={`text-xs ${stockInfo.color}`}>
                        {stockInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                          product.status === "active"
                            ? "text-emerald-500"
                            : "text-gray-400"
                        }`}
                      >
                        {product.status === "active" ? "ACTIVE" : "INACTIVE"}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
                          product.status === "active"
                            ? "bg-[#4648d4]"
                            : "bg-gray-200"
                        }`}
                      >
                        <motion.div
                          animate={{ x: product.status === "active" ? 20 : 2 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Package size={48} className="text-gray-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-1">
            No products found
          </h3>
          <p className="text-sm text-gray-300">
            Try adjusting your search or filters
          </p>
        </motion.div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
        product={editingProduct}
        isEditing={!!editingProduct}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProduct(null);
        }}
        onConfirm={handleDeleteProduct}
        productName={deletingProduct?.title}
      />
    </div>
  );
};

export default ProductsSection;
