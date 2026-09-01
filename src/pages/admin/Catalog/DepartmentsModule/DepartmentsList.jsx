import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as LucideIcons from 'lucide-react';
import ConfirmDialog from '../../../../components/admin/ui/ConfirmDialog';

const getIcon = (name) => {
  return LucideIcons[name] || LucideIcons.Box || LucideIcons.Layers;
};

const getColors = (index) => {
  const colors = [
    { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    { bg: 'bg-pink-100', text: 'text-pink-600' },
    { bg: 'bg-blue-100', text: 'text-[#4648d4]' },
    { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    { bg: 'bg-amber-100', text: 'text-amber-600' },
    { bg: 'bg-cyan-100', text: 'text-cyan-600' },
    { bg: 'bg-purple-100', text: 'text-purple-600' },
  ];
  return colors[index % colors.length];
};

const DepartmentsList = () => {
  const navigate = useNavigate();

  // Data State
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Filter/Search State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Departments
  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/departments`, {
        params: {
          page: currentPage,
          limit,
          search: debouncedSearch
        }
      });

      if (response.data.success) {
        setDepartments(response.data.departments);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Delete Handler
  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/admin/departments/${departmentToDelete._id}`, {
        withCredentials: true
      });
      toast.success('Department deleted successfully');
      setIsDeleteDialogOpen(false);
      setDepartmentToDelete(null);
      fetchDepartments();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Failed to delete department';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewClick = (department) => {
    navigate(`/admin/catalog/departments/${department._id}/tree`);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 w-full max-w-6xl">
      <div className="bg-white rounded-2xl p-4 px-6 shadow-sm border border-slate-100 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4648d4]/10 flex items-center justify-center shrink-0">
            <LucideIcons.Box className="text-[#4648d4]" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Departments</h2>
            <p className="text-[13px] text-slate-500">Manage your store departments and their availability.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search departments..."
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-[13px] w-64 focus:outline-none focus:ring-2 focus:ring-[#4648d4]/20 focus:border-[#4648d4] transition-all font-medium text-slate-900 placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => navigate('/admin/catalog/departments/add')}
            className="bg-[#4648d4] hover:bg-[#3b3db0] text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors font-semibold text-[13px] whitespace-nowrap shadow-sm shadow-[#4648d4]/20"
          >
            <LucideIcons.Plus size={16} strokeWidth={2.5} />
            Add Department
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-24">Sr. No.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-2/4">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium">Loading departments...</td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium">
                    {search ? "No departments found matching your search." : "No departments created yet."}
                  </td>
                </tr>
              ) : (
                departments.map((row, index) => {
                  const IconComponent = getIcon(row.iconName);
                  const colors = getColors(index);
                  return (
                    <tr key={row._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-3 text-center">
                        <span className="text-sm font-bold text-[#4648d4]">
                          {String((currentPage - 1) * limit + index + 1).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text} shrink-0`}>
                            <IconComponent size={18} />
                          </div>
                          <span className="font-bold text-slate-900 text-[14px]">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-slate-500 text-[14px] font-medium">
                          {row.description || 'No description provided'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewClick(row)}
                            className="p-1.5 text-slate-400 hover:text-[#4648d4] border border-slate-200 hover:border-[#4648d4]/30 hover:bg-[#4648d4]/10 rounded-lg transition-all"
                            title="View Details"
                          >
                            <LucideIcons.Eye size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/catalog/departments/${row._id}/edit`)}
                            className="p-1.5 text-slate-400 hover:text-[#4648d4] border border-slate-200 hover:border-[#4648d4]/30 hover:bg-[#4648d4]/10 rounded-lg transition-all"
                            title="Edit"
                          >
                            <LucideIcons.Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(row)}
                            className="p-1.5 text-red-400 hover:text-red-600 border border-red-100 hover:border-red-200 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <LucideIcons.Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {!isLoading && departments.length > 0 && (
          <div className="border-t border-slate-100 p-4 px-6 flex items-center justify-between bg-white mt-auto rounded-b-2xl">
            <span className="text-sm text-slate-500 font-medium">
              Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalItems)} of {totalItems} results
            </span>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-slate-200 transition-all"
              >
                <LucideIcons.ArrowLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${
                    currentPage === page 
                      ? 'bg-[#4648d4] text-white shadow-sm shadow-[#4648d4]/20' 
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-slate-200 transition-all"
              >
                <LucideIcons.ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Department"
        message={`Are you sure you want to delete the department "${departmentToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DepartmentsList;
