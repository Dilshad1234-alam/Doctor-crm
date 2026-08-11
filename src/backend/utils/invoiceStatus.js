/**
 * Calculates the correct invoice status based on paid amount vs total amount.
 * Never trust the client to send the status directly.
 * 
 * @param {number} totalAmount 
 * @param {number} paidAmount 
 * @param {string} currentStatus 
 * @returns {string} The correct status
 */
export function calculateInvoiceStatus(totalAmount, paidAmount, currentStatus) {
  // Allow manual overrides for certain terminal states
  if (currentStatus === "draft") return "draft";
  if (currentStatus === "cancelled") return "cancelled";
  if (currentStatus === "refunded") return "refunded";

  if (paidAmount <= 0) {
    return "unpaid";
  }

  if (paidAmount >= totalAmount) {
    return "paid";
  }

  // 0 < paidAmount < totalAmount
  return "partially_paid";
}
