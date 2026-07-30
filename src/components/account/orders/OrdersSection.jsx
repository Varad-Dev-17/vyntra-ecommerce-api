import React, { useState, useEffect } from 'react';
import { Package, Loader2, Filter, ChevronRight, X, CheckCircle2, Truck, Clock } from 'lucide-react';
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
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All orders</h2>
          <p className="text-sm text-gray-500 mt-1">from {activeFilterTime.replace(/_/g, ' ')}</p>
        </div>

        <button
          onClick={openFilterModal}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
        </div>
      ) : orderItems.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">No Orders Found</h2>
          <p className="text-gray-500 text-center max-w-sm text-sm">
            We couldn't find any orders matching your current filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
            
            // Check if there is an active return/exchange request for this specific item+variant in this order
            const activeRequest = returnRequests.find(req => 
              req.order === order._id && 
              (req.product?._id || req.product) === (item.product?._id || item.product) &&
              (req.originalVariant?._id || req.originalVariant) === (item.variant?._id || item.variant) &&
              !['rejected', 'refunded', 'exchanged'].includes(req.status)
            );
            
            const eligibility = getReturnEligibility(order, item, activeRequest);

            return (
              <div
                key={`${order._id}-${index}`}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer mb-4"
                onClick={() => navigate(`/account/orders/${order._id}`)}
              >
                {/* Header: Status */}
                <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-gray-100 flex items-center justify-center bg-white shadow-sm flex-shrink-0">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className={`text-[17px] font-medium ${getStatusColor(order.status)}`}>
                        {statusDisplay}
                      </h3>
                      <p className="text-[14px] text-gray-500 mt-0.5">
                        On {new Date(order.createdAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {(order.status === 'pending' || order.status === 'processing') && (
                    <button
                      onClick={(e) => handleCancelOrder(e, order._id)}
                      className="px-4 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <ReturnExchangeButton 
                      orderId={order._id} 
                      productId={item.product?._id} 
                      item={item}
                      eligibility={eligibility}
                    />
                  )}
                </div>

                {/* Body: Product Info */}
                <div className="p-5 flex items-center gap-5 relative">
                  <img
                    src={item.variant?.mainImage?.url || 'https://via.placeholder.com/100'}
                    alt={item.product?.title || 'Product'}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-lg border border-gray-100 bg-white"
                  />

                  <div className="flex-1">
                    {brandName && <h4 className="text-[16px] font-bold text-[#0F172A] mb-1">{brandName}</h4>}
                    <p className="text-[15px] text-[#334155] mb-2 pr-8">
                      {item.product?.title || 'Unknown Product'}
                    </p>
                    <div className="text-[14px] text-gray-500 flex flex-wrap gap-x-3 mb-1.5">
                      {color && <span>Color: {color}</span>}
                      {size && <span>Size: {size}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <p className="text-[14px] font-bold text-gray-900">Order Total: ₹{order.totalAmount}</p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 absolute right-5 top-1/2 -translate-y-1/2" />
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

