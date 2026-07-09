import Wishlist from "../models/wishlist.js";
import Product from "../models/product.js";

// GET USER WISHLIST
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({ user: userId })
      .populate({
        path: "products",
        match: { status: "active" },
        select:
          "title description images price stock ratingAverage ratingCount category subCategory brand status",
        populate: [
          { path: "category", select: "name" },
          { path: "subCategory", select: "name" },
          { path: "brand", select: "name" },
        ],
      })
      .lean();

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: "Wishlist fetched successfully",
        data: { products: [] },
      });
    }

    // Filter out null products (inactive/deleted)
    const activeProducts = wishlist.products.filter((p) => p !== null);

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: { products: activeProducts },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      data: null,
    });
  }
};

// ADD TO WISHLIST
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
        data: null,
      });
    }

    // Check if product exists and is active
    const product = await Product.findOne({ _id: productId, status: "active" });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or inactive",
        data: null,
      });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        products: [productId],
      });
    } else {
      if (wishlist.products.includes(productId)) {
        return res.status(409).json({
          success: false,
          message: "Product already in wishlist",
          data: null,
        });
      }
      wishlist.products.push(productId);
      await wishlist.save();
    }

    // Increment product wishlist count
    product.wishlistCount += 1;
    await product.save();

    const populatedWishlist = await Wishlist.findOne({ user: userId })
      .populate({
        path: "products",
        match: { status: "active" },
        select:
          "title description images price stock ratingAverage ratingCount category subCategory brand",
        populate: [
          { path: "category", select: "name" },
          { path: "subCategory", select: "name" },
          { path: "brand", select: "name" },
        ],
      })
      .lean();

    const activeProducts = populatedWishlist.products.filter((p) => p !== null);

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      data: { products: activeProducts },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to add to wishlist",
      data: null,
    });
  }
};

// REMOVE FROM WISHLIST
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
        data: null,
      });
    }

    if (!wishlist.products.includes(productId)) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
        data: null,
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );
    await wishlist.save();

    // Decrement product wishlist count
    const product = await Product.findById(productId);
    if (product) {
      product.wishlistCount = Math.max(0, product.wishlistCount - 1);
      await product.save();
    }

    const populatedWishlist = await Wishlist.findOne({ user: userId })
      .populate({
        path: "products",
        match: { status: "active" },
        select:
          "title description images price stock ratingAverage ratingCount category subCategory brand",
        populate: [
          { path: "category", select: "name" },
          { path: "subCategory", select: "name" },
          { path: "brand", select: "name" },
        ],
      })
      .lean();

    const activeProducts = populatedWishlist
      ? populatedWishlist.products.filter((p) => p !== null)
      : [];

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      data: { products: activeProducts },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove from wishlist",
      data: null,
    });
  }
};

// CLEAR WISHLIST
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist || wishlist.products.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Wishlist is already empty",
        data: { products: [] },
      });
    }

    // Decrement wishlist counts for all products
    for (const productId of wishlist.products) {
      const product = await Product.findById(productId);
      if (product) {
        product.wishlistCount = Math.max(0, product.wishlistCount - 1);
        await product.save();
      }
    }

    wishlist.products = [];
    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      data: { products: [] },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
      data: null,
    });
  }
};

// CHECK IF PRODUCT IS IN WISHLIST
export const checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({ user: userId });
    const isInWishlist = wishlist
      ? wishlist.products.includes(productId)
      : false;

    return res.status(200).json({
      success: true,
      message: "Wishlist status fetched",
      data: { isInWishlist },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to check wishlist status",
      data: null,
    });
  }
};
