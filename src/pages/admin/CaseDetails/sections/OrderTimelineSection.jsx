import React, { useState } from "react";
import { Clock, Truck, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import SectionCard from "../components/SectionCard";
import TimelineItem from "../components/TimelineItem";

const OrderTimelineSection = ({ order = {}, returnRequest = null, onUpdateStatus = null }) => {
  const [showAuditLog, setShowAuditLog] = useState(false); // Collapsed by default for a clean, compact UI

  const status = (order.status || "pending").toLowerCase();
  const isCancelled = status === "cancelled";

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return String(dateString);
    }
  };

  const stepsOrder = ["pending", "packed", "shipped", "on_the_way", "delivered"];
  const normalizedStatus = status === "processing" ? "packed" : status;
  const currentIndex = stepsOrder.indexOf(normalizedStatus);

  // 1. Milestone Tracker Steps
  const milestoneSteps = [
    {
      title: "Order Confirmed",
      date: formatDate(order.createdAt),
      subtitle: "Order received and verified.",
      isCompleted: !isCancelled && (currentIndex >= 0 || status === "delivered"),
      isCurrent: status === "pending",
      actionValue: "pending",
    },
    {
      title: "Packed",
      date: currentIndex >= 1 ? formatDate(order.updatedAt) : "",
      subtitle: "Items inspected & securely packaged.",
      isCompleted: !isCancelled && currentIndex >= 1,
      isCurrent: status === "packed" || status === "processing",
      actionValue: "packed",
    },
    {
      title: "Shipped",
      date: currentIndex >= 2 ? formatDate(order.updatedAt) : "",
      subtitle: order.trackingNumber ? `Tracking / AWB: ${order.trackingNumber}` : "Handed over to logistics courier.",
      isCompleted: !isCancelled && currentIndex >= 2,
      isCurrent: status === "shipped",
      actionValue: "shipped",
    },
    {
      title: "On The Way",
      date: currentIndex >= 3 ? formatDate(order.updatedAt) : "",
      subtitle: "Package out for delivery and arriving soon.",
      isCompleted: !isCancelled && currentIndex >= 3,
      isCurrent: status === "on_the_way",
      actionValue: "on_the_way",
    },
    {
      title: "Delivered",
      date: formatDate(order.deliveredAt || (status === "delivered" ? order.updatedAt : null)),
      subtitle: "Successfully delivered to recipient.",
      isCompleted: !isCancelled && status === "delivered",
      isCurrent: status === "delivered",
      actionValue: "delivered",
    },
  ];

  if (isCancelled) {
    milestoneSteps.push({
      title: "Cancelled",
      date: formatDate(order.updatedAt),
      subtitle: "Order was cancelled and items restocked.",
      isCurrent: true,
      isError: true,
    });
  }

  // 2. Combine and sort immutable chronological audit log events from Order & Return Request
  const orderEvents = Array.isArray(order.timeline) ? order.timeline : [];
  const returnEvents = returnRequest && Array.isArray(returnRequest.timeline) ? returnRequest.timeline : [];

  const combinedEvents = [...orderEvents, ...returnEvents].sort((a, b) => {
    return new Date(a.timestamp || 0) - new Date(b.timestamp || 0);
  });

  const auditSteps = combinedEvents.map((ev, i) => ({
    eventId: ev.eventId || `audit-${i}`,
    title: ev.type || "System Event",
    date: formatDate(ev.timestamp),
    subtitle: ev.description || "",
    performedBy: ev.performedBy || ev.createdBy || "System",
    isCompleted: true,
  }));

  return (
    <SectionCard icon={Truck} title="Order Tracking" className="w-full">
      <div className="py-2 space-y-6">
        
        {/* Existing Milestone Tracker */}
        <div>
          <TimelineItem
            steps={milestoneSteps}
            currentStatus={status}
            isCancelled={isCancelled}
            onStepClick={(val) => {
              if (!isCancelled && onUpdateStatus && val !== status) {
                onUpdateStatus(val);
              }
            }}
          />
        </div>

        {/* Activity History Log Section */}
        {auditSteps.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowAuditLog(!showAuditLog)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-gray-200/70 text-xs font-bold text-slate-700 transition-colors cursor-pointer mb-2"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#4F46E5] stroke-[2.25]" />
                <span>Activity History ({auditSteps.length} updates)</span>
              </div>
              {showAuditLog ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showAuditLog && (
              <div className="max-h-[220px] overflow-y-auto pr-2 custom-scrollbar pl-1 pt-2 bg-slate-50/50 rounded-xl p-3 border border-gray-100 animate-fadeIn">
                <TimelineItem steps={auditSteps} isAuditLog={true} />
              </div>
            )}
          </div>
        )}

      </div>
    </SectionCard>
  );
};

export default OrderTimelineSection;
