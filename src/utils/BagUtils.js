export const GST_RATES = {
  fashion: { threshold: 2500, lowRate: 0.05, highRate: 0.18 },
  tech: { rate: 0.18 },
  home: { rate: 0.18 },
  lifestyle: {
    "soaps/shampoos": 0.05,
    default: 0.18,
  },
  sports: { rate: 0.18 },
  apparel: { threshold: 2500, lowRate: 0.05, highRate: 0.18 },
  accessories: { threshold: 2500, lowRate: 0.05, highRate: 0.18 },
};

export const calculateGST = (price, category, subcategory = "") => {
  const normalizedCategory = category?.toLowerCase().trim() || "fashion";
  const rateConfig = GST_RATES[normalizedCategory];

  if (!rateConfig)
    return { rate: 0.18, cgst: 0.09, sgst: 0.09 };

  let rate = 0.18;

  if (rateConfig.threshold !== undefined) {
    rate =
      price <= rateConfig.threshold ? rateConfig.lowRate : rateConfig.highRate;
  } else if (rateConfig.rate !== undefined) {
    rate = rateConfig.rate;
  } else if (typeof rateConfig === "object" && !rateConfig.threshold) {
    const normalizedSub = subcategory.toLowerCase().trim();
    rate = rateConfig[normalizedSub] || rateConfig.default;
  }

  return {
    rate,
    cgst: rate / 2,
    sgst: rate / 2,
  };
};

export const calculateBagTotals = (items) => {
  let subtotal = 0;
  let totalMRP = 0;
  let totalTax = 0;
  let totalCGST = 0;
  let totalSGST = 0;

  const itemBreakdown = items.map((item) => {
    // The price from the database is treated as EXCLUSIVE of GST.
    const priceExclusive = parseFloat(item.price) || 0;
    const mrp = parseFloat(item.mrp) || priceExclusive;
    
    const itemTotalExclusive = priceExclusive * item.quantity;
    const itemTotalMRP = mrp * item.quantity;
    
    // Safely extract category string if it's an object from populate
    const categoryName = typeof item.category === "object" ? item.category?.name : item.category;
    
    const gst = calculateGST(
      priceExclusive,
      categoryName || "fashion",
      ""
    );

    const itemTax = itemTotalExclusive * gst.rate;
    
    const itemCGST = itemTax / 2;
    const itemSGST = itemTax / 2;

    subtotal += itemTotalExclusive;
    totalMRP += itemTotalMRP;
    totalTax += itemTax;
    totalCGST += itemCGST;
    totalSGST += itemSGST;

    return {
      ...item,
      itemTotal: itemTotalExclusive,
      gstRate: (gst.rate * 100).toFixed(0),
      cgst: itemCGST,
      sgst: itemSGST,
      taxAmount: itemTax,
      basePriceTotal: itemTotalExclusive,
    };
  });

  return {
    items: itemBreakdown,
    totalMRP,
    subtotal,
    discountOnMRP: totalMRP - subtotal,
    totalTax,
    totalCGST,
    totalSGST,
    shipping: subtotal > 0 ? 0 : 0, 
    grandTotal: subtotal + totalTax, 
  };
};
