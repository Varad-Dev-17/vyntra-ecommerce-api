/**
 * Reusable validation helper for QC, Refund, and Return Status transitions.
 * Enforces business logic rules and prevents illegal lifecycle state changes.
 */

/**
 * Validate Quality Check (QC) status transitions.
 * @param {String} currentStatus - Return request status (e.g. "pending", "received")
 * @param {String} targetStatus - Proposed return request status
 * @param {String} newQcStatus - Proposed QC status ("pending", "passed", "failed")
 * @returns {Object} { isValid: Boolean, message: String }
 */
export const validateQcTransition = (currentStatus, targetStatus, newQcStatus) => {
  const statusToEvaluate = targetStatus || currentStatus;

  if (newQcStatus && ["passed", "failed"].includes(newQcStatus)) {
    if (currentStatus === "rejected" || statusToEvaluate === "rejected") {
      return {
        isValid: false,
        message: "Quality Check (QC) cannot be performed on a rejected return request."
      };
    }

    const receivedOrLater = ["received", "refunded", "exchanged", "picked_up"];
    if (!receivedOrLater.includes(statusToEvaluate)) {
      return {
        isValid: false,
        message: "Quality Check (QC) cannot become passed or failed before item has been picked up or received at warehouse."
      };
    }
  }

  return { isValid: true };
};

/**
 * Validate Refund status transitions.
 * @param {String} currentRefundStatus - Existing refund status
 * @param {String} targetRefundStatus - Proposed refund status ("not_required", "initiated", "processing", "completed", "failed")
 * @param {String} effectiveQcStatus - Effective QC status ("pending", "passed", "failed")
 * @param {String} requestType - "return" or "exchange"
 * @returns {Object} { isValid: Boolean, message: String }
 */
export const validateRefundTransition = (currentRefundStatus, targetRefundStatus, effectiveQcStatus, requestType) => {
  if (!targetRefundStatus || targetRefundStatus === currentRefundStatus) {
    return { isValid: true };
  }

  const validStatuses = ["not_required", "initiated", "processing", "completed", "failed"];
  if (!validStatuses.includes(targetRefundStatus)) {
    return { isValid: false, message: `Invalid refund status: ${targetRefundStatus}` };
  }

  // Rule: Refund cannot become processing before initiated (unless existing status is initiated, processing, or failed retry)
  if (targetRefundStatus === "processing") {
    if (!["initiated", "processing", "failed"].includes(currentRefundStatus)) {
      return {
        isValid: false,
        message: "Refund cannot transition to processing before it has been initiated."
      };
    }
  }

  // Rule: No refund can be completed until QC passes
  if (targetRefundStatus === "completed") {
    if (effectiveQcStatus !== "passed") {
      return {
        isValid: false,
        message: "Refund cannot be completed before Quality Check (QC) status is marked as 'passed'."
      };
    }
  }

  return { isValid: true };
};

/**
 * Validate overall Return Request status transitions.
 * @param {String} currentStatus - Existing return request status
 * @param {String} targetStatus - Proposed return request status
 * @param {String} effectiveQcStatus - Effective QC status
 * @param {String} requestType - "return" or "exchange"
 * @returns {Object} { isValid: Boolean, message: String }
 */
export const validateReturnStatusTransition = (currentStatus, targetStatus, effectiveQcStatus, requestType) => {
  if (!targetStatus || targetStatus === currentStatus) {
    return { isValid: true };
  }

  const validStatuses = ["pending", "approved", "packed", "shipped", "rejected", "pickup_scheduled", "picked_up", "received", "refunded", "exchanged"];
  if (!validStatuses.includes(targetStatus)) {
    return { isValid: false, message: `Invalid return request status: ${targetStatus}` };
  }

  // Rule: Exchange cannot complete until QC passes
  if (targetStatus === "exchanged") {
    if (requestType !== "exchange") {
      return { isValid: false, message: "Cannot mark a return request as 'exchanged'." };
    }
    if (effectiveQcStatus !== "passed") {
      return {
        isValid: false,
        message: "Exchange cannot be marked as completed until Quality Check (QC) passes."
      };
    }
  }

  // Rule: Refunded status cannot complete until QC passes
  if (targetStatus === "refunded") {
    if (effectiveQcStatus !== "passed") {
      return {
        isValid: false,
        message: "Return cannot be marked as refunded until Quality Check (QC) passes."
      };
    }
  }

  return { isValid: true };
};
