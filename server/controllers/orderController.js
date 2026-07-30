import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Coupon from "../models/coupon.js";
import transport from "../middlewares/sendMail.js";
import { orderEmailTemplate } from "../utils/orderEmailTemplate.js";
import { cancelEmailTemplate } from "../utils/cancelEmailTemplate.js";

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

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "username email")
        .populate("items.product", "title images price")
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
      .populate("user", "username email phone")
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

      // We should check variant stock, but if we don't populate variant, we can just use the product's price from cart logic
      // In cartController, price is on the variant. Let's fetch variant to check stock and price.
      const Variant = (await import("../models/variant.js")).default;
      const variant = await Variant.findById(item.variantId);
      
      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${variant?.stock || 0} items available for ${product.title}`,
          data: null,
        });
      }

      subtotal += variant.price * item.quantity;
      orderItems.push({
        product: product._id,
        variant: variant._id,
        quantity: item.quantity,
        price: variant.price,
      });
    }

    // Apply coupon if provided
    let discountAmount = 0;
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
            discountAmount = (subtotal * coupon.value) / 100;
          } else {
            discountAmount = coupon.value;
          }

          if (
            coupon.maxDiscountAmount &&
            discountAmount > coupon.maxDiscountAmount
          ) {
            discountAmount = coupon.maxDiscountAmount;
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

    const totalAmount = Math.max(0, subtotal - discountAmount);
    const orderId = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;

    // Create order
    const order = await Order.create({
      orderId,
      user: userId,
      items: orderItems,
      shippingAddress,
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
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
        await transport.sendMail({
          from: `"Vyntra Orders" <${process.env.NODE_CODE_SENDING_EMAIL_ADDRESS}>`,
          to: populatedOrder.user.email,
          subject: `Order Confirmation - ${orderId}`,
          html: orderEmailTemplate(populatedOrder, populatedOrder.user),
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

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        data: null,
      });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
        data: null,
      });
    }

    // Handle cancellation - restore stock
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    if (status) {
      if (status === "delivered" && order.status !== "delivered") {
        order.deliveredAt = new Date();
      } else if (status !== "delivered" && order.status === "delivered") {
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
        await transport.sendMail({
          from: `"Vyntra Orders" <${process.env.NODE_CODE_SENDING_EMAIL_ADDRESS}>`,
          to: populatedOrder.user.email,
          subject: `Order Cancelled - ${populatedOrder.orderId}`,
          html: cancelEmailTemplate(populatedOrder, populatedOrder.user),
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
