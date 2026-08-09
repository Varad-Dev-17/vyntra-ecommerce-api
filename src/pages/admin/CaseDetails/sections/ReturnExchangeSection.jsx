import React, { useState, useEffect } from "react";
import { RefreshCcw, FileText, Image as ImageIcon, Eye, Check, X, ShieldAlert, Truck, Package, ArrowRight } from "lucide-react";
import SectionCard from "../components/SectionCard";
import TimelineItem from "../components/TimelineItem";
import StatusBadge from "../../../../components/admin/ui/StatusBadge";
import ImageViewerModal from "../components/ImageViewerModal";

const ReturnExchangeSection = ({ returnRequest = null, onUpdateRequestStatus = null, isProcessing = false }) => {
  const [isImgModalOpen, setIsImgModalOpen] = useState(false);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.altKey || e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        if (returnRequest?.status === 'pending' && onUpdateRequestStatus && !isProcessing) {
          e.preventDefault();
          onUpdateRequestStatus('approved');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [returnRequest, onUpdateRequestStatus, isProcessing]);

  if (!returnRequest) return null;

  const type = returnRequest.type || "return";
  const status = (returnRequest.status || "pending").toLowerCase();
  const reason = returnRequest.reason || "Not specified";
  const additionalDetails = returnRequest.additionalDetails || null;
  const images = Array.isArray(returnRequest.images)
    ? returnRequest.images.map((img) => (typeof img === "object" && img?.url ? img.url : img))
    : [];

  const isPending = status === "pending";
  const isRejected = status === "rejected";
  const isApprovedOrLater = ["approved", "packed", "shipped", "pickup_scheduled", "picked_up", "received", "refunded", "exchanged"].includes(status);
  const isPackedOrLater = ["packed", "shipped", "pickup_scheduled", "picked_up", "received", "refunded", "exchanged"].includes(status);
  const isShippedOrLater = ["shipped", "pickup_scheduled", "picked_up", "received", "refunded", "exchanged"].includes(status);
  const isPickupScheduledOrLater = ["pickup_scheduled", "picked_up", "received", "refunded", "exchanged"].includes(status);
  const isPickedUpOrLater = ["picked_up", "received", "refunded", "exchanged"].includes(status);
  const isReceivedOrLater = ["received", "refunded", "exchanged"].includes(status);
  const isCompleted = ["refunded", "exchanged"].includes(status);

  const formatDate = (dateVal) => {
    if (!dateVal) return "";
    try {
      return new Date(dateVal).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  // Build granular Request processing timeline
  const steps = type === "exchange" ? [
    {
      title: "Exchange Requested",
      date: formatDate(returnRequest.createdAt),
      subtitle: `Reason: ${reason}`,
      isCompleted: true,
    },
    {
      title: "Approved",
      date: formatDate(returnRequest.updatedAt || returnRequest.createdAt),
      subtitle: isRejected ? "Request reviewed and declined." : isApprovedOrLater ? "Verified and replacement item reserved." : "Pending inspection of customer photos.",
      isCompleted: isApprovedOrLater,
      isCurrent: isPending,
      isError: isRejected,
    },
    {
      title: "Packed",
      date: isPackedOrLater ? formatDate(returnRequest.updatedAt) : "",
      subtitle: "Replacement product packed and verified at facility.",
      isCompleted: isPackedOrLater,
      isCurrent: status === "approved",
    },
    {
      title: "Shipped",
      date: isShippedOrLater ? formatDate(returnRequest.updatedAt) : "",
      subtitle: "Replacement product dispatched via logistics carrier.",
      isCompleted: isShippedOrLater,
      isCurrent: status === "packed",
    },
    {
      title: "Out for Exchange",
      date: isPickupScheduledOrLater ? formatDate(returnRequest.updatedAt) : "",
      subtitle: "Courier en route with replacement product for swap.",
      isCompleted: isPickupScheduledOrLater,
      isCurrent: status === "shipped" || status === "approved",
    },
    {
      title: "Quality Check",
      date: isPickedUpOrLater ? formatDate(returnRequest.updatedAt) : "",
      subtitle: "Courier verifying product condition and brand tags at doorstep.",
      isCompleted: isPickedUpOrLater,
      isCurrent: status === "pickup_scheduled",
    },
    {
      title: "Exchanged",
      date: isCompleted ? formatDate(returnRequest.updatedAt) : "",
      subtitle: "Doorstep Quality Check passed and replacement item handed over.",
      isCompleted: isCompleted,
      isCurrent: status === "picked_up" || status === "received",
    }
  ] : [
    {
      title: "Return Requested",
      date: formatDate(returnRequest.createdAt),
      subtitle: `Reason: ${reason}`,
      isCompleted: true,
    },
    {
      title: "Under Admin Review",
      date: formatDate(returnRequest.updatedAt || returnRequest.createdAt),
      subtitle: isRejected ? "Request was reviewed and declined." : isApprovedOrLater ? "Verified and approved by admin." : "Pending inspection of customer photos.",
      isCompleted: isApprovedOrLater,
      isCurrent: isPending,
      isError: isRejected,
    },
    {
      title: "Pickup Scheduled",
      date: isPickupScheduledOrLater ? formatDate(returnRequest.updatedAt) : "",
      subtitle: "Courier assigned for item collection.",
      isCompleted: isPickupScheduledOrLater,
      isCurrent: status === "approved",
    },
    {
      title: "Picked Up by Courier",
      date: isPickedUpOrLater ? formatDate(returnRequest.updatedAt) : "",
      subtitle: "Item collected from customer address.",
      isCompleted: isPickedUpOrLater,
      isCurrent: status === "pickup_scheduled",
    },
    {
      title: "Received at Warehouse",
      date: isReceivedOrLater ? formatDate(returnRequest.updatedAt) : "",
      subtitle: "Item arrived at warehouse for Quality Check (QC).",
      isCompleted: isReceivedOrLater,
      isCurrent: status === "picked_up",
    },
    {
      title: "Refund Completed",
      date: isCompleted ? formatDate(returnRequest.updatedAt) : "",
      subtitle: "Refund settled to customer account.",
      isCompleted: isCompleted,
      isCurrent: status === "received",
    },
  ];

  const handleOpenInspector = (idx) => {
    setSelectedImgIndex(idx);
    setIsImgModalOpen(true);
  };

  return (
    <>
      <SectionCard
        icon={RefreshCcw}
        title={`${type === "exchange" ? "Exchange" : "Return"} Request`}
        className=""
      >
        <div className="flex flex-col gap-6">
          
          {/* Top Section: Primary Reason & Controls on Left, Uploaded Photos on Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Left Column: Request Reason & Details */}
            <div className="space-y-4 md:border-r border-gray-100 md:pr-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText size={14} className="text-[#4F46E5]" />
                  Reason for Return
                </h5>
                <p className="text-sm font-semibold text-slate-700 leading-snug">{reason}</p>
                
                {additionalDetails && (
                  <div className="pt-2 mt-2 border-t border-gray-200 text-xs text-slate-600 font-medium">
                    "{additionalDetails}"
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Customer Proof Photos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-[#4F46E5]" />
                  Uploaded Photos ({images.length})
                </span>
              </div>

              {/* 3-Square Grid Architecture */}
              <div className="grid grid-cols-3 gap-3.5 pt-1">
                {[0, 1, 2].map((slotIdx) => {
                  const hasImg = slotIdx < images.length;
                  const isThirdSlotWithMore = slotIdx === 2 && images.length > 3;

                  if (hasImg) {
                    return (
                      <div
                        key={slotIdx}
                        onClick={() => handleOpenInspector(isThirdSlotWithMore ? 0 : slotIdx)}
                        className="group relative aspect-square rounded-xl bg-gray-100 overflow-hidden border border-gray-200/80 cursor-pointer transition-all duration-200 hover:scale-105 shadow-sm"
                      >
                        <img
                          src={images[slotIdx]}
                          alt={`Proof ${slotIdx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                         loading="lazy" decoding="async" />

                        {isThirdSlotWithMore ? (
                          <div className="absolute inset-0 bg-[#282c3f]/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-2 text-center transition-opacity hover:opacity-95 z-10">
                            <span className="text-lg font-black tracking-wider text-[#4F46E5]">+ {images.length - 3}</span>
                            <span className="text-[10.5px] font-bold mt-0.5">View All ({images.length})</span>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[11px] font-bold z-10">
                            <Eye size={14} />
                            <span>View</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Render Blank / Empty Placeholder Square for slots 2 and 3 when unfilled
                  return (
                    <div
                      key={slotIdx}
                      className="aspect-square rounded-xl bg-gray-50/80 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 select-none shadow-2xs"
                    >
                      <ImageIcon size={26} className="stroke-[1.25] mb-1.5 opacity-50 text-gray-400" />
                      <span className="text-[11px] font-semibold text-gray-400">
                        {slotIdx === 0 && images.length === 0 ? "No Photos" : "Empty"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Bottom Section: Full-Width Horizontal Return Tracking Timeline */}
          <div className="pt-4 border-t border-gray-100 w-full">
            <span className="text-xs font-bold text-slate-700 block mb-1">
              Return Tracking Status
            </span>
            <TimelineItem steps={steps} currentStatus={status} isRejected={isRejected} />
          </div>

        </div>
      </SectionCard>

      {/* Full Resolution Image Inspection Lightbox */}
      <ImageViewerModal
        isOpen={isImgModalOpen}
        onClose={() => setIsImgModalOpen(false)}
        images={images}
        initialIndex={selectedImgIndex}
      />
    </>
  );
};

export default ReturnExchangeSection;
