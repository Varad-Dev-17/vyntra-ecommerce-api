import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

import { useState, useEffect, useRef, useCallback } from 'react';
import SearchableSelect from '../../../../components/admin/ui/SearchableSelect';

const ProductForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    longDescription: '',
    status: 'Inactive',
    department: '',
    category: '',
    brand: '',
    returnable: true,
    exchangeable: true,
    returnDays: 7
  });

  const [slugModified, setSlugModified] = useState(false);

  // Dropdown Options State
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Loading States
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isBrandsLoading, setIsBrandsLoading] = useState(false);
  const [isDynamicAttributesLoading, setIsDynamicAttributesLoading] = useState(false);

  // Dynamic Attributes State
  const [dynamicAttributesConfig, setDynamicAttributesConfig] = useState([]);
  const [dynamicAttributes, setDynamicAttributes] = useState([]);

  // Submit & Edit State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(isEdit);
  const fetchedAttributesRef = useRef([]);

  // Validation State & Refs
  const [errors, setErrors] = useState({});
  const fieldRefs = useRef({});
  const setRef = useCallback((key) => (el) => {
    if (el) {
      fieldRefs.current[key] = el;
    }
  }, []);

  // For Edit Mode: Fetch Product Data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!isEdit || !id) return;
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/admin/products/${id}`, {
          withCredentials: true
        });
        if (response.data.success) {
          const prod = response.data.data.product || response.data.data;
          setFormData({
            title: prod.title || '',
            slug: prod.slug || '',
            shortDescription: prod.shortDescription || '',
            longDescription: prod.longDescription || '',
            status: prod.status || 'Inactive',
            department: prod.department?._id || '',
            category: prod.category?._id || '',
            brand: prod.brand?._id || '',
            returnable: prod.returnPolicy?.returnable ?? true,
            exchangeable: prod.returnPolicy?.exchangeable ?? true,
            returnDays: prod.returnPolicy?.returnDays ?? 7
          });
          setSlugModified(true);
          fetchedAttributesRef.current = prod.attributes || [];
        }
      } catch (error) {
        console.error('Failed to load product', error);
        toast.error('Failed to load product data');
      }
    };
    fetchProduct();
  }, [isEdit, id]);

  // Fetch initial data (Departments)
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsDepartmentsLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/departments`, { params: { limit: 1000, status: 'Active' } });
        if (res.data.success) {
          setDepartments(res.data.departments || res.data.data);
        }
      } catch (error) {
        console.error('Failed to load departments:', error);
        toast.error('Failed to load departments.');
      } finally {
        setIsDepartmentsLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch Categories and Brands when Department changes
  useEffect(() => {
    const fetchCascadingOptions = async () => {
      if (!formData.department) {
        setCategories([]);
        setBrands([]);
        return;
      }

      try {
        setIsCategoriesLoading(true);
        setIsBrandsLoading(true);

        // We will fetch all and filter client side since backend doesn't have by-department route explicitly yet
        // OR we can pass departmentId as query param if backend supports it. Assuming query param `departmentId`.
        const [catsRes, brandsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/categories`, { params: { limit: 1000, status: 'Active', departmentId: formData.department } }),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/brands`, { params: { limit: 1000, status: 'Active', departmentId: formData.department } })
        ]);

        if (catsRes.data.success) {
          // If backend doesn't filter, we filter client-side:
          let cats = catsRes.data.categories || catsRes.data.data;
          // client side fallback
          cats = cats.filter(c => c.departmentIds && c.departmentIds.some(d => (d._id || d) === formData.department));
          setCategories(cats);
        }

        if (brandsRes.data.success) {
          let bs = brandsRes.data.brands || brandsRes.data.data;
          // client side fallback
          bs = bs.filter(b => b.departmentIds && b.departmentIds.some(d => (d._id || d) === formData.department));
          setBrands(bs);
        }
      } catch (error) {
        console.error('Failed to fetch cascading options:', error);
        toast.error('Failed to load categories/brands.');
        setCategories([]);
        setBrands([]);
      } finally {
        setIsCategoriesLoading(false);
        setIsBrandsLoading(false);
      }
    };

    fetchCascadingOptions();
  }, [formData.department]);

  // Fetch Dynamic Attributes when Category changes
  useEffect(() => {
    const fetchDynamicAttributes = async () => {
      if (!isInitialLoad) {
        setDynamicAttributesConfig([]);
        setDynamicAttributes([]);
      }

      if (!formData.category) {
        return;
      }

      try {
        setIsDynamicAttributesLoading(true);
        // Use the attribute mapping API to get exact mapped attributes for this category
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/admin/attribute-mapping/${formData.category}/attributes?usage=Product`, {
          withCredentials: true
        });

        if (data.success && data.attributes) {
          let attrs = data.attributes;

          const configList = [];
          const initialData = [];

          for (const attr of attrs) {
            // Include all attributes (do not skip Color/Size)
            let options = [];
            if (['select', 'color', 'multiselect'].includes(attr.fieldType)) {
              try {
                const optRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/attribute-options/attribute/${attr._id}`);
                if (optRes.data.success) {
                  options = optRes.data.options;
                }
              } catch (optErr) {
                console.error(`Failed to load options for attribute ${attr.name}:`, optErr);
              }
            }

            configList.push({
              _id: attr._id,
              name: attr.name,
              fieldType: attr.fieldType,
              isRequired: attr.isRequired, // Assume Attributes have isRequired if needed, or default false
              options
            });

            const existingVal = fetchedAttributesRef.current?.find(a =>
              (a.attribute?._id || a.attribute) === attr._id
            );

            initialData.push({
              attribute: attr._id,
              values: existingVal ? existingVal.values : []
            });
          }

          setDynamicAttributesConfig(configList);
          setDynamicAttributes(initialData);

          if (isInitialLoad) {
            setIsInitialLoad(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dynamic attributes:', error);
        toast.error('Failed to load dynamic attributes.');
      } finally {
        setIsDynamicAttributesLoading(false);
      }
    };

    fetchDynamicAttributes();
  }, [formData.category, isInitialLoad]);

  // Handlers
  const clearError = (field) => {
    setErrors(prev => {
      if (!prev[field]) return prev;
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleNameChange = (e) => {
    const newTitle = e.target.value;
    clearError('title');
    if (!slugModified) {
      const generatedSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, title: newTitle, slug: generatedSlug }));
      clearError('slug');
    } else {
      setFormData(prev => ({ ...prev, title: newTitle }));
    }
  };

  const handleSlugChange = (e) => {
    setSlugModified(true);
    clearError('slug');
    setFormData(prev => ({ ...prev, slug: e.target.value }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    clearError(name);
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate Form
    if (!formData.title?.trim()) newErrors.title = "Product Name is required.";
    if (!formData.slug?.trim()) newErrors.slug = "Product Slug is required.";
    if (!formData.department) newErrors.department = "Please select a department.";
    if (!formData.category) newErrors.category = "Please select a category.";
    if (!formData.brand) newErrors.brand = "Please select a brand.";
    if (!formData.shortDescription?.trim()) newErrors.shortDescription = "Short Description is required.";
    if (!formData.longDescription?.trim()) newErrors.longDescription = "Long Description is required.";

    // Validate Dynamic Attributes
    for (const config of dynamicAttributesConfig) {
      if (config.isRequired) {
        const attrVal = dynamicAttributes.find(a => a.attribute === config._id);
        if (!attrVal || !attrVal.values || attrVal.values.length === 0 || attrVal.values[0] === '') {
          newErrors[`attr_${config._id}`] = `${config.name} is required.`;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const errorKeys = Object.keys(newErrors);
      const orderedFields = ['title', 'slug', 'department', 'category', 'brand', 'shortDescription', 'longDescription'];
      let firstErrorKey = orderedFields.find(f => errorKeys.includes(f));
      if (!firstErrorKey) {
        firstErrorKey = errorKeys.find(k => k.startsWith('attr_'));
      }
      if (firstErrorKey && fieldRefs.current[firstErrorKey]) {
        const el = fieldRefs.current[firstErrorKey];
        if (typeof el.focus === 'function') el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Construct Payload
    const payload = {
      title: formData.title,
      slug: formData.slug,
      shortDescription: formData.shortDescription,
      longDescription: formData.longDescription,
      status: formData.status,
      department: formData.department,
      category: formData.category,
      brand: formData.brand,
      attributes: dynamicAttributes.filter(a => a.values && a.values.length > 0 && a.values[0] !== ''), // only send non-empty attributes
      returnPolicy: {
        returnable: formData.returnable,
        exchangeable: formData.exchangeable,
        returnDays: parseInt(formData.returnDays) || 0
      }
    };

    setIsSubmitting(true);

    try {
      if (isEdit) {
        const response = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/admin/products/${id}`, payload, {
          withCredentials: true
        });
        if (response.data.success) {
          toast.success('Product updated successfully');
          navigate(`/admin/products/${id}/variants`);
        }
      } else {
        const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/admin/products`, payload, {
          withCredentials: true
        });
        if (response.data.success) {
          toast.success('Product created successfully. Now add variants.');
          const newProductId = response.data.data._id;
          navigate(`/admin/products/${newProductId}/variants`);
        }
      }
    } catch (error) {
      console.error('Submit error', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Dynamic Field Component
  const renderDynamicField = (config) => {
    const currentAttr = dynamicAttributes.find(a => a.attribute === config._id);
    const currentValue = currentAttr?.values[0] || '';
    const hasError = !!errors[`attr_${config._id}`];
    const borderClass = hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#4648d4] focus:ring-[#4648d4]';

    const handleValueChange = (val) => {
      setDynamicAttributes(prev => prev.map(attr =>
        attr.attribute === config._id ? { ...attr, values: [val] } : attr
      ));
      clearError(`attr_${config._id}`);
    };

    switch (config.fieldType) {
      case 'text':
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleValueChange(e.target.value)}
            className={`w-full px-4 h-12 border ${borderClass} rounded-lg outline-none focus:ring-1 transition-colors`}
            placeholder={`Enter ${config.name}`}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={currentValue}
            onChange={(e) => handleValueChange(e.target.value)}
            className={`w-full px-4 h-12 border ${borderClass} rounded-lg outline-none focus:ring-1 transition-colors`}
            placeholder={`Enter ${config.name}`}
          />
        );
      case 'select':
      case 'multiselect':
        return (
          <select
            value={currentValue}
            onChange={(e) => handleValueChange(e.target.value)}
            className={`w-full px-4 h-12 border ${borderClass} rounded-lg outline-none focus:ring-1 transition-colors bg-white cursor-pointer`}
          >
            <option value="">-- Select {config.name} --</option>
            {config.options.map(opt => (
              <option key={opt._id} value={opt.storedValue}>{opt.displayName}</option>
            ))}
          </select>
        );
      case 'color':
        return (
          <div className={`flex flex-wrap gap-2 p-2 rounded-lg border ${hasError ? 'border-red-500 bg-red-50' : 'border-transparent'}`}>
            {config.options.map(opt => (
              <button
                key={opt._id}
                type="button"
                onClick={() => handleValueChange(opt.storedValue)}
                className={`flex items-center gap-2 px-3 h-12 rounded-lg border transition-all ${currentValue === opt.storedValue
                    ? 'border-[#4648d4] bg-[#4648d4]/5 ring-1 ring-[#4648d4]'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: opt.storedValue }}
                />
                <span className="text-sm font-medium text-gray-700">{opt.displayName}</span>
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 pb-10 relative">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5">
        {/* Basic Information - 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

          {/* Row 1 */}
          <div>
            <label className="block text-sm font-medium text-[#4648d4] mb-1">Product Name <span className="text-red-500">*</span></label>
            <input
              ref={setRef('title')}
              type="text"
              name="title"
              value={formData.title}
              onChange={handleNameChange}
              placeholder="e.g. Men Solid Polo Collar T-shirt"
              className={`w-full px-4 h-12 border ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#4648d4] focus:ring-[#4648d4]'} rounded-lg outline-none focus:ring-1 transition-colors`}
            />
            {errors.title && <span className="text-red-500 text-xs mt-1 block">❌ {errors.title}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4648d4] mb-1">Product Slug <span className="text-red-500">*</span></label>
            <input
              ref={setRef('slug')}
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              placeholder="e.g. men-solid-polo-collar-t-shirt"
              className={`w-full px-4 h-12 border ${errors.slug ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#4648d4] focus:ring-[#4648d4]'} rounded-lg outline-none focus:ring-1 transition-colors font-mono text-sm`}
            />
            {errors.slug && <span className="text-red-500 text-xs mt-1 block">❌ {errors.slug}</span>}
          </div>
          <div ref={setRef('department')}>
            <label className="block text-sm font-medium text-[#4648d4] mb-1">Department <span className="text-red-500">*</span></label>
            <SearchableSelect
              value={formData.department}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, department: val, category: '', brand: '' }));
                clearError('department');
                clearError('category');
                clearError('brand');
              }}
              disabled={isDepartmentsLoading}
              options={[{ value: '', label: isDepartmentsLoading ? "Loading..." : "-- Select --" }, ...departments.map(d => ({ value: d._id, label: d.name }))]}
            />
            {errors.department && <span className="text-red-500 text-xs mt-1 block">❌ {errors.department}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4648d4] mb-1">Status <span className="text-red-500">*</span></label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 h-12 border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] focus:ring-1 focus:ring-[#4648d4] transition-colors bg-white cursor-pointer"
            >
              <option value="Inactive">Inactive</option>
              <option value="Active">Active</option>
            </select>
          </div>

          {/* Row 2 */}
          <div ref={setRef('category')}>
            <label className="block text-sm font-medium text-[#4648d4] mb-1">Category <span className="text-red-500">*</span></label>
            <SearchableSelect
              value={formData.category}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, category: val }));
                clearError('category');
              }}
              disabled={!formData.department || isCategoriesLoading}
              options={[{ value: '', label: !formData.department ? "-- Department First --" : isCategoriesLoading ? "Loading..." : "-- Select --" }, ...categories.map(c => ({ value: c._id, label: c.name }))]}
            />
            {errors.category && <span className="text-red-500 text-xs mt-1 block">❌ {errors.category}</span>}
          </div>
          <div ref={setRef('brand')}>
            <label className="block text-sm font-medium text-[#4648d4] mb-1">Brand <span className="text-red-500">*</span></label>
            <SearchableSelect
              value={formData.brand}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, brand: val }));
                clearError('brand');
              }}
              disabled={!formData.department || isBrandsLoading}
              options={[{ value: '', label: !formData.department ? "-- Department First --" : isBrandsLoading ? "Loading..." : "-- Select --" }, ...brands.map(b => ({ value: b._id, label: b.name }))]}
            />
            {errors.brand && <span className="text-red-500 text-xs mt-1 block">❌ {errors.brand}</span>}
          </div>
        </div>

        {/* Row 3: Short Description */}
        <div>
          <label className="block text-sm font-medium text-[#4648d4] mb-1">Short Description <span className="text-red-500">*</span></label>
          <input
            ref={setRef('shortDescription')}
            type="text"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="Brief summary of the product"
            className={`w-full px-4 h-12 border ${errors.shortDescription ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#4648d4] focus:ring-[#4648d4]'} rounded-lg outline-none focus:ring-1 transition-colors`}
          />
          {errors.shortDescription && <span className="text-red-500 text-xs mt-1 block">❌ {errors.shortDescription}</span>}
        </div>

        {/* Row 4: Long Description */}
        <div>
          <label className="block text-sm font-medium text-[#4648d4] mb-1">Long Description <span className="text-red-500">*</span></label>
          <textarea
            ref={setRef('longDescription')}
            name="longDescription"
            value={formData.longDescription}
            onChange={handleChange}
            rows="4"
            placeholder="Detailed description..."
            className={`w-full px-4 py-2 border ${errors.longDescription ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#4648d4] focus:ring-[#4648d4]'} rounded-lg outline-none focus:ring-1 transition-colors resize-y`}
          ></textarea>
          {errors.longDescription && <span className="text-red-500 text-xs mt-1 block">❌ {errors.longDescription}</span>}
        </div>
      </div>

      {/* Dynamic Attributes or Info Card */}
      {formData.category && !isDynamicAttributesLoading && dynamicAttributesConfig.length === 0 ? (
        <div className="bg-[#4648d4]/5 rounded-xl border border-[#4648d4]/20 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-[#4648d4] mb-3">Product Variants</h3>
          <p className="text-sm font-medium text-gray-800 mb-2">This product uses variants.</p>
          <p className="text-sm text-gray-600 mb-3">After saving the product you will configure:</p>
          <ul className="text-sm text-gray-600 mb-4 ml-1 space-y-1">
            <li>• Color</li>
            <li>• Size</li>
            <li>• SKU</li>
            <li>• Stock</li>
            <li>• Images</li>
            <li>• Price</li>
          </ul>
          <p className="text-sm text-gray-500 font-medium italic">Click "Save Product & Add Variants" to continue.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#4648d4]">Attributes</h3>
          </div>

          {isDynamicAttributesLoading ? (
            <div className="flex flex-col items-center justify-center py-6 px-4 border border-dashed border-gray-200 rounded-lg bg-gray-50">
              <div className="w-6 h-6 border-2 border-[#4648d4] border-t-transparent rounded-full animate-spin mb-2"></div>
              <span className="text-sm text-gray-500 font-medium">Loading attributes...</span>
            </div>
          ) : !formData.category ? (
            <div className="flex flex-col items-center justify-center py-6 px-4 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
              <span className="text-sm text-gray-500 font-medium">Select a Category to load product attributes.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dynamicAttributesConfig.map((config) => (
                <div key={config._id} className="flex flex-col" ref={setRef(`attr_${config._id}`)}>
                  <label className="block text-sm font-medium text-[#4648d4] mb-1">
                    {config.name} {config.isRequired && <span className="text-red-500">*</span>}
                  </label>
                  {renderDynamicField(config)}
                  {errors[`attr_${config._id}`] && <span className="text-red-500 text-xs mt-1 block">❌ {errors[`attr_${config._id}`]}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Return & Exchange Policy */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-[#4648d4] mb-4">Return / Exchange</h3>
        
        <div className="flex flex-wrap items-center gap-8">
          {/* Returnable Toggle */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#4648d4]">Returnable</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="returnable"
                checked={formData.returnable}
                onChange={handleChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4648d4]"></div>
            </label>
          </div>

          {/* Exchangeable Toggle */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#4648d4]">Exchangeable</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="exchangeable"
                checked={formData.exchangeable}
                onChange={handleChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4648d4]"></div>
            </label>
          </div>

          {/* Return Window */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#4648d4]">Return In</span>
            <input
              type="number"
              name="returnDays"
              min="0"
              value={formData.returnDays}
              onChange={handleChange}
              disabled={!formData.returnable && !formData.exchangeable}
              className={`w-20 px-2 h-9 text-center border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] focus:ring-1 focus:ring-[#4648d4] transition-colors ${(!formData.returnable && !formData.exchangeable) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
            />
            <span className="text-sm font-medium text-[#4648d4]">days</span>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-center gap-4 pt-4 pb-6">
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="h-12 px-8 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`h-12 px-8 text-sm font-medium text-white bg-[#4648d4] rounded-xl shadow-sm transition-colors flex items-center justify-center min-w-[160px] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#3b3db0]'}`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {isEdit ? 'Saving...' : 'Saving...'}
            </>
          ) : (
            'Save Product & Add Variants →'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
