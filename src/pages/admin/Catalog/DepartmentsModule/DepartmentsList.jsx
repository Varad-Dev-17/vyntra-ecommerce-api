import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../../../../components/admin/ui/DataTable';
import SearchToolbar from '../../../../components/admin/ui/SearchToolbar';
import StatusBadge from '../../../../components/admin/ui/StatusBadge';
import ConfirmDialog from '../../../../components/admin/ui/ConfirmDialog';
import Pagination from '../../../../components/admin/ui/Pagination';
import SearchableSelect from '../../../../components/admin/ui/SearchableSelect';

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
  const [statusFilter, setStatusFilter] = useState('');

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
      // We use the public endpoint which supports query params
      const response = await axios.get(`http://localhost:8000/departments`, {
        params: {
          page: currentPage,
          limit,
          search: debouncedSearch,
          status: statusFilter
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
  }, [currentPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  // Delete Handler
  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:8000/admin/departments/${departmentToDelete._id}`, {
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

  const handleToggleStatus = async (department) => {
    const newStatus = department.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const response = await axios.put(`http://localhost:8000/admin/departments/${department._id}`, {
        status: newStatus
      }, { withCredentials: true });
      
      if (response.data.success) {
        toast.success(`Department marked as ${newStatus}`);
        setDepartments(prev => 
          prev.map(d => d._id === department._id ? { ...d, status: newStatus } : d)
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
      header: 'Department',
      accessor: 'name',
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.name}
        </span>
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
            onClick={() => navigate(`/admin/catalog/departments/${row._id}/edit`)}
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
          leftSlot={<h2 className="text-lg font-semibold text-[#4648d4] px-2">Departments</h2>}
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search departments..."
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
              onClick={() => navigate('/admin/catalog/departments/add')}
              className="bg-[#4648d4] hover:bg-[#3b3db0] text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium text-sm whitespace-nowrap"
            >
              <Plus size={18} />
              Add Department
            </button>
          }
        />
        
        <div className="w-full flex-1 min-h-0">
          <DataTable 
            columns={columns}
            data={departments}
            isLoading={isLoading}
            emptyMessage={search ? "No departments found matching your search." : "No departments created yet."}
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
        title="Delete Department"
        message={`Are you sure you want to delete the department "${departmentToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />

    </div>
  );
};

export default DepartmentsList;
