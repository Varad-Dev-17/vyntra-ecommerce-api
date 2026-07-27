import Breadcrumbs from '../../../../components/admin/ui/Breadcrumbs';
import ProductForm from './ProductForm';

const EditProduct = () => {
  return (
    <div className="p-4 sm:p-6 max-w-[95%] 2xl:max-w-[1600px] mx-auto w-full">
      <div className="mb-4">
        <Breadcrumbs items={[
          { label: 'Products', path: '/admin/products' },
          { label: 'Edit Product' }
        ]} />
      </div>
      <ProductForm isEdit={true} />
    </div>
  );
};

export default EditProduct;
