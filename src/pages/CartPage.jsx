import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Gift,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";
import { useCart } from "../context/CartContext";

// GST Calculator (client-side)
const GST_RATES = {
  fashion: { threshold: 2500, lowRate: 0.05, highRate: 0.18 },
  tech: { rate: 0.18 },
  home: { rate: 0.18 },
  lifestyle: {
    "soaps/shampoos": 0.05,
    default: 0.18,
  },
  sports: { rate: 0.18 },
  apparel: { threshold: 2500, lowRate: 0.05, highRate: 0.18 },
  accessories: { threshold: 2500, lowRate: 0.05, highRate: 0.18 },
};

const calculateGST = (price, category, subcategory = "") => {
  const normalizedCategory = category.toLowerCase().trim();
  const rateConfig = GST_RATES[normalizedCategory];

  if (!rateConfig)
    return { rate: 0.18, cgst: 0.09, sgst: 0.09, totalTax: price * 0.18 };

  let rate = 0.18;

  if (rateConfig.threshold !== undefined) {
    rate =
      price <= rateConfig.threshold ? rateConfig.lowRate : rateConfig.highRate;
  } else if (rateConfig.rate !== undefined) {
    rate = rateConfig.rate;
  } else if (typeof rateConfig === "object" && !rateConfig.threshold) {
    const normalizedSub = subcategory.toLowerCase().trim();
    rate = rateConfig[normalizedSub] || rateConfig.default;
  }

  const totalTax = price * rate;
  return {
    rate,
    cgst: rate / 2,
    sgst: rate / 2,
    totalTax,
    totalWithTax: price + totalTax,
  };
};

