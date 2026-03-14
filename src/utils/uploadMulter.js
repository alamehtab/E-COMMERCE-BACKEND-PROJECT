const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/profiles")
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9)
        cb(null, uniqueName + path.extname(file.originalname))
    }
})

const fileFilter = async (req, file, cb) => {
    const allowedFileTypes = ["image/png", "image/jpeg", "image/jpg"]
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error("Invalid file type!", false))
    }
}

exports.upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
})