import React, { useState } from "react";
import { MessageSquarePlus, Send, Loader2, Bookmark, Tag, Eye, EyeOff } from "lucide-react";
import SectionCard from "../components/SectionCard";
import NotesHistory from "../components/NotesHistory";

const AdminNotesSection = ({ notes = [], onSaveNote, isSaving = false }) => {
  const [newNoteText, setNewNoteText] = useState("");
  const [category, setCategory] = useState("admin");
  const [visibleToCustomer, setVisibleToCustomer] = useState(true);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText || !newNoteText.trim()) return;

    if (onSaveNote) {
      const payload = {
        note: newNoteText.trim(),
        category,
        visibleToCustomer,
      };
      const success = await onSaveNote(payload);
      if (success !== false) {
        setNewNoteText("");
        // Reset defaults after save
        setCategory("admin");
        setVisibleToCustomer(true);
      }
    }
  };

  // Convert string fallback if legacy data is passed
  const formattedNotes = typeof notes === "string" && notes.trim() !== ""
    ? [{ note: notes, createdBy: "Admin", category: "admin", visibleToCustomer: true, createdAt: new Date() }]
    : Array.isArray(notes)
    ? notes
    : [];

  return (
    <SectionCard
      icon={Bookmark}
      title="Admin Notes"
      className="print:hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Section 1: Historical Notes Stream */}
        <div className="space-y-3 lg:border-r border-gray-100 lg:pr-6">
          <span className="text-xs font-bold text-slate-700 block mb-2">
            Notes History ({formattedNotes.length})
          </span>
          <NotesHistory notes={formattedNotes} />
        </div>

        {/* Section 2: Add New Note Form */}
        <form onSubmit={handleAddNote} className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-2xs">
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquarePlus size={16} className="text-[#4F46E5] stroke-[2.25]" />
              <span>Add New Note</span>
            </label>

            {/* Category Dropdown and Customer Visibility Toggle Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-gray-200">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-500 flex items-center gap-1">
                  <Tag size={12} className="text-[#4F46E5]" /> Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSaving}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] cursor-pointer"
                >
                  <option value="admin">Admin</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="finance">Finance</option>
                  <option value="system">System</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1 flex flex-col justify-between">
                <label className="block text-[11px] font-bold text-gray-500 flex items-center gap-1">
                  {visibleToCustomer ? <Eye size={12} className="text-emerald-600" /> : <EyeOff size={12} className="text-gray-400" />}
                  Visibility
                </label>
                <button
                  type="button"
                  onClick={() => setVisibleToCustomer(!visibleToCustomer)}
                  disabled={isSaving}
                  className={`w-full py-1.5 px-3 rounded-md text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                    visibleToCustomer
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                      : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  <span>{visibleToCustomer ? "Visible to Customer" : "Internal Admin Only"}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              disabled={isSaving}
              placeholder="Type your note here..."
              className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-gray-200 text-sm font-medium text-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-all duration-200 resize-none disabled:bg-gray-50 disabled:opacity-60"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-200/70">
            <span className="text-[11px] font-semibold text-gray-500">
              * Saved notes are permanent.
            </span>

            <button
              type="submit"
              disabled={isSaving || !newNoteText.trim()}
              className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338ca] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs rounded-lg transition-all shadow-2xs flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} className="stroke-[2.25]" />
              )}
              <span>{isSaving ? "Saving Note..." : "Save Note"}</span>
            </button>
          </div>
        </form>

      </div>
    </SectionCard>
  );
};

export default AdminNotesSection;
