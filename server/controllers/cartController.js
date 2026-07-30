import Cart from "../models/cart.js";
import Product from "../models/product.js";
import Variant from "../models/variant.js";
import mongoose from "mongoose";

// GET USER CART
export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId })
      .populate({
        path: "products.productId",
        match: { status: "Active" },
        select: "title slug category brand status",
        populate: [
          { path: "category", select: "name" },
          { path: "brand", select: "name" },
        ],
      })
      .populate({
        path: "products.variantId",
        populate: [
          { path: "attributes.attribute" },
          { path: "attributes.option" }
        ]
      })
      .lean();

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart fetched successfully",
        data: { items: [], totalAmount: 0, itemCount: 0 },
      });
    }

    // Process and filter active items
    const activeItems = [];
    let totalAmount = 0;
    let itemCount = 0;

    for (const item of cart.products) {
      if (!item.productId || !item.variantId) continue; // Product or variant was deleted, is inactive, or is a legacy item

      const product = item.productId;
      const variant = item.variantId;
      
      // Get color and size from attributes
      let colorName = "Default";
      let sizeName = "Standard";

      if (variant.attributes) {
        variant.attributes.forEach(attr => {
          if (attr.attribute?.name?.toLowerCase() === "color") {
            colorName = attr.option?.displayName || colorName;
          }
          if (attr.attribute?.name?.toLowerCase() === "size") {
            sizeName = attr.option?.displayName || sizeName;
          }
        });
      }

      // Extract specific variant info
      const processedItem = {
        _id: item._id, // Cart item ID
        productId: product._id,
        variantId: variant._id,
        quantity: item.quantity,
        // UI fields
        title: product.title,
        slug: product.slug,
        brand: product.brand,
        category: product.category,
        price: variant.price,
        mrp: variant.mrp,
        gstRate: variant.gstRate,
        image: variant.mainImage?.url,
        colorName,
        sizeName,
        stock: variant.stock,
        addedFromWishlist: item.addedFromWishlist
      };

      activeItems.push(processedItem);
      totalAmount += variant.price * item.quantity;
      itemCount += item.quantity;
    }

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: {
        items: activeItems,
        totalAmount: Math.round(totalAmount * 100) / 100,
        itemCount,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
      data: null,
    });
  }
};

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity = 1, addedFromWishlist = false } = req.body;
    const userId = req.user.userId;

    if (!productId || !variantId) {
      return res.status(400).json({
        success: false,
        message: "Product ID and Variant ID are required",
        data: null,
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
        data: null,
      });
    }

    // Check product exists and is active
    const product = await Product.findOne({ _id: productId, status: "Active" });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or inactive",
        data: null,
      });
    }

    const variant = await Variant.findOne({ _id: variantId, product: productId });
    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    // Check stock
    if (variant.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${variant.stock} items available in stock`,
        data: null,
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        products: [{ productId, variantId, quantity: Number(quantity), addedFromWishlist }],
      });
    } else {
      // Clean up any legacy cart items that don't have a variantId
      cart.products = cart.products.filter(item => item.variantId);

      const itemIndex = cart.products.findIndex(
        (item) => 
          item.productId?.toString() === productId && 
          item.variantId?.toString() === variantId
      );

      if (itemIndex > -1) {
        // Update quantity
        const newQuantity = cart.products[itemIndex].quantity + Number(quantity);
        if (variant.stock < newQuantity) {
          return res.status(400).json({
            success: false,
            message: `Only ${variant.stock} items available. You already have ${cart.products[itemIndex].quantity} in cart.`,
            data: null,
          });
        }
        cart.products[itemIndex].quantity = newQuantity;
      } else {
        // Add new
        cart.products.push({ productId, variantId, quantity: Number(quantity), addedFromWishlist });
      }
    }

    await cart.save();
    
    // Quick re-fetch to get counts
    const countRes = await getCartData(userId);
    return res.status(200).json(countRes);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to add to cart",
      data: null,
    });
  }
};

// Helper for quick refetch
const getCartData = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate('products.productId').lean();
  let itemCount = 0;
  if (cart) {
    cart.products.forEach(p => {
      if(p.productId) itemCount += p.quantity;
    });
  }
  return { success: true, message: "Cart updated", data: { itemCount } };
}

// UPDATE CART ITEM QUANTITY
export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params; // CartItem _id
    const { quantity } = req.body;
    const userId = req.user.userId;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ success: false, message: "Valid quantity is required" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Bag not found" });

    const itemIndex = cart.products.findIndex(item => item._id.toString() === id);
    if (itemIndex === -1) return res.status(404).json({ success: false, message: "Item not found in bag" });

    if (quantity === 0) {
      cart.products.splice(itemIndex, 1);
    } else {
      const item = cart.products[itemIndex];
      const variant = await Variant.findById(item.variantId);
      if (variant && variant.stock < quantity) {
        return res.status(400).json({ success: false, message: `Only ${variant.stock} items available` });
      }
      cart.products[itemIndex].quantity = Number(quantity);
    }

    await cart.save();
    return await getCart(req, res); // Return full populated cart

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update cart" });
  }
};

// REMOVE FROM CART
export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params; // CartItem _id
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Bag not found" });

    const itemIndex = cart.products.findIndex(item => item._id.toString() === id);
    if (itemIndex === -1) return res.status(404).json({ success: false, message: "Item not found in bag" });

    cart.products.splice(itemIndex, 1);
    await cart.save();

    return await getCart(req, res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to remove from cart" });
  }
};

// CLEAR CART
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId });
    
    if (cart) {
      cart.products = [];
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: { items: [], totalAmount: 0, itemCount: 0 },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to clear cart" });
  }
};
