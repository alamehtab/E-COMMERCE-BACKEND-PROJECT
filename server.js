const express = require("express");
const mongoose=require("mongoose")
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
require("dotenv").config();
const { connectRedis } = require("./src/config/redis");

const couponRoutes=require("./src/routes/couponRoutes")
const authRoutes = require("./src/routes/authRoutes");
const categoryRoutes=require("./src/routes/categoryRoutes")
const productRoutes=require("./src/routes/productRoutes")
const cartRoutes=require("./src/routes/cartRoutes")
const orderRoutes=require("./src/routes/orderRoutes")
const reviewRoutes=require("./src/routes/reviewRoutes")
const wishlistRoutes=require("./src/routes/wishlistRoutes")


const app=express()
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
// app.use(mongoSanitize());
// app.use(xss());
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupon", couponRoutes);

app.get("/", (req, res) => {
    res.send("E-Commerce API Running");
});

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected");
    } catch (error) {
        console.log(error);
    }
} main().catch((err) => { console.log(err); })

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
})
