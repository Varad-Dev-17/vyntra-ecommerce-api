import ProductReview from "../models/productReview.js";
import Product from "../models/product.js";

// GET REVIEWS BY PRODUCT
export const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      ProductReview.find({ product: productId })
        .populate("user", "username email")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ProductReview.countDocuments({ product: productId }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: {
        reviews,
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
      message: "Failed to fetch reviews",
      data: null,
    });
  }
};

// CREATE REVIEW
export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
        data: null,
      });
    }

    // Check if product exists and is active
    const product = await Product.findOne({ _id: productId, status: "active" });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    // Check if user already reviewed this product
    const existingReview = await ProductReview.findOne({
      product: productId,
      user: userId,
    });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
        data: null,
      });
    }

    // Create review
    const review = await ProductReview.create({
      product: productId,
      user: userId,
      rating: Number(rating),
      comment: comment?.trim() || "",
    });

    // Recalculate product ratings
    const allReviews = await ProductReview.find({ product: productId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const ratingAverage = totalRating / allReviews.length;

    product.ratingAverage = Math.round(ratingAverage * 10) / 10;
    product.ratingCount = allReviews.length;
    await product.save();

    const populatedReview = await ProductReview.findById(review._id)
      .populate("user", "username email")
      .populate("product", "title");

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: populatedReview,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create review",
      data: null,
    });
  }
};

// UPDATE REVIEW
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    const review = await ProductReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
        data: null,
      });
    }

    // Only review owner can update
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this review",
        data: null,
      });
    }

    // Update fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
          data: null,
        });
      }
      review.rating = Number(rating);
    }

    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    await review.save();

    // Recalculate product ratings
    const productId = review.product;
    const allReviews = await ProductReview.find({ product: productId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const ratingAverage = totalRating / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      ratingAverage: Math.round(ratingAverage * 10) / 10,
      ratingCount: allReviews.length,
    });

    const populatedReview = await ProductReview.findById(reviewId)
      .populate("user", "username email")
      .populate("product", "title");

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: populatedReview,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update review",
      data: null,
    });
  }
};

// DELETE REVIEW
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const review = await ProductReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
        data: null,
      });
    }

    // Only review owner can delete
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this review",
        data: null,
      });
    }

    const productId = review.product;

    await ProductReview.findByIdAndDelete(reviewId);

    // Recalculate product ratings
    const allReviews = await ProductReview.find({ product: productId });

    let ratingAverage = 0;
    let ratingCount = 0;

    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      ratingAverage = Math.round((totalRating / allReviews.length) * 10) / 10;
      ratingCount = allReviews.length;
    }

    await Product.findByIdAndUpdate(productId, {
      ratingAverage,
      ratingCount,
    });

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
      data: null,
    });
  }
};
