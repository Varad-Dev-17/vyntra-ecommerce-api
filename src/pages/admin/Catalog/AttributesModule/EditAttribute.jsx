import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Breadcrumbs from '../../../../components/admin/ui/Breadcrumbs';
import AttributeForm from './AttributeForm';

const EditAttribute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attribute, setAttribute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttribute = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/attributes/${id}`);
        if (response.data.success) {
          setAttribute(response.data.attribute);
        }
      } catch (error) {
        console.error('Error fetching attribute:', error);
        toast.error('Failed to load attribute.');
        navigate('/admin/catalog/attributes');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttribute();
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
          { label: 'Attributes', path: '/admin/catalog/attributes' },
          { label: 'Edit Attribute' }
        ]} />
      </div>
      <AttributeForm initialData={attribute} isEdit={true} />
    </div>
  );
};

export default EditAttribute;
