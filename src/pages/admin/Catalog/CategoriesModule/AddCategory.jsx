import Breadcrumbs from '../../../../components/admin/ui/Breadcrumbs';
import CategoryForm from './CategoryForm';

const AddCategory = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <Breadcrumbs items={[
          { label: 'Catalog', path: '/admin/catalog' },
          { label: 'Categories', path: '/admin/catalog/categories' },
          { label: 'Add Category' }
        ]} />
      </div>
      <CategoryForm />
    </div>
  );
};

export default AddCategory;
