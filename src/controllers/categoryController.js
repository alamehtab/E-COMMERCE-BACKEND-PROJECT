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
        const categories = await Category.find();
        return res.status(200).json({
            success: true,
            data: categories
        });
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
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }
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

// UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
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