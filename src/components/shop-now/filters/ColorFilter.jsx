import { useState } from "react";
import { ChevronUp, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ColorFilter = ({ colors = [], activeColors = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-[#E5E7EB] pb-5 mb-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-[#111827] font-semibold text-[15px] mb-4"
      >
        <span>Colors</span>
        {isOpen ? <ChevronUp size={16} className="text-[#4B5563]" /> : <ChevronDown size={16} className="text-[#4B5563]" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 p-1">
              {colors.map((color) => {
                // Color options have displayName (e.g. "Red") and sometimes a storedValue with hex,
                // but the UI typically uses displayName for both name and to fetch a generic hex if unavailable.
                const colorName = color.displayName || color.name;
                const isActive = activeColors.includes(colorName);
                
                const toggleColor = () => {
                  if (isActive) {
                    onChange(activeColors.filter(c => c !== colorName));
                  } else {
                    onChange([...activeColors, colorName]);
                  }
                };

                // Fallback basic CSS color if the backend doesn't provide a hex code
                const bgColor = color.hex || colorName.toLowerCase().replace(/\s+/g, '');


                return (
                  <button
                    key={color._id || colorName}
                    title={colorName}
                    onClick={toggleColor}
                    className={`w-6 h-6 rounded-full border border-[#E5E7EB] shadow-sm hover:scale-110 transition-all flex items-center justify-center ${isActive ? 'ring-2 ring-offset-1 ring-[#6D4AFF]' : ''}`}
                    style={{ backgroundColor: bgColor }}
                  >
                    {isActive && <Check size={12} className={bgColor === 'white' || bgColor === '#ffffff' ? 'text-black' : 'text-white'} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ColorFilter;
