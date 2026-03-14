const { createClient } = require("redis");

let redisClient = null;

const connectRedis = async () => {
    try {
        const client = createClient({
            url: process.env.REDIS_URL,
        });
        client.on("error", (err) => {
            console.log("Redis error:", err.message);
        });
        await client.connect();
        redisClient = client;
        console.log("Redis Connected");
    } catch (error) {
        console.log("Redis not running. Skipping Redis connection.");
    }
};

module.exports = { redisClient, connectRedis };