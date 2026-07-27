import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Breadcrumbs from '../../../../components/admin/ui/Breadcrumbs';
import BrandForm from './BrandForm';

const EditBrand = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [brand, setBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/brands/${id}`);
        if (response.data.success) {
          setBrand(response.data.brand);
        }
      } catch (error) {
        console.error('Error fetching brand:', error);
        toast.error('Failed to load brand.');
        navigate('/admin/catalog/brands');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrand();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#4648d4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <Breadcrumbs items={[
          { label: 'Catalog', path: '/admin/catalog' },
          { label: 'Brands', path: '/admin/catalog/brands' },
          { label: 'Edit Brand' }
        ]} />
      </div>
      <BrandForm initialData={brand} isEdit={true} />
    </div>
  );
};

export default EditBrand;
