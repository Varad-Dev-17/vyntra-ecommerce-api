import React from "react";
import { ShoppingCart } from "lucide-react";

const OrdersSection = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-[#1a1a2e] font-['Manrope'] mb-6">
      Orders
    </h2>
    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
      <ShoppingCart size={48} className="text-gray-200 mx-auto mb-4" />
      <p className="text-gray-400">Orders management coming in next phase</p>
    </div>
  </div>
);

export default OrdersSection;
