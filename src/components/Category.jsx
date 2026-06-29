import { Link } from "react-router-dom";
import {
  Monitor,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "../animations/FadeIn";
import StaggerContainer from "../animations/StaggerContainer";
import StaggerItem from "../animations/StaggerItem";

const categories = [
  {
    name: "Electronics",
    icon: Monitor,
    bg: "bg-[#4648D4]/10",
    text: "text-[#4648D4]",
  },
  {
    name: "Fashion",
    icon: Shirt,
    bg: "bg-[#6B38D4]/10",
    text: "text-[#6B38D4]",
  },
  {
    name: "Home & Kitchen",
    icon: Home,
    bg: "bg-[#904900]/10",
    text: "text-[#904900]",
  },
  {
    name: "Beauty",
    icon: Sparkles,
    bg: "bg-[#4648D4]/10",
    text: "text-[#4648D4]",
  },
  {
    name: "Sports",
    icon: Dumbbell,
    bg: "bg-[#6B38D4]/10",
    text: "text-[#6B38D4]",
  },
];

const CategorySection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <FadeIn>
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-[#1B1B23] font-['Manrope']">
                Shop by Category
              </h2>
              <p className="text-[#464554] mt-1 font-['Be_Vietnam_Pro']">
                Find exactly what you're looking for
              </p>
            </div>
            <Link
              to="/products"
              className="flex items-center gap-1 font-medium text-[#4648D4] hover:text-[#6B38D4] transition-colors font-['Be_Vietnam_Pro']"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>

        <StaggerContainer staggerDelay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <StaggerItem key={cat.name}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={`/products?category=${cat.name.toLowerCase()}`}
                      className="group flex flex-col items-center gap-3 p-6 rounded-2xl hover:bg-[#F5F2FE] transition-colors"
                    >
                      <motion.div
                        className={`w-16 h-16 ${cat.bg} ${cat.text} rounded-2xl flex items-center justify-center`}
                        whileHover={{ rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Icon className="w-7 h-7" />
                      </motion.div>
                      <span className="text-sm font-medium text-[#1B1B23] font-['Be_Vietnam_Pro']">
                        {cat.name}
                      </span>
                    </Link>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </div>
        </StaggerContainer>
      </div>
    </section>
  );
};

export default CategorySection;
