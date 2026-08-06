import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const bentoItems = [
  {
    id: "spring",
    title: "The Spring Collection",
    subtitle: "Fresh styles for a new season.",
    image: "/home/spring_couple.jpg",
    link: "/products",
    className: "col-span-1 md:col-span-6 md:row-span-2 h-[380px] md:h-full",
    objectPosition: "object-center"
  },
  {
    id: "knitwear",
    title: "Vibrant Knitwear",
    subtitle: "Bold colors to stand out.",
    image: "/home/pink_sweater.jpg",
    link: "/products",
    className: "col-span-1 md:col-span-6 md:row-span-1 h-[260px] md:h-full",
    objectPosition: "object-[center_30%]"
  },
  {
    id: "sale",
    title: "Season Sale",
    subtitle: "Up to 40% off on selected items.",
    image: "/home/shopping_bags.jpg",
    link: "/products",
    className: "col-span-1 md:col-span-6 md:row-span-1 h-[260px] md:h-full",
    objectPosition: "object-[center_20%]"
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
    <section className="w-full bg-[#FAFBFF] pt-16 sm:pt-20 md:pt-28 pb-10 md:pb-[80px]">
      <div className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-2 md:mb-6">
          <h2 className="text-3xl sm:text-4xl md:text-[42px] lg:text-[48px] font-extrabold text-[#111827] tracking-[-0.02em]">Explore Collections</h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-[16px] md:gap-x-[24px] lg:gap-x-[32px] md:gap-y-[32px] md:h-[540px]"
        >
          {bentoItems.map((item) => (
            <motion.div variants={itemVariants} key={item.id} className={item.className}>
              <Link
                to={item.link}
                className="group relative w-full h-full rounded-[24px] overflow-hidden block cursor-pointer shadow-sm hover:shadow-xl transition-all duration-[400ms] ease-in-out hover:-translate-y-1"
              >
                {/* Image Background */}
                <div className="absolute inset-0 z-0 bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className={`w-full h-full object-cover ${item.objectPosition} transition-transform duration-[800ms] ease-out group-hover:scale-105`}
                  />
                </div>

                {/* Subtle Dark Gradient Overlay (Default) */}
                <div
                  className="absolute inset-0 z-10 transition-opacity duration-[400ms] ease-in-out opacity-100 group-hover:opacity-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(15,23,42,0.60) 0%, rgba(15,23,42,0.18) 45%, transparent 80%)'
                  }}
                />
                
                {/* Darker Gradient Overlay (Hover) */}
                <div
                  className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] ease-in-out"
                  style={{
                    background: 'linear-gradient(to top, rgba(15,23,42,0.80) 0%, rgba(15,23,42,0.28) 50%, transparent 100%)'
                  }}
                />

                {/* Content Overlay */}
                <div className="absolute bottom-6 md:bottom-8 left-0 w-full px-6 md:px-8 z-20 flex flex-col justify-end">
                  <h3 className="text-[24px] md:text-[30px] font-bold text-white mb-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[15px] md:text-[16px] text-white/90 mb-5 font-medium">
                    {item.subtitle}
                  </p>

                  <div className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-[#111827] rounded-full font-bold text-[14px] w-max shadow-md transition-colors duration-300 group-hover:bg-[#111827] group-hover:text-white">
                    Explore
                    <ArrowRight
                      size={16}
                      className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CuratedCollections;
