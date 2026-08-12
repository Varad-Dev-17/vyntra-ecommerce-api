import { Link } from "react-router-dom";
import { ChevronRight, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const PopularCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${(import.meta.env.PROD ? '' : 'http://localhost:8000')}/categories`, {
          params: { status: 'Active', limit: 8 }
        });
        if (response.data.success) {
          setCategories(response.data.categories || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);
  return (
    <section className="pt-16 sm:pt-20 md:pt-28 pb-4 bg-white px-4 md:px-8 lg:px-12 max-w-[1360px] mx-auto">
      <div className="flex flex-col items-center text-center mb-8 md:mb-12">
        <h2 className="text-3xl sm:text-4xl md:text-[42px] lg:text-[48px] font-extrabold text-[#111827] tracking-[-0.02em]">Explore Categories</h2>
      </div>

      <div className="relative">
        <div className="flex justify-start lg:justify-between gap-5 sm:gap-6 lg:gap-0 w-full overflow-x-auto pb-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {isLoading ? (
            <div className="flex justify-center items-center w-full py-6">
               <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : categories.map((cat, index) => (
            <Link 
              key={cat._id || index} 
              to={`/products?category=${cat.slug}`}
              className="flex flex-col items-center gap-2.5 min-w-[80px] md:min-w-[110px] group snap-start"
            >
              <div className="w-[80px] h-[80px] md:w-[110px] md:h-[110px] rounded-full overflow-hidden bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 border border-gray-100">
                {cat.image?.url ? (
                  <img 
                    src={cat.image.url} 
                    alt={cat.name} 
                    className="w-full h-full object-contain p-0 mix-blend-multiply group-hover:scale-110 transition-transform duration-300"
                    loading="lazy" decoding="async" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300 group-hover:scale-110 transition-transform duration-300" />
                )}
              </div>
              <span className="text-xs md:text-sm font-semibold text-[#111827] text-center">
                {cat.name}
              </span>
            </Link>
          ))}

          {/* View All Circle */}
          {!isLoading && categories.length > 0 && (
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
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
