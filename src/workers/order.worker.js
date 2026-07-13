const { Worker } = require("bullmq");
const bullRedis = require("../config/bullRedis");

const fs = require("fs");

const Order = require("../models/order");

const { generateInvoice } = require("../services/invoiceService");
const { sendMail } = require("../utils/mail");
const { sendSMS } = require("../services/smsService");

const worker = new Worker(
    "orderQueue",
    async (job) => {

        const { orderId } = job.data;

        const order = await Order.findById(orderId)
            .populate("user")
            .populate("items.product");

        if (!order) {
            throw new Error("Order not found");
        }

        const invoice = await generateInvoice(order._id);

        order.invoiceUrl = invoice.invoiceUrl;

        await order.save();

        await sendMail(
            order.user.email,
            "Order Confirmed",
            `Hello ${order.user.name},

Your order has been placed successfully.

Order ID: ${order._id}

Thank you for shopping with us.`,
            [
                {
                    filename: `Invoice-${order._id}.pdf`,
                    path: invoice.pdfPath,
                },
            ]
        );

        await fs.promises.unlink(invoice.pdfPath);

        await sendSMS(
            order.user.phone,
            `Your order ${order._id} has been placed successfully.`
        );

        console.log(`Order ${orderId} processed successfully.`);
    },
    {
        connection: bullRedis,
    }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.log(`Job ${job.id} failed:`, err.message);
});

module.exports = worker;