import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, UploadCloud, Save, ArrowLeft, Package, Edit2, Image as ImageIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Breadcrumbs from '../../../../components/admin/ui/Breadcrumbs';

const ProductVariants = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  
  // Dynamic Attributes
  const [mappedAttributes, setMappedAttributes] = useState([]);
  const [attributeOptionsMap, setAttributeOptionsMap] = useState({});
  
  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Derived Attributes
  const primaryAttribute = useMemo(() => {
    if (!mappedAttributes || mappedAttributes.length === 0) return null;
    const colorAttr = mappedAttributes.find(a => a.name.toLowerCase() === 'color');
    if (colorAttr) return colorAttr;
    return mappedAttributes[0];
  }, [mappedAttributes]);

  const secondaryAttributes = useMemo(() => {
    if (!primaryAttribute) return [];
    return mappedAttributes.filter(a => a._id !== primaryAttribute._id);
  }, [mappedAttributes, primaryAttribute]);

  const isColorGroup = primaryAttribute?.name?.toLowerCase() === 'color';

  // Form State (Grouped)
  const getEmptyGroup = () => {
    return {
      primaryOption: '',
      mainImage: null,
      galleryImages: [],
      items: [
        {
          id: Date.now(),
          secondaryOptions: secondaryAttributes.reduce((acc, attr) => ({ ...acc, [attr._id]: '' }), {}),
          sku: '',
          mrp: '',
          price: '',
          gstRate: '',
          stock: 0,
          status: 'Active'
        }
      ]
    };
  };

  const [currentGroup, setCurrentGroup] = useState(null);
  const [editingPrimaryOption, setEditingPrimaryOption] = useState(null);

  // Live Preview State
  const [previewPrimaryOption, setPreviewPrimaryOption] = useState(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  // Initial Form Setup
  useEffect(() => {
    if (!currentGroup && mappedAttributes.length > 0 && primaryAttribute) {
      setCurrentGroup(getEmptyGroup());
    }
  }, [mappedAttributes, primaryAttribute]);

  // Handle preview images
  const groupedVariants = useMemo(() => {
    if (!primaryAttribute || variants.length === 0) return [];
    const groups = new Map();
    
    variants.forEach(v => {
      const pAttr = v.attributes.find(a => (typeof a.attribute === 'object' ? a.attribute._id : a.attribute) === primaryAttribute._id);
      const pOptId = pAttr ? (typeof pAttr.option === 'object' ? pAttr.option._id : pAttr.option) : 'unknown';
      
      if (!groups.has(pOptId)) {
        groups.set(pOptId, {
          primaryOption: pOptId,
          mainImage: v.mainImage,
          galleryImages: v.galleryImages || [],
          items: []
        });
      }
      
      const secOpts = {};
      secondaryAttributes.forEach(sa => {
        const sAttr = v.attributes.find(a => (typeof a.attribute === 'object' ? a.attribute._id : a.attribute) === sa._id);
        secOpts[sa._id] = sAttr ? (typeof sAttr.option === 'object' ? sAttr.option._id : sAttr.option) : '';
      });
      
      groups.get(pOptId).items.push({
        _id: v._id,
        secondaryOptions: secOpts,
        sku: v.sku,
        stock: v.stock,
        mrp: v.mrp,
        price: v.price,
        gstRate: v.gstRate,
        status: v.status
      });
    });
    
    return Array.from(groups.values());
  }, [variants, primaryAttribute, secondaryAttributes]);

  // Auto-slide effect for Live Preview
  useEffect(() => {
    let images = [];
    
    // Determine active group images
    if (editingPrimaryOption !== null && currentGroup && previewPrimaryOption === editingPrimaryOption) {
      if (currentGroup.mainImage) images.push(currentGroup.mainImage);
      if (currentGroup.galleryImages) images.push(...currentGroup.galleryImages);
    } else if (previewPrimaryOption !== null) {
      const group = groupedVariants.find(g => g.primaryOption === previewPrimaryOption);
      if (group) {
        if (group.mainImage) images.push(group.mainImage);
        if (group.galleryImages) images.push(...group.galleryImages);
      }
    } else if (groupedVariants.length > 0) {
      const group = groupedVariants[0];
      if (group.mainImage) images.push(group.mainImage);
      if (group.galleryImages) images.push(...group.galleryImages);
    } else if (currentGroup) {
      if (currentGroup.mainImage) images.push(currentGroup.mainImage);
      if (currentGroup.galleryImages) images.push(...currentGroup.galleryImages);
    }

    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setPreviewImageIndex(prev => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [previewPrimaryOption, groupedVariants, editingPrimaryOption, currentGroup]);


  // Load Data
  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchData = async () => {
      setIsLoading(true);
      let prodData = null;

      try {
        const prodRes = await axios.get(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/admin/products/${id}`, { 
          withCredentials: true,
          signal: abortController.signal
        });
        if (prodRes.data.success) {
          prodData = prodRes.data.data.product || prodRes.data.data;
          setProduct(prodData);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        toast.error("Failed to load Product");
      }

      try {
        const varRes = await axios.get(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/admin/products/${id}/variants`, { 
          withCredentials: true,
          signal: abortController.signal
        });
        if (varRes.data.success) {
          const loadedVariants = varRes.data.data.map(v => ({
            ...v,
            attributes: v.attributes.map(a => ({
              attribute: typeof a.attribute === 'object' ? a.attribute._id : a.attribute,
              option: typeof a.option === 'object' ? a.option._id : a.option
            }))
          }));
          setVariants(loadedVariants);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        toast.error("Failed to load Variants");
      }

      if (prodData) {
        let catId = prodData.category;
        if (typeof catId === 'object' && catId._id) catId = catId._id;
        
        if (catId) {
          let attributes = [];
          try {
            const attrRes = await axios.get(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/admin/attribute-mapping/${catId}/attributes?usage=Variant`, { 
              withCredentials: true,
              signal: abortController.signal
            });
            if (attrRes.data.success) {
              attributes = attrRes.data.attributes || [];
              setMappedAttributes(attributes);
            }
          } catch (err) {
            if (axios.isCancel(err)) return;
            toast.error("Failed to load Variant Attributes");
          }
          
          if (attributes.length > 0) {
            const optionsMap = {};
            await Promise.all(attributes.map(async (attr) => {
              if (['select', 'color', 'multiselect'].includes(attr.fieldType)) {
                try {
                  const optRes = await axios.get(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/attribute-options/attribute/${attr._id}?limit=1000`, {
                    signal: abortController.signal
                  });
                  if (optRes.data.success) {
                    optionsMap[attr._id] = optRes.data.options;
                  }
                } catch (err) {
                  if (axios.isCancel(err)) return;
                }
              }
            }));
            setAttributeOptionsMap(optionsMap);
          }
        }
      }

      setIsLoading(false);
    };

    fetchData();
    return () => abortController.abort();
  }, [id]);

  useEffect(() => {
    if (groupedVariants.length > 0 && !previewPrimaryOption) {
      setPreviewPrimaryOption(groupedVariants[0].primaryOption);
    }
  }, [groupedVariants, previewPrimaryOption]);

  const generateSkuString = (pOptId, sOptId) => {
    const brandCode = (product?.brand?.name || 'VYN').substring(0,3).toUpperCase();
    const titleCode = (product?.title || 'PROD').split(' ')[0].toUpperCase();
    
    let pCode = '';
    if (pOptId) {
      const pOptName = attributeOptionsMap[primaryAttribute?._id]?.find(o => o._id === pOptId)?.displayName || '';
      pCode = pOptName.split(' ')[0].toUpperCase();
    }

    let sCode = '';
    if (secondaryAttributes.length > 0 && sOptId) {
      const sOptName = attributeOptionsMap[secondaryAttributes[0]._id]?.find(o => o._id === sOptId)?.displayName || '';
      sCode = sOptName.split(' ')[0].toUpperCase();
    }

    const parts = [brandCode, titleCode, pCode, sCode].filter(Boolean);
    return parts.join('-');
  };

  const updateCurrentGroup = (field, value) => {
    setCurrentGroup(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'primaryOption') {
        setPreviewPrimaryOption(value);
        setPreviewImageIndex(0);
        
        // Auto-update SKUs based on new primary option
        updated.items = updated.items.map(item => {
          let sOptId = null;
          if (secondaryAttributes.length > 0) {
            sOptId = item.secondaryOptions[secondaryAttributes[0]._id];
          }
          return { ...item, sku: generateSkuString(value, sOptId) };
        });
      }
      return updated;
    });
  };

  const updateItem = (itemIndex, field, value) => {
    setCurrentGroup(prev => {
      const newItems = [...prev.items];
      newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const updateItemSecondaryOption = (itemIndex, attributeId, optionId) => {
    setCurrentGroup(prev => {
      const newItems = [...prev.items];
      const newSecondary = { ...newItems[itemIndex].secondaryOptions, [attributeId]: optionId };
      
      let sku = newItems[itemIndex].sku;
      // Auto generate SKU for the first secondary attribute
      if (secondaryAttributes.length > 0 && attributeId === secondaryAttributes[0]._id) {
        sku = generateSkuString(prev.primaryOption, optionId);
      }
      
      newItems[itemIndex] = { ...newItems[itemIndex], secondaryOptions: newSecondary, sku };
      return { ...prev, items: newItems };
    });
  };

  const addRow = () => {
    setCurrentGroup(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          secondaryOptions: secondaryAttributes.reduce((acc, attr) => ({ ...acc, [attr._id]: '' }), {}),
          sku: '',
          mrp: '',
          price: '',
          gstRate: '',
          stock: 0,
          status: 'Active'
        }
      ]
    }));
  };

  const removeRow = (itemIndex) => {
    if (currentGroup.items.length === 1) {
      toast.error("You must have at least one configuration.");
      return;
    }
    setCurrentGroup(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== itemIndex)
    }));
  };

  const handleEditGroup = (group) => {
    const items = group.items.map(item => ({
      id: Math.random().toString(),
      secondaryOptions: item.secondaryOptions,
      sku: item.sku,
      stock: item.stock,
      mrp: item.mrp,
      price: item.price,
      gstRate: item.gstRate,
      status: item.status
    }));

    setCurrentGroup({
      primaryOption: group.primaryOption,
      mainImage: group.mainImage,
      galleryImages: group.galleryImages || [],
      items: items
    });
    setEditingPrimaryOption(group.primaryOption);
    setPreviewPrimaryOption(group.primaryOption);
    setPreviewImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setCurrentGroup(getEmptyGroup());
    setEditingPrimaryOption(null);
  };

  const handleMainImageUpload = async (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      return toast.error("Only .jpg, .jpeg, .png, .webp allowed");
    }
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/admin/upload/image`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        updateCurrentGroup('mainImage', res.data.data);
        toast.success("Image uploaded");
      }
    } catch {
      toast.error("Failed to upload image");
    }
  };

  const handleGalleryUpload = async (files) => {
    const validFiles = Array.from(files).filter(f => ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type));
    if (!validFiles.length) return;
    
    const currentCount = currentGroup.galleryImages?.length || 0;
    if (currentCount + validFiles.length > 5) {
      return toast.error("Maximum 5 gallery images allowed");
    }

    const formData = new FormData();
    validFiles.forEach(f => formData.append('images', f));
    try {
      const res = await axios.post(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/admin/upload/multiple`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        const newGallery = [...(currentGroup.galleryImages || []), ...res.data.data];
        updateCurrentGroup('galleryImages', newGallery);
        toast.success("Gallery updated");
      }
    } catch {
      toast.error("Failed to upload gallery");
    }
  };

  const removeGalleryImage = (gIndex) => {
    const newGallery = currentGroup.galleryImages.filter((_, idx) => idx !== gIndex);
    updateCurrentGroup('galleryImages', newGallery);
  };

  const saveVariantsToBackend = async (variantsToSave) => {
    const res = await axios.put(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/admin/products/${id}/variants`, { variants: variantsToSave }, {
      withCredentials: true
    });
    return res.data;
  };

  const handleSave = async (addAnother = false) => {
    if (!currentGroup) return;

    if (!currentGroup.primaryOption) {
      return toast.error(`Please select a ${primaryAttribute?.name || 'Primary Attribute'}.`);
    }

    if (!currentGroup.mainImage) {
      return toast.error("Main Image is required.");
    }

    // Validate Items
    if (currentGroup.items.length === 0) {
      return toast.error("Please add at least one configuration.");
    }

    for (let i = 0; i < currentGroup.items.length; i++) {
      const item = currentGroup.items[i];
      for (const sa of secondaryAttributes) {
        if (!item.secondaryOptions[sa._id]) {
          return toast.error(`Please select ${sa.name} for item ${i + 1}.`);
        }
      }
      if (!item.sku) return toast.error(`SKU is required for item ${i + 1}.`);
      if (item.mrp === '') return toast.error(`MRP is required for item ${i + 1}.`);
      if (item.price === '') return toast.error(`Selling Price is required for item ${i + 1}.`);
      if (item.gstRate === '') return toast.error(`GST Rate is required for item ${i + 1}.`);
      if (Number(item.price) > Number(item.mrp)) {
        return toast.error(`Selling Price cannot exceed MRP for item ${i + 1}.`);
      }
      if (item.stock === '' || item.stock < 0) return toast.error(`Valid stock is required for item ${i + 1}.`);
    }

    // Check for duplicate secondary configurations within the group
    if (secondaryAttributes.length > 0) {
      const configStrings = currentGroup.items.map(item => 
        secondaryAttributes.map(sa => item.secondaryOptions[sa._id]).join('-')
      );
      const uniqueConfigs = new Set(configStrings);
      if (uniqueConfigs.size !== configStrings.length) {
        return toast.error("This variant already exists. You cannot add duplicate combinations.");
      }
    }

    // Convert currentGroup to flat variants
    const flatVariantsToSave = currentGroup.items.map(item => {
      const attributes = [
        { attribute: primaryAttribute._id, option: currentGroup.primaryOption }
      ];
      secondaryAttributes.forEach(sa => {
        attributes.push({ attribute: sa._id, option: item.secondaryOptions[sa._id] });
      });
      
      return {
        attributes,
        sku: item.sku,
        stock: item.stock,
        mrp: item.mrp,
        price: item.price,
        gstRate: Number(item.gstRate),
        status: item.status,
        mainImage: currentGroup.mainImage,
        galleryImages: currentGroup.galleryImages
      };
    });

    let otherVariants = variants.filter(v => {
      const pAttr = v.attributes.find(a => (typeof a.attribute === 'object' ? a.attribute._id : a.attribute) === primaryAttribute._id);
      const pOptId = pAttr ? (typeof pAttr.option === 'object' ? pAttr.option._id : pAttr.option) : '';
      return pOptId !== editingPrimaryOption;
    });

    if (editingPrimaryOption !== currentGroup.primaryOption) {
       const alreadyExists = otherVariants.some(v => {
         const pAttr = v.attributes.find(a => (typeof a.attribute === 'object' ? a.attribute._id : a.attribute) === primaryAttribute._id);
         const pOptId = pAttr ? (typeof pAttr.option === 'object' ? pAttr.option._id : pAttr.option) : '';
         return pOptId === currentGroup.primaryOption;
       });
       if (alreadyExists) {
         return toast.error(`A group for ${attributeOptionsMap[primaryAttribute._id]?.find(o => o._id === currentGroup.primaryOption)?.displayName || 'this option'} already exists. Please edit that group directly.`);
       }
    }

    const allNewSkus = flatVariantsToSave.map(v => v.sku);
    const uniqueSkus = new Set(allNewSkus);
    if (uniqueSkus.size !== allNewSkus.length) {
      return toast.error("Duplicate SKUs found within this group.");
    }

    const hasDuplicate = otherVariants.some(v => allNewSkus.includes(v.sku));
    if (hasDuplicate) {
      return toast.error("One of the SKUs is already used by another variant.");
    }

    try {
      setIsSubmitting(true);
      
      const newVariantsList = [...otherVariants, ...flatVariantsToSave];

      const res = await saveVariantsToBackend(newVariantsList);
      
      if (res.success && res.data) {
         const savedVariants = res.data.map(v => ({
          ...v,
          attributes: v.attributes.map(a => ({
            attribute: typeof a.attribute === 'object' ? a.attribute._id : a.attribute,
            option: typeof a.option === 'object' ? a.option._id : a.option
          }))
        }));
        setVariants(savedVariants);
      } else {
        setVariants(newVariantsList);
      }
      
      setPreviewPrimaryOption(currentGroup.primaryOption);
      toast.success(isColorGroup ? "Color group saved successfully!" : "Variant group saved successfully!");
      
      if (addAnother || editingPrimaryOption !== null) {
        setCurrentGroup(getEmptyGroup());
        setEditingPrimaryOption(null);
      } else {
        setCurrentGroup(getEmptyGroup());
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save variants.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async (group) => {
    if (!window.confirm(`Are you sure you want to delete the ${attributeOptionsMap[primaryAttribute._id]?.find(o => o._id === group.primaryOption)?.displayName || 'selected'} group?`)) return;
    try {
      setIsDeleting(true);
      const newVariants = variants.filter(v => {
        const pAttr = v.attributes.find(a => (typeof a.attribute === 'object' ? a.attribute._id : a.attribute) === primaryAttribute._id);
        const pOptId = pAttr ? (typeof pAttr.option === 'object' ? pAttr.option._id : pAttr.option) : '';
        return pOptId !== group.primaryOption;
      });
      await saveVariantsToBackend(newVariants);
      setVariants(newVariants);
      toast.success("Group deleted.");
      
      if (editingPrimaryOption === group.primaryOption) {
        handleCancelEdit();
      }
    } catch {
      toast.error("Failed to delete group.");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
  const prices = variants.map(v => Number(v.price) || 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const priceRange = minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#4648d4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full pb-20">
      
      <div className="mb-6">
        <Breadcrumbs items={[
          { label: 'Catalog', path: '/admin/catalog' },
          { label: 'Products', path: '/admin/products' },
          { label: 'Product Variants' }
        ]} />
      </div>

      {/* Product Summary */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-8 w-full mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-[#4648d4] mb-2">{product?.title || 'Unknown Product'}</h2>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">{product?.brand?.name || '-'}</span>
              <span className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">{product?.department?.name || '-'}</span>
              <span className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">{product?.category?.name || '-'}</span>
              <span className={`px-3 py-1 rounded-lg border ${product?.status === 'Active' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                {product?.status || 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-sm font-medium text-[#4648d4] mb-1">Groups</p>
                <p className="text-xl font-bold text-gray-900">{groupedVariants.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#4648d4] mb-1">Variants</p>
                <p className="text-xl font-bold text-gray-900">{variants.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#4648d4] mb-1">Total Stock</p>
                <p className="text-xl font-bold text-gray-900">{totalStock}</p>
              </div>
            </div>
            
            <button 
              onClick={() => navigate(`/admin/products/${id}/edit`)}
              className="h-12 px-6 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Edit2 size={18} /> Edit Product
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column: Variant Form Card */}
        <div className="xl:col-span-8 bg-white rounded-[20px] shadow-sm border border-gray-100 p-8 flex flex-col">
           <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-[#4648d4]">
                {editingPrimaryOption !== null ? (isColorGroup ? 'Edit Color' : 'Edit Group') : (isColorGroup ? 'Add Color' : 'Add Group')}
              </h2>
           </div>

           {currentGroup && primaryAttribute && (
             <div className="space-y-8 flex-1">
               
               {/* Primary Group Details */}
               <div>
                 <h3 className="text-lg font-bold text-[#4648d4] mb-4">Group Details</h3>
                 <div className="grid grid-cols-1 gap-6 max-w-sm">
                    <div>
                      <label className="block text-sm font-medium text-[#4648d4] mb-2">{primaryAttribute.name} *</label>
                      <select
                        value={currentGroup.primaryOption}
                        onChange={(e) => updateCurrentGroup('primaryOption', e.target.value)}
                        className="w-full px-4 h-12 border border-gray-200 rounded-xl outline-none focus:border-[#4648d4] focus:ring-1 focus:ring-[#4648d4] bg-white transition-colors text-gray-900"
                      >
                        <option value="">Select {primaryAttribute.name}</option>
                        {(attributeOptionsMap[primaryAttribute._id] || []).map(opt => (
                          <option key={opt._id} value={opt._id}>{opt.displayName}</option>
                        ))}
                      </select>
                    </div>
                 </div>
               </div>

               {/* Variant Images */}
               <div className="pt-8 border-t border-gray-100">
                 <h3 className="text-lg font-bold text-[#4648d4] mb-4">Group Images</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                   <div className="sm:col-span-1 flex flex-col">
                     <label className="block text-sm font-medium text-[#4648d4] mb-2">Main Image *</label>
                     {currentGroup.mainImage ? (
                       <div className="relative aspect-[3/4] border border-gray-200 rounded-xl overflow-hidden group">
                         <img src={currentGroup.mainImage.url} className="w-full h-full object-cover" alt="Main" />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2 transition-opacity">
                           <label className="bg-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer shadow-sm text-gray-900">
                             Replace
                             <input type="file" className="hidden" accept="image/*" onChange={(e) => handleMainImageUpload(e.target.files[0])} />
                           </label>
                         </div>
                       </div>
                     ) : (
                       <label className="flex flex-col items-center justify-center aspect-[3/4] border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                         <UploadCloud className="w-6 h-6 text-gray-400 mb-2" />
                         <span className="text-sm font-medium text-gray-600">Upload</span>
                         <input type="file" className="hidden" accept="image/*" onChange={(e) => handleMainImageUpload(e.target.files[0])} />
                       </label>
                     )}
                   </div>

                   <div className="sm:col-span-3 flex flex-col">
                     <div className="flex justify-between items-center mb-2">
                       <label className="block text-sm font-medium text-[#4648d4]">Gallery Images</label>
                       <span className="text-sm text-gray-500">{currentGroup.galleryImages?.length || 0}/5</span>
                     </div>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                       {currentGroup.galleryImages?.map((img, gIndex) => (
                         <div key={img.publicId || gIndex} className="relative aspect-square border border-gray-200 rounded-xl overflow-hidden group">
                           <img src={img.url} className="w-full h-full object-cover" alt="Gallery" />
                           <button type="button" onClick={() => removeGalleryImage(gIndex)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                             <Trash2 size={20} />
                           </button>
                         </div>
                       ))}
                       {(currentGroup.galleryImages?.length || 0) < 5 && (
                         <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                           <Plus className="w-6 h-6 text-gray-400 mb-2" />
                           <span className="text-sm font-medium text-gray-600">Add Image</span>
                           <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleGalleryUpload(e.target.files)} />
                         </label>
                       )}
                     </div>
                   </div>
                 </div>
               </div>

               {/* Inventory Table */}
               <div className="pt-8 border-t border-gray-100">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold text-[#4648d4]">Inventory Configurations</h3>
                   {secondaryAttributes.length > 0 && (
                     <button 
                       type="button" 
                       onClick={addRow}
                       className="text-sm font-medium text-[#4648d4] bg-[#4648d4]/10 hover:bg-[#4648d4]/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                     >
                       <Plus size={16} /> {isColorGroup && secondaryAttributes[0].name.toLowerCase() === 'size' ? 'Add Size' : 'Add Option'}
                     </button>
                   )}
                 </div>
                 
                 <div className="overflow-x-auto border border-gray-100 rounded-xl bg-gray-50/50 p-2">
                   <table className="w-full text-left border-collapse min-w-[700px]">
                     <thead>
                       <tr className="border-b border-gray-200">
                         {secondaryAttributes.map(sa => (
                           <th key={sa._id} className="py-3 px-3 text-xs font-semibold text-[#4648d4] uppercase tracking-wider">{sa.name}</th>
                         ))}
                         <th className="py-3 px-3 text-xs font-semibold text-[#4648d4] uppercase tracking-wider">SKU</th>
                         <th className="py-3 px-3 text-xs font-semibold text-[#4648d4] uppercase tracking-wider">Stock</th>
                         <th className="py-3 px-3 text-xs font-semibold text-[#4648d4] uppercase tracking-wider">MRP</th>
                         <th className="py-3 px-3 text-xs font-semibold text-[#4648d4] uppercase tracking-wider">Price</th>
                         <th className="py-3 px-3 text-xs font-semibold text-[#4648d4] uppercase tracking-wider w-24">GST</th>
                         <th className="py-3 px-3 text-xs font-semibold text-[#4648d4] uppercase tracking-wider w-24">Status</th>
                         {secondaryAttributes.length > 0 && (
                           <th className="py-3 px-3 text-xs font-semibold text-[#4648d4] uppercase tracking-wider w-12 text-center">Act</th>
                         )}
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                       {currentGroup.items.map((item, index) => {
                         const priceError = Number(item.price) > Number(item.mrp);
                         return (
                           <tr key={item.id} className="bg-white">
                             {secondaryAttributes.map(sa => (
                               <td key={sa._id} className="p-2">
                                 <select
                                   value={item.secondaryOptions[sa._id]}
                                   onChange={(e) => updateItemSecondaryOption(index, sa._id, e.target.value)}
                                   className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] focus:ring-1 focus:ring-[#4648d4] bg-white transition-colors text-gray-900"
                                 >
                                   <option value="">Select</option>
                                   {(attributeOptionsMap[sa._id] || []).map(opt => (
                                     <option key={opt._id} value={opt._id}>{opt.displayName}</option>
                                   ))}
                                 </select>
                               </td>
                             ))}
                             <td className="p-2">
                               <input type="text" value={item.sku} onChange={e => updateItem(index, 'sku', e.target.value)} className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] text-gray-900" placeholder="SKU" />
                             </td>
                             <td className="p-2 w-20">
                               <input type="number" value={item.stock} onChange={e => updateItem(index, 'stock', e.target.value)} className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] text-gray-900" />
                             </td>
                             <td className="p-2 w-24">
                               <input type="number" value={item.mrp} onChange={e => updateItem(index, 'mrp', e.target.value)} className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] text-gray-900" />
                             </td>
                             <td className="p-2 w-24 relative">
                               <input type="number" value={item.price} onChange={e => updateItem(index, 'price', e.target.value)} className={`w-full px-2 py-2 text-sm border rounded-lg outline-none focus:ring-1 text-gray-900 ${priceError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#4648d4] focus:ring-[#4648d4]'}`} />
                             </td>
                             <td className="p-2 w-24">
                               <select value={item.gstRate} onChange={e => updateItem(index, 'gstRate', e.target.value)} className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] bg-white text-gray-900">
                                 <option value="">Select</option>
                                 <option value="0">0%</option>
                                 <option value="5">5%</option>
                                 <option value="12">12%</option>
                                 <option value="18">18%</option>
                                 <option value="28">28%</option>
                               </select>
                             </td>
                             <td className="p-2">
                               <select value={item.status} onChange={e => updateItem(index, 'status', e.target.value)} className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#4648d4] bg-white text-gray-900">
                                 <option value="Active">Active</option>
                                 <option value="Inactive">Inactive</option>
                               </select>
                             </td>
                             {secondaryAttributes.length > 0 && (
                               <td className="p-2 text-center">
                                 <button type="button" onClick={() => removeRow(index)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                   <Trash2 size={16} />
                                 </button>
                               </td>
                             )}
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                 </div>
               </div>
               
               {/* Form Actions */}
               <div className="flex flex-wrap items-center justify-end gap-4 pt-8 border-t border-gray-100 mt-auto">
                 {editingPrimaryOption !== null ? (
                   <>
                     <button 
                       type="button"
                       onClick={handleCancelEdit}
                       className="h-12 px-6 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                     >
                       Cancel
                     </button>
                     <button 
                       type="button"
                       onClick={() => handleSave(false)}
                       disabled={isSubmitting}
                       className="h-12 px-6 bg-[#4648d4] hover:bg-[#3b3db0] text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                     >
                       {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isColorGroup ? 'Update Color' : 'Update Group')}
                     </button>
                   </>
                 ) : (
                   <>
                     <button 
                       type="button"
                       onClick={() => setCurrentGroup(getEmptyGroup())}
                       className="h-12 px-6 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                     >
                       Clear
                     </button>
                     <button 
                       type="button"
                       onClick={() => handleSave(true)}
                       disabled={isSubmitting}
                       className="h-12 px-6 border border-[#4648d4] text-[#4648d4] hover:bg-blue-50 rounded-xl font-medium transition-colors flex items-center justify-center min-w-[160px]"
                     >
                       Save & Add Another
                     </button>
                     <button 
                       type="button"
                       onClick={() => handleSave(false)}
                       disabled={isSubmitting}
                       className="h-12 px-6 bg-[#4648d4] hover:bg-[#3b3db0] text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                     >
                       {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isColorGroup ? 'Save Color' : 'Save Group')}
                     </button>
                   </>
                 )}
               </div>

             </div>
           )}
        </div>

        {/* Right Column: Live Preview Card */}
        <div className="xl:col-span-4 bg-white rounded-[20px] shadow-sm border border-gray-100 p-8 flex flex-col h-full min-h-[500px]">
           <h2 className="text-xl font-bold text-[#4648d4] mb-8">Live Preview</h2>
           
           {variants.length === 0 && (!currentGroup?.mainImage) ? (
             <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-[20px] p-8 text-center min-h-[400px]">
               <ImageIcon className="w-12 h-12 text-gray-300 mb-4" />
               <h3 className="text-lg font-bold text-[#4648d4] mb-2">No Images</h3>
               <p className="text-sm text-gray-500 max-w-[250px]">Upload a main image to preview.</p>
             </div>
           ) : (
             <div className="flex flex-col items-center">
                {/* Large Carousel */}
                <div className="w-full aspect-[3/4] rounded-[20px] bg-gray-50 border border-gray-100 relative flex items-center justify-center mb-6 overflow-hidden group">
                  {(() => {
                    let images = [];
                    if (editingPrimaryOption !== null && currentGroup && previewPrimaryOption === editingPrimaryOption) {
                      if (currentGroup.mainImage) images.push(currentGroup.mainImage);
                      if (currentGroup.galleryImages) images.push(...currentGroup.galleryImages);
                    } else if (previewPrimaryOption !== null) {
                      const group = groupedVariants.find(g => g.primaryOption === previewPrimaryOption);
                      if (group) {
                        if (group.mainImage) images.push(group.mainImage);
                        if (group.galleryImages) images.push(...group.galleryImages);
                      }
                    } else if (groupedVariants.length > 0) {
                      const group = groupedVariants[0];
                      if (group.mainImage) images.push(group.mainImage);
                      if (group.galleryImages) images.push(...group.galleryImages);
                    } else if (currentGroup?.mainImage) {
                      images.push(currentGroup.mainImage);
                      if (currentGroup.galleryImages) images.push(...currentGroup.galleryImages);
                    }
                    
                    if (images.length === 0) {
                      return <Package size={48} className="text-gray-300" />;
                    }

                    return (
                      <>
                        <img 
                          src={images[previewImageIndex]?.url || images[0]?.url} 
                          alt="Variant Preview" 
                          className="w-full h-full object-cover object-center transition-all duration-500" 
                        />
                        {images.length > 1 && (
                          <>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPreviewImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1); }}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-sm text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPreviewImageIndex(prev => (prev + 1) % images.length); }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-sm text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                            >
                              <ChevronRight size={20} />
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                              {images.map((_, idx) => (
                                <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === previewImageIndex ? 'bg-[#4648d4]' : 'bg-gray-300'}`} />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
                
                {/* Thumbnail Strip */}
                {groupedVariants.length > 0 && (
                  <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2 scrollbar-hide w-full max-w-full">
                    {groupedVariants.map((g, idx) => {
                      const isSelected = previewPrimaryOption === g.primaryOption;
                      const optName = attributeOptionsMap[primaryAttribute._id]?.find(o => o._id === g.primaryOption)?.displayName || 'Unknown';
                      return (
                        <button
                          key={g.primaryOption || idx}
                          onClick={() => { setPreviewPrimaryOption(g.primaryOption); setPreviewImageIndex(0); }}
                          className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${isSelected ? 'border-[#4648d4] p-0.5' : 'border-transparent opacity-70 hover:opacity-100'}`}
                          title={optName}
                        >
                          {g.mainImage ? (
                            <img src={g.mainImage.url} alt="Thumbnail" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-lg"><Package size={20} className="text-gray-400"/></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
             </div>
           )}
        </div>
      </div>

      {/* Bottom Section: Variants Group Cards */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-8 w-full">
        <div className="mb-6 flex justify-between items-center">
           <h2 className="text-xl font-bold text-[#4648d4]">Saved Groups</h2>
           <div className="flex gap-4">
             <div className="bg-blue-50 text-[#4648d4] px-4 py-1.5 rounded-lg font-medium text-sm border border-blue-100">
               Groups: {groupedVariants.length}
             </div>
             <div className="bg-blue-50 text-[#4648d4] px-4 py-1.5 rounded-lg font-medium text-sm border border-blue-100">
               Variants: {variants.length}
             </div>
           </div>
        </div>
        
        {groupedVariants.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No variants available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedVariants.map((group, index) => {
              const optName = attributeOptionsMap[primaryAttribute._id]?.find(o => o._id === group.primaryOption)?.displayName || '-';
              
              // Calculate group level stats
              const gStock = group.items.reduce((acc, item) => acc + (Number(item.stock) || 0), 0);
              const gPrices = group.items.map(item => Number(item.price) || 0);
              const gMin = gPrices.length ? Math.min(...gPrices) : 0;
              const gMax = gPrices.length ? Math.max(...gPrices) : 0;
              const gPriceRange = gMin === gMax ? `₹${gMin}` : `₹${gMin} - ₹${gMax}`;
              
              // Consolidate secondary attributes
              const secStrings = group.items.map(item => {
                return secondaryAttributes.map(sa => {
                  return attributeOptionsMap[sa._id]?.find(o => o._id === item.secondaryOptions[sa._id])?.displayName || '';
                }).join(' ');
              }).filter(s => s);
              const displaySec = secStrings.join(' • ');

              return (
                <div key={group.primaryOption || index} className="border border-gray-200 rounded-[16px] overflow-hidden hover:border-[#4648d4] transition-colors flex flex-col bg-white">
                  <div className="p-4 flex gap-4 items-center border-b border-gray-100">
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                      {group.mainImage ? (
                        <img src={group.mainImage.url} alt={optName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={20}/></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#4648d4] text-lg mb-1 flex items-center">
                        {isColorGroup && (
                          <span className="inline-block w-3.5 h-3.5 rounded-full mr-2 shadow-sm border border-gray-200" style={{ backgroundColor: optName.toLowerCase().replace(' ', '') }}></span>
                        )}
                        {optName}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">{1 + (group.galleryImages?.length || 0)} Images</p>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1">
                    <div className="space-y-3">
                      {secondaryAttributes.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{secondaryAttributes.map(sa => sa.name).join(' + ')}</p>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1" title={displaySec}>{displaySec || '-'}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Price Range</p>
                          <p className="text-sm font-medium text-gray-900">{gPriceRange}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Stock</p>
                          <p className="text-sm font-medium text-gray-900">{gStock}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex border-t border-gray-100 bg-gray-50/50">
                    <button 
                      onClick={() => handleEditGroup(group)}
                      className="flex-1 py-3 text-sm font-medium text-[#4648d4] hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 border-r border-gray-100"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteGroup(group)}
                      className="flex-1 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ProductVariants;
