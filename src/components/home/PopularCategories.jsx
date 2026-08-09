import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const categories = [
  { name: "Electronics", image: "/home/cat_electronics_1785433088900.png", slug: "electronics" },
  { name: "Fashion", image: "/home/cat_fashion_1785433098747.png", slug: "fashion" },
  { name: "Luxury", image: "/home/cat_luxury_1785433108279.png", slug: "luxury" },
  { name: "Home Decor", image: "/home/cat_decor_1785433119539.png", slug: "home-decor" },
  { name: "Health & Beauty", image: "/home/cat_beauty_1785433130784.png", slug: "health-beauty" },
  { name: "Groceries", image: "/home/cat_groceries_1785433143220.png", slug: "groceries" },
  { name: "Sneakers", image: "/home/cat_sneakers_1785433154388.png", slug: "sneakers" },
];

const PopularCategories = () => {
  return (
    <section className="pt-16 sm:pt-20 md:pt-28 pb-4 bg-white px-4 md:px-8 lg:px-12 max-w-[1360px] mx-auto">
      <div className="flex flex-col items-center text-center mb-8 md:mb-12">
        <h2 className="text-3xl sm:text-4xl md:text-[42px] lg:text-[48px] font-extrabold text-[#111827] tracking-[-0.02em]">Explore Categories</h2>
      </div>

      <div className="relative">
        <div className="flex justify-start lg:justify-between gap-5 sm:gap-6 lg:gap-0 w-full overflow-x-auto pb-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map((cat, index) => (
            <Link 
              key={index} 
              to={`/products?category=${cat.slug}`}
              className="flex flex-col items-center gap-2.5 min-w-[80px] md:min-w-[110px] group snap-start"
            >
              <div className="w-[80px] h-[80px] md:w-[110px] md:h-[110px] rounded-full overflow-hidden bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 border border-gray-100">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover scale-[1.08] mix-blend-multiply group-hover:scale-[1.18] transition-transform duration-300"
                 loading="lazy" decoding="async" />
              </div>
              <span className="text-xs md:text-sm font-semibold text-[#111827] text-center">
                {cat.name}
              </span>
            </Link>
          ))}

          {/* View All Circle */}
          <Link 
            to="/categories"
            className="flex flex-col items-center justify-center gap-2.5 min-w-[80px] md:min-w-[110px] group snap-start"
          >
            <div className="w-[80px] h-[80px] md:w-[110px] md:h-[110px] rounded-full overflow-hidden bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 border border-gray-100 group-hover:bg-blue-50">
              <span className="text-xs md:text-sm font-semibold text-blue-600 flex items-center group-hover:translate-x-1 transition-transform duration-300">
                View All <ChevronRight size={16} className="ml-0.5" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
