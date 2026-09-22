# THE ROYAL'S — Luxury QR Dine-In Ordering Web Application

A modern, mobile-first QR dine-in ordering web application built for **The Royal's** dual-venue establishment (**The Royal's Cafe** & **The Royal's Restaurant**).

---

## 🌟 Key Features

- **Dual Venue Selection**: Seamlessly switch between Cafe & Bistro items and Fine Dining Restaurant menus.
- **Table QR Resolution**: Auto-detects table numbers upon scanning physical table QR codes.
- **Fast Food & Beverage Menu**: Categorized menu with instant search, intelligent synonyms, and Veg / Non-Veg diet filters.
- **Frictionless Cart & Checkout**: Fast 2-step ordering with table confirmation and special cooking instructions.
- **Live Order Status Tracking**: Real-time progress updates from order placement to kitchen preparation and serving.
- **Staff Floor Dashboard**: Real-time order notification stream and order lifecycle management for floor staff.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express, Socket.IO (Real-time WebSockets)
- **Database**: MongoDB with Mongoose ODM

---

## 🚀 Getting Started Locally

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/aditya-vrm/The-Royal-s.git
cd The-Royal-s
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
```

### 3. Build & Run
```bash
# Build Next.js application
npm run build

# Start the unified server
npm start
```

---

## 📄 License
MIT License. Built for The Royal's.
