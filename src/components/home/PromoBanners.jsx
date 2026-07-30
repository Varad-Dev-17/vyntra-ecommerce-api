import { Link } from "react-router-dom";

const PromoBanners = () => {
  return (
    <section className="py-8 bg-[#FFFFFF] px-4 md:px-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Banner 1 */}
        <Link to="/products?category=electronics" className="flex-1 block relative rounded-3xl overflow-hidden group shadow-lg">
          <div className="aspect-[21/9] md:aspect-[16/9] lg:aspect-[21/9] relative">
            <img 
              src="/home/iphone.jpg" 
              alt="iPhone 16 Pro Max Promo" 
              className="w-full h-full object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Text Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-end p-6 sm:p-8 md:p-10 lg:p-12 z-10 pointer-events-none">
              <div className="flex flex-col items-start text-left text-white w-[55%] sm:w-[50%]">
                <span className="text-[13px] sm:text-base md:text-lg font-normal tracking-wide mb-1 opacity-90">iPhone 16 Pro Max</span>
                <span className="text-xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 tracking-tight">From $ 50,769*</span>
                
                <p className="text-[10px] sm:text-xs md:text-sm text-white/80 leading-snug">
                  A18 chip. Superfast. Supersmart
                </p>
                <p className="text-[10px] sm:text-xs md:text-sm text-white/80 leading-snug mb-6 sm:mb-8">
                  History. Biggest Price Drop
                </p>

                <div className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#0A102A] hover:bg-[#182654] transition-colors rounded-full text-white text-[11px] sm:text-sm font-medium shadow-md pointer-events-auto">
                  Shop Now
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Banner 2 */}
        <Link to="/products?category=sneakers" className="flex-1 block relative rounded-3xl overflow-hidden group shadow-lg">
          <div className="aspect-[21/9] md:aspect-[16/9] lg:aspect-[21/9] relative">
            <img 
              src="/home/shoes_banner.jpg" 
              alt="Sneakers Sale Promo" 
              className="w-full h-full object-cover object-[center_26%] transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Text Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-center items-start p-6 sm:p-8 md:p-10 lg:p-12 z-10 pointer-events-none">
              <div className="flex flex-col items-start max-w-[65%] sm:max-w-[55%]">
                <span className="text-[13px] sm:text-base md:text-lg font-bold text-pink-600 tracking-wider mb-1 uppercase">Mega Sale</span>
                <span className="text-xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 sm:mb-3 leading-tight tracking-tight">Up to 50% Off<br/>Sneakers</span>
                
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 leading-relaxed mb-6 sm:mb-8 font-medium">
                  Step up your game with our premium collection.
                </p>

                <div className="px-5 sm:px-6 py-2 sm:py-2.5 bg-pink-600 hover:bg-pink-700 transition-colors rounded-full text-white text-[11px] sm:text-sm font-bold shadow-md pointer-events-auto">
                  Shop Collection
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default PromoBanners;
