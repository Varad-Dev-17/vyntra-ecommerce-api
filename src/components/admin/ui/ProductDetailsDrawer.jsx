import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Package, ImageIcon } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ProductDetailsDrawer = ({ isOpen, onClose, product }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [attributesMap, setAttributesMap] = useState({});
  const [optionsMap, setOptionsMap] = useState({});
  const [isAttributesLoading, setIsAttributesLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product?.attributes?.length > 0) {
      const fetchAttributes = async () => {
        setIsAttributesLoading(true);
        try {
          const [attrRes, optRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/attributes`, { params: { limit: 1000 }, withCredentials: true }),
            axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/attribute-options`, { withCredentials: true })
          ]);
          
          if (attrRes.data.success && attrRes.data.attributes) {
            const attrMap = {};
            attrRes.data.attributes.forEach(a => { attrMap[a._id] = a; });
            setAttributesMap(attrMap);
          }
          if (optRes.data.success && optRes.data.options) {
            const optMap = {};
            optRes.data.options.forEach(o => { optMap[o.storedValue] = o; });
            setOptionsMap(optMap);
          }
        } catch (error) {
          console.error('Failed to load attributes for drawer', error);
        } finally {
          setIsAttributesLoading(false);
        }
      };
      fetchAttributes();
    }
  }, [isOpen, product]);

  // Debugging logs requested by user
  useEffect(() => {
    if (isOpen) {
      console.log("=== ProductDetailsDrawer Debug ===");
      console.log("Product:", product);
      console.log("Attributes:", product?.attributes);
      console.log("AttributesMap:", attributesMap);
      console.log("OptionsMap:", optionsMap);
    }
  }, [isOpen, product, attributesMap, optionsMap]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  // Compute Inventory Summary
  const variants = product?.variants || [];
  let pAttr = null;
  let pAttrId = null;
  let pAttrName = 'Group';
  const groupsMap = new Map();

  if (variants.length > 0) {
    pAttr = variants[0].attributes?.find(a => a.attribute?.name?.toLowerCase() === 'color')?.attribute;
    if (!pAttr) pAttr = variants[0].attributes?.[0]?.attribute;
    pAttrId = pAttr?._id || pAttr;
    pAttrName = pAttr?.name || 'Group';

    variants.forEach(v => {
      const pAttrObj = v.attributes.find(a => (a.attribute?._id || a.attribute) === pAttrId);
      const pOptName = pAttrObj?.option?.displayName || pAttrObj?.option || 'Unknown';
      
      if (!groupsMap.has(pOptName)) {
        groupsMap.set(pOptName, {
          name: pOptName,
          stock: 0,
          prices: [],
          mainImage: v.mainImage || null,
          galleryImages: v.galleryImages || [],
          statuses: new Set(),
          secondaryOptions: []
        });
      }
      
      const group = groupsMap.get(pOptName);
      group.stock += (Number(v.stock) || 0);
      if (v.price) group.prices.push(Number(v.price));
      if (v.status) group.statuses.add(v.status);
      
      const secondaryAttrs = v.attributes.filter(a => (a.attribute?._id || a.attribute) !== pAttrId);
      if (secondaryAttrs.length > 0) {
         const secString = secondaryAttrs.map(a => a.option?.displayName || a.option).join(' + ');
         group.secondaryOptions.push(secString);
      }
    });
  }

  const groups = Array.from(groupsMap.values());

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
         style={{ opacity: isClosing ? 0 : 1 }}
         onClick={handleClose}>
      <div 
        className={`bg-white h-full shadow-2xl flex flex-col w-full md:w-[80vw] lg:w-[800px] transform transition-transform duration-300 ease-in-out ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#4648d4]">Product Details</h2>
            <p className="text-sm text-gray-500 mt-1">{product?.title || 'Unknown Product'}</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/30">
          
          {/* Product Header & Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#4648d4] mb-4 uppercase tracking-wider">Product Information</h3>
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="block text-gray-500 mb-1">Brand</span>
                <span className="font-medium text-gray-900">{product?.brand?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Department</span>
                <span className="font-medium text-gray-900">{product?.department?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Category</span>
                <span className="font-medium text-gray-900">{product?.category?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Status</span>
                <StatusBadge status={product?.status?.toLowerCase() || 'inactive'} />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="block text-gray-500 text-sm mb-1">Short Description</span>
                <p className="text-gray-900 text-sm">{product?.shortDescription || 'N/A'}</p>
              </div>
              <div>
                <span className="block text-gray-500 text-sm mb-1">Long Description</span>
                <p className="text-gray-900 text-sm whitespace-pre-wrap">{product?.longDescription || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Attributes */}
          {product?.attributes && product.attributes.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#4648d4] mb-4 uppercase tracking-wider">Attributes</h3>
              {isAttributesLoading ? (
                <div className="text-sm text-gray-500 animate-pulse">Loading attributes...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-sm">
                  {product.attributes.map((attr, idx) => {
                    const resolvedAttr = attributesMap[attr.attribute] || (attr.attribute && typeof attr.attribute === 'object' ? attr.attribute : null);
                    if (!resolvedAttr) return null;

                    const resolvedValues = (attr.values || []).map(v => {
                      return optionsMap[v]?.displayName || v;
                    });

                    return (
                      <div key={idx}>
                        <span className="block text-gray-500 mb-1">{resolvedAttr.name || 'Unknown'}</span>
                        <span className="font-medium text-gray-900">{resolvedValues.join(', ') || 'N/A'}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Variant Groups */}
          <div>
            <h3 className="text-sm font-bold text-[#4648d4] mb-4 uppercase tracking-wider px-2">Variant Groups</h3>
            {groups.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-gray-900 font-medium mb-1">No variants have been added yet.</h4>
                <p className="text-gray-500 text-sm">Click Edit Product to add the first variant.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
                {groups.map((g, idx) => {
                  const gMin = g.prices.length ? Math.min(...g.prices) : 0;
                  const gMax = g.prices.length ? Math.max(...g.prices) : 0;
                  const gPriceRange = gMin === gMax ? `₹${gMin}` : `₹${gMin} - ₹${gMax}`;
                  const imageCount = (g.galleryImages?.length || 0) + (g.mainImage ? 1 : 0);
                  
                  return (
                    <div key={idx} className="border border-gray-200 rounded-[16px] overflow-hidden bg-white shadow-sm flex flex-col">
                      <div className="p-4 flex gap-4 items-center border-b border-gray-100">
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                          {g.mainImage ? (
                            <img src={g.mainImage.url} alt={g.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={20}/></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {pAttrName.toLowerCase() === 'color' && (
                              <span className="w-3 h-3 rounded-full border border-gray-200 shadow-sm shrink-0" style={{ backgroundColor: g.name.toLowerCase().replace(' ', '') }}></span>
                            )}
                            <h3 className="font-bold text-[#4648d4] truncate">{g.name}</h3>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <ImageIcon size={12}/> {imageCount} Images
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 flex-1 flex flex-col justify-between bg-gray-50/50">
                        <div className="space-y-3">
                           <div className="flex justify-between items-start gap-4">
                             <span className="text-xs text-gray-500 whitespace-nowrap">Available</span>
                             <span className="text-sm font-medium text-gray-900 text-right">{g.secondaryOptions.join(' • ')}</span>
                           </div>
                           <div className="flex justify-between items-center">
                             <span className="text-xs text-gray-500">Price Range</span>
                             <span className="text-sm font-medium text-gray-900">{gPriceRange}</span>
                           </div>
                           <div className="flex justify-between items-center">
                             <span className="text-xs text-gray-500">Stock</span>
                             <span className="text-sm font-medium text-gray-900">{g.stock}</span>
                           </div>
                           <div className="flex justify-between items-center">
                             <span className="text-xs text-gray-500">Status</span>
                             <div className="flex gap-1 flex-wrap justify-end">
                               {Array.from(g.statuses).map((s, i) => <StatusBadge key={i} status={s.toLowerCase()}/>)}
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsDrawer;
