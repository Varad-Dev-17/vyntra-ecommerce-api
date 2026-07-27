import React, { useState, useEffect } from 'react';
import { Package, Loader2, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const { getAuthHeaders } = useAuth();

  const fetchOrders = async (filter) => {
    setIsLoading(true);
    try {
      const endpoint = filter === 'all' ? '/orders/my-orders' : `/orders/my-orders?status=${filter}`;
      const response = await axios.get(endpoint, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const response = await axios.put(`/orders/cancel/${orderId}`, {}, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        toast.success('Order cancelled successfully');
        fetchOrders(activeFilter);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl h-full flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
        <p className="text-gray-500 text-center max-w-sm">
          When you place an order, it will appear here so you can track its status and view details.
        </p>
      </div>
    );
  }

  const filterTabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-[#4F46E5] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">No Orders Found</h2>
          <p className="text-gray-500 text-center max-w-sm text-sm">
            {activeFilter === 'all' 
              ? "When you place an order, it will appear here so you can track its status and view details." 
              : `You don't have any ${activeFilter} orders yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Order Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Order Placed</p>
                  <p className="text-gray-900 font-semibold">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Total</p>
                  <p className="text-gray-900 font-semibold">₹ {order.totalAmount}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Order ID</p>
                  <p className="text-gray-900 font-semibold">{order.orderId || order._id.toString().slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                {order.status === 'pending' && (
                  <button 
                    onClick={() => handleCancelOrder(order._id)}
                    className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
              <div className="divide-y divide-gray-100">
                {order.items.map((item, index) => {
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

                  return (
                  <div key={index} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                    <Link to={`/product/${item.product?.slug || item.product?._id}`}>
                      <img 
                        src={item.variant?.mainImage?.url || 'https://via.placeholder.com/100'} 
                        alt={item.product?.title || 'Product'} 
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-100"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link to={`/product/${item.product?.slug || item.product?._id}`}>
                        <h4 className="text-base font-semibold text-gray-900 hover:text-[#4F46E5] transition-colors mb-1">
                          {item.product?.title || 'Unknown Product'}
                        </h4>
                      </Link>
                      <div className="text-sm text-gray-500 mb-2">
                        Qty: {item.quantity} | Price: ₹ {item.price}
                      </div>
                      
                      <div className="text-sm text-gray-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                        {brandName && <p>Brand: <span className="font-medium text-gray-900">{brandName}</span></p>}
                        {color && <p>Color: <span className="font-medium text-gray-900">{color}</span></p>}
                        {size && <p>Size: <span className="font-medium text-gray-900">{size}</span></p>}
                      </div>
                    </div>
                    {order.status === 'delivered' && (
                      <button className="hidden sm:flex text-sm text-[#4F46E5] font-semibold hover:underline items-center gap-1">
                        Write Review <ExternalLink size={14} />
                      </button>
                    )}
                  </div>
                )})}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default OrdersSection;
