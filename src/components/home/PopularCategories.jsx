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
    <section className="pt-8 pb-2 bg-[#FFFFFF] px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#111827]">Categories</h2>
      </div>

      <div className="relative">
        <div className="flex gap-6 md:gap-10 overflow-x-auto pb-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map((cat, index) => (
            <Link 
              key={index} 
              to={`/products?category=${cat.slug}`}
              className="flex flex-col items-center gap-3 min-w-[100px] md:min-w-[140px] group snap-start"
            >
              <div className="w-[100px] h-[100px] md:w-[140px] md:h-[140px] rounded-full overflow-hidden bg-gray-50 flex items-center justify-center p-2 shadow-sm group-hover:shadow-md transition-all duration-300 border border-gray-100">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-sm md:text-base font-semibold text-[#111827] text-center">
                {cat.name}
              </span>
            </Link>
          ))}

          {/* View All Circle */}
          <Link 
            to="/categories"
            className="flex flex-col items-center justify-center gap-3 min-w-[100px] md:min-w-[140px] group snap-start"
          >
            <div className="w-[100px] h-[100px] md:w-[140px] md:h-[140px] rounded-full overflow-hidden bg-gray-50 flex items-center justify-center p-2 shadow-sm group-hover:shadow-md transition-all duration-300 border border-gray-100 group-hover:bg-blue-50">
              <span className="text-sm md:text-base font-semibold text-blue-600 flex items-center group-hover:translate-x-1 transition-transform duration-300">
                View All <ChevronRight size={18} className="ml-1" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
