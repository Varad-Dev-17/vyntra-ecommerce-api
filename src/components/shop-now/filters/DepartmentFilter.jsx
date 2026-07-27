import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DepartmentFilter = ({ departments = [], activeDepartment = "all", onChange }) => {
  return (
    <div className="border-b border-[#E5E7EB] pb-5 mb-5 mt-2">
      <div className="flex flex-col gap-3">
        {departments.map((dept) => {
          const isActive = activeDepartment === dept.name;
          return (
            <label 
              key={dept._id} 
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => onChange && onChange(dept.name)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isActive ? 'border-[#6D4AFF]' : 'border-[#E5E7EB] group-hover:border-[#6D4AFF]'}`}>
                  {isActive && <div className="w-2 h-2 rounded-full bg-[#6D4AFF]" />}
                </div>
                <span className={`text-[15px] ${isActive ? 'text-[#111827] font-medium' : 'text-[#4B5563]'}`}>
                  {dept.name}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentFilter;
