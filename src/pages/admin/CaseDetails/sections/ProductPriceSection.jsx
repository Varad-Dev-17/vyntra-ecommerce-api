import React, { useState } from 'react';
import { ShoppingBag, Truck, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import SectionCard from '../components/SectionCard';
import PriceRow from '../components/PriceRow';
import TimelineItem from '../components/TimelineItem';

const ProductPriceSection = ({ 
  items = [], 
  order = {}, 
  isReturnItemOnly = false, 
  returnItem = null,
  returnRequest = null,
  onUpdateStatus = null 
}) => {
  const [showAuditLog, setShowAuditLog] = useState(false);

  // If we have a single item focus (e.g. from Return item summary) vs full order items list
  const displayItems = isReturnItemOnly && returnItem ? [returnItem] : items;
  const totalAmount = order.totalAmount || displayItems.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);

  // Timeline & Audit Log calculations
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

  const milestoneSteps = [
    {
      title: "Order Placed",
      date: formatDate(order.createdAt),
      subtitle: "Confirmed.",
      isCompleted: !isCancelled && (currentIndex >= 0 || status === "delivered"),
      isCurrent: status === "pending",
      actionValue: "pending",
    },
    {
      title: "Packed",
      date: currentIndex >= 1 ? formatDate(order.updatedAt) : "",
      subtitle: "Inspected & ready.",
      isCompleted: !isCancelled && currentIndex >= 1,
      isCurrent: status === "packed" || status === "processing",
      actionValue: "packed",
    },
    {
      title: "Shipped",
      date: currentIndex >= 2 ? formatDate(order.updatedAt) : "",
      subtitle: order.trackingNumber ? `AWB: ${order.trackingNumber}` : "Handed over.",
      isCompleted: !isCancelled && currentIndex >= 2,
      isCurrent: status === "shipped",
      actionValue: "shipped",
    },
    {
      title: "On The Way",
      date: currentIndex >= 3 ? formatDate(order.updatedAt) : "",
      subtitle: "Out for delivery.",
      isCompleted: !isCancelled && currentIndex >= 3,
      isCurrent: status === "on_the_way",
      actionValue: "on_the_way",
    },
    {
      title: "Delivered",
      date: formatDate(order.deliveredAt || (status === "delivered" ? order.updatedAt : null)),
      subtitle: "Delivered to recipient.",
      isCompleted: !isCancelled && status === "delivered",
      isCurrent: status === "delivered",
      actionValue: "delivered",
    },
  ];

  if (isCancelled) {
    milestoneSteps.push({
      title: "Cancelled",
      date: formatDate(order.updatedAt),
      subtitle: "Order cancelled.",
      isCurrent: true,
      isError: true,
    });
  }

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
    <SectionCard icon={ShoppingBag} title={isReturnItemOnly ? "Returned Item & Tracking" : "Ordered Items & Order Tracking"} className="">
      <div className="space-y-6">
        
        {/* Side-by-Side Widescreen Architecture */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
          
          {/* Left Side: Product Items (Spans 5 of 12 columns) */}
          <div className="xl:col-span-5 divide-y divide-gray-100 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar space-y-4 xl:border-r border-gray-200 xl:pr-6">
            {displayItems.map((item, index) => {
              const product = item.product || item;
              const variant = item.variant || item.originalVariant || {};
              const title = product.title || product.name || "Product";
              const brand = product.brand?.name || (typeof product.brand === "string" ? product.brand : null) || item.brand?.name || (typeof item.brand === "string" ? item.brand : null) || "";
              const img = variant.mainImage?.url || (typeof variant.mainImage === "string" ? variant.mainImage : null) || product.images?.[0]?.url || (typeof product.images?.[0] === "string" ? product.images[0] : null) || null;
              const qty = item.quantity || item.qty || 1;
              const price = item.price || variant.price || product.price || 0;

              let color = "";
              let size = "";
              if (Array.isArray(variant.attributes) && variant.attributes.length > 0) {
                variant.attributes.forEach((attr) => {
                  const attrName = attr.attribute?.name?.toLowerCase() || "";
                  const optValue = attr.option?.displayName || attr.option?.storedValue || attr.option?.value || attr.value || "";
                  if (attrName.includes("color") && optValue) color = optValue;
                  if (attrName.includes("size") && optValue) size = optValue;
                });
              }
              if (!color) color = item.color || variant.color || "";
              if (!size) size = item.size || variant.size || "";

              return (
                <div key={index} className="flex items-start gap-3 pt-3 first:pt-0">
                  <div className="w-16 h-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
                    {img ? (
                      <img src={img} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag size={20} className="text-gray-300" />
                    )}
                  </div>

                  <div className="grow flex flex-col justify-between min-h-[5rem]">
                    <div>
                      {brand && (
                        <span className="block text-xs font-semibold text-[#4F46E5] mb-0.5">
                          {brand}
                        </span>
                      )}
                      <h5 className="font-bold text-slate-700 text-sm hover:text-[#4F46E5] transition-colors line-clamp-1">
                        {title}
                      </h5>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600 font-medium mt-2">
                      {color && (
                        <span className="bg-indigo-50/60 text-[#4F46E5] px-2 py-0.5 rounded-md border border-indigo-100/70 text-[11px] font-semibold">
                          Color: <strong className="font-bold text-indigo-900">{color}</strong>
                        </span>
                      )}
                      {size && (
                        <span className="bg-purple-50/60 text-purple-700 px-2 py-0.5 rounded-md border border-purple-100/70 text-[11px] font-semibold">
                          Size: <strong className="font-bold text-purple-900">{size}</strong>
                        </span>
                      )}
                      <span className="bg-gray-100/70 text-gray-700 px-2 py-0.5 rounded-md text-[11px] font-bold border border-gray-200/60">
                        Qty: {qty}
                      </span>
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-emerald-200/70">
                        Amount Paid: <strong className="font-bold font-mono text-emerald-950">₹{Number(displayItems.length === 1 && order.totalAmount ? order.totalAmount : (item.sellingPrice || price || 0) * qty).toLocaleString("en-IN")}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Side: Order Tracking Milestone Bar (Spans 7 of 12 columns) */}
          <div className="xl:col-span-7 pl-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Truck size={14} className="text-[#4F46E5]" />
                Order Fulfillment Timeline
              </span>
            </div>
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

        </div>

        {/* Financial Accounting Box - only display if multiple items exist */}
        {!isReturnItemOnly && displayItems.length > 1 && (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-2xs mt-auto">
            <PriceRow label="Total Amount Paid" value={totalAmount} isTotal />
          </div>
        )}

        {isReturnItemOnly && returnItem && displayItems.length > 1 && (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-2xs mt-auto">
            <PriceRow label="Amount Paid" value={returnItem.price || 0} isTotal />
          </div>
        )}

        {/* Activity History Log Section */}
        {auditSteps.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowAuditLog(!showAuditLog)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-gray-200/70 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-[#4F46E5] stroke-[2.25]" />
                <span>Activity History ({auditSteps.length} updates recorded)</span>
              </div>
              {showAuditLog ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showAuditLog && (
              <div className="max-h-[220px] overflow-y-auto pr-2 custom-scrollbar pl-1 pt-2 bg-slate-50/50 rounded-xl p-3 border border-gray-100 mt-2">
                <TimelineItem steps={auditSteps} isAuditLog={true} />
              </div>
            )}
          </div>
        )}

      </div>
    </SectionCard>
  );
};

export default ProductPriceSection;
