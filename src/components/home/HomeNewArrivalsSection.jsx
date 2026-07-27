import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import ShopProductCard from "../shop-now/product/ShopProductCard";
import Loader from "./loader/Loader";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const HomeNewArrivalsSection = ({ title, subtitle, endpoint }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(endpoint);
        if (response.data.success) {
          setProducts(response.data.data);
        } else {
          setError("Failed to fetch products.");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Something went wrong while fetching products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [endpoint]);

  return (
    <section className="w-full bg-[#FFFFFF] pt-12 md:pt-16 pb-16 md:pb-24">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-[40px] md:text-[64px] lg:text-[80px] font-bold text-[#111827] font-['Inter'] leading-[1.1] tracking-[-0.02em]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[16px] md:text-[18px] font-normal text-[#6B7280] font-['Inter'] leading-[1.7] mt-4">
              {subtitle}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6 lg:gap-8">
            {[...Array(5)].map((_, index) => (
              <Loader key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[#EF4444] font-medium font-['Inter'] mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <p className="text-[16px] text-gray-500 font-['Inter'] italic">
              New arrivals coming soon.
            </p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6 lg:gap-8"
          >
            {products.map((product) => (
              <motion.div variants={itemVariants} key={product.id}>
                <ShopProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </section>
  );
};

export default HomeNewArrivalsSection;
