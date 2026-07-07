const redisClient = require("../config/redis");
const Category = require("../models/category");

// CREATE CATEGORY
exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        return res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL CATEGORIES
exports.getCategories = async (req, res) => {
    try {
        const cacheKey = "category"
        const cachedData = await redisClient.get(cacheKey)
        if (cachedData) {
            return res.status(200).json({ message: "Redis data", data: JSON.parse(cachedData) })
        }
        const categories = await Category.find();
        const response = {
            success: true,
            data: categories
        }
        await redisClient.setEx(cacheKey, 60, JSON.stringify(response))
        return res.status(200).json({ response });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET SINGLE CATEGORY
exports.getCategory = async (req, res) => {
    try {
        const cacheKey = `category:${req.params.id}`
        const cachedData = await redisClient.get(cacheKey)
        if (cachedData) {
            return res.status(200).json({ message: "Redis data", data: JSON.parse(cachedData) })
        }
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }
        const response = {
            success: true,
            data: category
        }
        await redisClient.setEx(cacheKey, 60, JSON.stringify(response))
        return res.status(200).json({ response });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        await redisClient.flushAll()
        return res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        await redisClient.flushAll()
        return res.status(200).json({
            success: true,
            message: "Category deleted"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};