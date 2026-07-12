const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const Order = require("../models/orderModel");
const cloudinary = require("../config/cloudinary");
const invoiceTemplate = require("../templates/invoiceTemplate");

exports.generateInvoice = async (orderId) => {
    let browser;
    try {
        const order = await Order.findById(orderId).populate("user").populate("items.product")
        if (!order) {
            throw new Error("Order not found!")
        }
        const html = invoiceTemplate(order)

        browser = await puppeteer.launch({
            headless: true // opens chrome without showing the chrome window
        })
        const page = await browser.newPage() // opening a new tab in chrome browser
        await page.setContent(html, { // creates a page with html content and display it
            waitUntil: 'networkidle0' // wait untils everything loads from the the html.
        })

        const invoiceDir = path.join(__dirname, "../temp/invoices");
        await fs.promises.mkdir(invoiceDir, {
            recursive: true
        });

        const pdfPath = path.join(
            invoiceDir,
            `invoice_${order._id}.pdf`
        )
        await page.pdf({
            path: pdfPath,
            format: "A4",
            printBackground: true
        })

        const uploadFile = await cloudinary.uploader.upload(pdfPath, {
            resource_type: 'raw',
            folder: 'ecommerce-invoices',
            public_id: `invoices_${order._id}`
        })
        // await fs.promises.unlink(pdfPath)
        return { invoiceUrl: uploadFile.secure_url, pdfPath }
    } catch (error) {
        throw new Error(error)
    } finally {
        if (browser) {
            await browser.close()
        }
    }
};