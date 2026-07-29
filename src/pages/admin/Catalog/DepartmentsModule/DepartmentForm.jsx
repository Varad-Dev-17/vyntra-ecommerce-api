import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const DepartmentForm = ({ initialData = null, isEdit = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'Active'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [slugModified, setSlugModified] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        status: initialData.status || 'Active'
      });
      if (initialData.slug) {
        setSlugModified(true);
      }
    }
  }, [initialData]);

  // Auto-generate slug from name if user hasn't manually edited it
  const handleNameChange = (e) => {
    const newName = e.target.value;
    if (!slugModified) {
      const generatedSlug = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData({ ...formData, name: newName, slug: generatedSlug });
    } else {
      setFormData({ ...formData, name: newName });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error('Name and Slug are required.');
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit) {
        await axios.put(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/admin/departments/${initialData._id}`, formData, {
          withCredentials: true
        });
        toast.success('Department updated successfully!');
      } else {
        await axios.post(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/admin/departments`, formData, {
          withCredentials: true
        });
        toast.success('Department created successfully!');
      }
      navigate('/admin/catalog/departments');
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Failed to save department';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-8 w-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#4648d4]">{isEdit ? 'Edit Department' : 'Add Department'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-[#4648d4] mb-2">Department Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g. Men's Clothing"
              className="w-full px-4 h-12 border border-gray-200 rounded-xl outline-none focus:border-[#4648d4] focus:ring-1 focus:ring-[#4648d4] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4648d4] mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 h-12 border border-gray-200 rounded-xl outline-none focus:border-[#4648d4] focus:ring-1 focus:ring-[#4648d4] transition-colors bg-white cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 mt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/admin/catalog/departments')}
            disabled={isLoading}
            className="h-12 px-6 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="h-12 px-6 bg-[#4648d4] hover:bg-[#3b3db0] text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Create Department'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentForm;
