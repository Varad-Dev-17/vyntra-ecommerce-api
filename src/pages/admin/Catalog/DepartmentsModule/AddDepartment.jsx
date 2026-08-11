import Breadcrumbs from '../../../../components/admin/ui/Breadcrumbs';
import DepartmentForm from './DepartmentForm';

const AddDepartment = () => {
  return (
    <div className="w-full">
      <div className="mb-6">
        <Breadcrumbs items={[
          { label: 'Catalog', path: '/admin/catalog' },
          { label: 'Departments', path: '/admin/catalog/departments' },
          { label: 'Add Department' }
        ]} />
      </div>
      <div className="max-w-5xl mx-auto">
        <DepartmentForm />
      </div>
    </div>
  );
};

export default AddDepartment;
