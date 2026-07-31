import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Package, ShoppingCart, RefreshCcw, FileText, Activity, CreditCard, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosConfig";
import PageCard from "../admin/ui/PageCard";

const RequestDetailsView = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isOrderView = location.pathname.includes("/admin/orders");
  const isReturnView = location.pathname.includes("/admin/returns");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [adminNotes, setAdminNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (isOrderView) {
          const res = await api.get(`/admin/orders/${id}`);
          if (res.data.success) {
            setData(res.data.data);
            setAdminNotes(res.data.data.adminNotes || "");
          }
        } else if (isReturnView) {
          const res = await api.get(`/admin/returns/${id}`);
          if (res.data.success) {
            setData(res.data.data);
            setAdminNotes(res.data.data.adminNotes || "");
          }
        }
      } catch (err) {
        console.error("Failed to fetch details:", err);
        setError("Failed to load details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, isOrderView, isReturnView]);

  const handleUpdateStatus = async (newStatus) => {
    if (!newStatus) return;
    try {
      setStatusUpdateLoading(true);
      if (isOrderView) {
        const res = await api.put(`/admin/orders/${id}`, { status: newStatus });
        if (res.data.success) {
          toast.success("Order status updated");
          setData(res.data.data); // Assuming the API returns the updated order
        }
      } else if (isReturnView) {
        const res = await api.put(`/admin/returns/${id}`, { status: newStatus });
        if (res.data.success) {
          toast.success("Return request status updated");
          setData(res.data.data);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setIsSavingNotes(true);
      if (isOrderView) {
        // Assuming there is an endpoint or we can use PUT /admin/orders/:id to save notes
        const res = await api.put(`/admin/orders/${id}`, { adminNotes });
        if (res.data.success) toast.success("Notes saved successfully");
      } else if (isReturnView) {
        const res = await api.put(`/admin/returns/${id}`, { adminNotes });
        if (res.data.success) toast.success("Notes saved successfully");
      }
    } catch (err) {
      toast.error("Failed to save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#4648d4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <p>{error || "Data not found"}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#4648d4] hover:underline font-medium">
          Go Back
        </button>
      </div>
    );
  }

  // --- Derive Data based on Context ---
  let user = null;
  let orderData = null;
  let returnData = null;
  let displayProducts = [];

  if (isOrderView) {
    orderData = data;
    user = data.user;
    displayProducts = data.items || [];
    // If there is a return request associated with this order, we could show it
    if (data.returnRequests && data.returnRequests.length > 0) {
      returnData = data.returnRequests[0];
    }
  } else if (isReturnView) {
    returnData = data;
    user = data.user;
    orderData = data.order;
    // Format product nicely for the UI
    if (data.product) {
      displayProducts = [{
        product: data.product,
        variant: data.originalVariant,
        price: data.originalPrice,
        quantity: 1, // Returns are typically handled 1 by 1 in this schema
      }];
    }
  }

  const pageTitle = isOrderView ? "Order Details" : "Request Details";
  const displayId = isOrderView ? orderData?.orderId : `RET${returnData?._id?.slice(-6).toUpperCase()}`;

  const renderTimeline = (type) => {
    let steps = [];
    let currentStatus = "";
    
    if (type === "order" && orderData) {
      steps = ["pending", "processing", "shipped", "delivered"];
      currentStatus = orderData.status;
    } else if (type === "return" && returnData) {
      steps = ["pending", "received", "approved", returnData.type === "exchange" ? "exchanged" : "refunded"];
      currentStatus = returnData.status;
      // Handle rejected state specially
      if (currentStatus === "rejected") {
        steps = ["pending", "received", "rejected"];
      }
    } else {
      return null;
    }

    const currentIndex = steps.indexOf(currentStatus);

    return (
      <div className="relative pl-3 mt-4 space-y-6">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100"></div>
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          let label = step;
          if (step === "pending" && type === "return") label = "Request Submitted";
          if (step === "received" && type === "return") label = "Item Received";
          if (step === "approved" && type === "return") label = "Approved";
          if (step === "refunded") label = "Refund Completed";
          if (step === "exchanged") label = "Exchange Completed";
          if (step === "rejected") label = "Request Rejected";
          
          return (
            <div key={step} className="relative flex gap-4">
              <div className={`w-3 h-3 rounded-full mt-1.5 relative z-10 flex-shrink-0 ${isCompleted ? 'bg-[#4648d4] ring-4 ring-indigo-50' : 'bg-white border-2 border-gray-200'}`}></div>
              <div>
                <p className={`text-sm font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'} capitalize`}>{label}</p>
                {isCurrent && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {/* Timestamp could go here */}
                    Current Status
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-2 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span className="hover:text-gray-900 cursor-pointer" onClick={() => navigate(isOrderView ? '/admin/orders' : '/admin/returns')}>
                {isOrderView ? "Orders" : "Returns & Exchanges"}
              </span>
              <ChevronRight size={14} />
              <span className="font-medium text-gray-900">{displayId}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
              {isReturnView && returnData && (
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${returnData.type === 'exchange' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {returnData.type}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isReturnView && returnData?.status === "pending" && (
            <button
              onClick={() => handleUpdateStatus("received")}
              disabled={statusUpdateLoading}
              className="px-4 py-2 bg-[#4648d4] text-white text-sm font-semibold rounded-lg hover:bg-[#3b3db0] transition-colors shadow-sm disabled:opacity-70"
            >
              Mark as Received
            </button>
          )}
          {isReturnView && returnData?.status === "received" && (
            <>
              <button
                onClick={() => handleUpdateStatus("rejected")}
                disabled={statusUpdateLoading}
                className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors shadow-sm disabled:opacity-70"
              >
                Reject
              </button>
              <button
                onClick={() => handleUpdateStatus("approved")}
                disabled={statusUpdateLoading}
                className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-semibold rounded-lg hover:bg-emerald-100 transition-colors shadow-sm disabled:opacity-70"
              >
                Approve
              </button>
            </>
          )}
          {isReturnView && returnData?.status === "approved" && (
            <button
              onClick={() => handleUpdateStatus(returnData.type === 'exchange' ? 'exchanged' : 'refunded')}
              disabled={statusUpdateLoading}
              className="px-4 py-2 bg-[#4648d4] text-white text-sm font-semibold rounded-lg hover:bg-[#3b3db0] transition-colors shadow-sm disabled:opacity-70"
            >
              Mark as Completed
            </button>
          )}

          {isOrderView && orderData && (
            <select
              value={orderData.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              disabled={statusUpdateLoading}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#4648d4] outline-none shadow-sm cursor-pointer disabled:opacity-70"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Customer Details */}
          <PageCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4648d4]">
                <User size={18} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Customer Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{user?.username || "Unknown"}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-sm text-gray-500">{user?.phone || orderData?.shippingAddress?.phone}</p>
              </div>
              {orderData?.shippingAddress && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Shipping Address</p>
                  <p className="text-sm text-gray-500">
                    {orderData.shippingAddress.address}, {orderData.shippingAddress.city}
                  </p>
                  <p className="text-sm text-gray-500">
                    {orderData.shippingAddress.state}, {orderData.shippingAddress.country} - {orderData.shippingAddress.zipCode}
                  </p>
                </div>
              )}
            </div>
          </PageCard>

          {/* Product Details */}
          <PageCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4648d4]">
                <Package size={18} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{isOrderView ? "Order Items" : "Product Details"}</h3>
            </div>

            <div className="flex flex-col gap-4">
              {displayProducts.map((item, idx) => {
                const prod = item.product;
                const vari = item.variant;
                if (!prod) return null;
                
                let color = "";
                let size = "";
                if (vari && vari.attributes) {
                  const colorAttr = vari.attributes.find(a => a.attribute?.name?.toLowerCase() === 'color' || a.name?.toLowerCase() === 'color');
                  const sizeAttr = vari.attributes.find(a => a.attribute?.name?.toLowerCase() === 'size' || a.name?.toLowerCase() === 'size');
                  if (colorAttr) color = colorAttr.option?.displayName || colorAttr.value;
                  if (sizeAttr) size = sizeAttr.option?.displayName || sizeAttr.value;
                }

                return (
                  <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                      {prod.images?.[0]?.url || vari?.mainImage?.url ? (
                        <img src={vari?.mainImage?.url || prod.images[0].url} alt={prod.title} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 m-auto text-gray-300 mt-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 line-clamp-1">{prod.title}</h4>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        {color && <span className="flex items-center gap-1.5"><span className="text-gray-400">Color:</span> <span className="font-medium text-gray-900">{color}</span></span>}
                        {size && <span className="flex items-center gap-1.5"><span className="text-gray-400">Size:</span> <span className="font-medium text-gray-900">{size}</span></span>}
                        <span className="flex items-center gap-1.5"><span className="text-gray-400">Qty:</span> <span className="font-medium text-gray-900">{item.quantity}</span></span>
                      </div>
                      <div className="mt-2">
                         <span className="font-semibold text-gray-900">₹ {item.price || item.sellingPrice || item.mrp || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </PageCard>

          {/* Order Details (Always show in both views) */}
          {orderData && (
            <PageCard className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4648d4]">
                      <ShoppingCart size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                      <span className="text-gray-500 text-sm">Order ID</span>
                      <span className="font-semibold text-gray-900 text-sm">{orderData.orderId}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                      <span className="text-gray-500 text-sm">Order Date</span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {new Date(orderData.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute:"2-digit" })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                      <span className="text-gray-500 text-sm">Payment Method</span>
                      <span className="font-semibold text-gray-900 text-sm uppercase">{orderData.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                      <span className="text-gray-500 text-sm">Payment Status</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${orderData.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                        {orderData.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4648d4]">
                      <Activity size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Order Timeline</h3>
                  </div>
                  {renderTimeline("order")}
                </div>
              </div>
            </PageCard>
          )}

          {/* Return / Exchange Details (Show if it's a return view OR if order has a return request) */}
          {returnData && (
            <PageCard className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                      <RefreshCcw size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Return / Exchange Details</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-start pb-3 border-b border-gray-50 gap-4">
                      <span className="text-gray-500 text-sm whitespace-nowrap">Reason</span>
                      <span className="font-semibold text-gray-900 text-sm text-right">{returnData.reason}</span>
                    </div>
                    
                    {returnData.additionalDetails && (
                      <div className="flex flex-col pb-3 border-b border-gray-50 gap-1">
                        <span className="text-gray-500 text-sm">Additional Details</span>
                        <p className="text-gray-900 text-sm leading-relaxed">{returnData.additionalDetails}</p>
                      </div>
                    )}

                    {returnData.images && returnData.images.length > 0 && (
                      <div className="flex flex-col pt-2 gap-2">
                        <span className="text-gray-500 text-sm">Images Uploaded</span>
                        <div className="flex flex-wrap gap-2">
                          {returnData.images.map((img, idx) => (
                            <div key={idx} className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                              <img src={img.url} alt="Return proof" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#4648d4]">
                      <Activity size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Request Timeline</h3>
                  </div>
                  {renderTimeline("return")}
                </div>
              </div>
            </PageCard>
          )}

          {/* Refund Details or Exchange Details (If applicable) */}
          {returnData && (
            <PageCard className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CreditCard size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {returnData.type === 'exchange' ? 'Exchange Settlement' : 'Refund Details'}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">Original Price</span>
                    <span className="font-semibold text-gray-900 text-sm">₹ {returnData.originalPrice || 0}</span>
                  </div>
                  {returnData.type === 'exchange' && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                      <span className="text-gray-500 text-sm">Exchange Price</span>
                      <span className="font-semibold text-gray-900 text-sm">₹ {returnData.exchangePrice || 0}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">Settlement Type</span>
                    <span className="font-semibold text-gray-900 text-sm capitalize">{returnData.settlementType?.replace('_', ' ') || 'Refund'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">Difference Amount</span>
                    <span className="font-bold text-[#4648d4] text-sm">₹ {Math.abs(returnData.priceDifference || returnData.originalPrice || 0)}</span>
                  </div>
                </div>
                
                {returnData.type === 'exchange' && returnData.requestedExchangeVariant && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center">
                    <p className="text-sm font-semibold text-gray-900 mb-3 text-center">Exchange Item Selected</p>
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                         <img src={returnData.requestedExchangeVariant?.mainImage?.url} alt="Exchange variant" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        {returnData.requestedExchangeVariant?.attributes?.map((attr, i) => (
                           <p key={i} className="text-sm text-gray-600">
                             <span className="font-medium text-gray-900">{attr.attribute?.name || attr.name}:</span> {attr.option?.displayName || attr.value}
                           </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </PageCard>
          )}

          {/* Admin Notes */}
          <PageCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                  <FileText size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Admin Notes</h3>
              </div>
              <button 
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="px-4 py-1.5 bg-[#4648d4]/10 text-[#4648d4] text-sm font-semibold rounded-md hover:bg-[#4648d4]/20 transition-colors disabled:opacity-50"
              >
                {isSavingNotes ? "Saving..." : "Save Notes"}
              </button>
            </div>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes about this request or order... (Not visible to customer)"
              className="w-full h-32 p-4 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:bg-white focus:border-[#4648d4] focus:ring-1 focus:ring-[#4648d4] transition-all text-sm resize-none text-gray-700"
            ></textarea>
          </PageCard>
          
        </div>

        {/* Right Column (1/3) */}
        <div className="flex flex-col gap-6">
          
          {/* Summary Card for Returns */}
          {isReturnView && returnData && (
             <PageCard className="p-6 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
               <h3 className="text-lg font-bold text-gray-900 mb-4">Request Summary</h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-center">
                   <span className="text-gray-500 text-sm">Type</span>
                   <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${returnData.type === 'exchange' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                     {returnData.type}
                   </span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-gray-500 text-sm">Status</span>
                   <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-gray-200 text-gray-900 capitalize">
                     {returnData.status}
                   </span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-gray-500 text-sm">Requested</span>
                   <span className="font-semibold text-gray-900 text-sm">
                     {new Date(returnData.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                   </span>
                 </div>
               </div>
             </PageCard>
          )}

          {/* Activity Log (Mocked for now, but UI structure exists) */}
          <PageCard className="p-6">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                  <Activity size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Activity Log</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1 pb-3 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 text-sm">System</span>
                    <span className="text-xs text-gray-500">
                       {new Date((returnData || orderData).createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute:"2-digit" })}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {isReturnView ? "Return/Exchange request created" : "Order placed by customer"}
                  </span>
                </div>
                {/* Additional log entries could be mapped here if backend supports an activity log array */}
              </div>
          </PageCard>
          
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsView;
