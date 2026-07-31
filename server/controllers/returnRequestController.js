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

// GET ALL RETURN REQUESTS (ADMIN)
export const getAllReturnRequestsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      type,
      settlementType,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    // For search, we might need to populate and filter or just search request ID.
    // Assuming request ID is just the _id for now, or we can add a custom ID field.
    // If we want to search by Order ID or User, we need to populate.
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (settlementType) query.settlementType = settlementType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      ReturnRequest.find(query)
        .populate("user", "username email")
        .populate("order", "orderId createdAt paymentMethod paymentStatus")
        .populate("product", "title brand")
        .populate("originalVariant", "mainImage attributes sku")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ReturnRequest.countDocuments(query),
    ]);

    // Calculate stats
    const statsAggr = await ReturnRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      received: 0,
      refunded: 0,
      exchanged: 0,
      total: total
    };
    statsAggr.forEach(s => {
      if (stats.hasOwnProperty(s._id)) {
        stats[s._id] = s.count;
      }
    });

    return res.status(200).json({
      success: true,
      message: "Requests fetched successfully",
      data: {
        requests,
        stats,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get All Return Requests Admin Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
      data: null,
    });
  }
};

// GET RETURN REQUEST BY ID (ADMIN)
export const getReturnRequestByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ReturnRequest.findById(id)
      .populate("user", "username email phone")
      .populate({
        path: "order",
        select: "orderId createdAt paymentMethod paymentStatus items",
        populate: {
          path: "items.product items.variant"
        }
      })
      .populate({
        path: "product",
        select: "title brand slug images price",
        populate: { path: "brand", select: "name" }
      })
      .populate("originalVariant", "mainImage attributes sku price")
      .populate("requestedExchangeVariant", "mainImage attributes sku price")
      .lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Return request fetched successfully",
      data: request,
    });
  } catch (error) {
    console.error("Get Return Request Admin Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch request",
      data: null,
    });
  }
};

// UPDATE RETURN REQUEST STATUS (ADMIN)
export const updateReturnRequestStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const request = await ReturnRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
        data: null,
      });
    }

    if (adminNotes !== undefined) {
      request.adminNotes = adminNotes;
    }

    if (status && status !== request.status) {
      // Validate status transition (optional strict validation can be added here)
      const validStatuses = ["pending", "approved", "rejected", "received", "refunded", "exchanged"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
          data: null,
        });
      }
      
      // Stock updates if exchanged
      if (status === "exchanged" && request.status !== "exchanged" && request.type === "exchange") {
        const Variant = (await import("../models/variant.js")).default;
        // Reduce stock of requested exchange variant
        if (request.requestedExchangeVariant) {
          await Variant.findByIdAndUpdate(request.requestedExchangeVariant, {
            $inc: { stock: -1 }, // Assuming qty is 1 for now (schema doesn't have qty for returns currently)
          });
        }
        // Restock original variant? This depends on business logic if returned item is sellable. Let's not assume it's sellable.
      }
      
      request.status = status;
    }

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Request updated successfully",
      data: request,
    });
  } catch (error) {
    console.error("Update Return Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update request",
      data: null,
    });
  }
};