const calculateCartTotals = (items) => {
  let subtotal = 0;
  let totalTax = 0;
  let totalCGST = 0;
  let totalSGST = 0;

  const itemBreakdown = items.map((item) => {
    const price = parseFloat(item.price) || 0;
    const itemTotal = price * item.quantity;
    const gst = calculateGST(
      price,
      item.categories || item.category || "fashion",
      item.subcategory || ""
    );

    const itemTax = itemTotal * gst.rate;
    const itemCGST = itemTotal * gst.cgst;
    const itemSGST = itemTotal * gst.sgst;

    subtotal += itemTotal;
    totalTax += itemTax;
    totalCGST += itemCGST;
    totalSGST += itemSGST;

    return {
      ...item,
      itemTotal,
      gstRate: (gst.rate * 100).toFixed(0),
      cgst: itemCGST,
      sgst: itemSGST,
      taxAmount: itemTax,
      totalWithTax: itemTotal + itemTax,
    };
  });

  return {
    items: itemBreakdown,
    subtotal,
    totalTax,
    totalCGST,
    totalSGST,
    shipping: subtotal > 0 ? 0 : 0,
    grandTotal: subtotal + totalTax,
  };
};

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const { updateCartCount } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      if (res.data.success) {
        setCart(res.data.cart);
        const totalItems = res.data.cart.products.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        updateCartCount(totalItems);
      }
    } catch (err) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQty) => {
    if (newQty < 1) return;
    try {
      const res = await api.put("/cart/update", {
        productId,
        quantity: newQty,
      });
      if (res.data.success) {
        setCart(res.data.cart);
        const totalItems = res.data.cart.products.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        updateCartCount(totalItems);
        toast.success("Quantity updated");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await api.delete(`/cart/remove/${productId}`);
      if (res.data.success) {
        setCart(res.data.cart);
        const totalItems = res.data.cart.products.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        updateCartCount(totalItems);
        toast.success("Item removed");
      }
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Clear your entire bag?")) return;
    try {
      const res = await api.delete("/cart/clear");
      if (res.data.success) {
        setCart({ ...cart, products: [] });
        updateCartCount(0);
        toast.success("Bag cleared");
      }
    } catch (err) {
      toast.error("Failed to clear bag");
    }
  };

  if (loading) {
    return (
      <section className="h-125 md:h-155 flex items-center justify-center bg-[#fcf8ff]">
        <div className="w-10 h-10 border-4 border-[#4648d4] border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  const cartItems = cart?.products || [];
  const populatedItems = cartItems.map((item) => ({
    ...item.productId,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
  }));

  const totals = calculateCartTotals(populatedItems);

  if (cartItems.length === 0) {
    return (
      <section className="h-125 md:h-155 overflow-hidden flex items-center justify-center bg-[#fcf8ff]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="w-24 h-24 rounded-full bg-[#4648d4]/10 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-[#4648d4]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a1a2e] font-['Manrope'] mb-2">
            Your bag is empty
          </h2>
          <p className="text-gray-500 mb-8">
            Looks like you haven't added anything yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#4648d4] text-white rounded-xl font-medium hover:bg-[#3a3cb8] transition-colors"
          >
            Start Shopping
          </Link>
        </motion.div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8ff] pt-3 mt-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a2e] font-['Manrope']">
              Your Bag
            </h1>
            <p className="text-gray-500 mt-1">
              Review your selection before reaching the peak of luxury.
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Cart Items - wider column */}
          <div className="lg:col-span-3 space-y-4">
            <AnimatePresence>
              {populatedItems.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 flex gap-5"
                >
                  <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-[#1a1a2e] font-['Manrope'] truncate">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.color} / Size {item.size}
                        </p>
                        <span className="inline-flex mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-[#4648d4]/10 text-[#4648d4]">
                          {item.categories}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-[#4648d4] font-['Manrope'] whitespace-nowrap">
                        ₹{parseFloat(item.price).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#4648d4] hover:text-[#4648d4] transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#4648d4] hover:text-[#4648d4] transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#4648d4]/10 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-[#4648d4]" />
              </div>
              <div>
                <p className="font-medium text-[#1a1a2e]">
                  Vyntra Authenticity Guaranteed
                </p>
                <p className="text-sm text-gray-500">
                  Every item is inspected by our experts before dispatch.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary - larger card, wider column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-[#1a1a2e] font-['Manrope'] mb-6">
                Order Summary
              </h2>

              {/* ─── PRODUCT LIST ─── */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                  Items in Bag
                </p>
                {totals.items.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1a1a2e] truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.color} / Size {item.size}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-[#1a1a2e]">
                        ₹{parseFloat(item.price).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <Truck size={14} />
                    Shipping
                  </span>
                  <span className="text-emerald-600 font-medium">FREE</span>
                </div>

                {/* GST Breakdown */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Tax Breakdown (Intra-state)
                  </p>
                  {totals.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between text-xs text-gray-500 py-1"
                    >
                      <span>
                        {item.title?.slice(0, 20)}... ({item.gstRate}%)
                      </span>
                      <span>₹{item.taxAmount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-gray-600 mt-2">
                    <span>CGST</span>
                    <span>₹{totals.totalCGST.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>SGST</span>
                    <span>₹{totals.totalSGST.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Tax (GST)</span>
                  <span>₹{totals.totalTax.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1a1a2e] font-['Manrope']">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-[#4648d4] font-['Manrope']">
                    ₹{totals.grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button className="w-full mt-6 py-3.5 bg-[#4648d4] text-white rounded-xl font-medium hover:bg-[#3a3cb8] transition-colors flex items-center justify-center gap-2">
                Checkout Now
                <span>→</span>
              </button>

              {/* Payment Icons */}
              <div className="mt-5 text-center">
                <p className="text-xs text-gray-400 mb-3">WE ACCEPT</p>
                <div className="flex items-center justify-center gap-3 text-gray-400">
                  <svg
                    width="32"
                    height="20"
                    viewBox="0 0 32 20"
                    fill="currentColor"
                  >
                    <circle cx="10" cy="10" r="10" fillOpacity="0.8" />
                    <circle cx="22" cy="10" r="10" fillOpacity="0.8" />
                  </svg>
                  <div className="w-8 h-5 bg-gray-200 rounded" />
                  <div className="w-8 h-5 bg-gray-200 rounded" />
                  <div className="w-8 h-5 bg-gray-200 rounded" />
                </div>
              </div>

              {/* Gift Note */}
              <div className="mt-5 p-3 bg-[#4648d4]/5 rounded-xl flex items-start gap-2">
                <Gift size={16} className="text-[#4648d4] mt-0.5 shrink-0" />
                <p className="text-xs text-[#4648d4]">
                  Complimentary eco-friendly gift wrapping included with this
                  order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
