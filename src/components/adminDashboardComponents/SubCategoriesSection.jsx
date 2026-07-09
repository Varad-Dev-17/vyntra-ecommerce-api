import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";

const SubCategoriesSection = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subCatRes, catRes] = await Promise.all([
        api.get("/subcategories"),
        api.get("/categories"),
      ]);

      if (subCatRes.data.success) {
        setSubCategories(subCatRes.data.subCategories);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.categories);
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

  const handleOpenModal = (subCategory = null) => {
    if (subCategory) {
      setEditingSubCategory(subCategory);
      setFormData({
        name: subCategory.name,
        description: subCategory.description || "",
        category: subCategory.category?._id || subCategory.category || "",
      });
    } else {
      setEditingSubCategory(null);
      setFormData({ name: "", description: "", category: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubCategory(null);
    setFormData({ name: "", description: "", category: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      return toast.error("Please select a parent category.");
    }
    try {
      if (editingSubCategory) {
        const res = await api.put(`/admin/subcategories/${editingSubCategory._id}`, formData);
        if (res.data.success) {
          toast.success("SubCategory updated successfully");
          fetchData();
          handleCloseModal();
        }
      } else {
        const res = await api.post("/admin/subcategories", formData);
        if (res.data.success) {
          toast.success("SubCategory created successfully");
          fetchData();
          handleCloseModal();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save subcategory");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) return;
    try {
      const res = await api.delete(`/admin/subcategories/${id}`);
      if (res.data.success) {
        toast.success("SubCategory deleted successfully");
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete subcategory");
    }
  };

  const filteredSubCategories = subCategories.filter((subCat) => {
    const matchesSearch = subCat.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      (subCat.category && subCat.category._id === categoryFilter);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#1a1a2e] font-['Manrope']">
          SubCategories
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#4648d4] text-white rounded-lg font-medium hover:bg-[#3b3db0] transition-colors"
        >
          <Plus size={18} />
          Add SubCategory
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[250px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search subcategories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] transition-colors text-sm"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] text-sm text-gray-700 bg-white min-w-[200px]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Parent Category
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Description
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
              ) : filteredSubCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    No subcategories found
                  </td>
                </tr>
              ) : (
                filteredSubCategories.map((subCat) => (
                  <tr
                    key={subCat._id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      subCat.status === "inactive" ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-[#1a1a2e]">
                        {subCat.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {subCat.category?.name || <span className="text-red-400">Orphaned</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                      {subCat.description || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          subCat.status === "active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {subCat.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(subCat)}
                          className="p-2 rounded-lg hover:bg-[#4648d4]/10 text-gray-400 hover:text-[#4648d4] transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(subCat._id)}
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
                  {editingSubCategory ? "Edit SubCategory" : "Add SubCategory"}
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
                    placeholder="e.g. Men's Wear"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] transition-colors"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
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
                    placeholder="SubCategory description..."
                  />
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
                    {editingSubCategory ? "Update" : "Save"}
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

export default SubCategoriesSection;
