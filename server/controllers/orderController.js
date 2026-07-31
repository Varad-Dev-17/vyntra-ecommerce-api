import Order from "../models/order.js";
import Cart from "../models/cart.js";
import User from "../models/user.js";
import Variant from "../models/variant.js";
import Address from "../models/address.js";
import Coupon from "../models/coupon.js";
import transport from "../middlewares/sendMail.js";
import { orderEmailTemplate } from "../utils/orderEmailTemplate.js";
import { cancelEmailTemplate } from "../utils/cancelEmailTemplate.js";
import { getNextSequence } from "../utils/counterHelper.js";

// GET ALL ORDERS (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      paymentStatus,
      paymentMethod,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (search.trim()) {
      query.$or = [
        { orderId: { $regex: search.trim(), $options: "i" } },
        { "shippingAddress.name": { $regex: search.trim(), $options: "i" } },
        { "shippingAddress.email": { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      // To include the entire end date, we can set it to the end of the day or just use as is if it's an ISO string with time
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "username email")
        .populate("items.product", "title images price")
        .populate({
          path: "items.variant",
          select: "mainImage attributes",
          populate: [
            { path: "attributes.attribute" },
            { path: "attributes.option" }
          ]
        })
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      data: null,
    });
  }
};

// GET ORDER BY ID (Admin)
export const getAdminOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("user", "username email mobileNo gender")
      .populate({
        path: "items.product",
        select: "title brand slug images price",
        populate: { path: "brand", select: "name" }
      })
      .populate("items.variant", "mainImage attributes sku price")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    // Fallback for older orders that missed pincode in schema
    if (order.shippingAddress && !order.shippingAddress.pincode) {
      const userAddress = await Address.findOne({ userId: order.user._id, isDefault: true }) || await Address.findOne({ userId: order.user._id });
      if (userAddress) {
        order.shippingAddress.pincode = userAddress.pincode;
        if (!order.shippingAddress.state) order.shippingAddress.state = userAddress.state;
        if (!order.shippingAddress.country) order.shippingAddress.country = userAddress.country;
      }
    }

    // Also fetch any return requests associated with this order
    const ReturnRequest = (await import("../models/returnRequest.js")).default;
    const returnRequests = await ReturnRequest.find({ order: id })
      .populate("product", "title")
      .populate("originalVariant", "attributes")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: {
        ...order,
        returnRequests,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      data: null,
    });
  }
};

// GET USER ORDERS
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status, time } = req.query;

    const query = { user: userId };
    if (status && status !== 'all') query.status = status;

    if (time && time !== 'anytime') {
      const now = new Date();
      if (time === 'last_30_days') {
        query.createdAt = { $gte: new Date(now.setDate(now.getDate() - 30)) };
      } else if (time === 'last_6_months') {
        query.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 6)) };
      } else if (time === 'last_year') {
        query.createdAt = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
      }
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate({
          path: "items.product",
          select: "title brand slug",
          populate: { path: "brand", select: "name" }
        })
        .populate({
          path: "items.variant",
          select: "mainImage attributes",
          populate: [
            { path: "attributes.attribute" },
            { path: "attributes.option" }
          ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      data: null,
    });
  }
};

// GET ORDER BY ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin;

    const order = await Order.findById(id)
      .populate("user", "username email mobileNo gender")
      .populate({
        path: "items.product",
        select: "title brand slug images",
        populate: { path: "brand", select: "name" }
      })
      .populate("items.variant", "mainImage attributes sku price")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    // Users can only view their own orders unless admin
    if (!isAdmin && order.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      data: null,
    });
  }
};

