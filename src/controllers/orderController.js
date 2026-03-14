const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");

// CREATE ORDER FROM CART
exports.createOrder = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }
        let totalPrice = 0;
        const orderItems = cart.items.map(item => {
            totalPrice += item.product.price * item.quantity;
            return {
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            };
        });
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            totalPrice,
            shippingAddress: req.body.shippingAddress
        });
        // reduce stock
        for (let item of cart.items) {
            await Product.findByIdAndUpdate(
                item.product._id,
                { $inc: { stock: -item.quantity } }
            );
        }
        // clear cart
        cart.items = [];
        cart.totalPrice = 0
        await cart.save();
        return res.status(201).json(order);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate("item.product")
        if (!cart || cart.items.length === 0) {
            return res.status(401).json({ message: "Cart is empty!" })
        }
        let totalPrice = 0
        const orderItems = cart.items.map((item) => {
            totalPrice += item.product.price * item.quantity
            return {
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            }
        })
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            totalPrice,
            shippingAddress: req.body.shippingAddress
        })
        for (let item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } })
        }
        cart.items = []
        cart.totalPrice = 0
        await cart.save()
        return res.status(201).json({ message: "Order created successfully", order })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// GET USER ORDERS
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate("items.product");
        return res.json(orders);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// GET ORDER BY ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("items.product");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        return res.json(order);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// ADMIN UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        order.status = req.body.status;
        await order.save();
        return res.json(order);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};