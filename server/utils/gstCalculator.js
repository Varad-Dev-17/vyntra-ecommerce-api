const GST_RATES = {
  fashion: { threshold: 2500, lowRate: 0.05, highRate: 0.18 },
  tech: { rate: 0.18 },
  home: { rate: 0.18 },
  lifestyle: {
    "soaps/shampoos": 0.05,
    default: 0.18,
  },
  sports: { rate: 0.18 },
  apparel: { threshold: 2500, lowRate: 0.05, highRate: 0.18 },
};

export const calculateGST = (price, category, subcategory = "") => {
  const normalizedCategory = category.toLowerCase().trim();
  const rateConfig = GST_RATES[normalizedCategory];

  if (!rateConfig)
    return { rate: 0.18, cgst: 0.09, sgst: 0.09, totalTax: price * 0.18 };

  let rate = 0.18;

  if (rateConfig.threshold !== undefined) {
    // Fashion / Apparel — threshold-based
    rate =
      price <= rateConfig.threshold ? rateConfig.lowRate : rateConfig.highRate;
  } else if (rateConfig.rate !== undefined) {
    // Fixed rate categories
    rate = rateConfig.rate;
  } else if (typeof rateConfig === "object" && !rateConfig.threshold) {
    // Lifestyle with subcategory check
    const normalizedSub = subcategory.toLowerCase().trim();
    rate = rateConfig[normalizedSub] || rateConfig.default;
  }

  const totalTax = price * rate;
  return {
    rate,
    cgst: rate / 2,
    sgst: rate / 2,
    totalTax,
    totalWithTax: price + totalTax,
  };
};

export const calculateCartTotals = (items) => {
  let subtotal = 0;
  let totalTax = 0;
  let totalCGST = 0;
  let totalSGST = 0;

  const itemBreakdown = items.map((item) => {
    const itemTotal = item.price * item.quantity;
    const gst = calculateGST(item.price, item.category, item.subcategory || "");

    const itemTax = itemTotal * gst.rate;
    const itemCGST = itemTotal * gst.cgst;
    const itemSGST = itemTotal * gst.sgst;

    subtotal += itemTotal;
    totalTax += itemTax;
    totalCGST += itemCGST;
    totalSGST += itemSGST;

    return {
      ...item,
      itemTotal,
      gstRate: gst.rate * 100,
      cgst: itemCGST,
      sgst: itemSGST,
      taxAmount: itemTax,
      totalWithTax: itemTotal + itemTax,
    };
  });

  return {
    items: itemBreakdown,
    subtotal,
    totalTax,
    totalCGST,
    totalSGST,
    shipping: subtotal > 0 ? 0 : 0, // FREE shipping
    grandTotal: subtotal + totalTax,
  };
};
