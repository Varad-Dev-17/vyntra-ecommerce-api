import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Check } from 'lucide-react';
import DataTable from '../../../../components/admin/ui/DataTable';
import CatalogDetailsModal from '../../../../components/admin/ui/CatalogDetailsModal';

import SearchToolbar from '../../../../components/admin/ui/SearchToolbar';
import StatusBadge from '../../../../components/admin/ui/StatusBadge';
import ConfirmDialog from '../../../../components/admin/ui/ConfirmDialog';
import Pagination from '../../../../components/admin/ui/Pagination';
import SearchableSelect from '../../../../components/admin/ui/SearchableSelect';

const BrandsList = () => {
  const navigate = useNavigate();
  
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/brands`, {
        params: {
          page: currentPage,
          limit,
          search: debouncedSearch,
          status: statusFilter
        }
      });
      
      if (response.data.success) {
        setBrands(response.data.brands || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || response.data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const handleDeleteClick = (brand) => {
    setBrandToDelete(brand);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!brandToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/admin/brands/${brandToDelete._id}`, {
        withCredentials: true
      });
      toast.success('Brand deleted successfully');
      setIsDeleteDialogOpen(false);
      setBrandToDelete(null);
      fetchBrands();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Failed to delete brand';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (brand) => {
    const newStatus = brand.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/admin/brands/${brand._id}`, {
        status: newStatus
      }, { withCredentials: true });
      
      if (response.data.success) {
        toast.success(`Brand marked as ${newStatus}`);
        setBrands(prev => 
          prev.map(b => b._id === brand._id ? { ...b, status: newStatus } : b)
        );
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const columns = [
    {
      header: 'Sr. No.',
      accessor: 'srNo',
      align: 'center',
      render: (_, rowIndex) => (
        <span className="text-gray-500 font-medium">
          {(currentPage - 1) * limit + rowIndex + 1}
        </span>
      )
    },
    {
      header: 'Brand',
      accessor: 'name',
      render: (row) => (
        <button 
          onClick={() => { setSelectedItem(row); setIsModalOpen(true); }}
          className="font-medium text-[#4648d4] hover:underline text-left focus:outline-none"
        >
          {row.name}
        </button>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleToggleStatus(row)}
            className="text-xs font-medium text-gray-500 hover:text-[#4648d4] bg-gray-50 hover:bg-[#4648d4]/10 px-2 py-1 rounded transition-colors"
          >
            {row.status === 'Active' ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={() => navigate(`/admin/catalog/brands/${row._id}/edit`)}
            className="p-1.5 text-gray-400 hover:text-[#4648d4] hover:bg-[#4648d4]/10 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 flex flex-col w-full h-full">
        <SearchToolbar 
          leftSlot={<h2 className="text-lg font-semibold text-[#4648d4] px-2">Brands</h2>}
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search brands by name or slug..."
          extraFilters={
            <SearchableSelect
              className="w-[140px]"
              size="sm"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: '', label: 'All Status' },
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' }
              ]}
            />
          }
          actionButton={
            <button 
              onClick={() => navigate('/admin/catalog/brands/add')}
              className="bg-[#4648d4] hover:bg-[#3b3db0] text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium text-sm whitespace-nowrap"
            >
              <Plus size={18} />
              Add Brand
            </button>
          }
        />
        
        <div className="w-full flex-1 min-h-0">
          <DataTable 
            columns={columns}
            data={brands}
            isLoading={isLoading}
            emptyMessage={search || statusFilter ? "No brands found matching your filters." : "No brands created yet."}
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
        title="Delete Brand"
        message={`Are you sure you want to delete the brand "${brandToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />

      <CatalogDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Brand Details"
        entityType="Brand"
        entityName={selectedItem?.name}
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#4648d4] mb-3 pb-2 border-b border-gray-100">
              Mapped Departments
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
        </div>
      </CatalogDetailsModal>
    </div>
  );
};

export default BrandsList;
