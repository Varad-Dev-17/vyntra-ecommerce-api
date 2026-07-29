import React, { useState, useEffect, useMemo } from 'react';

const ExchangeSection = ({ requestedVariantId, setRequestedVariantId, productVariants, currentVariantId, currentPrice }) => {
  const [selectedColor, setSelectedColor] = useState('');
  
  // Extract all unique colors
  const colors = useMemo(() => {
    if (!productVariants) return [];
    const colorSet = new Set();
    productVariants.forEach(variant => {
      variant.attributes?.forEach(attr => {
        if (attr.attribute?.name?.toLowerCase() === 'color') {
          colorSet.add(attr.option?.displayName);
        }
      });
    });
    return Array.from(colorSet);
  }, [productVariants]);

  // When variants load, set initial color to current variant's color if possible
  useEffect(() => {
    if (colors.length > 0 && !selectedColor) {
      const currentVariant = productVariants.find(v => v._id === currentVariantId);
      let defaultColor = colors[0];
      if (currentVariant) {
        currentVariant.attributes?.forEach(attr => {
          if (attr.attribute?.name?.toLowerCase() === 'color') {
            defaultColor = attr.option?.displayName;
          }
        });
      }
      setSelectedColor(defaultColor);
    }
  }, [colors, currentVariantId, productVariants, selectedColor]);

  // Filter variants for the selected color
  const colorVariants = useMemo(() => {
    if (!selectedColor || !productVariants) return [];
    return productVariants.filter(variant => 
      variant.attributes?.some(attr => 
        attr.attribute?.name?.toLowerCase() === 'color' && 
        attr.option?.displayName === selectedColor
      )
    );
  }, [productVariants, selectedColor]);

  const selectedVariant = productVariants?.find(v => v._id === requestedVariantId);
  const currentVariant = productVariants?.find(v => v._id === currentVariantId);
  const priceDifference = selectedVariant ? selectedVariant.price - currentPrice : 0;

  const getAttributes = (variant) => {
    let color = '';
    let size = '';
    variant?.attributes?.forEach(attr => {
      if (attr.attribute?.name?.toLowerCase() === 'color') color = attr.option?.displayName;
      if (attr.attribute?.name?.toLowerCase() === 'size') size = attr.option?.displayName;
    });
    return { color, size };
  };

  const currAttrs = getAttributes(currentVariant);
  const reqAttrs = getAttributes(selectedVariant);

  return (
    <div className="space-y-6">
      {colors.length > 0 && (
        <div>
          <label className="block text-[14px] font-bold text-gray-900 mb-3">Select Color</label>
          <div className="flex flex-wrap gap-3">
            {colors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  setSelectedColor(color);
                  setRequestedVariantId(''); // Reset size selection when color changes
                }}
                className={`px-4 py-2 rounded-full border text-[14px] font-medium transition-colors ${
                  selectedColor === color 
                    ? 'border-[#4F46E5] bg-[#eef2ff] text-[#4F46E5]' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-[14px] font-bold text-gray-900 mb-3">Select Size</label>
        <div className="flex flex-wrap gap-3 mt-2 pt-1">
          {colorVariants.length > 0 ? (
            colorVariants.map((variant) => {
              let size = '';
              variant.attributes?.forEach(attr => {
                if (attr.attribute?.name?.toLowerCase() === 'size') {
                  size = attr.option?.displayName;
                }
              });
              
              if (!size) return null; // Fallback if no size attribute

              const isCurrent = variant._id === currentVariantId;
              const isOutOfStock = variant.status === 'Inactive' || variant.stock <= 0;
              const isDisabled = isCurrent || isOutOfStock;

              return (
                <div key={variant._id} className="relative group">
                  <button
                    type="button"
                    onClick={() => !isDisabled && setRequestedVariantId(variant._id)}
                    disabled={isDisabled}
                    className={`min-w-[70px] h-[52px] rounded-lg flex flex-col items-center justify-center border transition-colors px-3 ${
                      requestedVariantId === variant._id 
                        ? 'border-[#4F46E5] bg-[#4F46E5] text-white' 
                        : isDisabled
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-[14px] font-bold leading-tight">{size}</span>
                    <span className={`text-[12px] font-medium leading-tight ${requestedVariantId === variant._id ? 'text-indigo-200' : 'text-gray-500'}`}>₹{variant.price}</span>
                  </button>
                  {/* Tooltip for disabled reasons */}
                  {isDisabled && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-10">
                      {isCurrent ? 'Current Variant' : 'Out of Stock'}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-[13px] text-gray-500">No options available.</p>
          )}
        </div>
      </div>

      {selectedVariant && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6 space-y-5">
          {/* Variants Comparison */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            {/* Current Variant */}
            <div className="flex-1">
              <p className="text-[12px] uppercase font-bold text-gray-500 tracking-wider mb-2">Current Variant</p>
              <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                <p className="text-[13px] text-gray-600 mb-1">Color: <span className="font-semibold text-gray-900">{currAttrs.color}</span></p>
                <p className="text-[13px] text-gray-600 mb-1">Size: <span className="font-semibold text-gray-900">{currAttrs.size}</span></p>
                <p className="text-[13px] text-gray-600">Price: <span className="font-semibold text-gray-900">₹{currentPrice}</span></p>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex flex-col items-center justify-center text-gray-400 px-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <div className="flex md:hidden justify-center text-gray-400 py-1">
              <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>

            {/* Requested Variant */}
            <div className="flex-1">
              <p className="text-[12px] uppercase font-bold text-[#4F46E5] tracking-wider mb-2">Requested Variant</p>
              <div className="bg-white p-3 rounded-md border border-[#c7d2fe] shadow-sm">
                <p className="text-[13px] text-gray-600 mb-1">Color: <span className="font-semibold text-gray-900">{reqAttrs.color}</span></p>
                <p className="text-[13px] text-gray-600 mb-1">Size: <span className="font-semibold text-gray-900">{reqAttrs.size}</span></p>
                <p className="text-[13px] text-gray-600">Price: <span className="font-semibold text-gray-900">₹{selectedVariant.price}</span></p>
              </div>
            </div>
          </div>

          {/* Price Calculation */}
          <div className="border-t border-gray-200 pt-5">
            <p className="text-[12px] uppercase font-bold text-gray-500 tracking-wider mb-3">Price Difference</p>
            <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-gray-200 text-[14px] font-mono text-gray-700 mb-4 shadow-sm">
              <span>₹{selectedVariant.price}</span>
              <span className="text-gray-400">-</span>
              <span>₹{currentPrice}</span>
              <span className="text-gray-400">=</span>
              <span className={`font-bold ${priceDifference > 0 ? 'text-red-600' : priceDifference < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {priceDifference > 0 ? '+' : ''}₹{priceDifference}
              </span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <p className="text-[15px] font-bold text-gray-900">
                {priceDifference > 0 
                  ? 'Additional Amount to Pay' 
                  : priceDifference < 0 
                    ? 'Refund Amount' 
                    : 'No Price Difference'}
              </p>
              <p className={`text-[20px] font-bold ${priceDifference > 0 ? 'text-[#4F46E5]' : priceDifference < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {priceDifference !== 0 ? `₹${Math.abs(priceDifference)}` : '-'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeSection;
