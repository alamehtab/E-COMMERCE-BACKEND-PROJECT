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
        for (let item of cart.items) {
            const product = await Product.findById(item.product._id)
            if (!product) {
                return res.status(404).json({ message: "Product not found!" })
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: "Limited stocks!" })
            }
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
            const checkProduct = await Product.findByIdAndUpdate(
                { _id: item.product._id, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity, sold: item.quantity } },
                { new: true }
            );
            if (!checkProduct) {
                return res.status(400).json({ message: "Stock changed! Try adding again." })
            }
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
        const { status } = req.body
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        const validTransitions = {
            placed: ["confirmed", "cancelled"],
            confirmed: ["shipped", "delivered"],
            shipped: ["delivered"],
            delivered: [],
            cancelled: []
        }
        const allowed = validTransitions[order.status]
        if (!allowed.includes(status)) {
            return res.status(402).json({ message: `Invalid change from ${order.status} to ${status}.` })
        }
        if (status === "cancelled" || order.status !== "cancelled") {
            for (let item of order.items) {
                await Product.findByIdAndUpdate({ _id: item.product }, { $inc: { stock: item.quantity, sold: -item.quantity } })
            }
        }
        order.status = status
        await order.save();
        return res.json(order);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};