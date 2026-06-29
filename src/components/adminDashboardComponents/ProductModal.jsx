import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ChevronDown } from "lucide-react";
import api from "../../api/axiosConfig";

const ProductModal = ({ isOpen, onClose, onSubmit, product, isEditing }) => {
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    img: "",
    categories: "Fashion",
    size: "M",
    color: "Black",
    price: "",
    stock: "10",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (product && isEditing) {
      setFormData({
        title: product.title || "",
        desc: product.desc || "",
        img: product.img || "",
        categories: product.categories || "Fashion",
        size: product.size || "M",
        color: product.color || "Black",
        price: product.price || "",
        stock: product.stock?.toString() || "10",
        status: product.status || "active",
      });
      setPreviewUrl(product.img || "");
    } else {
      setFormData({
        title: "",
        desc: "",
        img: "",
        categories: "Fashion",
        size: "M",
        color: "Black",
        price: "",
        stock: "10",
        status: "active",
      });
      setPreviewUrl("");
    }
  }, [product, isEditing, isOpen]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploading(true);

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      const res = await api.post("/upload/image", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, img: res.data.imageUrl }));
        setPreviewUrl(res.data.imageUrl);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Try pasting a URL instead.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const categories = [
    "Fashion",
    "Tech",
    "Lifestyle",
    "Home",
    "Sports",
    "Accessories",
  ];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
  const colors = [
    "Black",
    "White",
    "Red",
    "Blue",
    "Green",
    "Purple",
    "Pink",
    "Gray",
    "Brown",
    "Gold",
    "Silver",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
                <h2 className="text-xl font-bold text-[#1a1a2e] font-['Manrope']">
                  {isEditing ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Product Image
                  </label>
                  {(previewUrl || formData.img) && (
                    <div className="mb-3 relative group">
                      <div className="w-full aspect-square rounded-xl overflow-hidden border border-gray-200">
                        <img
                          src={previewUrl || formData.img}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/400x400?text=Invalid+Image";
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl("");
                          setFormData((prev) => ({ ...prev, img: "" }));
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#4648d4] hover:bg-[#4648d4]/5 cursor-pointer transition-all min-w-30">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {uploading ? (
                        <div className="w-4 h-4 border-2 border-[#4648d4] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus size={16} className="text-[#4648d4]" />
                      )}
                      <span className="text-xs font-medium text-gray-600">
                        {uploading ? "Uploading..." : "Upload"}
                      </span>
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.img}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            img: e.target.value,
                          }));
                          setPreviewUrl(e.target.value);
                        }}
                        placeholder="Or paste image URL..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    Supported: JPG, PNG, WebP. Max 5MB.
                  </p>
                </div>

                {/* Title & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Product Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="e.g. Spectral Pro Audio"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Price (₹) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      placeholder="e.g. 24,999"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Category & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={formData.categories}
                        onChange={(e) =>
                          handleChange("categories", e.target.value)
                        }
                        className="appearance-none w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20 outline-none transition-all text-sm bg-white cursor-pointer"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => handleChange("stock", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Size & Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Size
                    </label>
                    <div className="relative">
                      <select
                        value={formData.size}
                        onChange={(e) => handleChange("size", e.target.value)}
                        className="appearance-none w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20 outline-none transition-all text-sm bg-white cursor-pointer"
                      >
                        {sizes.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Color
                    </label>
                    <div className="relative">
                      <select
                        value={formData.color}
                        onChange={(e) => handleChange("color", e.target.value)}
                        className="appearance-none w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20 outline-none transition-all text-sm bg-white cursor-pointer"
                      >
                        {colors.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.desc}
                    onChange={(e) => handleChange("desc", e.target.value)}
                    placeholder="Describe your product..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20 outline-none transition-all text-sm resize-none"
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Product Status
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formData.status === "active"
                        ? "Product is visible to customers"
                        : "Product is hidden from customers"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleChange(
                        "status",
                        formData.status === "active" ? "inactive" : "active"
                      )
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                      formData.status === "active"
                        ? "bg-[#4648d4]"
                        : "bg-gray-300"
                    }`}
                  >
                    <motion.div
                      animate={{
                        x: formData.status === "active" ? 26 : 2,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-linear-to-r from-[#4648d4] to-[#6b38d4] text-white font-medium hover:shadow-lg hover:shadow-[#4648d4]/25 transition-all disabled:opacity-50 text-sm"
                  >
                    {loading
                      ? isEditing
                        ? "Updating..."
                        : "Adding..."
                      : isEditing
                      ? "Update Product"
                      : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
