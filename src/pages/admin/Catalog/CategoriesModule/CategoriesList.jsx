import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Check, Image as ImageIcon, Folder } from 'lucide-react';
import DataTable from '../../../../components/admin/ui/DataTable';
import CatalogDetailsModal from '../../../../components/admin/ui/CatalogDetailsModal';

import SearchToolbar from '../../../../components/admin/ui/SearchToolbar';
import StatusBadge from '../../../../components/admin/ui/StatusBadge';
import ConfirmDialog from '../../../../components/admin/ui/ConfirmDialog';
import Pagination from '../../../../components/admin/ui/Pagination';
const CategoriesList = () => {
  const navigate = useNavigate();

  // Data State
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Filter/Search State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mappedAttributes, setMappedAttributes] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);



  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/categories`, {
        params: {
          page: currentPage,
          limit,
          search: debouncedSearch,
          status: statusFilter,
        }
      });

      if (response.data.success) {
        setCategories(response.data.categories || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || response.data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  // Delete Handler
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/admin/categories/${categoryToDelete._id}`, {
        withCredentials: true
      });
      toast.success('Category deleted successfully');
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Failed to delete category';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (category) => {
    const newStatus = category.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const response = await axios.put(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/admin/categories/${category._id}`, {
        status: newStatus
      }, { withCredentials: true });

      if (response.data.success) {
        toast.success(`Category marked as ${newStatus}`);
        setCategories(prev =>
          prev.map(c => c._id === category._id ? { ...c, status: newStatus } : c)
        );
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const handleNameClick = async (category) => {
    setSelectedItem(category);
    setMappedAttributes([]);
    setIsModalOpen(true);
    setIsModalLoading(true);

    try {
      const response = await axios.get(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/admin/attribute-mapping/${category._id}/attributes`, {
        withCredentials: true
      });
      if (response.data.success) {
        setMappedAttributes(response.data.attributes || []);
      }
    } catch (error) {
      console.error('Failed to fetch mapped attributes:', error);
      toast.error('Failed to load attributes');
    } finally {
      setIsModalLoading(false);
    }
  };

  const columns = [
    {
      header: 'Sr. No.',
      accessor: 'srNo',
      align: 'center',
      width: '10%',
      render: (_, rowIndex) => (
        <span className="text-gray-500 font-medium">
          {(currentPage - 1) * limit + rowIndex + 1}
        </span>
      )
    },
    {
      header: 'Image',
      accessor: 'image',
      align: 'center',
      width: '10%',
      render: (row) => (
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 shadow-sm mx-auto p-1">
          {row.image?.url ? (
            <img src={row.image.url} alt={row.name} className="w-full h-full object-contain" />
          ) : (
            <ImageIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'name',
      width: '30%',
      render: (row) => (
        <button
          onClick={() => handleNameClick(row)}
          className="font-bold text-[#1a1a2e] hover:text-[#4648d4] transition-colors text-left focus:outline-none"
        >
          {row.name}
        </button>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      width: '15%',
      render: (row) => <div className="flex justify-center"><StatusBadge status={row.status} /></div>
    },
    {
      header: 'Created At',
      accessor: 'createdAt',
      align: 'center',
      width: '20%',
      render: (row) => {
        const date = new Date(row.createdAt);
        return (
          <span className="text-gray-500 font-medium text-xs">
            {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      align: 'center',
      width: '15%',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-2 mr-1">
            <button 
              onClick={() => handleToggleStatus(row)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${row.status === 'Active' ? 'bg-[#4648d4]' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${row.status === 'Active' ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </div>

          <button
            onClick={() => navigate(`/admin/catalog/categories/${row._id}/edit`)}
            className="w-8 h-8 flex items-center justify-center text-[#4648d4] border border-gray-200 hover:border-[#4648d4] hover:bg-[#4648d4]/5 rounded-xl transition-colors shadow-sm"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="w-8 h-8 flex items-center justify-center text-red-500 border border-gray-200 hover:border-red-500 hover:bg-red-50 rounded-xl transition-colors shadow-sm"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 flex flex-col w-full h-full">
      <SearchToolbar
        leftSlot={
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-xl bg-[#4648d4]/10 flex items-center justify-center text-[#4648d4]">
              <Folder size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Categories</h2>
              <p className="text-xs text-gray-500">Manage your product categories</p>
            </div>
          </div>
        }
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search categories..."
        extraFilters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[130px] px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] focus:ring-1 focus:ring-[#4648d4] transition-colors text-sm bg-white cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        }
        actionButton={
          <button
            onClick={() => navigate('/admin/catalog/categories/add')}
            className="bg-[#4648d4] hover:bg-[#3b3db0] text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium text-sm whitespace-nowrap"
          >
            <Plus size={18} />
            Add Category
          </button>
        }
      />

      <div className="w-full flex-1 min-h-0">
        <DataTable
          columns={columns}
          data={categories}
          isLoading={isLoading}
          emptyMessage={search || statusFilter ? "No categories found matching your filters." : "No categories created yet."}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={limit}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />

      <CatalogDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Category Details"
        entityType="Category"
        entityName={selectedItem?.name}
      >
        <div className="space-y-6">
          {/* Departments Section */}
          <div>
            <h3 className="text-sm font-semibold text-[#4648d4] mb-3 pb-2 border-b border-gray-100">
              Departments
            </h3>
            {selectedItem?.departmentIds && selectedItem.departmentIds.length > 0 ? (
              <div className="space-y-2">
                {selectedItem.departmentIds.map(dep => (
                  <div key={dep._id} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-500 shrink-0" />
                    {dep.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No departments mapped.</p>
            )}
          </div>

          {/* Attributes Section */}
          <div>
            <h3 className="text-sm font-semibold text-[#4648d4] mb-3 pb-2 border-b border-gray-100 flex items-center justify-between">
              <span>Mapped Attributes</span>
              {isModalLoading && (
                <div className="w-4 h-4 border-2 border-[#4648d4] border-t-transparent rounded-full animate-spin" />
              )}
            </h3>

            {!isModalLoading && (
              mappedAttributes.length > 0 ? (
                <div className="space-y-2">
                  {mappedAttributes.map(attr => (
                    <div key={attr._id} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-500 shrink-0" />
                      {attr.name} <span className="text-xs text-gray-400">({attr.fieldType})</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No attributes mapped.</p>
              )
            )}
          </div>
        </div>
      </CatalogDetailsModal>
    </div>
  );
};

export default CategoriesList;
