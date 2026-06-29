import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProductDetailsModal from "../components/ProductDetailsModal";
import {
  ShoppingCart,
  Heart,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import axios from "axios";

const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardHover = {
  rest: { y: 0, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" },
  hover: {
    y: -8,
    boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const imageHover = {
  rest: { scale: 1 },
  hover: { scale: 1.08, transition: { duration: 0.6, ease: "easeOut" } },
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Fetch products from backend
  const fetchProducts = async (category = "All") => {
    try {
      setLoading(true);
      setError(null);

      const url =
        category === "All"
          ? "/products"
          : `/products?category=${encodeURIComponent(category)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setProducts(res.data.products);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("/products/categories");
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      setCategories([
        "All",
        "Fashion",
        "Electronics",
        "Home Decor",
        "Accessories",
        "Wellness",
      ]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory]);

  // Client-side search filter
  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      product.title?.toLowerCase().includes(q) ||
      product.desc?.toLowerCase().includes(q) ||
      product.categories?.toLowerCase().includes(q)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Out of Stock", color: "text-red-500" };
    if (stock <= 5) return { label: "Low Stock", color: "text-amber-500" };
    return { label: "In Stock", color: "text-emerald-500" };
  };

  return (
    <div className="min-h-screen bg-[#fcf8ff]">
      {/* Hero Banner */}
      <section className="relative h-125 md:h-155 overflow-hidden flex items-center mt-4 mb-9">
        <div className="absolute inset-0 z-0">
          {/* Keep the zoom animation */}
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.15 }}
            transition={{
              duration: 8,
              ease: "linear",
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="w-full h-full"
          >
            <img
              src="https://wallpapercave.com/wp/wp7116832.jpg"
              alt="Curated Living 2026"
              className="w-full h-full object-cover object-[center_20%]"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/1600x900?text=Premium+Living";
              }}
            />
          </motion.div>

          {/* Dark overlay for text readability */}
          {/* {/* <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" /> */}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 px-6 md:px-20 max-w-7xl mx-auto w-full mt-5">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeInUp}
              custom={0}
              className="font-['Manrope'] font-bold text-sm tracking-[0.2em] text-white/80 uppercase block mb-4"
            >
              Curated Living 2026
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="font-['Poppins'] text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg"
            >
              Effortless Grace.
              <br />
              Timeless Style.
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              custom={1.5}
              className="font-['Be_Vietnam_Pro'] text-white/70 text-lg mb-6 max-w-md"
            >
              Discover curated pieces that celebrate the modern woman — where
              confidence meets refined simplicity in every stitch.
            </motion.p>

            <motion.div variants={fadeInUp} custom={2}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-2xl bg-[#4648d4] text-white font-['Be_Vietnam_Pro'] font-bold text-lg hover:bg-[white] hover:text-[#4648d4] transition-all duration-300 shadow-lg shadow-[#4648d4]/30"
              >
                Shop Fashion
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="sticky top-20 z-40 bg-[#fcf8ff]/80 backdrop-blur-md py-4 border-b border-[#c7c4d7]/20"
      >
        <div className="px-4 md:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            <SlidersHorizontal
              size={16}
              className="text-[#767586] mr-2 shrink-0"
            />
            {categories.map((cat, index) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full font-['Geist'] text-xs tracking-wider uppercase transition-all duration-300 whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-[#4648d4] text-white shadow-lg shadow-[#4648d4]/25"
                    : "bg-white border border-[#c7c4d7] text-[#464554] hover:border-[#4648d4] hover:text-[#4648d4]"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Products Grid */}
      <section className="py-12 px-4 md:px-12 max-w-7xl mx-auto min-h-150">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#4648d4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : paginatedProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <Package size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg font-['sans-serif'] font-semibold">
              No products found
            </p>
            <p className="text-gray-300 text-sm mt-1 font-['Be_Vietnam_Pro']">
              Try adjusting your search or filters
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {paginatedProducts.map((product, index) => {
                  const stockInfo = getStockStatus(
                    parseInt(product.stock) || 0
                  );
                  return (
                    <motion.div
                      key={product._id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsModalOpen(true);
                      }}
                      layout
                      initial={{ opacity: 0, y: 40, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        delay: index * 0.08,
                        duration: 0.5,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      whileHover={{
                        y: -8,
                        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
                      }}
                      className="group relative bg-white/40 rounded-2xl overflow-hidden border border-white/60 cursor-pointer transition-shadow duration-500"
                    >
                      {/* Image */}
                      <div className="aspect-4/5 relative overflow-hidden">
                        <motion.img
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          src={
                            product.img ||
                            "https://via.placeholder.com/400x500?text=No+Image"
                          }
                          alt={product.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/400x500?text=No+Image";
                          }}
                        />

                        {/* Badges */}
                        {product.stock <= 5 && product.stock > 0 && (
                          <span className="absolute top-3 left-3 bg-amber-500 text-white font-['Geist'] text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                            Low Stock
                          </span>
                        )}
                        {product.stock === 0 && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white font-['Geist'] text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                            Out of Stock
                          </span>
                        )}

                        {/* Favorite Button */}
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          whileHover={{ scale: 1.1 }}
                          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Heart
                            size={16}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          />
                        </motion.button>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <p className="font-['Inter'] text-xs font-semibold tracking-[0.18em] uppercase text-[#4648d4] mb-2">
                          {product.categories}
                        </p>
                        <h3 className="font-['Poppins'] text-lg font-semibold text-[#1b1b23] leading-6 line-clamp-2 transition-colors duration-300 group-hover:text-[#4648d4]">
                          {product.title}
                        </h3>
                        <p className="font-['Inter'] text-sm text-[#6B7280] mt-2 line-clamp-2 leading-6">
                          {product.desc}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="font-['Manrope'] text-lg font-bold text-[#1b1b23]">
                            ₹{product.price}
                          </span>
                          <span
                            className={`text-[10px] font-medium ${stockInfo.color}`}
                          >
                            {stockInfo.label}
                          </span>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="w-full mt-3 py-2.5 rounded-xl bg-[#4648d4]/10 text-[#4648d4] text-sm font-medium hover:bg-[#4648d4] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 font-['Be_Vietnam_Pro']"
                        >
                          <ShoppingCart size={14} />
                          Add to Cart
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 mt-12"
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-[#c7c4d7] text-[#464554] hover:border-[#4648d4] hover:text-[#4648d4] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        currentPage === page
                          ? "bg-[#4648d4] text-white shadow-lg shadow-[#4648d4]/25"
                          : "border border-[#c7c4d7] text-[#464554] hover:border-[#4648d4] hover:text-[#4648d4]"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-[#c7c4d7] text-[#464554] hover:border-[#4648d4] hover:text-[#4648d4] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </motion.div>
            )}
          </>
        )}
      </section>
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
};

export default Products;
