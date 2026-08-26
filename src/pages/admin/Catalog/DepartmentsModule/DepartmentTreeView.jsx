import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Folder, Tag, ChevronDown, ChevronRight, Hash, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import PageCard from '../../../../components/admin/ui/PageCard';

const api = axios.create({
  baseURL: import.meta.env.PROD ? '' : 'http://localhost:8000',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const NodeCard = ({ title, icon: Icon, isSelected, onClick, isLeaf = false, hasConnector = false }) => {
  return (
    <div 
      className={`relative w-full h-[48px] flex items-center justify-between px-3 rounded-lg border transition-all ${
        isSelected ? 'border-green-300 bg-[#f0fdf4] shadow-sm z-20' : 'border-gray-200 bg-white hover:border-gray-300 z-10'
      } ${!isLeaf ? 'cursor-pointer' : ''}`}
      onClick={!isLeaf ? onClick : undefined}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {Icon && <Icon size={16} className={`shrink-0 ${isSelected ? 'text-green-600' : 'text-gray-400'}`} />}
        <span className={`text-sm font-semibold truncate ${isSelected ? 'text-green-800' : 'text-gray-700'}`}>
          {title}
        </span>
      </div>
      
      {!isLeaf && (
        <div className={`shrink-0 ml-2 ${isSelected ? 'text-green-600' : 'text-gray-400'}`}>
          {isSelected ? <ChevronDown size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
        </div>
      )}

      {isSelected && hasConnector && (
        <>
           <div className="absolute left-full top-1/2 w-[40px] border-t-2 border-green-400 pointer-events-none"></div>
           <div className="absolute -right-[4px] top-1/2 w-2 h-2 rounded-full bg-green-500 transform -translate-y-1/2 pointer-events-none"></div>
        </>
      )}
    </div>
  );
};

const EmptySlot = () => (
  <div className="w-full h-[48px] flex items-center justify-center">
    <span className="text-gray-300 font-bold">-</span>
  </div>
);

const LoadingNode = () => (
  <div className="w-full h-[48px] flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
    <Loader2 size={16} className="animate-spin text-gray-400 mr-2" />
    <span className="text-sm text-gray-500 font-medium">Loading...</span>
  </div>
);

const DepartmentTreeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState({ department: null, brands: [], categories: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lazy loading states
  const [attributesCache, setAttributesCache] = useState({});
  const [optionsCache, setOptionsCache] = useState({});
  const [isLoadingCol2, setIsLoadingCol2] = useState(false);
  const [isLoadingCol3, setIsLoadingCol3] = useState(false);

  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedAttribute, setExpandedAttribute] = useState(null);

  // 1. Initial Load: Only fetch department, brands, categories
  useEffect(() => {
    const fetchTreeData = async () => {
      setIsLoading(true);
      try {
        const [deptRes, brandsRes, categoriesRes] = await Promise.all([
          api.get(`/departments/${id}`),
          api.get(`/brands/department/${id}`),
          api.get(`/categories/department/${id}`)
        ]);

        setTreeData({
          department: deptRes.data.department,
          brands: brandsRes.data.brands || [],
          categories: categoriesRes.data.categories || []
        });
      } catch (err) {
        console.error('Failed to load tree data', err);
        setError('Failed to load organizational hierarchy.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchTreeData();
  }, [id]);

  // 2. Handle Category Click (Fetch attributes lazily)
  const handleCategoryClick = async (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      setExpandedAttribute(null);
      return;
    }
    
    setExpandedCategory(categoryId);
    setExpandedAttribute(null); // Reset child col

    if (!attributesCache[categoryId]) {
      setIsLoadingCol2(true);
      try {
        const attrRes = await api.get(`/attributes/category/${categoryId}`);
        setAttributesCache(prev => ({ ...prev, [categoryId]: attrRes.data.attributes || [] }));
      } catch (err) {
        console.error('Failed to fetch attributes', err);
      } finally {
        setIsLoadingCol2(false);
      }
    }
  };

  // 3. Handle Attribute Click (Fetch options lazily)
  const handleAttributeClick = async (attrId) => {
    if (expandedAttribute === attrId) {
      setExpandedAttribute(null);
      return;
    }
    
    setExpandedAttribute(attrId);

    if (!optionsCache[attrId]) {
      setIsLoadingCol3(true);
      try {
        const optRes = await api.get(`/attribute-options/attribute/${attrId}`);
        setOptionsCache(prev => ({ ...prev, [attrId]: optRes.data.options || [] }));
      } catch (err) {
        console.error('Failed to fetch options', err);
      } finally {
        setIsLoadingCol3(false);
      }
    }
  };

  // 4. Compute Grid Layout
  const { col1, col2, col3, catIndex, attrIndex } = useMemo(() => {
    if (!treeData.department) return { col1: [], col2: [], col3: [], catIndex: -1, attrIndex: -1 };
    
    const categories = treeData.categories;
    const cIdx = categories.findIndex(c => c._id === expandedCategory);
    
    const attributes = expandedCategory && attributesCache[expandedCategory] ? attributesCache[expandedCategory] : [];
    const aIdx = attributes.findIndex(a => a._id === expandedAttribute);
    
    const options = expandedAttribute && optionsCache[expandedAttribute] ? optionsCache[expandedAttribute] : [];

    const isFetchingAttr = isLoadingCol2 && expandedCategory;
    const isFetchingOpt = isLoadingCol3 && expandedAttribute;
    
    const attrCount = isFetchingAttr ? 1 : attributes.length;
    const optCount = isFetchingOpt ? 1 : options.length;

    const maxRows = Math.max(
      categories.length,
      cIdx >= 0 ? cIdx + attrCount : 0,
      (cIdx >= 0 && aIdx >= 0) ? cIdx + aIdx + optCount : 0
    );

    const c1 = [];
    const c2 = [];
    const c3 = [];

    for (let i = 0; i < maxRows; i++) {
      c1.push(categories[i] || null);
      
      if (cIdx >= 0 && i >= cIdx && i < cIdx + attrCount) {
        c2.push(isFetchingAttr ? { _loading: true } : attributes[i - cIdx]);
      } else {
        c2.push(null);
      }

      if (cIdx >= 0 && aIdx >= 0 && i >= cIdx + aIdx && i < cIdx + aIdx + optCount) {
        c3.push(isFetchingOpt ? { _loading: true } : options[i - (cIdx + aIdx)]);
      } else {
        c3.push(null);
      }
    }

    return { col1: c1, col2: c2, col3: c3, catIndex: cIdx, attrIndex: aIdx };
  }, [treeData, expandedCategory, expandedAttribute, attributesCache, optionsCache, isLoadingCol2, isLoadingCol3]);


  if (isLoading) {
    return (
      <PageCard>
        <div className="flex flex-col items-center justify-center py-32 h-full">
          <Loader2 size={48} className="animate-spin text-[#4648d4] mb-4" />
          <p className="text-gray-500 font-medium">Constructing cascading grid...</p>
        </div>
      </PageCard>
    );
  }

  if (error || !treeData.department) {
    return (
      <PageCard>
        <div className="flex flex-col items-center justify-center py-32 h-full">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={() => navigate('/admin/catalog/departments')} className="text-[#4648d4] hover:underline">
            Go Back
          </button>
        </div>
      </PageCard>
    );
  }

  return (
    <PageCard>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/catalog/departments')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{treeData.department.name} Grid View</h1>
          <p className="text-sm text-gray-500">Cascading row-aligned grid of catalog entities.</p>
        </div>
      </div>

      <div className="w-full bg-[#fcfcfd] rounded-xl p-8 min-h-[600px] overflow-x-auto border border-gray-100">
        <div className="flex gap-12 min-w-max">
          
          {/* Brands Block (Standalone) */}
          <div className="w-[220px] shrink-0">
            <h2 className="text-lg font-bold text-[#1e3a8a] mb-6 pl-1">Brands</h2>
            <div className="flex flex-col gap-2">
              {treeData.brands.length === 0 ? (
                <span className="text-gray-400 text-sm">No brands.</span>
              ) : (
                treeData.brands.map(b => (
                  <NodeCard key={b._id} title={b.name} icon={Tag} isLeaf={true} />
                ))
              )}
            </div>
          </div>

          <div className="w-px bg-gray-200 mt-2 mb-8"></div>

          {/* Cascading Grid for Categories */}
          <div>
            <div className="flex gap-[40px] mb-6 px-1">
               <h2 className="text-lg font-bold text-[#1e3a8a] w-[220px]">Category</h2>
               {catIndex >= 0 && <h2 className="text-lg font-bold text-[#1e3a8a] w-[220px]">Attributes</h2>}
               {catIndex >= 0 && attrIndex >= 0 && <h2 className="text-lg font-bold text-[#1e3a8a] w-[220px]">Options</h2>}
            </div>

            <div className="flex gap-[40px] relative">
              
              {/* Column 1: Categories */}
              <div className="w-[220px] flex flex-col gap-2 relative">
                {col1.map((item, i) => item ? (
                  <NodeCard 
                    key={`c1-${i}`}
                    title={item.name}
                    icon={Folder}
                    isSelected={expandedCategory === item._id}
                    onClick={() => handleCategoryClick(item._id)}
                    hasConnector={expandedCategory === item._id && (isLoadingCol2 || (attributesCache[item._id] && attributesCache[item._id].length > 0))}
                  />
                ) : <EmptySlot key={`c1-e-${i}`} />)}
                <div className="absolute top-0 -right-[20px] bottom-0 w-px border-l-2 border-dashed border-gray-200 pointer-events-none"></div>
              </div>

              {/* Column 2: Attributes */}
              {(isLoadingCol2 || col2.some(Boolean)) && (
                <div className="w-[220px] flex flex-col gap-2 relative">
                  {col2.map((item, i) => {
                    if (!item) return <EmptySlot key={`c2-e-${i}`} />;
                    if (item._loading) return <LoadingNode key={`c2-l-${i}`} />;
                    
                    return (
                      <NodeCard 
                        key={`c2-${i}`}
                        title={item.name}
                        icon={Hash}
                        isSelected={expandedAttribute === item._id}
                        onClick={() => handleAttributeClick(item._id)}
                        hasConnector={expandedAttribute === item._id && (isLoadingCol3 || (optionsCache[item._id] && optionsCache[item._id].length > 0))}
                      />
                    );
                  })}
                  <div className="absolute top-0 -right-[20px] bottom-0 w-px border-l-2 border-dashed border-gray-200 pointer-events-none"></div>
                </div>
              )}

              {/* Column 3: Options */}
              {(isLoadingCol3 || col3.some(Boolean)) && (
                <div className="w-[220px] flex flex-col gap-2">
                  {col3.map((item, i) => {
                    if (!item) return <EmptySlot key={`c3-e-${i}`} />;
                    if (item._loading) return <LoadingNode key={`c3-l-${i}`} />;

                    return (
                      <NodeCard 
                        key={`c3-${i}`}
                        title={item.displayName || item.value}
                        icon={CheckCircle2}
                        isLeaf={true}
                      />
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </PageCard>
  );
};

export default DepartmentTreeView;
