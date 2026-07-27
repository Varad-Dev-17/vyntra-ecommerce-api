import Breadcrumbs from '../../../../components/admin/ui/Breadcrumbs';
import AttributeForm from './AttributeForm';

const AddAttribute = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <Breadcrumbs items={[
          { label: 'Catalog', path: '/admin/catalog' },
          { label: 'Attributes', path: '/admin/catalog/attributes' },
          { label: 'Add Attribute' }
        ]} />
      </div>
      <AttributeForm />
    </div>
  );
};

export default AddAttribute;
