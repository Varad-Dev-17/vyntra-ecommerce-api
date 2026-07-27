import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, PackageSearch } from 'lucide-react';
import DataTable from '../../../../components/admin/ui/DataTable';
import SearchToolbar from '../../../../components/admin/ui/SearchToolbar';
import StatusBadge from '../../../../components/admin/ui/StatusBadge';
import ConfirmDialog from '../../../../components/admin/ui/ConfirmDialog';
import Pagination from '../../../../components/admin/ui/Pagination';
import SearchableSelect from '../../../../components/admin/ui/SearchableSelect';
import ProductDetailsDrawer from '../../../../components/admin/ui/ProductDetailsDrawer';

const ProductsList = () => {
  const navigate = useNavigate();
  
  // Data State
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter Options State
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;
  
  // Filter/Search State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Variant Modal State
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Filter Options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [deptsRes, catsRes, brandsRes] = await Promise.all([
          axios.get('http://localhost:8000/departments', { params: { limit: 1000 } }),
          axios.get('http://localhost:8000/categories', { params: { limit: 1000 } }),
          axios.get('http://localhost:8000/brands', { params: { limit: 1000 } })
        ]);
        
        if (deptsRes.data.success) setDepartments(deptsRes.data.departments || deptsRes.data.data);
        if (catsRes.data.success) setCategories(catsRes.data.categories || catsRes.data.data);
        if (brandsRes.data.success) setBrands(brandsRes.data.brands || brandsRes.data.data);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/admin/products`, {
        params: {
          page: currentPage,
          limit,
          search: debouncedSearch,
          status: statusFilter,
          department: departmentFilter,
          category: categoryFilter,
          brand: brandFilter
        },
        withCredentials: true
      });
      
      if (response.data.success) {
        setProducts(response.data.data.products);
        setTotalPages(response.data.data.pagination.pages);
        setTotalItems(response.data.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, departmentFilter, categoryFilter, brandFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, departmentFilter, categoryFilter, brandFilter]);

  // Delete Handler
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:8000/admin/products/${productToDelete._id}`, {
        withCredentials: true
      });
      toast.success('Product deleted successfully');
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Failed to delete product';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Product Name',
      accessor: 'title',
      render: (row) => (
        <span 
          onClick={() => { setSelectedProduct(row); setIsVariantModalOpen(true); }}
          className="font-medium text-[#4648d4] hover:underline cursor-pointer line-clamp-1"
        >
          {row.title}
        </span>
      )
    },
    {
      header: 'Brand',
      accessor: 'brand',
      render: (row) => <span className="text-sm text-gray-600">{row.brand?.name || 'N/A'}</span>
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (row) => <span className="text-sm text-gray-600">{row.department?.name || 'N/A'}</span>
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="text-sm text-gray-600">{row.category?.name || 'N/A'}</span>
    },
    {
      header: 'Variants',
      accessor: 'variants',
      render: (row) => {
        const count = row.variants?.length || 0;
        let groupCount = 0;
        if (count > 0) {
           // Find the 'Color' attribute to group by, fallback to first attribute
           const firstVariantAttrs = row.variants[0].attributes || [];
           const colorAttr = firstVariantAttrs.find(a => a.attribute?.name?.toLowerCase() === 'color');
           
           const pAttrId = colorAttr 
             ? (colorAttr.attribute?._id || colorAttr.attribute)
             : (firstVariantAttrs[0]?.attribute?._id || firstVariantAttrs[0]?.attribute);
             
           const uniqueGroups = new Set();
           row.variants.forEach(v => {
             const pAttr = v.attributes.find(a => (a.attribute?._id || a.attribute) === pAttrId);
             if (pAttr) uniqueGroups.add(pAttr.option?._id || pAttr.option);
           });
           groupCount = uniqueGroups.size;
        }

        return (
          <span className="text-sm text-gray-600">
            {groupCount} Option{groupCount !== 1 ? 's' : ''}
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status.toLowerCase()} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/admin/products/${row._id}/edit`)}
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
    <div className="flex flex-col flex-1 overflow-hidden">
        <SearchToolbar 
          leftSlot={<h2 className="text-xl font-bold text-[#4648d4] pr-4 border-r border-gray-200 mr-2">Products</h2>}
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search products by name, SKU..."
          extraFilters={
            <div className="flex items-center gap-2">
              <SearchableSelect
                className="w-[180px]"
                size="sm"
                value={departmentFilter}
                onChange={setDepartmentFilter}
                options={[{ value: '', label: 'All Departments' }, ...departments.map(d => ({ value: d._id, label: d.name }))]}
              />
              
              <SearchableSelect
                className="w-[180px]"
                size="sm"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c._id, label: c.name }))]}
              />

              <SearchableSelect
                className="w-[160px]"
                size="sm"
                value={brandFilter}
                onChange={setBrandFilter}
                options={[{ value: '', label: 'All Brands' }, ...brands.map(b => ({ value: b._id, label: b.name }))]}
              />

              <SearchableSelect
                className="w-[140px]"
                size="sm"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'Inactive', label: 'Inactive' },
                  { value: 'Active', label: 'Active' }
                ]}
              />
            </div>
          }
          actionButton={
            <button 
              onClick={() => navigate('/admin/products/add')}
              className="bg-[#4648d4] hover:bg-[#3b3db0] text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium text-sm whitespace-nowrap"
            >
              <Plus size={18} />
              Add Product
            </button>
          }
        />
        
        <div className="flex-1 overflow-y-auto">
          <DataTable 
            columns={columns}
            data={products}
            isLoading={isLoading}
            emptyMessage={
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <PackageSearch className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-[#4648d4] mb-1">No products found</h3>
                <p className="text-xs text-gray-500 text-center max-w-sm mb-6">
                  {search || departmentFilter || categoryFilter || brandFilter || statusFilter 
                    ? "We couldn't find any products matching your current filters. Try adjusting them."
                    : "Get started by adding your first product to the catalog."}
                </p>
                {!(search || departmentFilter || categoryFilter || brandFilter || statusFilter) && (
                  <button
                    onClick={() => navigate('/admin/products/add')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#4648d4] hover:bg-[#3b3db0] rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                    Add Product
                  </button>
                )}
              </div>
            }
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
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.title}"? This action cannot be undone and will remove all associated images.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />

      <ProductDetailsDrawer
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductsList;
