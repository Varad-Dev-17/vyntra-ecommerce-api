import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Truck, ShieldCheck, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../../../components/admin/ui/StatusBadge';

const CaseHeader = ({ 
  title, 
  subtitle, 
  status, 
  statusOptions = [], 
  onUpdateStatus, 
  returnRequest = null,
  onUpdateQcStatus = null,
  onUpdateRefundStatus = null,
  isUpdating = false, 
  isReturnView = false 
}) => {
  const [selectedStatus, setSelectedStatus] = useState(status || "");
  const [selectedQc, setSelectedQc] = useState(returnRequest?.qcStatus || "pending");
  const [selectedRefund, setSelectedRefund] = useState("not_required");
  const navigate = useNavigate();

  const isExchange = returnRequest?.type === "exchange";

  useEffect(() => {
    setSelectedStatus(status || "");
  }, [status]);

  useEffect(() => {
    if (returnRequest) {
      setSelectedQc(returnRequest.qcStatus || "pending");
      if (isExchange) {
        setSelectedRefund(status === "exchanged" ? "exchanged" : "awaiting");
      } else {
        setSelectedRefund(returnRequest.refundStatus || "not_required");
      }
    }
  }, [returnRequest, status, isExchange]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        navigate(isReturnView ? "/admin/returns" : "/admin/orders");
      } else if ((e.altKey || e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, isReturnView]);

  // Instant onChange handlers without needing an Update button
  const handleShipmentChange = (e) => {
    const newVal = e.target.value;
    setSelectedStatus(newVal);
    if (onUpdateStatus && newVal !== status) {
      onUpdateStatus(newVal);
    }
  };

  const handleQcChange = (e) => {
    const newVal = e.target.value;
    setSelectedQc(newVal);
    if (onUpdateQcStatus && newVal !== returnRequest?.qcStatus) {
      onUpdateQcStatus(newVal);
    }
  };

  const handleRefundOrReplacementChange = (e) => {
    const newVal = e.target.value;
    setSelectedRefund(newVal);
    if (isExchange) {
      if (newVal === "exchanged" && onUpdateStatus && status !== "exchanged") {
        onUpdateStatus("exchanged");
      }
    } else if (onUpdateRefundStatus && newVal !== (returnRequest?.refundStatus || "not_required")) {
      onUpdateRefundStatus(newVal);
    }
  };

  // Sequence pipelines for strictly one-way forward progress
  const exchangeSequence = ["pending", "approved", "packed", "shipped", "pickup_scheduled", "picked_up", "exchanged"];
  const returnSequence = ["pending", "approved", "pickup_scheduled", "picked_up", "received", "refunded"];
  const activeSequence = isExchange ? exchangeSequence : returnSequence;
  const currentStatusClean = String(status || selectedStatus || "pending").toLowerCase();
  const currentSeqIdx = activeSequence.indexOf(currentStatusClean);

  // Lock dropdowns completely once order reaches terminal closed states
  const isTerminalStatus = ["exchanged", "refunded", "rejected"].includes(currentStatusClean);

  // Simple, unmistakable words for administrators
  const shipmentOptions = isExchange ? [
    { value: "pending", label: "1. Exchange Requested" },
    { value: "approved", label: "2. Approved" },
    { value: "packed", label: "3. Packed" },
    { value: "shipped", label: "4. Shipped" },
    { value: "pickup_scheduled", label: "5. Out for Exchange" },
    { value: "picked_up", label: "6. Quality Check" },
    { value: "exchanged", label: "7. Exchanged" },
    { value: "rejected", label: "Rejected / Cancelled" }
  ] : [
    { value: "pending", label: "1. Pending Admin Review" },
    { value: "approved", label: "2. Claim Approved" },
    { value: "pickup_scheduled", label: "3. Pickup Scheduled" },
    { value: "picked_up", label: "4. Picked Up by Courier" },
    { value: "received", label: "5. Received at Warehouse" },
    { value: "refunded", label: "6. Completed & Refunded" },
    { value: "rejected", label: "Claim Rejected / Cancelled" }
  ];

  // Filter out previous sequence steps so admins cannot accidentally rollback time
  const displayedShipmentOptions = shipmentOptions.filter(opt => {
    if (opt.value === currentStatusClean) return true;
    if (isTerminalStatus) return false;
    if (opt.value === "rejected" && currentSeqIdx > 1) return false; // Prevent rejection after item is packed/shipped
    const optIdx = activeSequence.indexOf(opt.value);
    if (optIdx !== -1 && optIdx < currentSeqIdx) return false; // Hide past steps
    return true;
  });

  const isOptionDisabled = (opt) => {
    if ((opt.value === "exchanged" || opt.value === "refunded") && selectedQc !== "passed" && currentStatusClean !== opt.value) {
      return true;
    }
    return false;
  };

  const getOptionLabel = (opt) => {
    if (isOptionDisabled(opt)) {
      return `${opt.label} (Requires QC Pass)`;
    }
    return opt.label;
  };

  const qcOptions = [
    { value: "pending", label: "1. Pending Inspection" },
    { value: "passed", label: "2. Passed (Good Condition)" },
    { value: "failed", label: "3. Failed (Damaged / Bad)" }
  ];

  const settlementOptions = isExchange ? [
    { value: "awaiting", label: "1. Awaiting Dispatch" },
    { value: "exchanged", label: "2. Replacement Dispatched & Closed" }
  ] : [
    { value: "not_required", label: "1. Not Started Yet" },
    { value: "initiated", label: "2. Refund Initiated" },
    { value: "processing", label: "3. Refund Processing" },
    { value: "completed", label: "4. Refund Paid & Closed" },
    { value: "failed", label: "Refund Payment Failed" }
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-gray-200 mb-6 print:border-0 print:p-0">
      {/* Left side: Back navigation & Identifiers */}
      <div className="space-y-1 shrink-0">
        <button
          onClick={() => navigate(isReturnView ? "/admin/returns" : "/admin/orders")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#4F46E5] transition-colors print:hidden group cursor-pointer"
        >
          <ArrowLeft size={13} className="stroke-[2.5] transition-transform group-hover:-translate-x-0.5" />
          <span>Back to {isReturnView ? "Returns & Exchanges" : "Orders"}</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 bg-gray-100 border border-gray-200 text-[10px] font-mono text-gray-400 rounded">ESC</kbd>
        </button>

        <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
          <h1 className="text-xl font-bold text-slate-700 tracking-tight">
            {title || "Case Details"}
          </h1>
        </div>

        {subtitle && (
          <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 pt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side: 3 Side-by-Side Labeled Status Dropdowns (No Update Buttons) */}
      <div className="flex flex-wrap xl:flex-nowrap items-end gap-2.5 print:hidden">
        {isReturnView && returnRequest ? (
          <>
            {/* Dropdown 1: Shipment & Claim Status */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Truck size={12} className="text-[#4F46E5]" />
                <span>1. Shipment & Claim</span>
              </span>
              <select
                value={selectedStatus}
                onChange={handleShipmentChange}
                disabled={isUpdating || isTerminalStatus}
                className="bg-white px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 border border-gray-300 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5] cursor-pointer hover:border-[#4F46E5] transition-colors disabled:opacity-60 disabled:cursor-not-allowed max-w-[240px] truncate"
              >
                {displayedShipmentOptions.map((opt) => (
                  <option 
                    key={opt.value} 
                    value={opt.value} 
                    disabled={isOptionDisabled(opt)}
                    className={`font-semibold text-xs py-1 ${isOptionDisabled(opt) ? "text-gray-400 bg-gray-50" : ""}`}
                  >
                    {getOptionLabel(opt)}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown 2: Quality Check (QC) */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={12} className="text-amber-600" />
                <span>2. Quality Check (QC)</span>
              </span>
              <select
                value={selectedQc}
                onChange={handleQcChange}
                disabled={isUpdating || isTerminalStatus}
                className="bg-white px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 border border-gray-300 shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer hover:border-amber-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed max-w-[210px] truncate"
              >
                {qcOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="font-semibold text-xs py-1">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown 3: Refund Status (Only needed for Return refund tracking, not Exchanges) */}
            {!isExchange && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign size={12} className="text-emerald-600" />
                  <span>3. Refund Status</span>
                </span>
                <select
                  value={selectedRefund}
                  onChange={handleRefundOrReplacementChange}
                  disabled={isUpdating || isTerminalStatus}
                  className="bg-white px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 border border-gray-300 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer hover:border-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed max-w-[220px] truncate"
                >
                  {settlementOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="font-semibold text-xs py-1">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        ) : (
          /* For standard Orders: single dropdown updating on change */
          statusOptions && statusOptions.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">Order Fulfillment Status</span>
              <select
                value={selectedStatus || status}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedStatus(val);
                  if (onUpdateStatus && val !== status) onUpdateStatus(val);
                }}
                disabled={isUpdating}
                className="bg-white px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 border border-gray-300 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-60 cursor-pointer capitalize min-w-[180px]"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="capitalize font-semibold text-xs py-1">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )
        )}

        <button
          onClick={() => window.print()}
          className="self-end px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer h-[34px] shrink-0"
        >
          <Printer size={14} className="text-[#4F46E5] stroke-[2]" />
          <span>Print</span>
          <kbd className="hidden sm:inline-block px-1 py-0.5 bg-gray-100 border border-gray-200 text-[10px] font-mono text-gray-400 rounded">Alt+P</kbd>
        </button>
      </div>
    </div>
  );
};

export default CaseHeader;
