const { Queue } = require("bullmq");
const bullRedis = require("../config/bullRedis");

const orderQueue = new Queue("orderQueue", {
    connection: bullRedis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
    },
});

module.exports = orderQueue;