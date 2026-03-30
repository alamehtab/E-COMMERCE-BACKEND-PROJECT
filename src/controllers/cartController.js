const Cart = require("../models/cart");
const Product = require("../models/product");

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: []
      });
    }
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
    await cart.save();
    return res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");
    return res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
    await cart.save();
    return res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};