import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Star, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const staticNewArrivals = [
  {
    id: "static-1",
    brand: "Biba",
    title: "Women Printed Cotton Kurta",
    slug: "biba-women-printed-kurta",
    price: 600,
    mrp: 650,
    discountPercentage: 8,
    images: [{ url: "/home/cat_fashion_1785433098747.png" }],
    availableSizes: ["S", "M", "L"],
    rating: 4.5,
    ratingCount: 24,
  },
  {
    id: "static-2",
    brand: "Peter England",
    title: "Men's Polo Collar T-Shirt",
    slug: "peter-england-polo-tshirt",
    price: 1499,
    mrp: 1999,
    discountPercentage: 25,
    images: [{ url: "/home/cat_fashion_1785433098747.png" }],
    availableSizes: ["M", "L", "XL"],
    rating: 4.3,
    ratingCount: 18,
  },
  {
    id: "static-3",
    brand: "Apple",
    title: "MacBook Air M2 13-inch",
    slug: "apple-macbook-air-m2",
    price: 80000,
    mrp: 90000,
    discountPercentage: 11,
    images: [{ url: "/home/cat_electronics_1785433088900.png" }],
    availableSizes: ["Standard"],
    rating: 4.9,
    ratingCount: 112,
  },
  {
    id: "static-4",
    brand: "Nike",
    title: "Men Dri-FIT Polo T-Shirt",
    slug: "nike-polo-tshirt",
    price: 1259,
    mrp: 1999,
    discountPercentage: 37,
    images: [{ url: "/home/cat_sneakers_1785433154388.png" }],
    availableSizes: ["S", "M", "L", "XL"],
    rating: 4.7,
    ratingCount: 45,
  },
  {
    id: "static-5",
    brand: "Louis Philippe",
    title: "Men Formal Cotton Shirt",
    slug: "louis-philippe-mens-shirt",
    price: 1999,
    mrp: 2499,
    discountPercentage: 20,
    images: [{ url: "/home/cat_fashion_1785433098747.png" }],
    availableSizes: ["M", "L", "XXL"],
    rating: 4.4,
    ratingCount: 31,
  },
  {
    id: "static-6",
    brand: "Raymond",
    title: "Men Slim Fit Casual T-Shirt",
    slug: "raymond-mens-tshirt",
    price: 999,
    mrp: 1499,
    discountPercentage: 33,
    images: [{ url: "/home/cat_fashion_1785433098747.png" }],
    availableSizes: ["M", "L"],
    rating: 4.2,
    ratingCount: 14,
  },
  {
    id: "static-7",
    brand: "Peter England",
    title: "Men Blue Cotton Formal Shirt",
    slug: "peter-england-mens-shirt",
    price: 1199,
    mrp: 1699,
    discountPercentage: 29,
    images: [{ url: "/home/cat_fashion_1785433098747.png" }],
    availableSizes: ["38", "40", "42"],
    rating: 4.6,
    ratingCount: 29,
  },
  {
    id: "static-8",
    brand: "Manyavar",
    title: "Men Black Casual Button-Down",
    slug: "manyavar-mens-casual-shirt",
    price: 1799,
    mrp: 2299,
    discountPercentage: 22,
    images: [{ url: "/home/cat_fashion_1785433098747.png" }],
    availableSizes: ["M", "L", "XL"],
    rating: 4.5,
    ratingCount: 19,
  },
  {
    id: "static-9",
    brand: "Raymond",
    title: "Men Pure Cotton Formal Shirt",
    slug: "raymond-formal-shirt-white",
    price: 2499,
    mrp: 2999,
    discountPercentage: 17,
    images: [{ url: "/home/cat_fashion_1785433098747.png" }],
    availableSizes: ["40", "42", "44"],
    rating: 4.8,
    ratingCount: 52,
  },
  {
    id: "static-10",
    brand: "Vyntra Luxe",
    title: "Limited Edition Designer Watch",
    slug: "vyntra-luxe-watch",
    price: 4999,
    mrp: 7999,
    discountPercentage: 38,
    images: [{ url: "/home/cat_luxury_1785433108279.png" }],
    availableSizes: ["One Size"],
    rating: 5.0,
    ratingCount: 16,
  },
  {
    id: "static-11",
    brand: "Titan",
    title: "Analog Men's Watch",
    slug: "titan-analog-watch",
    price: 2499,
    mrp: 3999,
    discountPercentage: 37,
    images: [{ url: "/home/cat_luxury_1785433108279.png" }],
    availableSizes: ["One Size"],
    rating: 4.6,
    ratingCount: 58,
  },
  {
    id: "static-12",
    brand: "Puma",
    title: "Men's Running Shoes",
    slug: "puma-running-shoes",
    price: 2999,
    mrp: 4999,
    discountPercentage: 40,
    images: [{ url: "/home/cat_sneakers_1785433154388.png" }],
    availableSizes: ["7", "8", "9", "10"],
    rating: 4.5,
    ratingCount: 89,
  },
  {
    id: "static-13",
    brand: "H&M",
    title: "Women Relaxed Fit Jeans",
    slug: "hm-women-jeans",
    price: 1499,
    mrp: 2299,
    discountPercentage: 34,
    images: [{ url: "/home/cat_fashion_1785433098747.png" }],
    availableSizes: ["28", "30", "32"],
    rating: 4.3,
    ratingCount: 42,
  },
  {
    id: "static-14",
    brand: "Philips",
    title: "Multi Grooming Kit",
    slug: "philips-grooming-kit",
    price: 1199,
    mrp: 1599,
    discountPercentage: 25,
    images: [{ url: "/home/cat_electronics_1785433088900.png" }],
    availableSizes: ["Standard"],
    rating: 4.8,
    ratingCount: 210,
  },
  {
    id: "static-15",
    brand: "L'Oreal",
    title: "Revitalift Night Cream",
    slug: "loreal-night-cream",
    price: 899,
    mrp: 1299,
    discountPercentage: 30,
    images: [{ url: "/home/cat_beauty_1785433130784.png" }],
    availableSizes: ["50ml"],
    rating: 4.4,
    ratingCount: 150,
  },
];

