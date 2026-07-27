import { motion } from "framer-motion";
import { Package } from "lucide-react";

const EmptyState = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <Package size={48} className="text-gray-300 mb-4" />
      <p className="text-gray-400 text-lg font-semibold">
        No products found
      </p>
      <p className="text-gray-300 text-[15px] mt-1">
        Try adjusting your search or filters
      </p>
    </motion.div>
  );
};

export default EmptyState;
