import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, User, Package, RefreshCcw, FileText, Activity, 
  CreditCard, ChevronRight, Phone, Mail, Download, Edit, 
  MapPin, Clock, CheckCircle2, MoreHorizontal, Printer
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosConfig";

const SectionCard = ({ icon: Icon, title, editAction, children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col ${className}`}>
    <div className="flex justify-between items-center mb-5 border-b border-gray-50 pb-3">
      <div className="flex items-center gap-2 text-[#4648d4]">
        {Icon && <Icon size={18} />}
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      {editAction && (
        <button className="flex items-center gap-1 text-[#4648d4] text-xs font-semibold hover:underline">
          <Edit size={12} /> {editAction}
        </button>
      )}
    </div>
    <div className="flex-1 flex flex-col">{children}</div>
  </div>
);

const VerticalTimeline = ({ type, data }) => {
  let steps = [];
  let currentStatus = "";
  let date = data?.createdAt;
  
  if (type === "order" && data) {
    steps = ["Ordered", "Packed", "Shipped", "Delivered"];
    const statusMap = {
      pending: "Ordered",
      processing: "Packed",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Ordered"
    };
    currentStatus = statusMap[data.status] || "Ordered";
  } else if (type === "return" && data) {
    steps = ["Request Submitted", "Under Review", "Customer Response", "Request Completed"];
    const statusMap = {
      pending: "Request Submitted",
      received: "Under Review",
      approved: "Customer Response",
      refunded: "Request Completed",
      exchanged: "Request Completed",
      rejected: "Request Completed"
    };
    currentStatus = statusMap[data.status] || "Request Submitted";
  }

  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="relative pl-2 h-full flex flex-col justify-between py-1">
      <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200"></div>
      
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        
        return (
          <div key={step} className="relative flex items-start gap-3">
            <div className={`w-2.5 h-2.5 mt-1 rounded-full z-10 flex-shrink-0 ${isCompleted ? 'bg-[#4648d4] ring-4 ring-indigo-50' : 'bg-white border-2 border-gray-300'}`}></div>
            <div className="-mt-1">
              <p className={`text-xs font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                 {isCompleted && date ? new Date(date).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute:"2-digit" }) : "-"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

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
  const [updateStatusVal, setUpdateStatusVal] = useState("pending");

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
            setUpdateStatusVal(res.data.data.status);
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
          setData(res.data.data);
        }
      } else if (isReturnView) {
        const res = await api.put(`/admin/returns/${id}`, { status: newStatus });
        if (res.data.success) {
          toast.success("Return request status updated");
          setData(res.data.data);
          setUpdateStatusVal(res.data.data.status);
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
    if (data.returnRequests && data.returnRequests.length > 0) {
      returnData = data.returnRequests[0];
    }
  } else if (isReturnView) {
    returnData = data;
    user = data.user;
    orderData = data.order;
    if (data.product) {
      displayProducts = [{
        product: data.product,
        variant: data.originalVariant,
        price: data.originalPrice,
        quantity: 1, 
      }];
    }
  }

  const pageTitle = isOrderView ? "Order Details" : "Request Details";
  const displayId = isOrderView ? orderData?.orderId : (returnData?._id ? `RET${returnData._id.slice(-6).toUpperCase()}` : "N/A");
  const displayDate = (returnData || orderData)?.createdAt ? new Date((returnData || orderData).createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute:"2-digit" }) : "N/A";

  const getAttr = (variant, attrName) => {
    return variant?.attributes?.find(a => a.attribute?.name?.toLowerCase() === attrName || a.name?.toLowerCase() === attrName)?.option?.displayName;
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 pt-0 pb-12 max-w-[1400px] mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="hover:text-[#4648d4] font-semibold cursor-pointer" onClick={() => navigate(isOrderView ? '/admin/orders' : '/admin/returns')}>
              {isOrderView ? "Orders" : "Returns & Exchanges"}
            </span>
            <ChevronRight size={14} />
            <span className="font-bold text-gray-900">{displayId}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            {isReturnView && returnData && (
              <span className={`px-2.5 py-1 rounded-full border text-xs font-bold capitalize ${returnData.type === 'exchange' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                {returnData.type}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium">
            {isOrderView ? "Order ID" : "Request ID"}: <span className="text-gray-900">{displayId}</span> &nbsp;•&nbsp; {isOrderView ? "Ordered on" : "Requested on"}: <span className="text-gray-900">{displayDate}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
           <span className="text-xs font-semibold text-gray-500 hidden lg:block">Update Status</span>
           <select
             value={updateStatusVal}
             onChange={(e) => setUpdateStatusVal(e.target.value)}
             className="px-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-lg focus:outline-none focus:border-[#4648d4] focus:ring-1 focus:ring-[#4648d4] cursor-pointer"
           >
             {isReturnView ? (
               <>
                 <option value="pending">Pending Review</option>
                 <option value="received">Item Received</option>
                 <option value="approved">Approved</option>
                 <option value="exchanged">Exchange Completed</option>
                 <option value="refunded">Refund Completed</option>
                 <option value="rejected">Rejected</option>
               </>
             ) : (
               <>
                 <option value="pending">Pending</option>
                 <option value="processing">Processing</option>
                 <option value="shipped">Shipped</option>
                 <option value="delivered">Delivered</option>
                 <option value="cancelled">Cancelled</option>
               </>
             )}
           </select>
           <button onClick={() => handleUpdateStatus(updateStatusVal)} disabled={statusUpdateLoading} className="px-5 py-2.5 bg-[#4648d4] text-white text-xs font-bold rounded-lg hover:bg-[#3b3db0] shadow-sm disabled:opacity-70 transition-colors">
             Update
           </button>
           <button className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm hidden md:flex">
             <Printer size={14} /> Print
           </button>
           <button className="p-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors">
             <MoreHorizontal size={16} />
           </button>
        </div>
      </div>

      {/* ROW 1: 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Details */}
        <SectionCard icon={User} title="Customer Details">
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex">
              <span className="text-gray-500 w-20 shrink-0">Name:</span>
              <span className="font-semibold text-gray-900">{user?.username || "Unknown"}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-20 shrink-0">Email:</span>
              <span className="font-semibold text-gray-900 break-all">{user?.email || "N/A"}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-20 shrink-0">Gender:</span>
              <span className="font-semibold text-gray-900 capitalize">{user?.gender || "N/A"}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-20 shrink-0">Mobile no.:</span>
              <span className="font-semibold text-gray-900">{user?.mobileNo || orderData?.shippingAddress?.phone || "N/A"}</span>
            </div>
            {orderData?.shippingAddress && (
              <>
                <div className="flex">
                  <span className="text-gray-500 w-20 shrink-0">Address:</span>
                  <span className="font-semibold text-gray-900 leading-relaxed">
                    {[orderData.shippingAddress.address, orderData.shippingAddress.city, orderData.shippingAddress.state, orderData.shippingAddress.country].filter(Boolean).join(', ')}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-20 shrink-0">Pincode:</span>
                  <span className="font-semibold text-gray-900">{orderData.shippingAddress.zipCode || orderData.shippingAddress.pincode || "N/A"}</span>
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* Product Details */}
        <SectionCard icon={Package} title="Product Details">
          <div className="flex flex-col gap-4 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
            {displayProducts.length === 0 && <p className="text-sm text-gray-500">No products found.</p>}
            {displayProducts.map((item, idx) => {
               const prod = item.product;
               const vari = item.variant;
               if (!prod) return null;
               
               const color = getAttr(vari, 'color');
               const size = getAttr(vari, 'size');
               const img = vari?.mainImage?.url || prod.images?.[0]?.url;
               
               return (
                 <div className="flex gap-4" key={idx}>
                  <div className="w-1/3 aspect-[4/5] rounded-xl bg-gray-100 flex-shrink-0 border border-gray-200 overflow-hidden">
                    {img ? <img src={img} alt={prod.title} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 m-auto text-gray-400 mt-8" />}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="font-bold text-gray-900 text-sm line-clamp-2">{prod.title}</span>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-2.5">
                      <span>Color: <span className="font-semibold text-gray-700">{color || 'N/A'}</span></span>
                      <span>Size: <span className="font-semibold text-gray-700">{size || 'N/A'}</span></span>
                      <span>Qty: <span className="font-semibold text-gray-700">{item.quantity || 1}</span></span>
                    </div>
                    <p className="font-bold text-gray-900 mt-3">Price: ₹ {item.price || vari?.price || 0}</p>
                  </div>
                </div>
               )
            })}
          </div>
        </SectionCard>

        {/* Request Summary */}
        <SectionCard icon={FileText} title={isReturnView ? "Request Summary" : "Order Summary"}>
          <div className="flex flex-col gap-4 text-sm h-full justify-center">
            {isReturnView ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Request Type</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize border ${returnData?.type === 'exchange' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                    {returnData?.type || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Reason</span>
                  <span className="font-semibold text-gray-900 text-xs line-clamp-1 max-w-[60%] text-right">{returnData?.reason || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Status</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-orange-100 bg-orange-50 text-orange-600 capitalize">
                    {returnData?.status || "Pending"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Requested on</span>
                  <span className="text-gray-900 text-xs">
                    {returnData?.createdAt ? new Date(returnData.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute:"2-digit" }) : "N/A"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Total Items</span>
                  <span className="font-semibold text-gray-900 text-xs">{displayProducts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Total Amount</span>
                  <span className="font-bold text-[#4648d4] text-xs">₹ {orderData?.totalAmount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Order Status</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100 bg-emerald-50 text-emerald-600 capitalize">
                    {orderData?.status || "Pending"}
                  </span>
                </div>
              </>
            )}

          </div>
        </SectionCard>
      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details (col-span-1) */}
        {orderData && (
          <SectionCard icon={Package} title="Order Details" editAction="Edit Order Status" className={!returnData ? "lg:col-span-3" : "lg:col-span-1"}>
            <div className={`flex flex-col md:flex-row gap-6 h-full ${!returnData ? 'md:w-2/3 mx-auto' : ''}`}>
               {/* Left Side: Order Info */}
               <div className={`flex-1 flex flex-col justify-center gap-5 text-sm ${!returnData ? 'border-r border-gray-100 pr-8' : 'border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4'}`}>
                 <div className="flex justify-between items-center gap-2">
                   <div className="flex items-center gap-2 text-gray-500 text-xs"><Package size={14}/> Order ID</div>
                   <span className="font-semibold text-gray-900 text-xs text-right truncate max-w-[150px]">{orderData.orderId || (orderData._id ? "Deleted Order" : "N/A")}</span>
                 </div>
                 <div className="flex justify-between items-center gap-2">
                   <div className="flex items-center gap-2 text-gray-500 text-xs"><Clock size={14}/> Order Date</div>
                   <span className="font-semibold text-gray-900 text-xs text-right">
                     {orderData.createdAt ? new Date(orderData.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute:"2-digit" }) : "N/A"}
                   </span>
                 </div>
                 <div className="flex justify-between items-center gap-2">
                   <div className="flex items-center gap-2 text-gray-500 text-xs"><CreditCard size={14}/> Payment</div>
                   <span className="font-semibold text-gray-900 text-xs text-right capitalize">{orderData.paymentMethod}</span>
                 </div>
                 <div className="flex justify-between items-center gap-2">
                   <div className="flex items-center gap-2 text-gray-500 text-xs"><Activity size={14}/> Pay Status</div>
                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${orderData.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                     {orderData.paymentStatus}
                   </span>
                 </div>
                 <div className="flex justify-between items-center gap-2">
                   <div className="flex items-center gap-2 text-gray-500 text-xs"><CheckCircle2 size={14}/> Ord Status</div>
                   <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-600 capitalize">
                     {orderData.status}
                   </span>
                 </div>
                 
                 {isReturnView && (
                   <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                     <button onClick={() => navigate(`/admin/orders/${orderData._id}`)} className="flex-1 py-2 border border-[#4648d4] text-[#4648d4] hover:bg-[#4648d4]/5 transition-colors font-bold text-xs rounded-lg text-center flex items-center justify-center gap-1.5">View Order <ChevronRight size={12}/></button>
                   </div>
                 )}
               </div>
               {/* Right Side: Timeline */}
               <div className={`md:w-2/5 ${!returnData ? 'pl-8 py-2' : 'pl-2'}`}>
                  <VerticalTimeline type="order" data={orderData} />
               </div>
            </div>
          </SectionCard>
        )}

        {/* Return / Exchange Details (col-span-2) */}
        {returnData && (
          <SectionCard icon={RefreshCcw} title="Return / Exchange Details" editAction="Edit Request Status" className={orderData ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="flex flex-col md:flex-row gap-6 h-full">
               <div className="flex-1 flex flex-col gap-4 text-sm md:border-r border-gray-100 md:pr-6">
                  <div className="flex items-start gap-4">
                     <span className="text-gray-500 text-xs w-1/3">Reason</span>
                     <span className="font-semibold text-gray-900 text-xs flex-1">{returnData.reason || "N/A"}</span>
                  </div>
                  {returnData.type === 'exchange' && (
                    <>
                      <div className="flex items-start gap-4">
                         <span className="text-gray-500 text-xs w-1/3">Requested Size</span>
                         <span className="font-semibold text-gray-900 text-xs flex-1">
                           {getAttr(returnData.requestedExchangeVariant, 'size') || "N/A"}
                         </span>
                      </div>
                      <div className="flex items-start gap-4">
                         <span className="text-gray-500 text-xs w-1/3">Requested Color</span>
                         <span className="font-semibold text-gray-900 text-xs flex-1">
                           {getAttr(returnData.requestedExchangeVariant, 'color') || "N/A"}
                         </span>
                      </div>
                    </>
                  )}
                  <div className="flex items-start gap-4">
                     <span className="text-gray-500 text-xs w-1/3">Additional Details</span>
                     <span className="font-medium text-gray-700 text-xs flex-1 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                       {returnData.additionalDetails || "No additional details provided."}
                     </span>
                  </div>
                  {returnData.images && returnData.images.length > 0 && (
                    <div className="flex items-start gap-4 mt-1">
                       <span className="text-gray-500 text-xs w-1/3 pt-1">Images Uploaded</span>
                       <div className="flex gap-2 flex-1 flex-wrap">
                         {returnData.images.slice(0, 3).map((img, i) => (
                           <div key={i} className="w-12 h-12 rounded border border-gray-200 overflow-hidden relative cursor-pointer hover:opacity-90">
                             <img src={img.url} className="w-full h-full object-cover" alt="Proof" />
                             {i === 2 && returnData.images.length > 3 && (
                               <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">
                                 +{returnData.images.length - 3}
                               </div>
                             )}
                           </div>
                         ))}
                       </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2.5 mt-auto pt-5 border-t border-gray-50">
                     <button onClick={() => handleUpdateStatus("approved")} disabled={statusUpdateLoading} className="flex-1 py-2 border border-emerald-500 text-emerald-600 font-bold text-xs rounded-lg text-center hover:bg-emerald-50 disabled:opacity-50 transition-colors">Approve</button>
                     <button onClick={() => handleUpdateStatus("rejected")} disabled={statusUpdateLoading} className="flex-1 py-2 border border-red-500 text-red-500 font-bold text-xs rounded-lg text-center hover:bg-red-50 disabled:opacity-50 transition-colors">Reject</button>
                     <button className="flex-1 py-2 border border-gray-300 text-gray-700 font-bold text-xs rounded-lg text-center hover:bg-gray-50 hidden md:block transition-colors">Ask More Info</button>
                  </div>
               </div>
               <div className="md:w-2/5 md:pl-2">
                  <VerticalTimeline type="return" data={returnData} />
               </div>
            </div>
          </SectionCard>
        )}
      </div>

      {/* ROW 3 */}
      {returnData && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Refund Details */}
        <SectionCard icon={CreditCard} title="Refund Details" editAction="Edit Refund Status">
          <div className="flex flex-col md:flex-row gap-4 h-full">
             <div className="flex-1 flex flex-col gap-5 text-sm md:border-r border-gray-100 md:pr-6 justify-center">
               <div className="flex justify-between items-center">
                 <span className="text-gray-500 text-xs">Refund Amount</span>
                 <span className="font-bold text-gray-900 text-xs">₹ {returnData.type === 'return' ? (returnData.originalPrice || 0) : 0}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-500 text-xs">Refund Method</span>
                 <span className="font-semibold text-gray-900 text-xs">-</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-500 text-xs">Refund Status</span>
                 <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200 text-gray-600 bg-gray-50">
                   {returnData.type === 'return' ? (returnData.status === 'refunded' ? 'Refunded' : 'Pending') : 'Not Applicable'}
                 </span>
               </div>
             </div>
             <div className="md:w-2/5 md:pl-4 py-2">
                <div className="relative pl-2 h-full flex flex-col justify-between py-1 gap-4">
                   <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200"></div>
                   
                   <div className="relative flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-white border-2 border-gray-300 z-10"></div>
                     <div>
                       <p className="text-[11px] font-semibold text-gray-400">Refund Initiated</p>
                       <p className="text-[9px] text-gray-400">-</p>
                     </div>
                   </div>
                   <div className="relative flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-white border-2 border-gray-300 z-10"></div>
                     <div>
                       <p className="text-[11px] font-semibold text-gray-400">Processing</p>
                       <p className="text-[9px] text-gray-400">-</p>
                     </div>
                   </div>
                   <div className="relative flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-white border-2 border-gray-300 z-10"></div>
                     <div>
                       <p className="text-[11px] font-semibold text-gray-400">Refund Completed</p>
                       <p className="text-[9px] text-gray-400">-</p>
                     </div>
                   </div>
                </div>
             </div>
          </div>
        </SectionCard>

        {/* Exchange Details */}
        <SectionCard icon={RefreshCcw} title="Exchange Details" editAction="Edit Exchange Status">
          <div className="flex flex-col md:flex-row gap-4 h-full">
             <div className="flex-1 flex flex-col gap-5 text-sm md:border-r border-gray-100 md:pr-6 justify-center">
               <div className="flex justify-between items-center">
                 <span className="text-gray-500 text-xs">From Size</span>
                 <span className="font-semibold text-gray-900 text-xs flex items-center gap-2">
                    {getAttr(returnData.originalVariant, 'size') || "N/A"} <ArrowLeft size={10} className="rotate-180 text-gray-400"/> {getAttr(returnData.requestedExchangeVariant, 'size') || "N/A"}
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-500 text-xs">From Color</span>
                 <span className="font-semibold text-gray-900 text-xs flex items-center gap-2">
                    {getAttr(returnData.originalVariant, 'color') || "N/A"} <ArrowLeft size={10} className="rotate-180 text-gray-400"/> {getAttr(returnData.requestedExchangeVariant, 'color') || "N/A"}
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-500 text-xs">Price Difference</span>
                 <span className="font-bold text-[#4648d4] text-xs">₹ {returnData.priceDifference || 0}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-500 text-xs">Exchange Status</span>
                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${returnData.type === 'exchange' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'border-gray-200 text-gray-600 bg-gray-50'}`}>
                   {returnData.type === 'exchange' ? (returnData.status === 'exchanged' ? 'Completed' : 'Pending') : 'Not Applicable'}
                 </span>
               </div>
             </div>
             <div className="md:w-2/5 md:pl-4 py-2">
                <div className="relative pl-2 h-full flex flex-col justify-between py-1 gap-4">
                   <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200"></div>
                   
                   <div className="relative flex items-center gap-3">
                     <div className={`w-2.5 h-2.5 rounded-full z-10 ${returnData.type === 'exchange' ? 'bg-[#4648d4] ring-4 ring-indigo-50' : 'bg-white border-2 border-gray-300'}`}></div>
                     <div>
                       <p className={`text-[11px] font-bold ${returnData.type === 'exchange' ? 'text-gray-900' : 'text-gray-400'}`}>Exchange Requested</p>
                       <p className="text-[9px] text-gray-500">
                         {returnData.type === 'exchange' && returnData.createdAt ? new Date(returnData.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute:"2-digit" }) : "-"}
                       </p>
                     </div>
                   </div>
                   <div className="relative flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-white border-2 border-gray-300 z-10"></div>
                     <div>
                       <p className="text-[11px] font-semibold text-gray-400">Exchange Processing</p>
                       <p className="text-[9px] text-gray-400">-</p>
                     </div>
                   </div>
                   <div className="relative flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-white border-2 border-gray-300 z-10"></div>
                     <div>
                       <p className="text-[11px] font-semibold text-gray-400">Exchange Completed</p>
                       <p className="text-[9px] text-gray-400">-</p>
                     </div>
                   </div>
                </div>
             </div>
          </div>
        </SectionCard>
      </div>
      )}

      {/* ROW 4 */}
      <div className="flex flex-col gap-6">
        {/* Admin Notes */}
        <SectionCard icon={Edit} title="Admin Notes">
          <div className="relative flex-1 flex flex-col h-full min-h-[140px]">
             <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this request or order..."
                className="w-full flex-1 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#4648d4] text-xs resize-none outline-none text-gray-700 pb-12 transition-all shadow-inner"
             ></textarea>
             <button 
               onClick={handleSaveNotes}
               disabled={isSavingNotes}
               className="absolute bottom-3 right-3 px-4 py-1.5 bg-[#4648d4]/10 text-[#4648d4] text-[11px] font-bold rounded-lg hover:bg-[#4648d4]/20 transition-colors"
             >
               {isSavingNotes ? "Saving..." : "Save Note"}
             </button>
          </div>
        </SectionCard>
      </div>

    </div>
  );
};

export default RequestDetailsView;
