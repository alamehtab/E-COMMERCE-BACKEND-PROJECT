const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

const s3 = require("../config/s3");

const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.AWS_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,

        key: function (req, file, cb) {
            const uniqueName =
                Date.now() + "-" + Math.round(Math.random() * 1e9);

            cb(null, "profiles/" + uniqueName + path.extname(file.originalname));
        }
    }),

    limits: {
        fileSize: 2 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const allowedFileTypes = [
            "image/png",
            "image/jpeg",
            "image/jpg"
        ];

        if (allowedFileTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"));
        }
    }
});

module.exports = upload;