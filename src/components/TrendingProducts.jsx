import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { useCylinderGallery } from "../animations/useCylinderGallery";

const products = [
  {
    id: 1,
    name: "Lunar Ceramic Vessel",
    category: "HOME DECOR",
    price: 999,
    rating: 4.5,
    reviews: 128,
    description:
      "Handcrafted ceramic vessel with a matte finish. Perfect for modern minimalist interiors.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDoo73vj4we4urZpMDWes05Q8obZxLd20MId7X4Dk2C-OGF6V-sas-Ri5JUe3B7eW2rUW-nbzalpMdhKsfEaRgBwpeVpAZlc1-O1vOixb4v27qgROEAoj4Yae6swLFIBG_Jykf2j4_UbJ2AiNL91dRXOGMnlNNtO_kGQW3XvbS9XocFFoyV1qjj6CJBKFD86f_HLrjqEI3Ly9wSKSmtq97tx8dy7GYL-hiMzEn78RvMgYpCrGaMBf01WTpLED6BroeSQRlE3xSffQo",
  },
  {
    id: 2,
    name: "Aura ANC Headphones",
    category: "ELECTRONICS",
    price: 2999,
    rating: 4.8,
    reviews: 342,
    description:
      "Premium active noise cancellation with 40-hour battery life and studio-quality sound.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCrfvdwrEHsHr6reAssEI6llSFLSJB9r8aHSpSO7B0qTOVMhXBKwdG6K7ZdCCU0Tm-nLs0hCIVmB0WPHEmbZ05ZRWBdy1w1gt5t8lxne6pZ0AhIpg0A-jBWb1y6KIcazRTSfSSC9BxqDKDL7J9E7dcyqGLCMWzwsxvcRW6tAGz594X8POgWJvdAzohnVYNuxOdgM8LoGA6MlOPqhg2zhKaxw-mc5B0z4t4rav8yxKBDxzZJbjZ0Khc-MSIrl-1a5d7wHCCAY7ntoFE",
  },
  {
    id: 3,
    name: "Structure Tailored Blazer",
    category: "FASHION",
    price: 2450,
    rating: 4.6,
    reviews: 89,
    description:
      "Italian wool blend blazer with structured shoulders and tailored fit.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA_WNGDOtkj4BaFY-W5sTWWiIFTavU14GsBxgqjlLsbRgiuesLVeHp5O_h9Qng5SdWDQjIGTG93tW19mkuirBpttY4D7aXmyPKUQ32aqYdASrA75VlaI_S0f3vEK2Ikpx_KooGLKXGt5NdLhVwA8CsufJyg2R9ByY45Mp-BF8FtbTpZyMGBKfc_85endUXhNNNLAVKBuk11O5TGN1dBD0CWMKsZrdcWnsYKymHckkRkOSK3Y9SL-f7_lxYyNI91blOgk4ZYvPlUCF0",
  },
  {
    id: 4,
    name: "Zenith Chronograph",
    category: "ACCESSORIES",
    price: 4200,
    rating: 4.9,
    reviews: 256,
    description:
      "Swiss movement chronograph with sapphire crystal and leather strap.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCXW1bJ-9NIiRu05D1tApEDdNhZKQLVaVIHO5f-lRcSyAEG3z6GDBYkNqBAODzIaWJriFBuHqdLINJ0lsXR2U6-XwPA-IY2-UybOOsNg6GwcvDR6P-EX7abhtKk0PlnTahP5dFBjgdeE-beilKc6iDxHbFL6VWk5xqnytPXT9YZ3mV8sxP6aP70-eZGeZynfhFSQpRq3IdM9hyn9Xfj3Eo680X94EJfGBQVdxdTCUZXw4Cy3DsoawPdHHtDQIUAnmfY71irGJCLsAI",
  },
  {
    id: 5,
    name: "Signature Dusk Candle",
    category: "WELLNESS",
    price: 2800,
    rating: 4.7,
    reviews: 412,
    description:
      "Soy wax candle with notes of sandalwood, amber, and vanilla. 60-hour burn time.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDeSt70h3aTR3SXAka4-01OOb4E1evGYiAe6vTV4_y8Oz8OKakCHfehkMfYwbmvNR-jjKqKL87HFOJ9MjbcqNfSLqoAZE_4B7eTUGlfjU8kZbgMHCztqpvuyXEmQeX5YVTkvd2Rq8s0-LTc3d6LZ9SoP8M88tK2sc26pWHxuGYobEnZiuHgRouyYLwOimweVvJctILFCcED4B72vaHve2GnKd7daUkwKkrsu7cCZBMoAfZvv5tYx8YqaLNfijJCdHqJ3DEiEX7RwcQ",
  },
  {
    id: 6,
    name: "Nebula Buds Pro",
    category: "ELECTRONICS",
    price: 1999,
    rating: 4.4,
    reviews: 567,
    description: "True wireless earbuds with spatial audio and adaptive EQ.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDeqyFzqzl0uftTwDdUPCKPExBukFOKNEZsvnZhj5kqAqcOj4yBjNVCzB46Z0vOu_Jc1svaXlcV04Bfe9D___T4mSZu-5jOBvGnIOWfrmuDqXYHCA0Dw0ivPCCxoXzKDBW6sxpCuEUs513h8-czbuZ5lmOWca_6yhYJAE6Q-bN1UfbtvvPOILhugHSz0KOHP32xHLkIxhgnqhuWCAXAbJYsjUXTgrMKPJtub-TNJEpBs5JGzB1AqBjOQd4Ggv5b7ifQv63y4SHuzcQ",
  },
  {
    id: 7,
    name: "Heritage Leather Tote",
    category: "FASHION",
    price: 2200,
    rating: 4.8,
    reviews: 178,
    description:
      "Full-grain Italian leather tote with brass hardware and cotton lining.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCvogqvbfGxvXH_jSYv78OkK8uixV7seZPBT4_zX9aISJQbs7Z2VXp1J-l-kvgpazGVmO3b8FlL9gq0Ofv581b-MHwWb1EaF6Y9ewV7ZlZiMjgpYjw5InfAcC7kvNPwBDFd9nzF_FPByKdr5631DMdw_GI7XKoczUx6q5ppKGwHO4zgwwq4Oi7UbGxRX4o4kIwmWJagDzp73d-0ej43wWRjxeiMih7g0XR86MO8Hg7FJOkK7o2-lQqlAUN0LwC8ZZRRU-JIeakt-CE",
  },
  {
    id: 8,
    name: "Vector Task Lamp",
    category: "HOME DECOR",
    price: 3400,
    rating: 4.6,
    reviews: 93,
    description:
      "Adjustable LED desk lamp with wireless charging base and touch controls.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC0VyM59kE2iWezoXU0uHD8uVmwaDV8RaO6TUs7Ti-3Pzp2oe3zrv6ZBks8GRMrnPKnZUZ14YoaoBbvunOAzZ_XlOL4ZKuWEDjd7SBCzoW5udWDKZY-DymKHt4fEx-xp1Aoe7llZ8wi6dsGSja0QFDWoOFBdHHWteH3SPDBvbxsgvQTYtuBtaDKQ5-bkKEojQu21Bjf-c36-kh_KrkZh9FbjO_628R1N12sopOUvcxgGAFyvzQAywd3S5af051YjovvTQ0CK3aMWls",
  },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const DesktopCard = ({ product, style, liked, toggleLike }) => {
  const { x, y, z, rotateY, scale, opacity, zIndex, isActive } = style;

  const transform = `translateX(calc(-50% + ${x}px)) translateY(calc(-50% + ${y}px)) scale(${scale}) rotateY(${rotateY}deg) translateZ(${z}px)`;

  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        transform,
        opacity,
        zIndex,
        transformStyle: "preserve-3d",
        transition: "transform 0.08s linear, opacity 0.15s ease",
        willChange: "transform, opacity",
        pointerEvents: isActive ? "auto" : "none",
      }}
    >
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          width: isActive ? 300 : 220,
          height: isActive ? 400 : 300,
          background: isActive
            ? "rgba(255,255,255,0.95)"
            : "rgba(255,255,255,0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: isActive
            ? "1.5px solid rgba(70,72,212,0.2)"
            : "1px solid rgba(255,255,255,0.3)",
          boxShadow: isActive
            ? "0 25px 60px rgba(70,72,212,0.18)"
            : "0 6px 20px rgba(0,0,0,0.06)",
          transition:
            "width 0.3s ease, height 0.3s ease, background 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            height: isActive ? 210 : 155,
            transition: "height 0.3s ease",
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            style={{
              filter: isActive ? "none" : "brightness(0.88)",
              transition: "filter 0.4s ease",
            }}
          />
          {!isActive && (
            <div className="absolute inset-0 bg-linear-to-t from-white/50 to-transparent" />
          )}

          {isActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(product.id);
              }}
              className="absolute top-3 right-3 p-2.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Heart
                className={`w-4 h-4 ${
                  liked[product.id]
                    ? "fill-[#4648D4] text-[#4648D4]"
                    : "text-[#4648D4]"
                }`}
              />
            </button>
          )}

          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase"
            style={{
              background: isActive
                ? "rgba(70,72,212,0.9)"
                : "rgba(70,72,212,0.5)",
              color: "white",
              fontFamily: "'Geist', sans-serif",
              transition: "background 0.3s ease",
            }}
          >
            {product.category}
          </div>
        </div>

        <div className="p-4">
          <h3
            className="font-bold text-[#1B1B23] font-['Manrope'] line-clamp-1"
            style={{
              fontSize: isActive ? 16 : 12,
              transition: "font-size 0.3s ease",
            }}
          >
            {product.name}
          </h3>

          {isActive && (
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-[11px] text-[#767586] ml-1">
                {product.rating} ({product.reviews})
              </span>
            </div>
          )}

          {isActive && (
            <p className="text-[11px] text-[#767586] mt-2 line-clamp-2 font-['Be Vietnam Pro'] leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="mt-3 flex justify-between items-center">
            <span
              className="font-bold text-[#1B1B23] font-['Manrope']"
              style={{
                fontSize: isActive ? 20 : 14,
                transition: "font-size 0.3s ease",
              }}
            >
              {formatPrice(product.price)}
            </span>
            {isActive && (
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[11px] font-semibold bg-[#4648D4] hover:bg-[#3a3cb8] transition-colors">
                <ShoppingCart className="w-3.5 h-3.5" />
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileCard = ({ product, liked, toggleLike }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ margin: "-50px" }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.02, y: -8 }}
    className="group rounded-xl overflow-hidden"
    style={{
      background: "rgba(255,255,255,0.4)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.4)",
    }}
  >
    <div className="relative aspect-4/5 overflow-hidden">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <button
        onClick={() => toggleLike(product.id)}
        className="absolute top-4 right-4 p-2 rounded-full"
        style={{
          background: "rgba(255,255,255,0.4)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Heart
          className={`w-4 h-4 ${
            liked[product.id]
              ? "fill-[#4648D4] text-[#4648D4]"
              : "text-[#4648D4]"
          }`}
        />
      </button>
    </div>
    <div className="p-4">
      <span className="text-[10px] font-semibold tracking-widest uppercase text-[#4648D4] font-['Geist']">
        {product.category}
      </span>
      <h3 className="text-lg font-semibold text-[#1B1B23] mt-1 mb-2 font-['Manrope']">
        {product.name}
      </h3>
      <div className="flex justify-between items-center">
        <span className="text-xl font-bold text-[#1B1B23] font-['Manrope']">
          {formatPrice(product.price)}
        </span>
        <button className="p-2 rounded-lg text-[#4648D4] bg-[#4648D4]/10 hover:bg-[#4648D4] hover:text-white transition-colors">
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
    </div>
  </motion.div>
);

const TrendingProducts = () => {
  const [liked, setLiked] = useState({});
  const { getItemStyle } = useCylinderGallery(products.length, 0.5);

  const toggleLike = (id) => setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <section className="bg-[#FCF8FF] pt-20 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase mb-5"
            style={{
              background: "rgba(70,72,212,0.1)",
              color: "#4648D4",
              fontFamily: "'Geist', sans-serif",
            }}
          >
            Curated Selection
          </span>
          <h2
            className="text-5xl md:text-6xl font-bold text-[#1B1B23] font-['Manrope'] mb-5"
            style={{ letterSpacing: "-0.02em" }}
          >
            Trending Now
          </h2>
          <p className="text-[#767586] font-['Be Vietnam Pro'] text-lg max-w-lg mx-auto leading-relaxed">
            A seamless flow of our finest picks — each one shines at center
            stage
          </p>
        </motion.div>

        <div className="hidden md:block">
          <div className="h-20" />
          <div
            className="relative flex items-center justify-center"
            style={{ perspective: 1400, height: 480 }}
          >
            {products.map((product, index) => (
              <DesktopCard
                key={product.id}
                product={product}
                style={getItemStyle(index)}
                liked={liked}
                toggleLike={toggleLike}
              />
            ))}
          </div>
          <div className="h-28" />
        </div>

        <div className="md:hidden grid grid-cols-2 gap-4 pb-16">
          {products.map((product) => (
            <MobileCard
              key={product.id}
              product={product}
              liked={liked}
              toggleLike={toggleLike}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
