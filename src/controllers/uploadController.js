const User = require("../models/user");

exports.uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ message: "User not found!" })
        }

        user.profilePicture = req.file.path;
        await user.save();

        res.json({
            message: "Profile image uploaded successfully",
            file: req.file.path
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};