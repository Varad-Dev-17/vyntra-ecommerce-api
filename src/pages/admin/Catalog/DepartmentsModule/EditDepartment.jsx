import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Breadcrumbs from '../../../../components/admin/ui/Breadcrumbs';
import DepartmentForm from './DepartmentForm';

const EditDepartment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/departments/${id}`);
        if (response.data.success) {
          setDepartment(response.data.department);
        }
      } catch (error) {
        console.error('Error fetching department:', error);
        toast.error('Failed to load department.');
        navigate('/admin/catalog/departments');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDepartment();
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
          { label: 'Departments', path: '/admin/catalog/departments' },
          { label: 'Edit Department' }
        ]} />
      </div>
      <DepartmentForm initialData={department} isEdit={true} />
    </div>
  );
};

export default EditDepartment;
