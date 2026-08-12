import { TriangleAlert, Maximize2 } from 'lucide-react';

const ProductDescriptions = ({ product }) => {
  return (
    <div className="border border-gray-300 p-6 bg-white">
      <div className="flex flex-col gap-6">
        
        {/* Short Description */}
        <div className="flex gap-4 items-start">
          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <TriangleAlert size={16} className="text-blue-500" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-gray-700 mb-1">Short Description</p>
            <p className="text-[13px] text-gray-900 leading-relaxed">
              {product.shortDescription || 'No short description provided.'}
            </p>
          </div>
        </div>

        {/* Long Description */}
        <div className="flex gap-4 items-start">
          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Maximize2 size={16} className="text-blue-500" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-gray-700 mb-1">Long Description</p>
            <p className="text-[13px] text-gray-900 leading-relaxed whitespace-pre-wrap">
              {product.longDescription || 'No long description provided.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDescriptions;
