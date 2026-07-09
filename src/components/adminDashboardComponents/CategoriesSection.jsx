import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    attributes: [],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, attrRes] = await Promise.all([
        api.get("/categories"),
        api.get("/attributes"),
      ]);

      if (catRes.data.success) {
        setCategories(catRes.data.categories);
      }
      if (attrRes.data.success) {
        setAttributes(attrRes.data.attributes);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        attributes: category.attributes.map((a) => (typeof a === "object" ? a._id : a)),
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", description: "", attributes: [] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", attributes: [] });
  };

  const handleAttributeToggle = (attrId) => {
    setFormData((prev) => {
      const isSelected = prev.attributes.includes(attrId);
      if (isSelected) {
        return { ...prev, attributes: prev.attributes.filter((id) => id !== attrId) };
      } else {
        return { ...prev, attributes: [...prev.attributes, attrId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await api.put(`/admin/categories/${editingCategory._id}`, formData);
        if (res.data.success) {
          toast.success("Category updated successfully");
          fetchData();
          handleCloseModal();
        }
      } else {
        const res = await api.post("/admin/categories", formData);
        if (res.data.success) {
          toast.success("Category created successfully");
          fetchData();
          handleCloseModal();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save category");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await api.delete(`/admin/categories/${id}`);
      if (res.data.success) {
        toast.success("Category deleted successfully");
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#1a1a2e] font-['Manrope']">
          Categories
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#4648d4] text-white rounded-lg font-medium hover:bg-[#3b3db0] transition-colors"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] transition-colors text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Attributes Count
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <div className="w-8 h-8 border-4 border-[#4648d4] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    No categories found
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category._id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      category.status === "inactive" ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-[#1a1a2e]">
                        {category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                      {category.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {category.attributes?.length || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          category.status === "active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {category.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="p-2 rounded-lg hover:bg-[#4648d4]/10 text-gray-400 hover:text-[#4648d4] transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-[#1a1a2e] font-['Manrope']">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] transition-colors"
                    placeholder="e.g. Electronics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] transition-colors resize-none"
                    placeholder="Category description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Linked Attributes
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                    {attributes.map((attr) => {
                      const isSelected = formData.attributes.includes(attr._id);
                      return (
                        <button
                          key={attr._id}
                          type="button"
                          onClick={() => handleAttributeToggle(attr._id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            isSelected
                              ? "bg-[#4648d4] border-[#4648d4] text-white"
                              : "bg-white border-gray-200 text-gray-600 hover:border-[#4648d4] hover:text-[#4648d4]"
                          }`}
                        >
                          {attr.name}
                        </button>
                      );
                    })}
                    {attributes.length === 0 && (
                      <span className="text-sm text-gray-400">No attributes available</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#4648d4] text-white rounded-lg font-medium hover:bg-[#3b3db0] transition-colors"
                  >
                    {editingCategory ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoriesSection;
