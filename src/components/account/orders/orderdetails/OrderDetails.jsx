import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Loader2, ArrowLeft, CheckCircle2, Truck, Clock, X, MapPin, Receipt, Phone, Mail, Package } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import toast from "react-hot-toast";
import CustomerTrackingCard from "./CustomerTrackingCard";
import ReturnExchangeButton from "../returnexchange/ReturnExchangeButton";
import { getReturnEligibility } from "../../../../utils/returnEligibility";

const OrderDetails = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/orders/${orderId}`, {
          headers: getAuthHeaders(),
        });
        if (response.data.success) {
          setOrder(response.data.data);
        }
      } catch (error) {
        toast.error("Failed to load order details");
        navigate("/account/orders");
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, getAuthHeaders, navigate]);

  // Auto-scroll to tracking section when navigated via "Return Requested" button
  useEffect(() => {
    if (order && location.state?.scrollToTracking) {
      setTimeout(() => {
        const elem = document.getElementById("customer-order-tracking");
        if (elem) {
          elem.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [order, location.state]);

  const getStatusBannerColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-600";
      case "on_the_way":
      case "shipped":
        return "bg-purple-600";
      case "packed":
      case "processing":
        return "bg-blue-600";
      case "cancelled":
        return "bg-red-600";
      default:
        return "bg-amber-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const statusDisplayMap = {
    pending: "Order Confirmed",
    processing: "Packed",
    packed: "Packed",
    shipped: "Shipped",
    on_the_way: "On The Way",
    delivered: "Delivered",
    cancelled: "Cancelled"
  };
  const statusDisplay = statusDisplayMap[order.status?.toLowerCase()] || (order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, " "));

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
      <button 
        onClick={() => navigate("/account/orders")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors font-medium text-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </button>

      <div className="space-y-6">
        {/* Render each item in the order */}
        {order.items.map((item, index) => {
          let color = "";
          let size = "";
          
          if (item.variant && item.variant.attributes) {
            item.variant.attributes.forEach(attr => {
              if (attr.attribute?.name?.toLowerCase() === "color") {
                color = attr.option?.displayName || color;
              }
              if (attr.attribute?.name?.toLowerCase() === "size") {
                size = attr.option?.displayName || size;
              }
            });
          }

          const brandName = item.product?.brand?.name;

          // Compute Return/Exchange eligibility
          const activeRequest = Array.isArray(order.returnRequests) ? order.returnRequests.find(req => 
            (req.product?._id || req.product) === (item.product?._id || item.product) &&
            !["rejected", "refunded", "exchanged"].includes(req.status)
          ) : null;
          const eligibility = getReturnEligibility(order, item, activeRequest);

          return (
            <div key={index} className="flex flex-col mb-4">
              {/* Product Header (Transparent container) */}
              <div className="flex flex-col items-center text-center pb-6">
                <div className="w-28 h-36 bg-gray-100 rounded-2xl overflow-hidden shadow-sm mb-4 border border-gray-200/60">
                  <img 
                    src={item.variant?.mainImage?.url || item.product?.images?.[0]?.url || "https://via.placeholder.com/150"} 
                    alt={item.product?.title || "Product"} 
                    className="w-full h-full object-cover"
                  />
                </div>
                {brandName && <h2 className="text-[14px] font-bold text-gray-900 uppercase tracking-widest">{brandName}</h2>}
                <p className="text-[14px] font-semibold text-gray-700 mt-1">{item.product?.title}</p>
                <div className="text-[12px] text-gray-500 mt-1 flex items-center justify-center gap-2 font-medium">
                  {size && <span>Size: {size}</span>}
                  {size && <span className="text-gray-300">•</span>}
                  <span>Quantity: {item.quantity}</span>
                </div>
                <div className="text-[12px] text-gray-400 mt-1 font-medium font-mono">
                  Order ID: #{order.orderId || order._id}
                </div>

                {/* Intelligent Return / Exchange Action Trigger */}
                <div className="mt-4">
                  <ReturnExchangeButton 
                    orderId={order._id || orderId} 
                    productId={item.product?._id || item.product} 
                    item={item}
                    eligibility={eligibility}
                    onClick={activeRequest ? () => {
                      const elem = document.getElementById("customer-order-tracking");
                      if (elem) elem.scrollIntoView({ behavior: "smooth" });
                    } : null}
                  />
                </div>
              </div>

              {/* Status Banner */}
              <div className={`${getStatusBannerColor(order.status)} rounded-xl px-5 py-4 flex items-center justify-between mb-2 shadow-sm relative overflow-hidden`}>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="bg-white/20 p-2 rounded-lg text-white">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="text-white">
                    <h4 className="font-bold text-[14px]">Status: {statusDisplay}</h4>
                    <p className="text-[12px] opacity-90 mt-0.5">
                      On {new Date(order.createdAt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                {order.status === "delivered" && (
                  <div className="hidden sm:flex absolute right-4 items-center justify-center w-16 h-16 rounded-full border-2 border-white/30 text-white/50 transform rotate-12 z-0">
                    <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center">
                      <span className="text-[8px] font-bold tracking-widest uppercase text-center leading-tight">Delivered<br/>Delivered</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Rate Product Section */}
              {order.status === "delivered" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-4 mt-2">
                  <div className="w-12 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={item.variant?.mainImage?.url || item.product?.images?.[0]?.url || "https://via.placeholder.com/100"} 
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-[13px] text-gray-900">Rate this product</p>
                    <div className="flex gap-1 mt-1 text-gray-200">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} className="hover:text-yellow-400 transition-colors cursor-pointer">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Dedicated Customer Lifecycle Tracking Dashboard (Phase 3 Enhancement) */}
        <CustomerTrackingCard order={order} />

        {/* Delivery Details Block */}
        {order.shippingAddress && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[14px] text-gray-900">Delivery To</h3>
                <p className="text-[13px] text-gray-500 font-semibold">{order.shippingAddress.name}</p>
              </div>
            </div>
            
            <div className="pl-13 space-y-4 ml-2 border-l-2 border-gray-50">
              <div className="flex gap-3 pl-4">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[12px] text-gray-900 font-medium">Contact Details</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">{order.shippingAddress.phone}</p>
                </div>
              </div>
              <div className="flex gap-3 pl-4">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 relative">
                  <p className="text-[12px] text-gray-900 font-medium">Delivery Address</p>
                  <p className="text-[12px] text-gray-500 mt-0.5 pr-12 leading-relaxed">
                    {order.shippingAddress.address}, {order.shippingAddress.city}
                  </p>
                  <div className="absolute right-0 top-0 w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#4F46E5]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Block */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs">
          <h3 className="font-bold text-[14px] text-gray-900 mb-4">Order Summary</h3>
          
          <div className="space-y-3 text-[13px] text-gray-600 mb-4 border-b border-gray-100 pb-4 font-medium">
            {order.totalMRP !== undefined && order.totalMRP > 0 && (
              <div className="flex justify-between">
                <span>Total MRP</span>
                <span>₹ {order.totalMRP}</span>
              </div>
            )}
            
            {order.discountAmount !== undefined && order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600 font-bold">
                <span>Total Savings</span>
                <span>- ₹ {order.discountAmount}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹ {order.subtotal}</span>
            </div>
            
            {order.shippingAmount !== undefined && (
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shippingAmount === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹ ${order.shippingAmount}`}</span>
              </div>
            )}
            
            {order.taxAmount !== undefined && (
              <div className="flex justify-between">
                <span>Tax (GST Inclusive)</span>
                <span>₹ {order.taxAmount}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[14px] text-gray-900">Grand Total</h3>
            <p className="font-extrabold text-[17px] text-gray-900">₹ {order.totalAmount}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 text-[13px] text-gray-700 border border-gray-100 font-medium">
            <div className="bg-white px-2 py-1 rounded text-[10px] font-extrabold text-gray-500 border border-gray-200 uppercase tracking-wider">
              {order.paymentMethod === "cod" ? "COD" : "UPI"}
            </div>
            <span>Paid by {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-4 mb-3 font-medium">Item sold by: Vyntra Retail</p>
          <button className="w-full py-2.5 border border-gray-200 rounded-lg text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
            Get Invoice
          </button>
        </div>

        {/* Updates Sent To Block */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs">
          <h3 className="font-bold text-[13px] text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            Updates sent to
          </h3>
          <div className="grid grid-cols-2 gap-4 pl-6 text-[12px]">
            <div>
              <p className="text-gray-400 mb-1 font-medium">Call</p>
              <p className="font-bold text-gray-900">{order.shippingAddress?.phone || order.user?.phone || "-"}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1 font-medium">Email</p>
              <p className="font-bold text-gray-900 truncate pr-2">{order.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Order Details Timestamps */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs">
          <h3 className="font-bold text-[13px] text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            Order details
          </h3>
          <div className="grid grid-cols-2 gap-4 pl-6 text-[12px]">
            <div>
              <p className="text-gray-400 mb-1 font-medium">Ordered On</p>
              <p className="font-bold text-gray-900">
                {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1 font-medium">Order ID</p>
              <p className="font-mono font-bold text-gray-900 uppercase">
                #{order.orderId || order._id}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetails;
