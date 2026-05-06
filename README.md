# Martify - Multi-Vendor E-Commerce Platform

![Martify Banner](https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)

Martify is a modern, full-stack multi-vendor e-commerce marketplace built using the **MERN** stack (MongoDB, Express, React, Node.js) and TypeScript. It offers a seamless shopping experience for buyers, powerful inventory and sales management for vendors, and full administrative oversight for platform owners.

---

## 🌟 Key Features

### 👤 Role-Based Access Control
- **Customers:** Browse products, compare items, manage carts/wishlists, apply coupons, and track orders.
- **Vendors (Sellers):** Manage own products, create discount coupons, monitor personal sales analytics, and manage orders.
- **Administrators:** Full platform control. Approve/reject products, manage all users, block accounts, and view sitewide analytics.

### 🛍️ Core E-commerce Functionality
- **Product Management:** Variants (size/color), stock tracking, product reviews, and category hierarchies.
- **Cart & Checkout:** Persistent carts via Redux, coupon code validation, tax/shipping calculation, and mocked payment flows.
- **Order Tracking:** Detailed order histories and real-time status updates (Processing, Shipped, Delivered).

### 🎁 Marketing & Promotions
- **Discount Coupons:** Vendors can generate specific codes with fixed/percentage discounts, minimum order requirements, and usage limits.
- **Featured Products:** Admins can pin products to the homepage to boost visibility.
- **Comparison Tool:** Buyers can compare up to 3 products side-by-side (specs, price, ratings).

### 🔔 Real-time Notifications & AI Assistant
- Context-aware UI notifications for order updates, low stock warnings, and review alerts.
- Built-in AI Chatbot assistant to help buyers find products instantly.

### 🎨 Modern UI/UX
- Responsive design crafted with custom CSS and Tailwind CSS.
- Smooth animations using Framer Motion.
- Toast notifications for instant feedback.

---

## 🛠️ Tech Stack

**Frontend:**
- React (v18)
- TypeScript
- Vite
- Redux Toolkit (State Management)
- React Router (v6)
- Tailwind CSS & Custom CSS Modules
- Framer Motion (Animations)
- Chart.js (Dashboards)
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- JSON Web Tokens (JWT) for Authentication
- TypeScript

---


## 🔐 Demo Accounts

You can log in to explore different roles using these default credentials (if seeded):

- **Admin:** `admin@martify.com` / `123456`
- **Vendor:** `ali@martify.com` / `123456`
- **Customer:** `buyer@martify.com` / `123456`

---

## 📁 Project Structure

```text
martify/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context providers (Theme, Comparison, Currency)
│   │   ├── pages/          # Route-level page components (Admin, Seller, Buyer)
│   │   ├── services/       # API Axios instances
│   │   ├── store/          # Redux slices (Cart, Auth, etc.)
│   │   └── styles/         # Global CSS and Tailwind directives
├── server/                 # Node/Express Backend
│   ├── src/
│   │   ├── controllers/    # Route logic
│   │   ├── middleware/     # Auth and error handling
│   │   ├── models/         # Mongoose schemas
│   │   └── routes/         # Express routes
```

---

## 📄 License
This project is licensed under the MIT License.
