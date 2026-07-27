import Breadcrumbs from '../../../../components/admin/ui/Breadcrumbs';
import BrandForm from './BrandForm';

const AddBrand = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <Breadcrumbs items={[
          { label: 'Catalog', path: '/admin/catalog' },
          { label: 'Brands', path: '/admin/catalog/brands' },
          { label: 'Add Brand' }
        ]} />
      </div>
      <BrandForm />
    </div>
  );
};

export default AddBrand;
