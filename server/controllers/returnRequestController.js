import ReturnRequest from "../models/returnRequest.js";
import Order from "../models/order.js";
import Product from "../models/product.js";
import Variant from "../models/variant.js";

// CREATE RETURN/EXCHANGE REQUEST
export const createReturnRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      orderId, // This is the Order _id, not the orderId string
      productId,
      variantId,
      type,
      reason,
      additionalDetails,
      images,
      requestedExchangeVariantId,
    } = req.body;

    // 1. Validate Order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    // 2. Validate Order is Delivered
    if (order.status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Can only request return/exchange for delivered orders",
        data: null,
      });
    }

    // 3. Validate Product exists in Order
    const orderItem = order.items.find(
      (item) => item.product.toString() === productId && item.variant.toString() === variantId
    );
    
    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: "Product/Variant not found in this order",
        data: null,
      });
    }

    // 4. Validate Product is returnable & window
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    const policy = product.returnPolicy;
    const isReturnable = policy?.returnable ?? true;
    const returnDays = policy?.returnDays ?? 7;

    if (!isReturnable) {
      return res.status(400).json({
        success: false,
        message: "This product is not eligible for return or exchange",
        data: null,
      });
    }

    const deliveryDate = new Date(order.deliveredAt || order.updatedAt || order.createdAt);
    const expiryDate = new Date(deliveryDate);
    expiryDate.setDate(expiryDate.getDate() + returnDays);
    
    if (new Date() > expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Return window has closed",
        data: null,
      });
    }

    // 5. Validate existing active request
    const existingRequest = await ReturnRequest.findOne({
      order: orderId,
      product: productId,
      originalVariant: variantId,
      status: { $nin: ["rejected", "refunded", "exchanged"] }, // active statuses
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "An active request already exists for this item",
        data: null,
      });
    }

    // 6. Validate exchange logic & Price Calc
    let originalPrice = undefined;
    let exchangePrice = undefined;
    let priceDifference = undefined;
    let settlementType = undefined;

    if (type === "exchange") {
      if (!requestedExchangeVariantId) {
        return res.status(400).json({
          success: false,
          message: "Exchange variant must be selected for exchange requests",
          data: null,
        });
      }

      const reqVariant = await Variant.findById(requestedExchangeVariantId);
      if (!reqVariant || reqVariant.product.toString() !== productId) {
        return res.status(400).json({
          success: false,
          message: "Selected exchange variant is invalid or does not belong to this product",
          data: null,
        });
      }

      if (reqVariant.status !== "Active" || reqVariant.stock <= 0) {
        return res.status(400).json({
          success: false,
          message: "Selected exchange variant is out of stock or inactive",
          data: null,
        });
      }

      originalPrice = orderItem.price; // Get price from the order item, not from client
      exchangePrice = reqVariant.price;
      priceDifference = exchangePrice - originalPrice;

      if (priceDifference > 0) settlementType = "additional_payment";
      else if (priceDifference < 0) settlementType = "refund";
      else settlementType = "no_difference";
    }

    // Create request
    const returnRequest = await ReturnRequest.create({
      order: orderId,
      product: productId,
      originalVariant: variantId,
      user: userId,
      type,
      reason,
      additionalDetails,
      images: images || [],
      requestedExchangeVariant: type === "exchange" ? requestedExchangeVariantId : undefined,
      originalPrice,
      exchangePrice,
      priceDifference,
      settlementType,
    });

    return res.status(201).json({
      success: true,
      message: "Request submitted successfully",
      data: returnRequest,
    });
  } catch (error) {
    console.error("Create Return Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit request",
      data: null,
    });
  }
};

// GET MY RETURN REQUESTS
export const getMyReturnRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const requests = await ReturnRequest.find({ user: userId })
      .populate("product", "title images brand")
      .populate("originalVariant", "attributes")
      .populate("requestedExchangeVariant", "attributes")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Requests fetched successfully",
      data: requests,
    });
  } catch (error) {
    console.error("Get My Return Requests Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
      data: null,
    });
  }
};
