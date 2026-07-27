import Breadcrumbs from '../../../../components/admin/ui/Breadcrumbs';
import DepartmentForm from './DepartmentForm';

const AddDepartment = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <Breadcrumbs items={[
          { label: 'Catalog', path: '/admin/catalog' },
          { label: 'Departments', path: '/admin/catalog/departments' },
          { label: 'Add Department' }
        ]} />
      </div>
      <DepartmentForm />
    </div>
  );
};

export default AddDepartment;
