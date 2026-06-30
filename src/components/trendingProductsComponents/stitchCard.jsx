import { forwardRef } from "react";
import { Heart, Star, ShoppingCart } from "lucide-react";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const StitchCard = forwardRef(({ product, liked, toggleLike }, ref) => {
  return (
    <div
      ref={ref}
      className="absolute left-1/2 top-1/2 will-change-transform"
      style={{
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <div
        className="rounded-xl overflow-hidden relative"
        style={{
          width: 280,
          height: 340,
          background: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.4)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            draggable={false}
            loading="eager"
          />
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase"
            style={{
              background: "rgba(70,72,212,0.85)",
              color: "white",
              fontFamily: "'Geist', sans-serif",
            }}
          >
            {product.category}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(product.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                liked[product.id]
                  ? "fill-[#4648D4] text-[#4648D4]"
                  : "text-[#4648D4]"
              }`}
            />
          </button>
        </div>

        <div className="p-3.5">
          <h3 className="font-bold text-[#1B1B23] font-['Manrope'] text-sm line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-0.5 mt-1.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-[10px] text-[#767586] ml-1">
              {product.rating}
            </span>
          </div>
          <div className="mt-2.5 flex justify-between items-center">
            <span className="font-bold text-[#1B1B23] font-['Manrope'] text-base">
              {formatPrice(product.price)}
            </span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[10px] font-semibold bg-[#4648D4] hover:bg-[#3a3cb8] transition-colors">
              <ShoppingCart className="w-3 h-3" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

StitchCard.displayName = "StitchCard";

export default StitchCard;
