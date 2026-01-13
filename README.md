````markdown
# 🛒 E-Commerce Backend API

A Node.js + Express + MongoDB e-commerce backend that supports authentication, product management, cart operations, and Paystack-powered payments with transactional integrity and webhook handling.

## 🌐 Project URL

Project page: [https://github.com/anaell/ecommerceAPI](https://github.com/anaell/ecommerceAPI)

## 🌐 Roadmap.sh Project URL

This backend API was built as part of the [roadmap.sh](https://roadmap.sh) learning projects.  
You can view the official project description and requirements here:

## 👉 [https://roadmap.sh/projects/ecommerce-api](https://roadmap.sh/projects/ecommerce-api)

## 🚀 Features

### 🔐 Authentication & Authorization

- User signup and login
- JWT-based authentication (access & refresh tokens)
- Secure HTTP-only refresh token cookies
- Role-based access control (admin, user)
- Token refresh & logout support

### 📦 Product Management

- Create, update, delete products (Admin only)
- Fetch all products
- Fetch single product by ID
- Search products by name or description

### 🛒 Cart Management

- Add products to cart
- Edit cart quantities
- Fetch user cart
- Clear cart
- One cart per user (enforced)

### 💳 Payments (Paystack Integration)

- Initialize payments via Paystack
- Verify payments
- Handle Paystack webhooks securely
- Atomic payment processing using MongoDB transactions
- Automatic stock decrement on successful payment
- Refund handling for out-of-stock scenarios
- Cart cleanup after successful or failed payment

---

## 🧰 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Zod (request validation)
- bcryptjs (password hashing)
- Paystack API
- Axios
- Cookie Parser
- MongoDB Transactions (Sessions)

---

## 📁 Project Structure

```plaintext
├── controllers/
│   ├── auth.controller.js
│   ├── cart.controller.js
│   ├── payment.controller.js
│   └── product.controller.js
│
├── models/
│   ├── user.model.js
│   ├── product.model.js
│   ├── cart.model.js
│   └── payment.model.js
│
├── routes/
│   ├── auth.route.js
│   ├── product.route.js
│   ├── cart.route.js
│   └── payment.route.js
│
├── middleware/
│   └── auth.js
│
├── services/
│   ├── auth.service.js
│   └── cart.service.js
│
├── utils/
│   ├── connectDB.js
│   ├── jwtGenerator.js
│   └── validators.js
│
├── index.js
└── README.md
```
````

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and configure the following:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

PAYSTACK_TEST_SECRET_KEY=your_paystack_secret_key
ADMIN_KEY=admin_secret_key
SALT=10
```

---

## 🛠️ Installation & Setup

```bash
# Clone repository
git clone https://github.com/anaell/ecommerceAPI.git

# Navigate to project
cd ecommerceAPI

# Install dependencies
pnpm install

# Start server
pnpm dev
```

Server runs at:  
`http://localhost:PORT`

---

## 🔑 Authentication Flow

**Signup/Login**

- Returns access token
- Sets refresh token as HTTP-only cookie

**Authenticated Requests**  
Send access token in headers:

```
Authorization: Bearer <access_token>
```

**Refresh Token**

```
POST /auth/refresh-token
```

Issues new access token

---

## 📌 API Endpoints Overview

### Auth

| Method | Endpoint            | Description          |
| ------ | ------------------- | -------------------- |
| POST   | /auth/signup        | Register user        |
| POST   | /auth/login         | Login user           |
| POST   | /auth/logout        | Logout user          |
| POST   | /auth/refresh-token | Refresh access token |

### Products

| Method | Endpoint     | Access |
| ------ | ------------ | ------ |
| GET    | /product     | Public |
| GET    | /product/:id | Public |
| POST   | /product     | Admin  |
| PUT    | /product/:id | Admin  |
| DELETE | /product/:id | Admin  |

### Cart (Authenticated)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET    | /cart    | Fetch cart  |
| POST   | /cart    | Add to cart |
| PUT    | /cart    | Edit cart   |
| DELETE | /cart    | Clear cart  |

### Payments

| Method | Endpoint                   | Description      |
| ------ | -------------------------- | ---------------- |
| POST   | /payment/intialize_payment | Start payment    |
| GET    | /payment/verify_payment    | Verify payment   |
| POST   | /payment/webhook           | Paystack webhook |

---

## 🔐 Security Highlights

- Passwords hashed with bcrypt
- JWT verification middleware
- HTTP-only refresh token cookies
- Paystack webhook signature verification
- MongoDB transactions to ensure atomic operations
- Idempotent payment processing

---

## 🔄 Payment Lifecycle

1. User initiates payment
2. Payment snapshot created
3. Paystack checkout URL returned
4. Payment verified (callback or webhook)
5. Stocks decremented
6. Cart cleared
7. Refund triggered if stock issues arise

---

## 📌 Future Improvements

- Order history endpoint
- Pagination & filtering for products
- Rate limiting
- Email notifications
- Admin dashboard
- Soft deletes
- Deployment (Docker / CI-CD)

---

## 📜 License

This project is licensed under the **MIT License**.
