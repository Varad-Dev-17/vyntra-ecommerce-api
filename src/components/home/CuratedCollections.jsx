import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    id: "men",
    title: "Men",
    subtitle: "New Arrivals",
    image: "/home/men.png",
    link: "/products?department=men",
  },
  {
    id: "women",
    title: "Women",
    subtitle: "New Arrivals",
    image: "/home/women.png",
    link: "/products?department=women",
  }
];

const collections = [
  {
    id: "summer",
    title: "Summer Edit",
    description: "Light fabrics. Everyday comfort.",
    image: "/home/summer wear.png",
    link: "/products",
    objectPosition: "object-[center_10%]"
  },
  {
    id: "urban",
    title: "Urban Essentials",
    description: "Modern tailoring for city life.",
    image: "/home/formal wear.png",
    link: "/products",
    objectPosition: "object-[center_top]"
  },
  {
    id: "occasion",
    title: "Occasion Wear",
    description: "Elegant styles for memorable moments.",
    image: "/home/occasion wear.png",
    link: "/products",
    objectPosition: "object-[center_top]"
  }
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const CuratedCollections = () => {
  return (
    <section className="w-full bg-[#FFFFFF] pt-10 md:pt-[80px] pb-10 md:pb-[80px]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 flex flex-col gap-8 md:gap-[56px] lg:gap-[64px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="flex flex-col gap-8 md:gap-[56px] lg:gap-[64px]"
        >
          {/* ROW 1: CATEGORY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            {categories.map((category) => (
              <motion.div variants={itemVariants} key={category.id}>
                <Link
                  to={category.link}
                  className="group flex flex-col sm:flex-row items-center bg-white rounded-[20px] shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden w-full h-auto sm:h-[190px] md:h-[210px] border border-gray-100"
                >
                  {/* Left Side: Image */}
                  <div className="w-full sm:w-[50%] h-[180px] sm:h-full overflow-hidden bg-gray-100">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover object-center transition-transform duration-[800ms] ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Right Side: Text */}
                  <div className="w-full sm:w-[50%] h-auto sm:h-full py-6 sm:py-0 flex flex-col justify-center px-6 md:px-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-[#111827]  mb-2 group-hover:text-[#5B4CF0] transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-[14px] md:text-[15px] text-[#6B7280]  mb-4">
                      {category.subtitle}
                    </p>
                    <div className="w-8 h-8 rounded-full bg-[#FAFAFA] text-[#111827] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-[#5B4CF0] group-hover:text-white">
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* ROW 2: EDITORIAL COLLECTION CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[24px]">
            {collections.map((collection) => (
              <motion.div variants={itemVariants} key={collection.id}>
                <Link
                  to={collection.link}
                  className="group relative w-full h-[280px] md:h-[300px] rounded-[20px] overflow-hidden block cursor-pointer shadow-sm hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-[350ms] ease-in-out hover:-translate-y-1.5"
                >
                  {/* Image Background */}
                  <div className="absolute inset-0 z-0 bg-gray-100">
                    <img
                      src={collection.image}
                      alt={collection.title}
                      className={`w-full h-full object-cover ${collection.objectPosition} transition-transform duration-[350ms] ease-in-out group-hover:scale-105`}
                    />
                  </div>

                  {/* Subtle Dark Gradient Overlay (Default) */}
                  <div
                    className="absolute inset-0 z-10 transition-opacity duration-[350ms] ease-in-out opacity-100 group-hover:opacity-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.12) 45%, transparent 80%)'
                    }}
                  />
                  {/* Subtle Dark Gradient Overlay (Hover) */}
                  <div
                    className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-[350ms] ease-in-out"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.28) 45%, transparent 80%)'
                    }}
                  />

                  {/* Content Overlay */}
                  <div className="absolute bottom-6 md:bottom-8 left-0 w-full px-6 md:px-8 z-20 flex flex-col justify-end">
                    <h3 className="text-[32px] md:text-[36px] font-bold text-white mb-2 ">
                      {collection.title}
                    </h3>
                    <p className="text-[16px] text-white/85 mb-6 ">
                      {collection.description}
                    </p>

                    <div className="inline-flex items-center gap-2 text-white font-semibold  text-[15px] w-max">
                      Shop Now
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-[350ms] ease-in-out group-hover:translate-x-1.5"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CuratedCollections;