const HomeArrivalCard = ({ product }) => {
  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col h-full bg-white cursor-pointer transition-transform duration-300 ease-out hover:-translate-y-1 block rounded-sm shadow-sm hover:shadow-md overflow-hidden"
    >
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-50">
        {product.images?.[0]?.url && (
          <img
            src={product.images[0].url}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        )}

        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.rating ? (
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow text-[11px] font-extrabold text-[#111827]">
              <span>{product.rating}</span>
              <Star size={11} className="fill-[#FFB800] text-[#FFB800] -ml-0.5" />
              <span className="text-gray-300 font-normal">|</span>
              <span className="text-[#111827] font-bold">{product.ratingCount}</span>
            </div>
          ) : (
            <div className="bg-white px-2.5 py-1 rounded-full shadow text-[11px] font-bold text-[#111827] uppercase tracking-wider">
              New
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#111827]">
          <ArrowUpRight size={16} strokeWidth={2} />
        </div>
      </div>

      <div className="p-3 bg-white flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#4F46E5] mb-1 line-clamp-1">
            {product.brand}
          </h3>
          <p className="text-[14px] font-semibold text-[#111827] mb-2 line-clamp-1 group-hover:text-[#4F46E5] transition-colors">
            {product.title}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gray-100">
          <span className="text-[15px] font-extrabold text-[#111827]">
            {formatPrice(product.price)}
          </span>
          {product.mrp > product.price && (
            <>
              <span className="text-[13px] text-[#6B7280] line-through font-normal">
                {formatPrice(product.mrp)}
              </span>
              <span className="text-[12px] font-bold text-[#ff905a]">
                ({product.discountPercentage}% OFF)
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

const HomeNewArrivalsSection = ({ title, subtitle }) => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const track = trackRef.current;
      const container = track.parentElement;
      const getScrollAmount = () => {
        const style = window.getComputedStyle(container);
        const padding = parseFloat(style.paddingLeft || 0) + parseFloat(style.paddingRight || 0);
        return -(track.scrollWidth - container.offsetWidth + padding);
      };

      gsap.to(track, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${Math.abs(getScrollAmount())}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white pt-12 sm:pt-17 md:pt-20 pb-8 overflow-hidden h-screen flex flex-col justify-center relative z-10"
    >
      <div className="max-w-[1600px] mx-auto w-full px-4 md:px-8 lg:px-12 mb-6 sm:mb-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-4">
          <h2 className="text-3xl sm:text-[40px] md:text-[56px] lg:text-[68px] font-bold text-[#111827] leading-[1.1] tracking-[-0.02em]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[15px] md:text-[16px] font-normal text-[#6B7280] leading-[1.6] mt-2">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Pinned Horizontal Runway Track */}
      <div className="w-full overflow-hidden px-4 md:px-8 lg:px-12 pb-6">
        <div
          ref={trackRef}
          className="flex gap-4 sm:gap-5 md:gap-6 w-max will-change-transform"
        >
          {staticNewArrivals.map((product) => (
            <div
              key={product.id}
              className="w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] shrink-0"
            >
              <HomeArrivalCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeNewArrivalsSection;
