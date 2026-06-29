import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const ProductDetailsModal = ({ product, isOpen, onClose }) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 40 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 flex items-center justify-center z-101 p-5"
          >
            <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl relative">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100"
              >
                <X size={20} />
              </button>

              <div className="grid md:grid-cols-2">
                {/* Left Image */}
                <div className="bg-[#f8f8fc]">
                  <img
                    src={product.img}
                    alt={product.title}
                    className="w-full h-full object-cover md:min-h-162.5"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/700x900?text=No+Image";
                    }}
                  />
                </div>

                {/* Right Info */}
                <div className="p-10 overflow-y-auto">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#4648d4]/10 text-[#4648d4] text-xs font-semibold uppercase">
                    {product.categories}
                  </span>

                  <h2 className="text-4xl font-bold mt-5 text-[#1b1b23]">
                    {product.title}
                  </h2>

                  <p className="mt-6 text-[#767586] leading-8">
                    {product.desc}
                  </p>

                  <div className="mt-10 space-y-6">
                    <div className="flex justify-between border-b pb-4">
                      <span className="text-gray-500">Category</span>
                      <span className="font-semibold">
                        {product.categories}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-4">
                      <span className="text-gray-500">Available Size</span>
                      <span className="font-semibold">{product.size}</span>
                    </div>

                    <div className="flex justify-between border-b pb-4">
                      <span className="text-gray-500">Color</span>
                      <span className="font-semibold">{product.color}</span>
                    </div>

                    <div className="flex justify-between border-b pb-4">
                      <span className="text-gray-500">Availability</span>
                      <span
                        className={`font-semibold ${
                          product.stock > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>

                    {/* <div className="flex justify-between">
                      <span className="text-gray-500">Added By</span>
                      <span className="font-semibold">{product.addedBy}</span>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailsModal;
