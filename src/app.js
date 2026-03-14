const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
// app.use(mongoSanitize());
// app.use(xss());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("E-Commerce API Running");
});

module.exports = app;