import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const BrandForm = ({ initialData = null, isEdit = false }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    departmentIds: [],
    name: '',
    slug: '',
    status: 'Active'
  });
  
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [slugModified, setSlugModified] = useState(false);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/departments`, {
          params: { status: 'Active', limit: 1000 }
        });
        if (response.data.success) {
          setDepartments(response.data.departments);
        }
      } catch (error) {
        console.error('Failed to fetch departments', error);
        toast.error('Failed to load departments');
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        departmentIds: initialData.departmentIds?.map(d => d._id || d) || [],
        name: initialData.name || '',
        slug: initialData.slug || '',
        status: initialData.status || 'Active'
      });
      if (initialData.slug) {
        setSlugModified(true);
      }
    }
  }, [initialData]);

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

  const handleDepartmentChange = (departmentId) => {
    setFormData(prev => {
      const isSelected = prev.departmentIds.includes(departmentId);
      if (isSelected) {
        return { ...prev, departmentIds: prev.departmentIds.filter(id => id !== departmentId) };
      } else {
        return { ...prev, departmentIds: [...prev.departmentIds, departmentId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.departmentIds.length === 0) {
      toast.error('Please select at least one Department.');
      return;
    }
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error('Brand Name and Slug are required.');
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit) {
        await axios.put(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/admin/brands/${initialData._id}`, formData, {
          withCredentials: true
        });
        toast.success('Brand updated successfully!');
      } else {
        await axios.post(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/admin/brands`, formData, {
          withCredentials: true
        });
        toast.success('Brand created successfully!');
      }
      navigate('/admin/catalog/brands');
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Failed to save brand';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-8 w-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#4648d4]">{isEdit ? 'Edit Brand' : 'Add Brand'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-[#4648d4] mb-2">Departments *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {departments.map(dept => (
              <label 
                key={dept._id} 
                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                  formData.departmentIds.includes(dept._id) 
                    ? 'border-[#4648d4] bg-[#4648d4]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#4648d4] rounded focus:ring-[#4648d4]"
                  checked={formData.departmentIds.includes(dept._id)}
                  onChange={() => handleDepartmentChange(dept._id)}
                />
                <span className="text-sm font-medium text-gray-700">{dept.name}</span>
              </label>
            ))}
          </div>
          {departments.length === 0 && (
            <p className="text-sm text-gray-500">No active departments found. Please create one first.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-[#4648d4] mb-2">Brand Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g. Nike"
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
            onClick={() => navigate('/admin/catalog/brands')}
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
              'Create Brand'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BrandForm;
