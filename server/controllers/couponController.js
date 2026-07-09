import Coupon from "../models/coupon.js";

// GET ALL COUPONS
export const getAllCoupons = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      type,
      isActive,
    } = req.query;

    const query = {};

    if (search.trim()) {
      query.$or = [
        { code: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (status) query.status = status;
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [coupons, total] = await Promise.all([
      Coupon.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
      Coupon.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Coupons fetched successfully",
      data: {
        coupons,
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
      message: "Failed to fetch coupons",
      data: null,
    });
  }
};

// GET SINGLE COUPON
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id).lean();
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon fetched successfully",
      data: coupon,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupon",
      data: null,
    });
  }
};

// VALIDATE COUPON (public - for checkout)
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
        data: null,
      });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      status: "active",
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired coupon",
        data: null,
      });
    }

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon is not active yet",
        data: null,
      });
    }
    if (coupon.endDate && now > coupon.endDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
        data: null,
      });
    }
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon is valid",
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate coupon",
      data: null,
    });
  }
};

// CREATE COUPON
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      startDate,
      endDate,
    } = req.body;

    if (!code?.trim() || !type || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Code, type, and value are required",
        data: null,
      });
    }

    if (!["percentage", "fixed"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be 'percentage' or 'fixed'",
        data: null,
      });
    }

    const existingCoupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    });
    if (existingCoupon) {
      return res.status(409).json({
        success: false,
        message: "Coupon with this code already exists",
        data: null,
      });
    }

    if (type === "percentage" && (value < 0 || value > 100)) {
      return res.status(400).json({
        success: false,
        message: "Percentage value must be between 0 and 100",
        data: null,
      });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      description: description?.trim() || "",
      type,
      value: Number(value),
      minOrderAmount: minOrderAmount !== undefined ? Number(minOrderAmount) : 0,
      maxDiscountAmount:
        maxDiscountAmount !== undefined ? Number(maxDiscountAmount) : null,
      usageLimit: usageLimit !== undefined ? Number(usageLimit) : null,
      usageCount: 0,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isActive: true,
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create coupon",
      data: null,
    });
  }
};

// UPDATE COUPON
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      startDate,
      endDate,
      isActive,
      status,
    } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
        data: null,
      });
    }

    if (code?.trim() && code.trim().toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        code: code.trim().toUpperCase(),
        _id: { $ne: id },
      });
      if (existingCoupon) {
        return res.status(409).json({
          success: false,
          message: "Coupon with this code already exists",
          data: null,
        });
      }
      coupon.code = code.trim().toUpperCase();
    }

    if (type !== undefined) {
      if (!["percentage", "fixed"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Type must be 'percentage' or 'fixed'",
          data: null,
        });
      }
      coupon.type = type;
    }

    if (value !== undefined) {
      if (coupon.type === "percentage" && (value < 0 || value > 100)) {
        return res.status(400).json({
          success: false,
          message: "Percentage value must be between 0 and 100",
          data: null,
        });
      }
      coupon.value = Number(value);
    }

    if (description !== undefined) coupon.description = description.trim();
    if (minOrderAmount !== undefined)
      coupon.minOrderAmount = Number(minOrderAmount);
    if (maxDiscountAmount !== undefined)
      coupon.maxDiscountAmount = Number(maxDiscountAmount);
    if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
    if (startDate !== undefined)
      coupon.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined)
      coupon.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (status) coupon.status = status;

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update coupon",
      data: null,
    });
  }
};

// DELETE COUPON (soft delete)
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
        data: null,
      });
    }

    coupon.status = "inactive";
    coupon.isActive = false;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
      data: null,
    });
  }
};
