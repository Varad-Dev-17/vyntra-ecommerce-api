import { Link } from "react-router-dom";

const brands = [
  { name: "Adidas", logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg", desc: "Delivery within 24 hours" },
  { name: "Nestle", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Nestle_logo.svg", desc: "Delivery within 24 hours" },
  { name: "Dr Pepper", logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Dr_Pepper_Logo.svg", desc: "Delivery within 24 hours" },
  { name: "LG Electronics", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/LG_logo_%282015%29.svg", desc: "Delivery within 24 hours" },
  { name: "Dell", logo: "https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg", desc: "Delivery within 24 hours" },
  { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", desc: "Delivery within 24 hours" },
  { name: "Chanel", logo: "https://upload.wikimedia.org/wikipedia/commons/9/94/Chanel_logo.svg", desc: "Delivery within 24 hours" },
  { name: "Zara", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg", desc: "Delivery within 24 hours" }
];

const OfficialBrandStores = () => {
  return (
    <section className="pt-8 pb-24 bg-[#FFFFFF] px-4 md:px-8 max-w-[1600px] mx-auto mt-4">
      <h2 className="text-2xl font-bold text-[#111827] mb-6">Explore Official Brand Stores</h2>
      
      {/* Brand Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {brands.map((brand, idx) => (
          <Link key={idx} to={`/brand/${brand.name.toLowerCase()}`} className="bg-[#f9f9f9] hover:bg-gray-100 rounded-xl p-4 flex items-center gap-4 transition-colors duration-300">
            <div className="w-[50px] h-[50px] rounded-full bg-white flex items-center justify-center p-2.5 shadow-sm shrink-0 border border-gray-100">
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="w-full h-full object-contain mix-blend-multiply" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <span className="hidden w-full h-full items-center justify-center text-lg font-bold text-gray-500">
                {brand.name[0]}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-[15px] leading-tight mb-1">{brand.name}</h3>
              <p className="text-[12px] text-gray-500">{brand.desc}</p>
            </div>
          </Link>
        ))}
      </div>

    </section>
  );
};

export default OfficialBrandStores;