// CREATE ORDER (from cart)
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shippingAddress, couponCode, paymentMethod = "cod" } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
        data: null,
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
        data: null,
      });
    }

    // Validate stock and calculate totals
    let subtotal = 0;
    let totalMRP = 0;
    let taxAmount = 0;
    const orderItems = [];

    for (const item of cart.products) {
      const product = item.productId;

      if (!product || product.status !== "Active") {
        return res.status(400).json({
          success: false,
          message: `Product ${
            product?.title || "Unknown"
          } is no longer available`,
          data: null,
        });
      }

      const Variant = (await import("../models/variant.js")).default;
      const variant = await Variant.findById(item.variantId);
      
      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${variant?.stock || 0} items available for ${product.title}`,
          data: null,
        });
      }

      const itemMRP = (variant.mrp || variant.price) * item.quantity;
      const itemSellingPrice = variant.price * item.quantity;
      const gstRate = variant.gstRate || 0;
      
      // basePrice = sellingPrice / (1 + gstRate/100)
      const itemBasePrice = itemSellingPrice / (1 + (gstRate / 100));
      const itemGSTAmount = itemSellingPrice - itemBasePrice;

      subtotal += itemSellingPrice;
      totalMRP += itemMRP;
      taxAmount += itemGSTAmount;

      orderItems.push({
        product: product._id,
        variant: variant._id,
        quantity: item.quantity,
        mrp: variant.mrp || variant.price,
        sellingPrice: variant.price,
        basePrice: variant.price / (1 + (gstRate / 100)),
        gstRate: gstRate,
        gstAmount: variant.price - (variant.price / (1 + (gstRate / 100))),
      });
    }

    // Apply coupon if provided
    let couponDiscount = 0;
    let couponApplied = null;

    if (couponCode?.trim()) {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        status: "active",
        isActive: true,
      });

      if (coupon) {
        const now = new Date();
        const isValid =
          (!coupon.startDate || now >= coupon.startDate) &&
          (!coupon.endDate || now <= coupon.endDate) &&
          (coupon.usageLimit === null ||
            coupon.usageCount < coupon.usageLimit) &&
          subtotal >= coupon.minOrderAmount;

        if (isValid) {
          if (coupon.type === "percentage") {
            couponDiscount = (subtotal * coupon.value) / 100;
          } else {
            couponDiscount = coupon.value;
          }

          if (
            coupon.maxDiscountAmount &&
            couponDiscount > coupon.maxDiscountAmount
          ) {
            couponDiscount = coupon.maxDiscountAmount;
          }

          couponApplied = {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
          };

          // Increment coupon usage
          coupon.usageCount += 1;
          await coupon.save();
        }
      }
    }

    const finalSubtotal = Math.max(0, subtotal - couponDiscount);
    
    // 3-tier delivery rule
    let shippingAmount = 0;
    if (finalSubtotal < 500) shippingAmount = 99;
    else if (finalSubtotal < 1000) shippingAmount = 49;
    else shippingAmount = 0;

    const totalAmount = finalSubtotal + shippingAmount;
    const totalDiscountAmount = (totalMRP - subtotal) + couponDiscount;
    
    let orderId = "";
    try {
      const seq = await getNextSequence('orderId');
      orderId = `ORD-${seq}`;
    } catch (err) {
      console.error("Failed to generate orderId sequence", err);
      // Fallback if counter fails
      orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }

    // Create order
    const order = await Order.create({
      orderId,
      user: userId,
      items: orderItems,
      shippingAddress,
      totalMRP: Math.round(totalMRP * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(totalDiscountAmount * 100) / 100,
      shippingAmount: Math.round(shippingAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      coupon: couponApplied,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      status: "pending",
    });

    // Reduce stock
    const Variant = (await import("../models/variant.js")).default;
    for (const item of cart.products) {
      await Variant.findByIdAndUpdate(item.variantId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart
    cart.products = [];
    await cart.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("items.product", "title images price")
      .populate({
        path: "items.variant",
        populate: [
          { path: "attributes.attribute" },
          { path: "attributes.option" }
        ]
      })
      .populate("user", "username email")
      .lean();

    // Send Order Confirmation Email
    try {
      if (populatedOrder.user && populatedOrder.user.email) {
        transport.sendMail({
          from: `"Vyntra Orders" <${process.env.NODE_CODE_SENDING_EMAIL_ADDRESS}>`,
          to: populatedOrder.user.email,
          subject: `Order Confirmation - ${orderId}`,
          html: orderEmailTemplate(populatedOrder, populatedOrder.user),
        }).catch(emailError => {
          console.error("Failed to send order confirmation email:", emailError);
        });
      }
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
      // We don't fail the order if the email fails
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: populatedOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      data: null,
    });
  }
};

// UPDATE ORDER STATUS (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, trackingNumber } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status", data: null });
      }

      const currentStatus = order.status;
      const transitionRules = {
        pending: ["processing", "cancelled"],
        processing: ["shipped", "cancelled"],
        shipped: ["delivered", "cancelled"],
        delivered: [],
        cancelled: [],
      };

      if (status !== currentStatus) {
        if (!transitionRules[currentStatus].includes(status)) {
          return res.status(400).json({
            success: false,
            message: `Invalid status transition from ${currentStatus} to ${status}`,
            data: null,
          });
        }
      }

      // Handle cancellation - restore stock
      if (status === "cancelled" && currentStatus !== "cancelled") {
        const Variant = (await import("../models/variant.js")).default;
        for (const item of order.items) {
          if (item.variant) {
            await Variant.findByIdAndUpdate(item.variant, {
              $inc: { stock: item.quantity },
            });
          }
        }
      }

      if (status === "delivered" && currentStatus !== "delivered") {
        order.deliveredAt = new Date();
      } else if (status !== "delivered" && currentStatus === "delivered") {
        order.deliveredAt = null;
      }
      order.status = status;
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;

    await order.save();

    const populatedOrder = await Order.findById(id)
      .populate("items.product", "title images price")
      .populate("user", "username email")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: populatedOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order",
      data: null,
    });
  }
};

// CANCEL ORDER (User)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled",
        data: null,
      });
    }

    // Restore stock to Variants instead of Products
    const Variant = (await import("../models/variant.js")).default;
    for (const item of order.items) {
      if (item.variant) {
        await Variant.findByIdAndUpdate(item.variant, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = "cancelled";
    await order.save();

    const populatedOrder = await Order.findById(id)
      .populate("items.product", "title images price")
      .populate({
        path: "items.variant",
        populate: [
          { path: "attributes.attribute" },
          { path: "attributes.option" }
        ]
      })
      .populate("user", "username email")
      .lean();

    // Send Cancellation Email
    try {
      if (populatedOrder.user && populatedOrder.user.email) {
        transport.sendMail({
          from: `"Vyntra Orders" <${process.env.NODE_CODE_SENDING_EMAIL_ADDRESS}>`,
          to: populatedOrder.user.email,
          subject: `Order Cancelled - ${populatedOrder.orderId}`,
          html: cancelEmailTemplate(populatedOrder, populatedOrder.user),
        }).catch(emailError => {
          console.error("Failed to send order cancellation email:", emailError);
        });
      }
    } catch (emailError) {
      console.error("Failed to send order cancellation email:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: populatedOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      data: null,
    });
  }
};

// GET ORDER STATS (Admin)
export const getOrderStats = async (req, res) => {
  try {
    const Order = (await import("../models/order.js")).default;
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    
    // Format response
    const formattedStats = {
      total: totalOrders,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      if (formattedStats.hasOwnProperty(stat._id)) {
        formattedStats[stat._id] = stat.count;
      }
    });

    return res.status(200).json({
      success: true,
      message: "Order stats fetched successfully",
      data: formattedStats
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order stats",
      data: null
    });
  }
};

