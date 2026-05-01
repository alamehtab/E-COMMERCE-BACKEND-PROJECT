const Product = require("../models/product");
const redisClient = require("redis")

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
    try {
        if (Array.isArray(req.body)) {
            req.body = req.body.map(product => ({
                ...product,
                createdBy: req.user._id
            }));
        } else {
            req.body.createdBy = req.user._id;
        }
        const product = await Product.create(req.body);
        return res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

exports.getProducts = async (req, res) => {
    try {
        // const cacheKey = `products:${JSON.stringify(req.query)}`
        // const cachedData = await redisClient.get(cacheKey)
        // if (cachedData) {
        //     return res.status(200).json({ message: "Redis data", data: JSON.parse(cachedData) })
        // }

        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10
        const skip = (page - 1) * limit

        const sortBy = req.query.sortBy || "price"
        const order = req.query.order === "asc" ? 1 : -1

        const sortObject = {}
        sortObject[sortBy] = order

        const filter = {}

        if (req.query.search) {
            filter.title = { $regex: req.query.search, $options: "i" }
        }

        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {}

            if (req.query.minPrice) {
                filter.price.$gte = Number(req.query.minPrice)
            }

            if (req.query.maxPrice) {
                filter.price.$lte = Number(req.query.maxPrice)
            }
        }

        const nonFilterItems = ["page", "limit", "sortBy", "minPrice", "maxPrice", "order", "search"]

        for (let key in req.query) {
            if (!nonFilterItems.includes(key)) {
                filter[key] = req.query[key]
            }
        }

        const totalProducts = await Product.countDocuments(filter)

        const products = await Product.find(filter)
            .sort(sortObject)
            .skip(skip)
            .limit(limit)
        const response = {
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            products
        }
        await redisClient.setEx(cacheKey, 60, JSON.stringify(response))
        return res.status(200).json({ response })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.getProduct = async (req, res) => {
    try {
        // const cachekey = `products:${req.params.id}`
        // const cachedData = await redisClient.get(cachekey)
        // if (cachedData) {
        //     return res.status(200).json({ message: "Redis data", data: JSON.parse(cachedData) })
        // }
        const product = await Product.findById(req.params.id)
            .populate("category");
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        const response = {
            success: true,
            data: product
        }
        await redisClient.setEx(cachekey, 60, JSON.stringify(response))
        return res.status(200).json({ response });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        // await redisClient.flushAll()
        return res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        // await redisClient.flushAll()
        return res.status(200).json({
            success: true,
            message: "Product deleted"
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};