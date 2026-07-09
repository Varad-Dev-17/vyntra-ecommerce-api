import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";

const AttributesSection = () => {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    fieldType: "text",
  });

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/attributes");
      if (res.data.success) {
        setAttributes(res.data.attributes);
      }
    } catch (err) {
      console.error("Error fetching attributes:", err);
      toast.error("Failed to load attributes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleOpenModal = (attribute = null) => {
    if (attribute) {
      setEditingAttribute(attribute);
      setFormData({
        name: attribute.name,
        fieldType: attribute.fieldType || "text",
      });
    } else {
      setEditingAttribute(null);
      setFormData({ name: "", fieldType: "text" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAttribute(null);
    setFormData({ name: "", fieldType: "text" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      return toast.error("Attribute name is required.");
    }
    if (!formData.fieldType) {
      return toast.error("Field type is required.");
    }
    try {
      if (editingAttribute) {
        const res = await api.put(`/admin/attributes/${editingAttribute._id}`, formData);
        if (res.data.success) {
          toast.success("Attribute updated successfully");
          fetchAttributes();
          handleCloseModal();
        }
      } else {
        const res = await api.post("/admin/attributes", formData);
        if (res.data.success) {
          toast.success("Attribute created successfully");
          fetchAttributes();
          handleCloseModal();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save attribute");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attribute?")) return;
    try {
      const res = await api.delete(`/admin/attributes/${id}`);
      if (res.data.success) {
        toast.success("Attribute deleted successfully");
        fetchAttributes();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete attribute");
    }
  };

  const filteredAttributes = attributes.filter((attr) =>
    attr.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#1a1a2e] font-['Manrope']">
          Attributes
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#4648d4] text-white rounded-lg font-medium hover:bg-[#3b3db0] transition-colors"
        >
          <Plus size={18} />
          Add Attribute
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search attributes..."
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
                  Field Type
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
              ) : filteredAttributes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">
                    No attributes found
                  </td>
                </tr>
              ) : (
                filteredAttributes.map((attr) => (
                  <tr
                    key={attr._id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      attr.status === "inactive" ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-[#1a1a2e]">
                        {attr.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="inline-flex px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold uppercase">
                        {attr.fieldType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          attr.status === "active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {attr.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(attr)}
                          className="p-2 rounded-lg hover:bg-[#4648d4]/10 text-gray-400 hover:text-[#4648d4] transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(attr._id)}
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
                  {editingAttribute ? "Edit Attribute" : "Add Attribute"}
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
                    placeholder="e.g. Color"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Type *
                  </label>
                  <select
                    required
                    value={formData.fieldType}
                    onChange={(e) => setFormData({ ...formData, fieldType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] transition-colors bg-white"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="select">Select</option>
                    <option value="multiselect">Multi-Select</option>
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
                    {editingAttribute ? "Update" : "Save"}
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

export default AttributesSection;
