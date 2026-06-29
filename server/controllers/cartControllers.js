import Cart from "../models/cart.js";

// GET /cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    let cart = await Cart.findOne({ userId }).populate({
      path: "products.productId",
      select: "title desc img categories size color price stock",
    });

    if (!cart) {
      cart = await Cart.create({ userId, products: [] });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("[Get Cart] Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /cart/add
export const addToCart = async (req, res) => {
  console.log("[Add to Cart] req.user:", req.user);
  console.log("[Add to Cart] req.body:", req.body);

  try {
    const userId = req.user.userId;
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    const existingIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
    );

    if (existingIndex > -1) {
      cart.products[existingIndex].quantity += parseInt(quantity) || 1;
    } else {
      cart.products.push({
        productId,
        quantity: parseInt(quantity) || 1,
        size,
        color,
      });
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ userId }).populate({
      path: "products.productId",
      select: "title desc img categories size color price stock",
    });

    res.status(200).json({
      success: true,
      message: "Added to bag",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("[Add to Cart] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// PUT /cart/update
export const updateQuantity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID and quantity required",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.products.find(
      (p) => p.productId.toString() === productId
    );
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    item.quantity = parseInt(quantity);
    await cart.save();

    const updatedCart = await Cart.findOne({ userId }).populate({
      path: "products.productId",
      select: "title desc img categories size color price stock",
    });

    res.status(200).json({
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    console.error("[Update Quantity] Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /cart/remove/:productId
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.products = cart.products.filter(
      (p) => p.productId.toString() !== productId
    );
    await cart.save();

    const updatedCart = await Cart.findOne({ userId }).populate({
      path: "products.productId",
      select: "title desc img categories size color price stock",
    });

    res.status(200).json({
      success: true,
      message: "Item removed",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("[Remove from Cart] Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /cart/clear
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.products = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart,
    });
  } catch (error) {
    console.error("[Clear Cart] Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
