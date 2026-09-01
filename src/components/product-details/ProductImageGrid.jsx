import React from 'react';

const ProductImageGrid = ({ variant }) => {
  if (!variant) return null;

  const images = [];
  if (variant.mainImage) images.push(variant.mainImage);
  if (variant.galleryImages && variant.galleryImages.length > 0) {
    images.push(...variant.galleryImages);
  }

  const displayImages = images.slice(0, 4);

  return (
    <div className="flex overflow-x-auto snap-x md:grid md:grid-cols-2 gap-3 sm:gap-4 pb-4 md:pb-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {displayImages.map((img, idx) => (
        <div key={idx} className="relative w-[85vw] shrink-0 md:w-full aspect-[3/4] overflow-hidden bg-[#f5f5f6] snap-center">
          <img
            src={img.url}
            alt={`Product View ${idx + 1}`}
            className="w-full h-full object-cover cursor-crosshair transition-transform duration-700 md:hover:scale-[1.03]"
           loading="lazy" decoding="async" />
        </div>
      ))}
    </div>
  );
};

export default ProductImageGrid;
