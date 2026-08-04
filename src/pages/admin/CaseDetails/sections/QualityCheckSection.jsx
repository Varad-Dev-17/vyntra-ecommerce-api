import React, { useState } from "react";
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, Clock, User, RefreshCw, AlertCircle } from "lucide-react";
import StatusBadge from "../../../../components/admin/ui/StatusBadge";
import toast from "react-hot-toast";

const QualityCheckSection = ({ returnRequest, onUpdateQcStatus, isProcessing = false }) => {
  const [selectedAction, setSelectedAction] = useState(null); // "passed" | "failed" | null
  const [qcReasonInput, setQcReasonInput] = useState(returnRequest?.qcReason || "");

  if (!returnRequest) return null;

  const currentQcStatus = returnRequest.qcStatus || "pending";
  const requestStatus = returnRequest.status || "pending";

  const qcEvents = (returnRequest.timeline || []).filter(
    (ev) => ev.type && ev.type.toLowerCase().includes("qc")
  );
  const latestQcEvent = qcEvents.length > 0 ? qcEvents[qcEvents.length - 1] : null;
  const performedBy = latestQcEvent?.performedBy || returnRequest?.qcBy || null;
  const lastUpdated = latestQcEvent?.timestamp || (currentQcStatus !== "pending" ? returnRequest.updatedAt : null);

  const isRejected = requestStatus === "rejected";
  const isItemReceivedOrCollected = ["picked_up", "received", "refunded", "exchanged"].includes(requestStatus);
  const isQcDisabled = isRejected || !isItemReceivedOrCollected || isProcessing;

  const handleActionSelect = (action) => {
    if (isQcDisabled) return;
    setSelectedAction(action === selectedAction ? null : action);
    if (action === "passed") {
      setQcReasonInput(returnRequest.qcReason || "");
    } else if (action === "failed") {
      setQcReasonInput(returnRequest.qcReason || "");
    }
  };

  const handleSubmitQc = () => {
    if (!selectedAction) return;
    if (selectedAction === "failed" && !qcReasonInput.trim()) {
      toast.error("Please explain why the quality check failed.");
      return;
    }
    if (onUpdateQcStatus) {
      onUpdateQcStatus({
        qcStatus: selectedAction,
        qcReason: qcReasonInput.trim()
      });
      setSelectedAction(null);
    }
  };

  const formatDateTime = (dateVal) => {
    if (!dateVal) return "Not performed yet";
    try {
      return new Date(dateVal).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return String(dateVal);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-5 py-6 border-b border-gray-100 first:pt-0 last:pb-0 last:border-b-0">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
        <div className="flex items-start gap-2.5">
          <span className="text-[#4F46E5] flex items-center justify-center shrink-0 mt-0.5">
            <ClipboardCheck size={18} className="stroke-[2.5]" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-700 tracking-tight">
              Item Quality Check
            </h3>
            <p className="text-xs font-medium text-gray-500">
              Check item condition before refunding or replacing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <StatusBadge status={currentQcStatus} />
        </div>
      </div>

      {/* QC Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-xl border border-gray-200/60">
        <div className="space-y-1">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <ClipboardCheck size={13} className="stroke-[2]" /> Result
          </span>
          <p className="text-sm font-bold text-slate-700">
            {currentQcStatus === "passed" ? "Passed (Good Condition)" : currentQcStatus === "failed" ? "Failed (Damaged / Defect)" : "Waiting for Item"}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <User size={13} className="stroke-[2]" /> Checked By
          </span>
          <p className="text-sm font-semibold text-slate-700">
            {performedBy || "Not recorded"}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <Clock size={13} className="stroke-[2]" /> Checked On
          </span>
          <p className="text-sm font-bold text-gray-700">
            {formatDateTime(lastUpdated)}
          </p>
        </div>

        {(returnRequest.qcReason || (currentQcStatus !== "pending" && returnRequest.qcReason !== undefined)) && (
          <div className="md:col-span-3 pt-3 border-t border-gray-200/80 space-y-1">
            <span className="text-xs text-slate-500 font-semibold">Inspector Notes:</span>
            <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-gray-200 shadow-2xs font-medium">
              "{returnRequest.qcReason || "No inspection details recorded."}"
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default QualityCheckSection;
