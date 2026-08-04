import React from 'react';

const PriceRow = ({ label, value, isDiscount = false, isTotal = false, isShipping = false, subtext = "", className = "" }) => {
  let valueText = String(value);
  if (!valueText.startsWith("₹") && !valueText.startsWith("-") && !valueText.startsWith("+") && !isNaN(Number(value))) {
    valueText = `₹${Number(value).toLocaleString("en-IN")}`;
  }
  if (isDiscount && typeof value === "number" && value > 0 && !valueText.startsWith("-")) {
    valueText = `-₹${Number(value).toLocaleString("en-IN")}`;
  }

  return (
    <div className={`flex items-center justify-between py-1 ${isTotal ? "pt-3 mt-1.5 border-t border-dashed border-gray-200" : ""} ${className}`}>
      <span className={isTotal ? "font-bold text-slate-700 text-sm" : "text-gray-600 font-medium text-xs"}>
        {label}
        {subtext && <span className="block text-[11px] font-normal text-gray-400 mt-0.5">{subtext}</span>}
      </span>
      
      <span
        className={`font-semibold tracking-tight ${
          isTotal
            ? "text-base font-bold text-[#4F46E5]"
            : isDiscount && value !== 0 && value !== "₹0"
            ? "text-emerald-600 font-bold text-xs"
            : isShipping && (value === 0 || value === "₹0" || value === "Free")
            ? "text-emerald-600 text-xs"
            : "text-slate-700 font-bold text-xs"
        }`}
      >
        {value === 0 || value === "₹0" ? (isShipping ? "Free" : "₹0") : valueText}
      </span>
    </div>
  );
};

export default PriceRow;
