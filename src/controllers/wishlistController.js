const Wishlist = require("../models/wishlist")
// ADD PRODUCT TO WISHLIST
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body
        let wishlist = await Wishlist.findOne({ user: req.user._id })
        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user._id,
                products: [productId]
            })
        } else {
            if (wishlist.products.includes(productId)) {
                return res.status(400).json({
                    message: "Product already in wishlist"
                })
            }
            wishlist.products.push(productId)
            await wishlist.save()
        }
        return res.json(wishlist)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
// GET WISHLIST
exports.getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({
            user: req.user._id
        }).populate("products")
        return res.json(wishlist)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
// REMOVE PRODUCT FROM WISHLIST
exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params
        const wishlist = await Wishlist.findOne({
            user: req.user._id
        })
        if (!wishlist) {
            return res.status(404).json({
                message: "Wishlist not found"
            })
        }
        wishlist.products = wishlist.products.filter(
            p => p.toString() !== productId
        )
        await wishlist.save()
        return res.json({ message: "Product removed from wishlist" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}