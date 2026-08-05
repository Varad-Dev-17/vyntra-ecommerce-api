import React from "react";
import { CheckCircle2, Clock, AlertCircle, XCircle, Package, Truck, RefreshCw, ClipboardCheck, DollarSign, ShieldAlert, User, ShieldCheck, Check } from "lucide-react";

const TimelineItem = ({ steps = [], currentStatus = "", onStepClick = null, isCancelled = false, isRejected = false, isAuditLog = false }) => {
  if (!Array.isArray(steps) || steps.length === 0) {
    return (
      <div className="py-4 text-center text-xs font-medium text-gray-400 italic">
        No timeline events recorded yet.
      </div>
    );
  }

  // Helper to resolve icon based on event type string
  const resolveAuditIcon = (title = "") => {
    const t = String(title).toLowerCase();
    if (t.includes("qc passed") || t.includes("approved")) return [ClipboardCheck, "bg-emerald-500 border-emerald-600 text-white"];
    if (t.includes("qc failed") || t.includes("rejected") || t.includes("cancelled") || t.includes("failed")) return [XCircle, "bg-rose-500 border-rose-600 text-white"];
    if (t.includes("refund")) return [DollarSign, "bg-purple-500 border-purple-600 text-white"];
    if (t.includes("return") || t.includes("exchange")) return [RefreshCw, "bg-amber-500 border-amber-600 text-white"];
    if (t.includes("shipped") || t.includes("on the way") || t.includes("on_the_way") || t.includes("pickup") || t.includes("picked up")) return [Truck, "bg-indigo-500 border-indigo-600 text-white"];
    if (t.includes("packed") || t.includes("processing") || t.includes("received")) return [Package, "bg-blue-500 border-blue-600 text-white"];
    if (t.includes("order created") || t.includes("order placed") || t.includes("order confirmed") || t.includes("delivered")) return [CheckCircle2, "bg-[#4648d4] border-[#3b3db0] text-white"];
    return [Clock, "bg-gray-200 border-gray-300 text-gray-600"];
  };

  // Helper to color-code Performed By badge
  const getPerformedByBadge = (actor = "System") => {
    const a = String(actor).toLowerCase();
    if (a === "admin") return "bg-indigo-50 text-[#4648d4] border-indigo-200";
    if (a === "warehouse") return "bg-blue-50 text-blue-700 border-blue-200";
    if (a === "finance") return "bg-purple-50 text-purple-700 border-purple-200";
    if (a === "customer") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  // Render Compact Horizontal Stepper for operational order, return, and refund step lists
  if (!isAuditLog) {
    return (
      <div className="w-full py-1.5 px-1 select-none">
        <div className="flex items-start justify-between relative w-full">
          {steps.map((step, idx) => {
            const isCompleted = step.isCompleted;
            const isCurrent = step.isCurrent;
            const isError = step.isError || (isCancelled && isCurrent) || (isRejected && isCurrent);

            let nodeContent = null;
            let nodeStyle = "w-2.5 h-2.5 bg-slate-300 rounded-full";
            let textColor = "text-slate-400 font-medium";
            let dateColor = "text-slate-400";
            let lineBg = "bg-slate-200";

            if (isError) {
              nodeStyle = "w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-white ring-2 ring-rose-200";
              nodeContent = <XCircle size={10} className="stroke-[2.5]" />;
              textColor = "text-rose-700 font-bold";
              dateColor = "text-rose-500 font-semibold";
            } else if (isCompleted && isCurrent) {
              nodeStyle = "w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-2xs ring-2 ring-emerald-200";
              nodeContent = <Check size={10} className="stroke-[3]" />;
              textColor = "text-slate-800 font-extrabold";
              dateColor = "text-emerald-600 font-semibold";
              lineBg = "bg-emerald-500";
            } else if (isCompleted) {
              nodeStyle = "w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xs";
              nodeContent = <Check size={9} className="stroke-[3]" />;
              textColor = "text-slate-700 font-bold";
              dateColor = "text-emerald-600 font-medium";
              lineBg = "bg-emerald-500";
            } else if (isCurrent) {
              nodeStyle = "w-3.5 h-3.5 bg-[#4F46E5] rounded-full ring-2 ring-[#4F46E5]/30 animate-pulse";
              textColor = "text-[#4F46E5] font-bold";
              dateColor = "text-[#4F46E5] font-semibold";
            }

            // Determine smart tooltip horizontal alignment to avoid edge clipping
            const isFirst = idx === 0;
            const isLast = idx === steps.length - 1 && steps.length > 1;
            let tooltipPosition = "left-1/2 -translate-x-1/2";
            let caretPosition = "left-1/2 -translate-x-1/2";
            if (isFirst) {
              tooltipPosition = "left-0";
              caretPosition = "left-6";
            } else if (isLast) {
              tooltipPosition = "right-0";
              caretPosition = "right-6";
            }

            return (
              <div
                key={step.eventId || idx}
                className={`flex-1 flex flex-col items-center text-center relative group min-w-[60px] ${
                  onStepClick && step.actionValue ? "cursor-pointer" : ""
                }`}
                onClick={() => onStepClick && step.actionValue && onStepClick(step.actionValue)}
              >
                {/* Horizontal progress connecting line to next step */}
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute top-2 left-1/2 w-full h-[2px] -z-0 transition-colors duration-300 ${
                      isCompleted ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                )}

                {/* Compact Step Circle Node */}
                <div className="h-4 flex items-center justify-center z-10 shrink-0">
                  <div className={`transition-transform duration-200 ${nodeStyle} ${
                    onStepClick && step.actionValue ? "group-hover:scale-110" : ""
                  }`}>
                    {nodeContent}
                  </div>
                </div>

                {/* Compact Title & Date underneath */}
                <div className="flex flex-col items-center mt-1.5 w-full px-0.5 z-10">
                  <span className={`text-[10.5px] tracking-tight leading-tight line-clamp-2 ${textColor}`}>
                    {step.title}
                  </span>
                  {step.date && (
                    <span className={`text-[9px] tracking-tight block mt-0.5 ${dateColor}`}>
                      {step.date}
                    </span>
                  )}
                  {step.performedBy && (
                    <span className={`mt-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border shadow-2xs ${getPerformedByBadge(step.performedBy)}`}>
                      By: {step.performedBy}
                    </span>
                  )}
                </div>

                {/* Hover Tooltip for Subtitle/Message (Saves massive vertical screen height) */}
                {step.subtitle && (
                  <div
                    className={`absolute bottom-full mb-2 ${tooltipPosition} w-52 p-2.5 bg-[#282c3f] text-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left leading-normal border border-gray-700/80`}
                  >
                    <div className="font-extrabold text-[11px] text-[#4F46E5] mb-1 flex items-center gap-1">
                      <span>●</span> {step.title}
                    </div>
                    <div className="text-gray-200 text-[10.5px] font-medium whitespace-pre-wrap leading-relaxed">
                      {step.subtitle}
                    </div>
                    {/* Tooltip downward caret triangle */}
                    <div className={`absolute top-full ${caretPosition} -mt-1 border-4 border-transparent border-t-[#282c3f]`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback Compact Vertical Feed for audit log streams and histories
  return (
    <div className="relative py-2 px-1">
      {/* Vertical line connector */}
      <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-gray-200" aria-hidden="true" />

      <ul className="space-y-4 relative">
        {steps.map((step, idx) => {
          const isCompleted = step.isCompleted;
          const isCurrent = step.isCurrent;
          const isError = step.isError || (isCancelled && isCurrent) || (isRejected && isCurrent);

          let Icon = Clock;
          let iconBg = "bg-gray-100 border-gray-300 text-gray-400";
          let textColor = "text-gray-500";
          let dateColor = "text-gray-400";

          if (isAuditLog) {
            const [AuditIcon, AuditBg] = resolveAuditIcon(step.title);
            Icon = AuditIcon;
            iconBg = `${AuditBg} shadow-2xs ring-2 ring-gray-100`;
            textColor = "text-slate-700 font-bold";
            dateColor = "text-gray-400 font-medium";
          } else if (isError) {
            Icon = XCircle;
            iconBg = "bg-red-50 border-red-500 text-red-600 shadow-xs ring-2 ring-red-100";
            textColor = "text-red-700 font-bold";
            dateColor = "text-red-500";
          } else if (isCompleted) {
            Icon = CheckCircle2;
            iconBg = "bg-emerald-500 border-emerald-600 text-white shadow-xs ring-2 ring-emerald-100";
            textColor = "text-slate-700 font-bold";
            dateColor = "text-emerald-600 font-medium";
          } else if (isCurrent) {
            Icon = Clock;
            iconBg = "bg-[#4F46E5] border-indigo-700 text-white shadow-xs ring-4 ring-[#4F46E5]/20 animate-pulse";
            textColor = "text-[#4F46E5] font-bold";
            dateColor = "text-[#4F46E5]";
          }

          return (
            <li key={step.eventId || idx} className="flex items-start gap-3 group">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border z-10 shrink-0 ${iconBg}`}>
                <Icon size={13} className="stroke-[2.25]" />
              </div>

              <div className="flex flex-col pt-0.5 grow">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs tracking-tight ${textColor}`}>{step.title}</span>
                    {step.performedBy && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border shadow-2xs ${getPerformedByBadge(step.performedBy)}`}>
                        By: {step.performedBy}
                      </span>
                    )}
                  </div>
                  {step.date && <span className={`text-[10px] ${dateColor}`}>{step.date}</span>}
                </div>
                {step.subtitle && (
                  <p className="text-[11px] text-gray-600 mt-1 font-normal leading-relaxed bg-gray-50 p-2 rounded-lg border border-gray-200/80">
                    {step.subtitle}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TimelineItem;
