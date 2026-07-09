import Cart from "../models/cart.js";
import Product from "../models/product.js";

// GET USER CART
export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        match: { status: "active" },
        select: "title images price stock status",
        populate: [
          { path: "category", select: "name" },
          { path: "brand", select: "name" },
        ],
      })
      .lean();

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart fetched successfully",
        data: { items: [], totalAmount: 0, itemCount: 0 },
      });
    }

    // Filter out inactive/deleted products and calculate totals
    const activeItems = cart.items.filter((item) => item.product !== null);

    let totalAmount = 0;
    let itemCount = 0;

    for (const item of activeItems) {
      totalAmount += item.product.price * item.quantity;
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
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.userId;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
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
    const product = await Product.findOne({ _id: productId, status: "active" });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or inactive",
        data: null,
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
        data: null,
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity: Number(quantity) }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // Product already in cart, update quantity
        const newQuantity = cart.items[itemIndex].quantity + Number(quantity);
        if (product.stock < newQuantity) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} items available. You already have ${cart.items[itemIndex].quantity} in cart.`,
            data: null,
          });
        }
        cart.items[itemIndex].quantity = newQuantity;
      } else {
        // Add new product to cart
        cart.items.push({ product: productId, quantity: Number(quantity) });
      }
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.product",
        match: { status: "active" },
        select: "title images price stock status",
        populate: [
          { path: "category", select: "name" },
          { path: "brand", select: "name" },
        ],
      })
      .lean();

    const activeItems = populatedCart.items.filter(
      (item) => item.product !== null
    );
    let totalAmount = 0;
    let itemCount = 0;
    for (const item of activeItems) {
      totalAmount += item.product.price * item.quantity;
      itemCount += item.quantity;
    }

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
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
      message: "Failed to add to cart",
      data: null,
    });
  }
};

// UPDATE CART ITEM QUANTITY
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.userId;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
        data: null,
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
        data: null,
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
        data: null,
      });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Check stock
      const product = await Product.findById(productId);
      if (product && product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
          data: null,
        });
      }
      cart.items[itemIndex].quantity = Number(quantity);
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.product",
        match: { status: "active" },
        select: "title images price stock status",
        populate: [
          { path: "category", select: "name" },
          { path: "brand", select: "name" },
        ],
      })
      .lean();

    const activeItems = populatedCart
      ? populatedCart.items.filter((item) => item.product !== null)
      : [];
    let totalAmount = 0;
    let itemCount = 0;
    for (const item of activeItems) {
      totalAmount += item.product.price * item.quantity;
      itemCount += item.quantity;
    }

    return res.status(200).json({
      success: true,
      message:
        quantity === 0 ? "Item removed from cart" : "Cart updated successfully",
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
      message: "Failed to update cart",
      data: null,
    });
  }
};

// REMOVE FROM CART
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
        data: null,
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
        data: null,
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.product",
        match: { status: "active" },
        select: "title images price stock status",
        populate: [
          { path: "category", select: "name" },
          { path: "brand", select: "name" },
        ],
      })
      .lean();

    const activeItems = populatedCart
      ? populatedCart.items.filter((item) => item.product !== null)
      : [];
    let totalAmount = 0;
    let itemCount = 0;
    for (const item of activeItems) {
      totalAmount += item.product.price * item.quantity;
      itemCount += item.quantity;
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
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
      message: "Failed to remove from cart",
      data: null,
    });
  }
};

// CLEAR CART
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Cart is already empty",
        data: { items: [], totalAmount: 0, itemCount: 0 },
      });
    }

    cart.items = [];
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: { items: [], totalAmount: 0, itemCount: 0 },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      data: null,
    });
  }
};
