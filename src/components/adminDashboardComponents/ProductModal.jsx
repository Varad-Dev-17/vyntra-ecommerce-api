import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ChevronDown, Trash2 } from "lucide-react";
import api from "../../api/axiosConfig";
import toast from "react-hot-toast";

const ProductModal = ({ isOpen, onClose, onSubmit, product, isEditing }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [],
    category: "",
    subCategory: "",
    brand: "",
    attributes: {}, // { attrId: ["val1", "val2"] }
    price: "",
    stock: "10",
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Lookups
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [attributeOptions, setAttributeOptions] = useState({}); // { attrId: [options] }

  useEffect(() => {
    if (isOpen) {
      fetchCategoriesAndBrands();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && product && isEditing) {
      const initialAttrs = {};
      if (product.attributes) {
        product.attributes.forEach((attr) => {
          initialAttrs[attr.attribute._id || attr.attribute] = attr.values;
        });
      }
      setFormData({
        title: product.title || "",
        description: product.description || "",
        images: product.images || [],
        category: product.category?._id || product.category || "",
        subCategory: product.subCategory?._id || product.subCategory || "",
        brand: product.brand?._id || product.brand || "",
        attributes: initialAttrs,
        price: product.price || "",
        stock: product.stock?.toString() || "10",
        status: product.status || "active",
      });
    } else if (isOpen) {
      setFormData({
        title: "",
        description: "",
        images: [],
        category: "",
        subCategory: "",
        brand: "",
        attributes: {},
        price: "",
        stock: "10",
        status: "active",
      });
    }
  }, [product, isEditing, isOpen]);

  // Fetch SubCategories and Attributes when Category changes
  useEffect(() => {
    if (formData.category) {
      fetchSubCategories(formData.category);
      fetchAttributes(formData.category);
    } else {
      setSubCategories([]);
      setAttributes([]);
    }
  }, [formData.category]);

  const fetchCategoriesAndBrands = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        api.get("/categories"),
        api.get("/brands"),
      ]);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (brandRes.data.success) setBrands(brandRes.data.brands);
    } catch (error) {
      console.error("Error fetching categories or brands", error);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const res = await api.get(`/subcategories/category/${categoryId}`);
      if (res.data.success) setSubCategories(res.data.subCategories);
    } catch (error) {
      console.error("Error fetching subcategories", error);
    }
  };

  const fetchAttributes = async (categoryId) => {
    try {
      const res = await api.get(`/products/attributes/${categoryId}`);
      if (res.data.success) {
        const attrs = res.data.data;
        setAttributes(attrs);
        // Fetch options for select/multiselect
        attrs.forEach((attr) => {
          if (attr.fieldType === "select" || attr.fieldType === "multiselect") {
            fetchAttributeOptions(attr._id);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching attributes", error);
    }
  };

  const fetchAttributeOptions = async (attributeId) => {
    try {
      const res = await api.get(`/attribute-options/attribute/${attributeId}`);
      if (res.data.success) {
        setAttributeOptions((prev) => ({
          ...prev,
          [attributeId]: res.data.options,
        }));
      }
    } catch (error) {
      console.error("Error fetching attribute options", error);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    if (formData.images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setUploading(true);
    const uploadData = new FormData();
    files.forEach((file) => uploadData.append("images", file));

    try {
      const res = await api.post("/admin/upload/multiple", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        const newUrls = res.data.data.map((img) => img.url);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newUrls],
        }));
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAttributeChange = (attrId, value, fieldType) => {
    setFormData((prev) => {
      const newAttrs = { ...prev.attributes };
      
      if (fieldType === "multiselect") {
        const currentVals = newAttrs[attrId] || [];
        if (currentVals.includes(value)) {
          newAttrs[attrId] = currentVals.filter((v) => v !== value);
        } else {
          newAttrs[attrId] = [...currentVals, value];
        }
      } else {
        // text, number, select (single)
        newAttrs[attrId] = [value];
      }
      
      return { ...prev, attributes: newAttrs };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.subCategory || !formData.brand) {
      toast.error("Category, Subcategory, and Brand are required");
      return;
    }

    setLoading(true);
    
    // Format attributes for backend: [{ attribute: ObjectId, values: [String] }]
    const formattedAttributes = Object.keys(formData.attributes)
      .map((attrId) => ({
        attribute: attrId,
        values: formData.attributes[attrId],
      }))
      .filter((a) => a.values && a.values.length > 0 && a.values[0] !== "");

    const payload = {
      ...formData,
      attributes: formattedAttributes,
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    await onSubmit(payload);
    setLoading(false);
    onClose();
  };

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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
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

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                
                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Product Images (Max 5)
                  </label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {formData.images.map((url, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={url} alt="product" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {formData.images.length < 5 && (
                      <label className="flex items-center justify-center w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#4648d4] hover:bg-[#4648d4]/5 cursor-pointer transition-all">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                        {uploading ? (
                          <div className="w-5 h-5 border-2 border-[#4648d4] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Plus size={20} className="text-[#4648d4]" />
                        )}
                      </label>
                    )}
                  </div>
                </div>

                {/* Title & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4648d4] outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Price (₹) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4648d4] outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4648d4] outline-none transition-all text-sm resize-none"
                  />
                </div>

                {/* Category, SubCategory, Brand */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                    <div className="relative">
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                        className="appearance-none w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:border-[#4648d4] outline-none text-sm bg-white"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">SubCategory *</label>
                    <div className="relative">
                      <select
                        required
                        disabled={!formData.category}
                        value={formData.subCategory}
                        onChange={(e) => handleChange("subCategory", e.target.value)}
                        className="appearance-none w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:border-[#4648d4] outline-none text-sm bg-white disabled:bg-gray-50"
                      >
                        <option value="">Select Subcategory</option>
                        {subCategories.map((sc) => (
                          <option key={sc._id} value={sc._id}>{sc.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand *</label>
                    <div className="relative">
                      <select
                        required
                        value={formData.brand}
                        onChange={(e) => handleChange("brand", e.target.value)}
                        className="appearance-none w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:border-[#4648d4] outline-none text-sm bg-white"
                      >
                        <option value="">Select Brand</option>
                        {brands.map((b) => (
                          <option key={b._id} value={b._id}>{b.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Dynamic Attributes */}
                {attributes.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 font-['Manrope']">Dynamic Attributes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {attributes.map((attr) => (
                        <div key={attr._id}>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5 capitalize">{attr.name}</label>
                          
                          {attr.fieldType === "text" && (
                            <input
                              type="text"
                              value={formData.attributes[attr._id]?.[0] || ""}
                              onChange={(e) => handleAttributeChange(attr._id, e.target.value, "text")}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#4648d4]"
                            />
                          )}
                          
                          {attr.fieldType === "number" && (
                            <input
                              type="number"
                              value={formData.attributes[attr._id]?.[0] || ""}
                              onChange={(e) => handleAttributeChange(attr._id, e.target.value, "number")}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#4648d4]"
                            />
                          )}

                          {attr.fieldType === "select" && (
                            <div className="relative">
                              <select
                                value={formData.attributes[attr._id]?.[0] || ""}
                                onChange={(e) => handleAttributeChange(attr._id, e.target.value, "select")}
                                className="appearance-none w-full px-3 py-2 pr-8 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#4648d4] bg-white"
                              >
                                <option value="">Select {attr.name}</option>
                                {attributeOptions[attr._id]?.map((opt) => (
                                  <option key={opt._id} value={opt.value}>{opt.value}</option>
                                ))}
                              </select>
                              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                          )}

                          {attr.fieldType === "multiselect" && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {attributeOptions[attr._id]?.map((opt) => {
                                const isSelected = formData.attributes[attr._id]?.includes(opt.value);
                                return (
                                  <button
                                    type="button"
                                    key={opt._id}
                                    onClick={() => handleAttributeChange(attr._id, opt.value, "multiselect")}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                      isSelected ? "bg-[#4648d4] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#4648d4]"
                                    }`}
                                  >
                                    {opt.value}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.stock}
                      onChange={(e) => handleChange("stock", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4648d4] outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Product Status</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formData.status === "active" ? "Visible to customers" : "Hidden from customers"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange("status", formData.status === "active" ? "inactive" : "active")}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                        formData.status === "active" ? "bg-[#4648d4]" : "bg-gray-300"
                      }`}
                    >
                      <motion.div
                        animate={{ x: formData.status === "active" ? 26 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                      />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
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
                    {loading ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Product" : "Add Product")}
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
