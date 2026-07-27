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
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {displayImages.map((img, idx) => (
        <div key={idx} className="relative aspect-[3/4] w-full overflow-hidden bg-[#f5f5f6]">
          <img
            src={img.url}
            alt={`Product View ${idx + 1}`}
            className="w-full h-full object-cover cursor-crosshair transition-transform duration-700 hover:scale-[1.03]"
          />
        </div>
      ))}
    </div>
  );
};

export default ProductImageGrid;
