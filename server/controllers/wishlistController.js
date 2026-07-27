import Wishlist from "../models/wishlist.js";
import Product from "../models/product.js";

// GET USER WISHLIST
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({ user: userId })
      .populate({
        path: "items.productId",
        match: { status: "Active" },
        select: "title slug description mainImage galleryImages price mrp stock ratingAverage ratingCount category brand status",
        populate: [
          { path: "category", select: "name" },
          { path: "brand", select: "name" },
        ],
      })
      .populate({
        path: "items.variantId",
        populate: [
          { path: "attributes.attribute" },
          { path: "attributes.option" }
        ]
      })
      .lean();

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: "Wishlist fetched successfully",
        data: { items: [] },
      });
    }

    // Filter out items where the product was deleted or became inactive
    const activeItems = wishlist.items.filter((item) => item.productId !== null);

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: { items: activeItems },
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
    const { productId, variantId } = req.body;
    const userId = req.user.userId;

    if (!productId || !variantId) {
      return res.status(400).json({
        success: false,
        message: "Product ID and Variant ID are required",
        data: null,
      });
    }

    // Check if product exists and is active
    const product = await Product.findOne({ _id: productId, status: "Active" });
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
        items: [{ productId, variantId }],
      });
    } else {
      // Check if this specific variant of the product is already in the wishlist
      const isAlreadyInWishlist = wishlist.items.some(
        (item) => item.productId.toString() === productId && item.variantId.toString() === variantId
      );

      if (isAlreadyInWishlist) {
        return res.status(409).json({
          success: false,
          message: "Product variant already in wishlist",
          data: null,
        });
      }
      wishlist.items.push({ productId, variantId });
      await wishlist.save();
    }

    // Increment product wishlist count
    product.wishlistCount = (product.wishlistCount || 0) + 1;
    await product.save();

    return getWishlist(req, res); // Return the updated wishlist directly using the same get method
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
    const { productId, variantId } = req.params; // Expecting both to uniquely identify what to remove
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
        data: null,
      });
    }

    const itemExists = wishlist.items.some(
      (item) => item.productId.toString() === productId && item.variantId.toString() === variantId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found in wishlist",
        data: null,
      });
    }

    wishlist.items = wishlist.items.filter(
      (item) => !(item.productId.toString() === productId && item.variantId.toString() === variantId)
    );
    await wishlist.save();

    // Decrement product wishlist count
    const product = await Product.findById(productId);
    if (product) {
      product.wishlistCount = Math.max(0, (product.wishlistCount || 1) - 1);
      await product.save();
    }

    return getWishlist(req, res); // Return updated list
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
    if (!wishlist || wishlist.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Wishlist is already empty",
        data: { items: [] },
      });
    }

    // Decrement wishlist counts for all products
    for (const item of wishlist.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.wishlistCount = Math.max(0, (product.wishlistCount || 1) - 1);
        await product.save();
      }
    }

    wishlist.items = [];
    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      data: { items: [] },
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
    const { productId, variantId } = req.params;
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({ user: userId });
    
    // Check if the specific variant is in wishlist
    const isInWishlist = wishlist
      ? wishlist.items.some(
          (item) => item.productId.toString() === productId && item.variantId.toString() === variantId
        )
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
