/**
 * Calculates the total for a single line item.
 */
export function calculateItemAmount(quantity, unitPrice) {
  const amount = Math.max(0, quantity) * Math.max(0, unitPrice);
  return Number(amount.toFixed(2));
}

/**
 * Calculates the subtotal for a list of items.
 * Recalculates each item amount to ensure accuracy.
 */
export function calculateSubtotal(items) {
  let subtotal = 0;
  for (const item of items) {
    const amount = calculateItemAmount(item.quantity, item.unitPrice);
    subtotal += amount;
  }
  return Number(subtotal.toFixed(2));
}

/**
 * Calculates the discount amount based on type and value.
 * Validates that the discount does not exceed the subtotal.
 */
export function calculateDiscount(subtotal, discountConfig) {
  if (!discountConfig || discountConfig.type === "none") {
    return 0;
  }

  let discountAmount = 0;
  const val = Math.max(0, discountConfig.value || 0);

  if (discountConfig.type === "flat") {
    discountAmount = Math.min(val, subtotal);
  } else if (discountConfig.type === "percentage") {
    const safePercent = Math.min(val, 100);
    discountAmount = (subtotal * safePercent) / 100;
  }

  return Number(discountAmount.toFixed(2));
}

/**
 * Calculates the tax amount.
 */
export function calculateTax(taxableAmount, taxConfig) {
  if (!taxConfig || !taxConfig.enabled) {
    return 0;
  }

  const safePercent = Math.max(0, taxConfig.percentage || 0);
  const taxAmount = (taxableAmount * safePercent) / 100;

  return Number(taxAmount.toFixed(2));
}

/**
 * Processes raw input to calculate all safe billing totals.
 * Never trust client totals!
 */
export function calculateInvoiceTotals(itemsInput = [], discountInput = null, taxInput = null) {
  // 1. Process items and get subtotal
  const processedItems = itemsInput.map(item => ({
    ...item,
    amount: calculateItemAmount(item.quantity, item.unitPrice)
  }));
  
  const subtotal = calculateSubtotal(processedItems);

  // 2. Calculate Discount
  const discountAmount = calculateDiscount(subtotal, discountInput);
  
  // 3. Amount after discount (taxable amount)
  const taxableAmount = Math.max(0, subtotal - discountAmount);

  // 4. Calculate Tax
  const taxAmount = calculateTax(taxableAmount, taxInput);

  // 5. Final Total
  const totalAmount = Number((taxableAmount + taxAmount).toFixed(2));

  return {
    processedItems,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount
  };
}
