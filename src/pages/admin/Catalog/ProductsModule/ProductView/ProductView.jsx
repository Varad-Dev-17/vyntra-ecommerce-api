import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import PageLoader from '../../../../../components/common/PageLoader';
import ProductInformation from './components/ProductInformation';
import ProductAttributes from './components/ProductAttributes';
import ProductDescriptions from './components/ProductDescriptions';
import VariantGroups from './components/VariantGroups';

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      try {
        const [productRes, variantsRes] = await Promise.all([
          axios.get(`${import.meta.env.PROD ? '' : 'http://localhost:8000'}/admin/products/${id}`, { withCredentials: true }),
          axios.get(`${import.meta.env.PROD ? '' : 'http://localhost:8000'}/admin/products/${id}/variants`, { withCredentials: true })
        ]);

        if (productRes.data.success) {
          setProduct(productRes.data.data.product);
        }
        
        if (variantsRes.data.success) {
          setVariants(variantsRes.data.data || variantsRes.data.variants || []);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.error('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProductData();
  }, [id]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h2 className="text-xl font-bold text-gray-700">Product not found</h2>
        <button 
          onClick={() => navigate('/admin/products')}
          className="mt-4 flex items-center gap-2 text-[#4648d4] hover:underline"
        >
          <ArrowLeft size={16} /> Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden p-4 lg:py-8 lg:pr-8 lg:pl-12">
      
      {/* Header */}
      <div className="mb-8 flex items-center gap-4 lg:-ml-10">
        <button 
          onClick={() => navigate('/admin/products')}
          className="h-8 w-8 flex items-center justify-center text-[#0f172a] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-full transition-colors"
          title="Back to Products"
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Product Details</h1>
          <p className="text-sm text-gray-500">{product.title}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-8 custom-scrollbar">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <ProductInformation product={product} />
            <ProductAttributes attributes={product.attributes} />
          </div>
          <ProductDescriptions product={product} />
          <VariantGroups variants={variants} />
        </div>
      </div>
    </div>
  );
};

export default ProductView;
