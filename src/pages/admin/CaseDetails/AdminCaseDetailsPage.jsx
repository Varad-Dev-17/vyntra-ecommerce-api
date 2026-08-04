import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../api/axiosConfig";
import { AlertCircle } from "lucide-react";

import CaseHeader from "./sections/CaseHeader";
import CaseStatusSummary from "./components/CaseStatusSummary";
import CustomerShippingSection from "./sections/CustomerShippingSection";
import ProductPriceSection from "./sections/ProductPriceSection";
import ReturnExchangeSection from "./sections/ReturnExchangeSection";
import QualityCheckSection from "./sections/QualityCheckSection";
import RefundExchangeSection from "./sections/RefundExchangeSection";
import AdminNotesSection from "./sections/AdminNotesSection";

const AdminCaseDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const isReturnView = location.pathname.includes("/admin/returns");
  const isOrderView = location.pathname.includes("/admin/orders");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [returnData, setReturnData] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const fetchCaseDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isOrderView) {
        const res = await api.get(`/admin/orders/${id}`);
        if (res.data.success && res.data.data) {
          const data = res.data.data;
          setOrderData(data);
          if (Array.isArray(data.returnRequests) && data.returnRequests.length > 0) {
            setReturnData(data.returnRequests[0]);
          } else {
            setReturnData(null);
          }
        }
      } else if (isReturnView) {
        const res = await api.get(`/admin/returns/${id}`);
        if (res.data.success && res.data.data) {
          const data = res.data.data;
          setReturnData(data);
          if (data.order) {
            setOrderData(data.order);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching admin case details:", err);
      setError("Failed to load case details. The resource may not exist or network failed.");
      toast.error("Error loading case details");
    } finally {
      setLoading(false);
    }
  }, [id, isOrderView, isReturnView]);

  useEffect(() => {
    if (id) {
      fetchCaseDetails();
    }
  }, [id, fetchCaseDetails]);

  // Status update handler
  const handleUpdateStatus = async (newStatus) => {
    if (!newStatus) return;
    setIsUpdatingStatus(true);
    try {
      if (isOrderView && orderData) {
        const res = await api.put(`/admin/orders/${orderData._id || id}`, { status: newStatus });
        if (res.data.success) {
          toast.success(`Order status updated to ${newStatus}`);
          setOrderData(res.data.data || { ...orderData, status: newStatus });
        }
      } else if (isReturnView && returnData) {
        const res = await api.put(`/admin/returns/${returnData._id || id}`, { status: newStatus });
        if (res.data.success) {
          toast.success(`Request status updated to ${newStatus}`);
          setReturnData(res.data.data || { ...returnData, status: newStatus });
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Dedicated return request quick status transition
  const handleUpdateReturnStatus = async (newReturnStatus) => {
    if (!returnData) return;
    setIsUpdatingStatus(true);
    try {
      const res = await api.put(`/admin/returns/${returnData._id}`, { status: newReturnStatus });
      if (res.data.success) {
        toast.success(`Return/Exchange request marked as ${newReturnStatus}`);
        setReturnData(res.data.data || { ...returnData, status: newReturnStatus });
      }
    } catch (err) {
      console.error("Failed to update return request:", err);
      toast.error(err.response?.data?.message || "Failed to transition return request status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Generic updater for return attributes (Quality Check & Refund details)
  const handleUpdateReturnDetails = async (updatePayload, successMsg = "Details updated successfully") => {
    if (!returnData) return;
    setIsUpdatingStatus(true);
    try {
      const res = await api.put(`/admin/returns/${returnData._id}`, updatePayload);
      if (res.data.success) {
        toast.success(successMsg);
        setReturnData(res.data.data || { ...returnData, ...updatePayload });
      }
    } catch (err) {
      console.error("Failed to update details:", err);
      toast.error(err.response?.data?.message || "Failed to save updates to database");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Persistent Admin Notes handler supporting categorization & customer visibility flags
  const handleSaveNote = async (noteData) => {
    setIsSavingNote(true);
    try {
      const targetEndpoint = isOrderView ? `/admin/orders/${id}` : `/admin/returns/${id}`;
      const payload = typeof noteData === "string" ? { note: noteData } : noteData;
      const res = await api.put(targetEndpoint, payload);
      if (res.data.success && res.data.data) {
        toast.success("Case note recorded successfully");
        if (isOrderView) {
          setOrderData(res.data.data);
        } else {
          setReturnData(res.data.data);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to save admin note:", err);
      toast.error("Failed to persist admin note to database");
      return false;
    } finally {
      setIsSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <div className="w-12 h-12 border-4 border-[#4648d4] border-t-transparent rounded-full animate-spin shadow-md" />
        <p className="text-sm font-bold text-gray-600 tracking-tight animate-pulse">
          Loading Case Dossier & Analytics...
        </p>
      </div>
    );
  }

  if (error || (!orderData && !returnData)) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-rose-50/80 border border-rose-200 rounded-2xl text-center shadow-sm space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto stroke-[1.75]" />
        <h3 className="text-lg font-extrabold text-rose-900">Unable to Load Case Details</h3>
        <p className="text-sm font-medium text-rose-700">{error || "Case data could not be parsed."}</p>
        <button
          onClick={fetchCaseDetails}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Retry Fetch
        </button>
      </div>
    );
  }

  const activeEntity = isReturnView && returnData ? returnData : orderData || returnData;
  const activeStatus = activeEntity?.status || "pending";

  const orderStatusOptions = [
    { value: "pending", label: "1. Order Confirmed" },
    { value: "packed", label: "2. Packed" },
    { value: "shipped", label: "3. Shipped" },
    { value: "on_the_way", label: "4. On The Way" },
    { value: "delivered", label: "5. Delivered" },
    { value: "cancelled", label: "Cancel" },
  ];

  const isExchangeCase = returnData?.type === "exchange";
  const returnStatusOptions = [
    { value: "pending", label: "0. Pending" },
    { value: "approved", label: "1. Request Approved" },
    { value: "pickup_scheduled", label: "2. Pickup Scheduled" },
    { value: "picked_up", label: "3. Picked Up" },
    { value: "received", label: "4. Received" },
    ...(isExchangeCase 
      ? [{ value: "exchanged", label: "5.Exchanged" }] 
      : [{ value: "refunded", label: "5. Refund Completed" }]
    ),
    { value: "rejected", label: "Rejected" },
  ];

  const headerTitle = isReturnView
    ? `${isExchangeCase ? "Exchange Request" : "Return Request"} #${returnData?._id ? returnData._id.slice(-8).toUpperCase() : id.slice(-8).toUpperCase()}`
    : `Order Details #${orderData?.orderId || id.slice(-8).toUpperCase()}`;

  const headerSubtitle = isReturnView
    ? `Requested by ${returnData?.user?.username || orderData?.user?.username || "Customer"} on ${new Date(returnData?.createdAt || Date.now()).toLocaleDateString("en-IN", { dateStyle: "long" })}`
    : `Placed by ${orderData?.user?.username || "Customer"} on ${new Date(orderData?.createdAt || Date.now()).toLocaleDateString("en-IN", { dateStyle: "long" })}`;

  const notesList = isReturnView ? returnData?.adminNotes : orderData?.adminNotes;

  return (
    <div className="w-full min-h-screen bg-white p-4 sm:p-6 lg:p-8 print:p-0">
      
      {/* 1. Case Header Navigation & Controls with 3 Labeled Dropdowns */}
      <CaseHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        status={activeStatus}
        statusOptions={isReturnView ? returnStatusOptions : orderStatusOptions}
        onUpdateStatus={handleUpdateStatus}
        returnRequest={returnData}
        onUpdateQcStatus={(newQc) => handleUpdateReturnDetails({ qcStatus: newQc }, `Quality Check updated to ${newQc.toUpperCase()}`)}
        onUpdateRefundStatus={(newRef) => {
          handleUpdateReturnDetails({ refundStatus: newRef }, `Refund status marked as ${newRef.toUpperCase()}`);
          if (newRef === "completed") {
            handleUpdateStatus("refunded");
          }
        }}
        isUpdating={isUpdatingStatus}
        isReturnView={isReturnView}
      />

      {/* Full Page Document Architecture (Primary Workspace on Left, Details & Controls on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start pt-2">
        
        {/* Left Workspace (Orders, Chronological Timelines, Photo Evidence & Notes) */}
        <div className="lg:col-span-2 divide-y divide-gray-100 lg:pr-6 lg:border-r border-gray-200">
          <ProductPriceSection
            items={orderData?.items || []}
            order={orderData || {}}
            isReturnItemOnly={isReturnView && (!orderData?.items || orderData.items.length === 0)}
            returnItem={returnData ? {
              product: returnData.product,
              title: returnData.product?.title,
              price: returnData.product?.price || returnData.originalVariant?.price,
              variant: returnData.originalVariant,
              quantity: 1
            } : null}
            returnRequest={returnData}
            onUpdateStatus={handleUpdateStatus}
          />

          {returnData && (
            <>
              <ReturnExchangeSection
                returnRequest={returnData}
                onUpdateRequestStatus={handleUpdateReturnStatus}
                isProcessing={isUpdatingStatus}
              />

              <RefundExchangeSection
                returnRequest={returnData}
                order={orderData || {}}
                onUpdateRefundStatus={(payload) => handleUpdateReturnDetails(payload, `Refund status updated to ${payload.refundStatus.toUpperCase()}`)}
                onUpdateRequestStatus={handleUpdateReturnStatus}
                isProcessing={isUpdatingStatus}
              />
            </>
          )}
        </div>

        {/* Right Sidebar (Summary, Customer Logistics & QC) */}
        <div className="divide-y divide-gray-100 lg:sticky lg:top-6">
          <CaseStatusSummary
            order={orderData}
            returnRequest={returnData}
          />

          <CustomerShippingSection
            customer={orderData?.user || returnData?.user || {}}
            shippingAddress={orderData?.shippingAddress || {}}
            originalOrderId={isReturnView && orderData ? orderData._id : ""}
            originalOrderNumber={isReturnView && orderData ? orderData.orderId : ""}
          />

          {returnData ? (
            <QualityCheckSection
              returnRequest={returnData}
              onUpdateQcStatus={(payload) => handleUpdateReturnDetails(payload, `Quality Check status recorded as ${payload.qcStatus.toUpperCase()}`)}
              isProcessing={isUpdatingStatus}
            />
          ) : (
            <div className="py-6 border-b border-gray-100 text-xs text-slate-500 space-y-2 last:border-b-0">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <span className="text-sm font-extrabold text-[#4F46E5]">⇄</span>
                <span>No Return Claim Active</span>
              </div>
              <p className="leading-relaxed font-medium">
                This order currently has no return or exchange request. Return evaluation, refund accounting, and warehouse quality check controls will dynamically unlock here if a claim is filed.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Full-Width Admin Notes Section spanning entire bottom width */}
      <div className="w-full mt-8 pt-4 border-t border-gray-200/80">
        <AdminNotesSection
          notes={notesList}
          onSaveNote={handleSaveNote}
          isSaving={isSavingNote}
        />
      </div>
    </div>
  );
};

export default AdminCaseDetailsPage;
