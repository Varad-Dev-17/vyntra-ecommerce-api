import crypto from "crypto";

/**
 * Append a timeline event to a document (Order or ReturnRequest).
 * Enforces APPEND-ONLY behavior; existing history is never overwritten or replaced.
 * 
 * @param {Object} doc - Mongoose document containing a timeline array
 * @param {String} type - Event title/type (e.g., "Order Created", "QC Passed")
 * @param {String} description - Event description or details
 * @param {String} performedBy - Entity performing action ("Customer", "Admin", "Warehouse", "Finance", "System")
 * @param {Object} metadata - Optional custom metadata dictionary
 */
export const addTimelineEvent = (doc, type, description = "", performedBy = "System", metadata = {}) => {
  if (!doc) return;
  
  if (!Array.isArray(doc.timeline)) {
    doc.timeline = [];
  }

  const event = {
    eventId: crypto.randomUUID(),
    type: String(type).trim(),
    description: String(description).trim(),
    performedBy: String(performedBy).trim(),
    createdBy: String(performedBy).trim(), // Backwards compatibility alias
    timestamp: new Date(),
    metadata: metadata || {}
  };

  // Strictly push onto array (append-only)
  doc.timeline.push(event);
  return event;
};

/**
 * Append an admin note to a document.
 * Enforces APPEND-ONLY behavior; never overwrites or replaces existing notes array.
 * 
 * @param {Object} doc - Mongoose document containing an adminNotes array
 * @param {String} noteText - Text content of the note
 * @param {String} createdBy - Name or identifier of author (default: "Admin")
 * @param {String} category - Categorization field ("system", "admin", "warehouse", "finance", "other")
 * @param {Boolean} visibleToCustomer - Whether customer can view this note (default: true)
 */
export const appendAdminNote = (doc, noteText, createdBy = "Admin", category = "admin", visibleToCustomer = true) => {
  if (!doc || !noteText || typeof noteText !== "string" || !noteText.trim()) return;

  // Handle legacy raw string migration safely without losing existing note
  if (typeof doc.adminNotes === "string" && doc.adminNotes.trim() !== "") {
    const legacyNote = doc.adminNotes;
    doc.adminNotes = [{
      note: legacyNote,
      createdBy: "Admin",
      category: "admin",
      visibleToCustomer: true,
      createdAt: doc.createdAt || new Date()
    }];
  } else if (!Array.isArray(doc.adminNotes)) {
    doc.adminNotes = [];
  }

  const newNote = {
    note: noteText.trim(),
    createdBy: String(createdBy || "Admin").trim(),
    category: String(category || "admin").trim(),
    visibleToCustomer: visibleToCustomer !== false && visibleToCustomer !== "false",
    createdAt: new Date()
  };

  // Strictly push onto array (append-only)
  doc.adminNotes.push(newNote);
  return newNote;
};

/**
 * Safely merge incoming adminNotes from body without overwriting historical entries.
 * If frontend submits an array of notes, identify genuinely new items and append them.
 * 
 * @param {Object} doc - Mongoose document
 * @param {Array} incomingNotes - Array of notes sent from client
 * @param {String} fallbackAuthor - Fallback author name
 */
export const mergeAdminNotesSafe = (doc, incomingNotes, fallbackAuthor = "Admin") => {
  if (!doc || !Array.isArray(incomingNotes)) return;

  if (!Array.isArray(doc.adminNotes)) {
    doc.adminNotes = [];
  }

  const existingNotesSet = new Set(
    doc.adminNotes.map(n => `${n.note?.trim()}|${n.createdBy?.trim()}`)
  );

  for (const item of incomingNotes) {
    if (!item || typeof item !== "object") continue;
    const noteContent = typeof item.note === "string" ? item.note.trim() : "";
    if (!noteContent) continue;

    const author = item.createdBy || fallbackAuthor;
    const key = `${noteContent}|${author}`;
    
    // Only append if it does not already exist in historical audit log
    if (!existingNotesSet.has(key)) {
      doc.adminNotes.push({
        note: noteContent,
        createdBy: author,
        category: item.category || "admin",
        visibleToCustomer: item.visibleToCustomer !== false && item.visibleToCustomer !== "false",
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
      });
      existingNotesSet.add(key);
    }
  }
};
