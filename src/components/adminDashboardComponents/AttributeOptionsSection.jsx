import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";

const AttributeOptionsSection = () => {
  const [options, setOptions] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [attributeFilter, setAttributeFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    value: "",
    attribute: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [optRes, attrRes] = await Promise.all([
        api.get("/attribute-options"),
        api.get("/attributes"),
      ]);

      if (optRes.data.success) {
        setOptions(optRes.data.options);
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

  const handleOpenModal = (option = null) => {
    if (option) {
      setEditingOption(option);
      setFormData({
        value: option.value,
        attribute: option.attribute?._id || option.attribute || "",
      });
    } else {
      setEditingOption(null);
      setFormData({ value: "", attribute: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOption(null);
    setFormData({ value: "", attribute: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.attribute) {
      return toast.error("Please select a parent attribute.");
    }
    if (!formData.value) {
      return toast.error("Value is required.");
    }
    try {
      if (editingOption) {
        const res = await api.put(`/admin/attribute-options/${editingOption._id}`, formData);
        if (res.data.success) {
          toast.success("Attribute option updated successfully");
          fetchData();
          handleCloseModal();
        }
      } else {
        const res = await api.post("/admin/attribute-options", formData);
        if (res.data.success) {
          toast.success("Attribute option created successfully");
          fetchData();
          handleCloseModal();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save attribute option");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this option?")) return;
    try {
      const res = await api.delete(`/admin/attribute-options/${id}`);
      if (res.data.success) {
        toast.success("Attribute option deleted successfully");
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete option");
    }
  };

  const filteredOptions = options.filter((opt) => {
    const matchesSearch = opt.value.toLowerCase().includes(search.toLowerCase());
    const matchesAttribute =
      attributeFilter === "all" ||
      (opt.attribute && opt.attribute._id === attributeFilter);
    return matchesSearch && matchesAttribute;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#1a1a2e] font-['Manrope']">
          Attribute Options
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#4648d4] text-white rounded-lg font-medium hover:bg-[#3b3db0] transition-colors"
        >
          <Plus size={18} />
          Add Option
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[250px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by value..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] transition-colors text-sm"
            />
          </div>
          
          <select
            value={attributeFilter}
            onChange={(e) => setAttributeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] text-sm text-gray-700 bg-white min-w-[200px]"
          >
            <option value="all">All Attributes</option>
            {attributes.map((attr) => (
              <option key={attr._id} value={attr._id}>
                {attr.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Parent Attribute
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
                  <td colSpan={4} className="text-center py-10">
                    <div className="w-8 h-8 border-4 border-[#4648d4] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredOptions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">
                    No options found
                  </td>
                </tr>
              ) : (
                filteredOptions.map((opt) => (
                  <tr
                    key={opt._id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      opt.status === "inactive" ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-[#1a1a2e]">
                        {opt.value}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {opt.attribute?.name || <span className="text-red-400">Orphaned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          opt.status === "active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {opt.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(opt)}
                          className="p-2 rounded-lg hover:bg-[#4648d4]/10 text-gray-400 hover:text-[#4648d4] transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(opt._id)}
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
                  {editingOption ? "Edit Option" : "Add Option"}
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
                    Value *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] transition-colors"
                    placeholder="e.g. Red, XL, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Attribute *
                  </label>
                  <select
                    required
                    value={formData.attribute}
                    onChange={(e) => setFormData({ ...formData, attribute: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] transition-colors"
                  >
                    <option value="" disabled>Select an attribute</option>
                    {attributes.map((attr) => (
                      <option key={attr._id} value={attr._id}>
                        {attr.name}
                      </option>
                    ))}
                  </select>
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
                    {editingOption ? "Update" : "Save"}
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

export default AttributeOptionsSection;
