import React, { useState, useEffect } from 'react';
import { Package, Loader2, Filter, ChevronRight, X, CheckCircle2, Truck, Clock, ShoppingBag, ShieldCheck, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import ReturnExchangeButton from './returnexchange/ReturnExchangeButton';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getReturnEligibility } from '../../../utils/returnEligibility';

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [activeFilterStatus, setActiveFilterStatus] = useState('all');
  const [activeFilterTime, setActiveFilterTime] = useState('anytime');

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState('all');
  const [tempTime, setTempTime] = useState('anytime');

  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const fetchOrdersAndRequests = async (status, time) => {
    setIsLoading(true);
    try {
      let endpoint = `/orders/my-orders?`;
      if (status && status !== 'all') endpoint += `status=${status}&`;
      if (time && time !== 'anytime') endpoint += `time=${time}&`;

      const [ordersRes, requestsRes] = await Promise.all([
        axios.get(endpoint, { headers: getAuthHeaders() }),
        axios.get('/return-requests/my-requests', { headers: getAuthHeaders() })
      ]);

      if (ordersRes.data.success) {
        setOrders(ordersRes.data.data.orders);
      }
      if (requestsRes.data?.success) {
        setReturnRequests(requestsRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load orders or requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndRequests(activeFilterStatus, activeFilterTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilterStatus, activeFilterTime]);

  const applyFilters = () => {
    setActiveFilterStatus(tempStatus);
    setActiveFilterTime(tempTime);
    setIsFilterModalOpen(false);
  };

  const clearFilters = () => {
    setTempStatus('all');
    setTempTime('anytime');
    setActiveFilterStatus('all');
    setActiveFilterTime('anytime');
    setIsFilterModalOpen(false);
  };

  const openFilterModal = () => {
    setTempStatus(activeFilterStatus);
    setTempTime(activeFilterTime);
    setIsFilterModalOpen(true);
  };

  const handleCancelOrder = async (e, orderId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        const response = await axios.put(`/orders/cancel/${orderId}`, {}, {
          headers: getAuthHeaders()
        });
        if (response.data.success) {
          toast.success("Order cancelled successfully");
          fetchOrdersAndRequests(activeFilterStatus, activeFilterTime);
        }
      } catch (error) {
        toast.error("Failed to cancel order");
      }
    }
  };

  // Flatten orders into individual items for the list view
  const orderItems = [];
  orders.forEach(order => {
    order.items.forEach(item => {
      orderItems.push({ order, item });
    });
  });

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600';
      case 'shipped':
        return 'text-purple-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-[#d97706]'; // orange for processing/pending
    }
  };

  return (
    <div className="w-full">
      {/* Status Filter Tabs with Inline Filters Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 mb-6">
        <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar -mb-px">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'processing', label: 'Processing' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => {
            const isActive = activeFilterStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveFilterStatus(tab.id);
                  setTempStatus(tab.id);
                }}
                className={`pb-3 px-1 text-sm sm:text-[15px] transition-all duration-200 whitespace-nowrap cursor-pointer relative ${
                  isActive 
                    ? 'text-[#4F46E5] font-bold border-b-2 border-[#4F46E5]' 
                    : 'text-gray-500 hover:text-gray-800 font-medium border-b-2 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={openFilterModal}
          className="flex items-center gap-1.5 px-4 py-1.5 mb-2 rounded-full border border-gray-300 hover:bg-gray-50 text-xs sm:text-sm font-medium text-gray-700 transition-all shadow-2xs shrink-0 cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5 text-[#4F46E5]" />
          <span>Filters</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-80">
          <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
        </div>
      ) : orderItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-200/80 shadow-xs text-center px-4">
          <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-5 border border-indigo-100">
            <Package className="w-10 h-10 text-[#4F46E5]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h2>
          <p className="text-gray-500 max-w-md text-sm leading-relaxed">
            We couldn't find any orders matching your current filter selection. Try adjusting your filters to see more results.
          </p>
          <button
            onClick={clearFilters}
            className="mt-6 px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {orderItems.map(({ order, item }, index) => {
            let color = '';
            let size = '';

            if (item.variant && item.variant.attributes) {
              item.variant.attributes.forEach(attr => {
                if (attr.attribute?.name?.toLowerCase() === 'color') {
                  color = attr.option?.displayName || color;
                }
                if (attr.attribute?.name?.toLowerCase() === 'size') {
                  size = attr.option?.displayName || size;
                }
              });
            }

            const brandName = item.product?.brand?.name;
            const statusDisplay = order.status.charAt(0).toUpperCase() + order.status.slice(1);
            
            const activeRequest = returnRequests.find(req => 
              req.order === order._id && 
              (req.product?._id || req.product) === (item.product?._id || item.product) &&
              (req.originalVariant?._id || req.originalVariant) === (item.variant?._id || item.variant) &&
              !['rejected', 'refunded', 'exchanged'].includes(req.status)
            );
            
            const eligibility = getReturnEligibility(order, item, activeRequest);
            const deliveryDate = order.deliveredAt || order.updatedAt || order.createdAt;

            return (
              <div
                key={`${order._id}-${index}`}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer w-full"
                onClick={() => navigate(`/account/orders/${order._id}`)}
              >
                {/* Card Header Row: Order ID, Placed Date & Status */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                    <div>
                      <span className="font-medium text-gray-600">Order ID: </span>
                      <span className="font-medium text-[#4F46E5]">#{order.orderId || order._id}</span>
                    </div>
                    <div className="text-gray-500">
                      Placed on: <span className="text-gray-700 font-medium">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Far-right Status Indicator */}
                  <div className="flex items-center gap-2 font-medium text-xs sm:text-sm">
                    {order.status === 'delivered' ? (
                      <div className="flex items-center gap-1.5 text-green-600">
                        <span>Delivered on: {new Date(deliveryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      </div>
                    ) : order.status === 'shipped' ? (
                      <div className="flex items-center gap-1.5 text-purple-600">
                        <span>Shipped (On the way)</span>
                        <Truck className="w-4 h-4 shrink-0" />
                      </div>
                    ) : order.status === 'cancelled' ? (
                      <div className="flex items-center gap-1.5 text-red-600">
                        <span>Cancelled on: {new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <X className="w-4 h-4 shrink-0" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-600">
                        <span className="capitalize">{order.status || 'Processing'} Order</span>
                        <Clock className="w-4 h-4 shrink-0 animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body: Product Info & Action Stack */}
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative">
                  {/* Left & Center: Product Image + Specs */}
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
                    <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-lg bg-gray-100 border border-gray-200/80 shrink-0 overflow-hidden relative group">
                      <img
                        src={item.variant?.mainImage?.url || item.product?.images?.[0]?.url || 'https://via.placeholder.com/150'}
                        alt={item.product?.title || 'Product'}
                        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Status Tag Pill Badge above title */}
                      <div className="mb-1.5">
                        {activeRequest ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100">
                            <RefreshCw className="w-3 h-3 animate-spin-slow text-[#4F46E5]" />
                            {activeRequest.type === 'exchange' ? 'Exchange' : 'Return'} Requested
                          </span>
                        ) : order.status === 'delivered' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            Delivered
                          </span>
                        ) : order.status === 'shipped' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            Shipped
                          </span>
                        ) : null}
                      </div>

                      {brandName && (
                        <h4 className="text-[15px] font-bold text-[#0F172A] tracking-tight mb-0.5 truncate">
                          {brandName}
                        </h4>
                      )}
                      <p className="text-[14px] text-[#334155] mb-2 truncate pr-4">
                        {item.product?.title || 'Unknown Product'}
                      </p>

                      {/* Specifications with vertical divider */}
                      <div className="text-[13px] text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                        {color && (
                          <span className="flex items-center gap-2">
                            <span>Color: {color}</span>
                            <span className="text-gray-300">|</span>
                          </span>
                        )}
                        {size && (
                          <span className="flex items-center gap-2">
                            <span>Size: {size}</span>
                            <span className="text-gray-300">|</span>
                          </span>
                        )}
                        <span>Qty: {item.quantity}</span>
                      </div>

                      {/* Price Display */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-[15px] font-bold text-gray-900">
                          ₹{item.price ? (item.price * item.quantity).toLocaleString('en-IN') : order.totalAmount?.toLocaleString('en-IN')}
                        </span>
                        {order.items?.length > 1 && (
                          <span className="text-xs text-gray-400 font-medium">
                            (Order Total: ₹{order.totalAmount?.toLocaleString('en-IN')})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions Column - Button Stack without Rate & Review */}
                  <div className="w-full sm:w-52 shrink-0 flex flex-col gap-2.5 justify-center border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <button
                        onClick={(e) => handleCancelOrder(e, order._id)}
                        className="w-full py-1.5 px-4 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}

                    {order.status === 'delivered' && (
                      <ReturnExchangeButton 
                        orderId={order._id} 
                        productId={item.product?._id || item.product} 
                        item={item}
                        eligibility={eligibility}
                      />
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const pId = item.product?._id || item.product;
                        if (pId && typeof pId === 'string') {
                          navigate(`/product/${pId}`);
                        } else {
                          navigate(`/account/orders/${order._id}`);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-4 text-sm font-medium text-gray-700 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#4F46E5] transition-colors shrink-0" />
                      <span>Buy Again</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Filter Orders</h3>
              <button onClick={() => setIsFilterModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Status Filters */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Status</h4>
                <div className="space-y-3">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'processing', label: 'Processing' },
                    { id: 'shipped', label: 'Shipped (On the way)' },
                    { id: 'delivered', label: 'Delivered' },
                    { id: 'cancelled', label: 'Cancelled' }
                  ].map((option) => (
                    <label key={option.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${tempStatus === option.id ? 'border-[#4F46E5] bg-[#4F46E5]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                        {tempStatus === option.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm text-gray-700">{option.label}</span>
                      <input
                        type="radio"
                        name="status"
                        value={option.id}
                        checked={tempStatus === option.id}
                        onChange={() => setTempStatus(option.id)}
                        className="hidden"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100 my-4" />

              {/* Time Filters */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3">Time</h4>
                <div className="space-y-3">
                  {[
                    { id: 'anytime', label: 'Anytime' },
                    { id: 'last_30_days', label: 'Last 30 days' },
                    { id: 'last_6_months', label: 'Last 6 months' },
                    { id: 'last_year', label: 'Last year' }
                  ].map((option) => (
                    <label key={option.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${tempTime === option.id ? 'border-[#4F46E5] bg-[#4F46E5]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                        {tempTime === option.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm text-gray-700">{option.label}</span>
                      <input
                        type="radio"
                        name="time"
                        value={option.id}
                        checked={tempTime === option.id}
                        onChange={() => setTempTime(option.id)}
                        className="hidden"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-4">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                CLEAR FILTERS
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 py-3 px-4 bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-md text-sm font-bold transition-colors"
              >
                APPLY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersSection;

