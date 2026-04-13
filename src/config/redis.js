const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

// events
redisClient.on("connect", () => {
    console.log("Redis Connected");
});

redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
});

// connect
(async () => {
    await redisClient.connect();
})();

module.exports = redisClient;