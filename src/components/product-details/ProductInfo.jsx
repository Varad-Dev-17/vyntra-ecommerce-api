import React from 'react';
import { ShoppingBag, Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axiosConfig';
import { useCart } from '../../context/CartContext';

const ProductInfo = ({ product, activeVariant, onVariantChange }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { updateCartCount, isVariantInCart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!product || !activeVariant) return null;

  const inBag = isVariantInCart(activeVariant._id);

  const handleAddToBag = async () => {
    if (!user) {
      navigate("/signin", { state: { from: location } });
      return;
    }
    if (inBag) {
      navigate("/bag");
      return;
    }
    try {
      const res = await api.post("/cart", {
        productId: product._id,
        variantId: activeVariant._id,
        quantity: 1,
      });
      if (res.data.success) {
        updateCartCount(res.data.data.itemCount);
        refreshCart(); // Fetch full cart to update isVariantInCart state
        toast.success("Added to bag!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to bag");
    }
  };

  // Formatter for INR
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // 1. Pricing
  const price = activeVariant.price || 0;
  const mrp = activeVariant.mrp || 0;
  let discount = 0;
  if (mrp > price && mrp > 0) {
    discount = Math.round(((mrp - price) / mrp) * 100);
  }

  // 2. Color Variants Mapping
  const colorVariantsMap = new Map();
  product.variants?.forEach(v => {
    const colorAttr = v.attributes?.find(a => a.attribute?.name?.toLowerCase() === 'color');
    const colorName = colorAttr?.option?.displayName || 'default';
    if (!colorVariantsMap.has(colorName)) {
      colorVariantsMap.set(colorName, v);
    }
  });
  const uniqueColorVariants = Array.from(colorVariantsMap.values());

  const activeColorAttr = activeVariant.attributes?.find(a => a.attribute?.name?.toLowerCase() === 'color');
  const activeColorName = activeColorAttr?.option?.displayName || 'default';

  // 3. Size Variants Mapping for the Active Color
  const variantsOfActiveColor = product.variants?.filter(v => {
    const cAttr = v.attributes?.find(a => a.attribute?.name?.toLowerCase() === 'color');
    const cName = cAttr?.option?.displayName || 'default';
    return cName === activeColorName;
  }) || [];

  const availableSizes = variantsOfActiveColor.map(v => {
    const sizeAttr = v.attributes?.find(a => a.attribute?.name?.toLowerCase() === 'size');
    return {
      name: sizeAttr?.option?.displayName,
      stock: v.stock,
      variantId: v._id,
      isActive: v._id === activeVariant._id
    };
  }).filter(s => s.name);

  return (
    <div className="flex flex-col">
      {/* Brand & Title */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#282c3f] mb-1">{product.brand?.name || product.brand || 'Vyntra'}</h1>
        <h2 className="text-xl text-[#535766] font-normal leading-relaxed">{product.title}</h2>
      </div>

      <div className="border-b border-[#eaeaec] mb-4" />

      {/* Pricing */}
      <div className="mb-4">
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-[22px] font-bold text-[#282c3f]">{formatPrice(price)}</span>
          {mrp > price && (
            <>
              <span className="text-[20px] text-[#7e818c] font-normal">
                MRP <span className="line-through">{formatPrice(mrp)}</span>
              </span>
              <span className="text-[20px] font-bold text-[#ff905a]">({discount}% OFF)</span>
            </>
          )}
        </div>
      </div>

      {/* More Colors */}
      {uniqueColorVariants.length > 1 && (
        <div className="mb-6">
          <h4 className="text-[14px] font-bold text-[#282c3f] uppercase tracking-wide mb-3">More Colors</h4>
          <div className="flex flex-wrap gap-2">
            {uniqueColorVariants.map((v) => {
              const cAttr = v.attributes?.find(a => a.attribute?.name?.toLowerCase() === 'color');
              const cName = cAttr?.option?.displayName || 'default';
              const isSelected = cName === activeColorName;
              return (
                <button
                  key={v._id}
                  onClick={() => onVariantChange(v._id)}
                  className={`relative w-16 h-20 rounded overflow-hidden border-2 transition-all ${isSelected ? 'border-[#4F46E5]' : 'border-transparent hover:border-[#d4d5d9]'}`}
                  title={cName}
                >
                  <img src={v.mainImage?.url} alt={cName} className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Select Size */}
      {availableSizes.length > 0 && (
        <div className="mb-8">
          <div className="mb-4">
            <h4 className="text-[14px] font-bold text-[#282c3f] uppercase tracking-wide">Select Size</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {availableSizes.map((size) => {
              const isOutOfStock = size.stock <= 0;
              return (
                <button
                  key={size.variantId}
                  onClick={() => !isOutOfStock && onVariantChange(size.variantId)}
                  disabled={isOutOfStock}
                  className={`relative overflow-hidden w-12 h-12 rounded-full border flex items-center justify-center text-[14px] font-bold transition-all
                    ${
                      isOutOfStock 
                        ? 'border-red-500 text-[#282c3f] cursor-not-allowed bg-white' 
                        : size.isActive 
                          ? 'border-[#4F46E5] text-[#4F46E5] cursor-pointer bg-white' 
                          : 'border-[#bfc0c6] text-[#282c3f] hover:border-[#282c3f] cursor-pointer bg-white'
                    }
                  `}
                >
                  {size.name}
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[140%] h-[1.5px] bg-red-500 -rotate-45" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button 
          onClick={handleAddToBag}
          className="flex-1 cursor-pointer bg-[#4F46E5] text-white border border-[#4F46E5] py-4 rounded font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-white hover:text-[#4F46E5] transition-colors"
        >
          <ShoppingBag size={20} />
          {inBag ? "GO TO BAG" : "ADD TO BAG"}
        </button>
        <button 
          onClick={async () => {
            if (!user) {
              navigate("/signin", { state: { from: location } });
              return;
            }
            const wasWishlisted = isInWishlist(product._id, activeVariant._id);
            const res = await toggleWishlist(product._id, activeVariant._id);
            if (!res?.success && res?.message) {
               toast.error(res.message);
            } else if (res?.success) {
               toast.success(wasWishlisted ? "Removed from wishlist" : "Added to wishlist");
            }
          }}
          className={`group flex-1 bg-white border py-4 rounded font-bold text-[15px] flex items-center justify-center gap-2 transition-colors ${
            isInWishlist(product._id, activeVariant._id)
              ? "border-[#f23661] text-[#f23661]"
              : "border-[#d4d5d9] text-[#282c3f] hover:border-[#f23661] hover:text-[#f23661]"
          }`}
        >
          <Heart 
            size={20} 
            className={!isInWishlist(product._id, activeVariant._id) ? "group-hover:text-[#f23661] group-hover:fill-[#f23661]" : ""}
            fill={isInWishlist(product._id, activeVariant._id) ? "currentColor" : "none"} 
            strokeWidth={isInWishlist(product._id, activeVariant._id) ? 0 : 2} 
          />
          {isInWishlist(product._id, activeVariant._id) ? "WISHLISTED" : "WISHLIST"}
        </button>
      </div>

      <div className="border-b border-[#eaeaec] mb-6" />

      {/* Product Details */}
      {(product.longDescription || product.shortDescription) && (
        <div className="mb-8">
          <h4 className="text-[14px] font-bold text-[#282c3f] uppercase tracking-wide mb-3 flex items-center gap-2">
            Product Details
          </h4>
          <div className="text-[14px] leading-relaxed text-[#282c3f] whitespace-pre-wrap">
            {product.longDescription || product.shortDescription}
          </div>
        </div>
      )}

      {/* Specifications */}
      {product.attributes && product.attributes.length > 0 && (
        <div>
          <h4 className="text-[14px] font-bold text-[#282c3f] uppercase tracking-wide mb-4">
            Specifications
          </h4>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {product.attributes.map((attr, idx) => {
              if (!attr.attribute?.name) return null;
              
              const formattedValues = attr.values?.map(val => 
                val ? val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ''
              ).join(", ");

              return (
                <div key={idx} className="border-b border-[#eaeaec] pb-3">
                  <div className="text-[12px] text-[#7e818c] mb-1">{attr.attribute.name}</div>
                  <div className="text-[14px] text-[#282c3f]">{formattedValues}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
