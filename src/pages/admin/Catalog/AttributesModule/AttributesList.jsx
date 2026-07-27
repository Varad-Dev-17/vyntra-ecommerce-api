import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import DataTable from '../../../../components/admin/ui/DataTable';
import CatalogDetailsModal from '../../../../components/admin/ui/CatalogDetailsModal';

import SearchToolbar from '../../../../components/admin/ui/SearchToolbar';
import StatusBadge from '../../../../components/admin/ui/StatusBadge';
import ConfirmDialog from '../../../../components/admin/ui/ConfirmDialog';
import Pagination from '../../../../components/admin/ui/Pagination';

const AttributesList = () => {
  const navigate = useNavigate();

  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [selectedAttributeForOptions, setSelectedAttributeForOptions] = useState(null);
  const [attributeOptions, setAttributeOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAttributeForDetails, setSelectedAttributeForDetails] = useState(null);



  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAttributes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/attributes`, {
        params: {
          page: currentPage,
          limit,
          search: debouncedSearch,
          status: statusFilter
        }
      });

      if (response.data.success) {
        setAttributes(response.data.attributes || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || response.data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch attributes:', error);
      toast.error('Failed to load attributes');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const handleDeleteClick = (attribute) => {
    setAttributeToDelete(attribute);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!attributeToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/admin/attributes/${attributeToDelete._id}`, {
        withCredentials: true
      });
      toast.success('Attribute deleted successfully');
      setIsDeleteDialogOpen(false);
      setAttributeToDelete(null);
      fetchAttributes();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Failed to delete attribute';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOptionsClick = async (attribute) => {
    if (!['select', 'color'].includes(attribute.fieldType) || attribute.optionsCount === 0) return;

    setSelectedAttributeForOptions(attribute);
    setIsOptionsModalOpen(true);
    setIsLoadingOptions(true);

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/attribute-options/attribute/${attribute._id}`);
      if (response.data.success) {
        setAttributeOptions(response.data.options || []);
      }
    } catch (error) {
      console.error('Failed to fetch options:', error);
      toast.error('Failed to load options');
    } finally {
      setIsLoadingOptions(false);
    }
  };



  const handleToggleStatus = async (attribute) => {
    const newStatus = attribute.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/admin/attributes/${attribute._id}`, {
        status: newStatus
      }, { withCredentials: true });

      if (response.data.success) {
        toast.success(`Attribute marked as ${newStatus}`);
        setAttributes(prev =>
          prev.map(a => a._id === attribute._id ? { ...a, status: newStatus } : a)
        );
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const getFieldTypeBadge = (type) => {
    const colors = {
      select: 'bg-blue-100 text-blue-700',
      color: 'bg-purple-100 text-purple-700',
      text: 'bg-gray-100 text-gray-700',
      number: 'bg-orange-100 text-orange-700'
    };
    const labels = {
      select: 'Select',
      color: 'Color Swatch',
      text: 'Text',
      number: 'Number'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[type] || colors.text}`}>
        {labels[type] || type}
      </span>
    );
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
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <button
          onClick={() => { setSelectedAttributeForDetails(row); setIsDetailsModalOpen(true); }}
          className="font-medium text-[#4648d4] hover:underline text-left focus:outline-none"
        >
          {row.name}
        </button>
      )
    },
    {
      header: 'Field Type',
      accessor: 'fieldType',
      render: (row) => getFieldTypeBadge(row.fieldType)
    },
    {
      header: 'Used In',
      accessor: 'usage',
      align: 'center',
      render: (row) => (
        <span className="font-medium text-gray-700">
          {row.usage || 'Product'}
        </span>
      )
    },
    {
      header: 'Options Count',
      accessor: 'optionsCount',
      render: (row) => {
        const isClickable = ['select', 'color'].includes(row.fieldType) && row.optionsCount > 0;
        return (
          <span
            onClick={() => isClickable && handleOptionsClick(row)}
            className={`${isClickable ? 'text-[#4648d4] hover:underline cursor-pointer font-medium' : 'text-gray-500'}`}
          >
            {['select', 'color'].includes(row.fieldType)
              ? `${row.optionsCount || 0} Options`
              : '-'}
          </span>
        );
      }
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
            onClick={() => navigate(`/admin/catalog/attributes/${row._id}/edit`)}
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
        leftSlot={<h2 className="text-lg font-semibold text-[#4648d4] px-2">Attributes</h2>}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search attributes..."
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
            onClick={() => navigate('/admin/catalog/attributes/add')}
            className="bg-[#4648d4] hover:bg-[#3b3db0] text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium text-sm whitespace-nowrap"
          >
            <Plus size={18} />
            Add Attribute
          </button>
        }
      />

      <div className="w-full flex-1 min-h-0">
        <DataTable
          columns={columns}
          data={attributes}
          isLoading={isLoading}
          emptyMessage={search || statusFilter ? "No attributes found matching your filters." : "No attributes created yet."}
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
        title="Delete Attribute"
        message={`Are you sure you want to delete "${attributeToDelete?.name}"? This action will also delete all of its options and cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />

      {/* Attribute Options Modal */}
      {isOptionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-xl font-semibold text-[#4648d4]">Attribute Options</h2>
                <p className="text-sm text-gray-500 mt-1">Attribute: <span className="font-medium text-gray-900">{selectedAttributeForOptions?.name}</span></p>
              </div>
              <button
                onClick={() => setIsOptionsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
              {isLoadingOptions ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 border-4 border-[#4648d4] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : attributeOptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                  No options found for this attribute.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-lg">
                    <div className="col-span-6">Display Name</div>
                    <div className="col-span-6">{selectedAttributeForOptions?.fieldType === 'color' ? 'Color' : 'Stored Value'}</div>
                  </div>
                  {attributeOptions.map((opt) => (
                    <div key={opt._id} className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                      <div className="col-span-6 font-medium text-gray-900 text-sm">
                        {opt.displayName}
                      </div>
                      <div className="col-span-6 flex items-center gap-3">
                        {selectedAttributeForOptions?.fieldType === 'color' ? (
                          <>
                            <div
                              className="w-6 h-6 rounded border border-gray-200 shadow-sm shrink-0"
                              style={{ backgroundColor: opt.hex || '#000000' }}
                            />
                            <span className="text-sm text-gray-500 font-mono">
                              {opt.hex || '#000000'}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-900 uppercase">
                            {opt.storedValue}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsOptionsModalOpen(false)}
                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <CatalogDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Attribute Details"
        entityType="Attribute"
        entityName={selectedAttributeForDetails?.name}
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#4648d4] mb-3 pb-2 border-b border-gray-100">
              Mapped Categories
            </h3>
            {selectedAttributeForDetails?.categoryIds && selectedAttributeForDetails.categoryIds.length > 0 ? (
              <div className="space-y-2">
                {selectedAttributeForDetails.categoryIds.map(cat => (
                  <div key={cat._id} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-500 shrink-0" />
                    {cat.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No categories mapped.</p>
            )}
          </div>
        </div>
      </CatalogDetailsModal>


    </div>
  );
};

export default AttributesList;
