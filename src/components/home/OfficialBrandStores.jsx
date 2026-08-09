import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const brands = [
  { name: "Levi's", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/Levi%27s_logo.svg" },
  { name: "H&M", logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg" },
  { name: "Tommy Hilfiger", logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/Tommy_Hilfiger_Logo.svg" },
  { name: "Nivea", logo: "https://upload.wikimedia.org/wikipedia/commons/8/81/Nivea_logo.svg" },
  { name: "Garnier", logo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Garnier_logo.svg" },
  { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
  { name: "Panasonic", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Panasonic_logo_%28Blue%29.svg" },
  { name: "Nintendo", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg" }
];

const BrandCard = ({ brand }) => (
  <Link to={`/brand/${brand.name.toLowerCase()}`} className="bg-transparent rounded-xl p-4 flex items-center gap-4 transition-colors duration-300 min-w-[260px] mx-2 shrink-0 group hover:opacity-80">
    <div className="w-[50px] h-[50px] rounded-full bg-white flex items-center justify-center p-2.5 shadow-sm shrink-0 border border-gray-100">
      <img 
        src={brand.logo} 
        alt={brand.name} 
        className="w-full h-full object-contain mix-blend-multiply" 
        loading="lazy"
        decoding="async"
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
      <h3 className="font-semibold text-slate-700 text-[16px] leading-tight mb-1">{brand.name}</h3>
    </div>
  </Link>
);

const MarqueeRow = ({ items, direction = "left", speed = 40 }) => {
  const isLeft = direction === "left";
  // Duplicate items to ensure seamless loop
  const duplicatedItems = [...items, ...items, ...items, ...items];
  
  return (
    <div className="flex overflow-hidden whitespace-nowrap w-full relative py-2">
      <motion.div
        className="flex min-w-max"
        animate={{ x: isLeft ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: speed }}
      >
        {duplicatedItems.map((brand, idx) => (
          <BrandCard key={idx} brand={brand} />
        ))}
      </motion.div>
    </div>
  );
};

const OfficialBrandStores = () => {
  const row1Brands = [...brands];
  const row2Brands = [...brands].reverse();
  const row3Brands = [...brands.slice(4), ...brands.slice(0, 4)];

  return (
    <section className="pt-12 pb-24 bg-white w-full mt-4 overflow-hidden relative">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mb-10 text-center flex flex-col items-center">
        <h2 className="text-4xl sm:text-5xl md:text-[56px] font-extrabold text-[#111827] tracking-[-0.02em] mb-3">Top Brands</h2>
        <p className="text-gray-500 max-w-2xl text-[15px] md:text-lg">Discover top deals and official collections from your favorite global brands.</p>
      </div>
      
      {/* Marquee Container */}
      <div className="relative w-full flex flex-col gap-2 overflow-hidden">
        {/* Left/Right Fade Overlays */}
        <div className="absolute top-0 bottom-0 left-0 w-16 md:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-16 md:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
        
        <MarqueeRow items={row1Brands} direction="left" speed={60} />
        <MarqueeRow items={row2Brands} direction="right" speed={75} />
        <MarqueeRow items={row3Brands} direction="left" speed={65} />
      </div>
    </section>
  );
};

export default OfficialBrandStores;
