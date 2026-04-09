# 🛒 MERN E-Commerce Backend API

A production-style **E-Commerce Backend Application** built using **Node.js, Express.js, MongoDB**, and **Razorpay Payment Integration**.
This project simulates a real-world online shopping backend including authentication, cart management, order workflow, inventory handling, coupon system, reviews, and secure payment processing.

---

## 🚀 Project Overview

This backend powers an e-commerce platform where users can:

* Register & login securely
* Browse categorized products
* Add items to cart
* Apply coupons
* Make online payments
* Automatically create orders after successful payment
* Track order status
* Review purchased products

The application follows real industry workflows where **orders are created only after payment verification**.

---

## 🧱 Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose

### Authentication & Security

* JWT Authentication
* Refresh Token System
* Password Hashing (bcrypt)
* Helmet
* CORS
* Morgan Logger

### Payment Gateway

* Razorpay Payment Integration
* Signature Verification (HMAC SHA256)

---

## 📁 Project Architecture

```
src/
│
├── controllers/
├── models/
├── routes/
├── middlewares/
├── config/
└── server.js
```

---

## 🔐 Authentication System

### Features

* User Registration
* Login with JWT Access Token
* Refresh Token stored securely
* Protected routes using middleware
* Role-based authorization (Admin/User)

### Flow

```
Register/Login
      ↓
Access Token generated
      ↓
Protected API Access
      ↓
Refresh token used when access token expires
```

---

## 👤 User Roles

| Role  | Permissions                  |
| ----- | ---------------------------- |
| User  | Shop, cart, payment, review  |
| Admin | Manage products & categories |

---

## 📦 Category Module

Categories help organize products logically.

### Admin Actions

* Create category
* Update category
* Delete category

### Purpose

Allows users to browse products easily by grouping items.

Example:

```
Electronics → Mobile → Accessories
```

---

## 🛍 Product Module

Products represent items available for purchase.

### Features

* CRUD operations (Admin)
* Stock management
* Product pricing
* Category association

### Stored Data

* Name
* Description
* Price
* Stock
* Sold count
* Category reference

---

## 🛒 Cart System

Each user owns a single cart.

### Features

* Add product to cart
* Update quantity
* Auto price calculation
* Prevent adding beyond available stock

### Cart Logic

```
User adds item
      ↓
Cart created (if not exists)
      ↓
Quantity updated
      ↓
Total price recalculated
```

Cart stores product price at add-time to avoid future price mismatch.

---

## ⭐ Review System

Users can review purchased products.

### Features

* Rating system
* Comments
* Linked to user & product

Purpose:

* Helps customers make decisions
* Builds product credibility

---

## 🎟 Coupon System

Admins can create discount coupons.

### Coupon Types

* Percentage discount
* Fixed discount

### Validation Rules

* Active coupon
* Not expired
* Minimum order amount satisfied

### Flow

```
User enters coupon
      ↓
Backend validates coupon
      ↓
Discount calculated
      ↓
Final price returned
```

---

## 💳 Payment Gateway Integration (Razorpay)

Payments are processed securely using Razorpay.

---

### Payment Workflow (Important)

```
Add Items to Cart
        ↓
User clicks Checkout
        ↓
Create Razorpay Order (Backend)
        ↓
Frontend opens Razorpay Payment UI
        ↓
User completes payment
        ↓
Razorpay returns payment details
        ↓
Backend verifies signature
        ↓
Order created
        ↓
Inventory updated
        ↓
Cart cleared
```

---

## 🧾 Create Payment API

Backend:

1. Fetches user's cart
2. Calculates latest total price
3. Creates Razorpay order
4. Stores pending payment in DB
5. Sends payment details to frontend

Razorpay requires amount in **paise**, so amount is multiplied by 100.

---

## ✅ Payment Verification

After payment success, frontend sends:

* razorpay_order_id
* razorpay_payment_id
* razorpay_signature

Backend verifies payment using:

```
HMAC SHA256 Signature Verification
```

This ensures payment data is genuinely from Razorpay.

---

### Why Signature Verification?

Prevents:

* Fake payment success requests
* Manual API tampering
* Fraudulent order creation

---

## 📦 Order Creation Flow

Orders are created **ONLY AFTER PAYMENT SUCCESS**.

### Steps:

1. Payment verified
2. Order created from cart items
3. Product stock reduced
4. Sold count increased
5. Cart cleared

This guarantees inventory accuracy.

---

## 🗄 Database Models

### User

* name
* email
* password
* role
* refreshToken

### Category

* name
* description

### Product

* title
* price
* stock
* category

### Cart

* user
* items[]
* totalPrice

### Order

* user
* items[]
* totalPrice
* status

### Payment

* user
* order reference
* amount
* status
* transactionId
* razorpayOrderId

### Review

* user
* product
* rating
* comment

---

## 🔄 Order Status Workflow

```
placed → confirmed → shipped → delivered
            ↓
        cancelled
```

Admin controls order progression.

---

## 🔐 Security Practices Used

* Password hashing using bcrypt
* Protected routes middleware
* HTTP security headers (Helmet)
* Secure cookies for refresh token
* Payment signature validation

---

## ▶️ API Base URL

```
http://localhost:5000/api
```

---

## ⚙️ Environment Variables

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
RAZORPAY_API_KEY=your_key
RAZORPAY_SECRET_KEY=your_secret
```

---

## ▶️ Run Project Locally

### Install dependencies

```
npm install
```

### Start server

```
npm run dev
```

Server runs on:

```
http://localhost:5000
```

---

## 🎯 Key Learning Outcomes

* REST API architecture
* Authentication & authorization
* Payment gateway integration
* Secure payment verification
* Inventory management
* Real-world order lifecycle
* Backend business logic design

---

## 👨‍💻 Author

**Mehtab Alam**
Backend Developer | MERN Stack Developer

---

## 📌 Future Improvements

* Order cancellation & refunds
* Admin analytics dashboard
* Email notifications
* Logging system
* Redis caching
* Global error handling
* Deployment & CI/CD

---
