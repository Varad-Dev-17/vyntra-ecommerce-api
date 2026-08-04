import React from "react";
import { User, Calendar, MessageSquare, Eye, EyeOff, Tag } from "lucide-react";

const NotesHistory = ({ notes = [] }) => {
  if (!Array.isArray(notes) || notes.length === 0) {
    return (
      <div className="py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
        <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2 stroke-[1.5]" />
        <p className="text-sm text-gray-500 font-medium">No previous notes recorded for this case.</p>
        <p className="text-xs text-gray-400 mt-0.5">Notes added below will appear here in chronological history.</p>
      </div>
    );
  }

  const formatDateTime = (dateVal) => {
    if (!dateVal) return "Just now";
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString("en-IN", {
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

  const getCategoryColor = (cat = "admin") => {
    const c = String(cat).toLowerCase();
    if (c === "warehouse") return "bg-blue-50 text-blue-700 border-blue-200";
    if (c === "finance") return "bg-purple-50 text-purple-700 border-purple-200";
    if (c === "system") return "bg-amber-50 text-amber-700 border-amber-200";
    if (c === "other") return "bg-gray-100 text-gray-700 border-gray-200";
    return "bg-indigo-50 text-[#4648d4] border-indigo-200";
  };

  return (
    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
      {notes.map((item, index) => {
        const isVisible = item.visibleToCustomer !== false && item.visibleToCustomer !== "false";
        const category = item.category || "admin";

        return (
          <div
            key={index}
            className="p-4 rounded-xl bg-gradient-to-r from-[#fcf8ff]/70 to-white border border-[#4648d4]/20 shadow-2xs hover:shadow-xs transition-shadow duration-200 space-y-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#4648d4] text-white flex items-center justify-center text-[10px] font-bold tracking-wider uppercase shrink-0 shadow-2xs">
                  {(item.createdBy || "A")[0]}
                </div>
                <span className="text-xs font-bold text-slate-700 tracking-tight">
                  {item.createdBy || "Admin"}
                </span>

                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${getCategoryColor(category)}`}>
                  {category}
                </span>
              </div>

              <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                <Calendar size={12} className="stroke-[1.75]" />
                <span>{formatDateTime(item.createdAt)}</span>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
              {item.note || String(item)}
            </p>

            <div className="flex items-center justify-end pt-1">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                  isVisible
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {isVisible ? <Eye size={12} className="stroke-[2.5]" /> : <EyeOff size={12} className="stroke-[2.5]" />}
                <span>{isVisible ? "Visible to Customer" : "Internal Admin Only"}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotesHistory;
