import React from 'react';

const ProductInfo = ({ product, variant, quantity, price, color, size }) => {
  return (
    <div className="flex gap-6 items-start">
      <div className="w-24 h-32 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-200">
        <img 
          src={variant?.mainImage?.url || product?.images?.[0]?.url || 'https://via.placeholder.com/150'} 
          alt={product?.title || 'Product'} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 pt-1">
        <h3 className="font-bold text-gray-900 text-[14px] uppercase tracking-wider">{product?.brand?.name || 'Brand'}</h3>
        <p className="text-gray-600 text-[15px] mt-1">{product?.title || 'Product Name'}</p>
        <div className="text-gray-500 text-[14px] mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2">
          {color && <span>Color: <span className="font-medium text-gray-900">{color}</span></span>}
          {size && <span>Size: <span className="font-medium text-gray-900">{size}</span></span>}
          <span>Qty: <span className="font-medium text-gray-900">{quantity || 1}</span></span>
        </div>
        {price && <p className="text-[16px] font-bold text-gray-900 mt-4">₹{price}</p>}
      </div>
    </div>
  );
};

export default ProductInfo;
