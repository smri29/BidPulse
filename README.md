Here is the updated `README.md` for BidPulse. It reflects the completed V1 status, including the deployment links (Vercel & Render), the unified user role system, and the updated tech stack details.

### Updated `README.md`

```markdown
# BidPulse ⚡

**BidPulse** is a premium, real-time Bidding Management System (BMS) designed to facilitate secure, high-stakes auctions. It features a sophisticated "Anti-Sniping" mechanism, an Escrow financial model, and a unified interface for Bidders, Sellers, and Administrators.

![Project Status](https://img.shields.io/badge/Status-Live-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Frontend](https://img.shields.io/badge/Frontend-Vercel-black)
![Backend](https://img.shields.io/badge/Backend-Render-purple)

## 🌐 Live Demo
- **Frontend:** [https://bid-pulse.vercel.app](https://bid-pulse.vercel.app)
- **Backend API:** [https://bidpulse-qkd9.onrender.com](https://bidpulse-qkd9.onrender.com)

---

## 🌟 Key Features

### 🧠 Intelligent Bidding Engine
* **Real-Time Updates:** Instant price updates across all connected clients using **Socket.io**. No page refreshes required.
* **"Soft Close" Logic:** If a bid is placed in the last 5 minutes, the auction timer automatically extends by 5 minutes. This prevents "sniping" and mimics real-world auction dynamics.
* **Smart Validation:** Prevents users from bidding on their own items or bidding below the increment threshold.

### 🛡️ Trust & Safety
* **Stripe Escrow Payments:** Winning bids are held in a secure platform account. Funds are only released to the Seller after the Buyer confirms receipt of the item.
* **Identity Verification:** Users must provide NID/Passport details during registration.
* **Admin Oversight:** Complete control to ban users, delete illegal auctions, and monitor platform health.

### 📧 Automated Notification System
The system handles communication automatically via email:
1.  **Welcome Email:** Immediate confirmation upon registration.
2.  **Password Reset:** Secure token-based password recovery.
3.  **Auction Won:** Notifies Winner (Pay Now) and Seller (Item Sold).
4.  **Payment Made:** Sends Invoice to Winner and "Ready to Ship" alert to Seller.
5.  **Order Completed:** Releases funds and sends "Thank You" notes upon delivery confirmation.

---

## 👥 User Roles & Workflows

### 1. The Unified User (Standard Account)
* **Dual Capabilities:** Every user can both **Buy** and **Sell**. No need for separate accounts.
* **Bidder Mode:** Live dashboard tracking Winning, Outbid, and Completed auctions.
* **Seller Mode:** Inventory management, order fulfillment tracking, and earnings reports.

### 2. Admin (The Moderator) - *Restricted Access*
* **Financial Control:** Automatically collects an **8% commission** on every sale.
* **User Management:** View all users, delete accounts, and manage verify status.
* **Platform Analytics:** Real-time stats on total volume, net revenue, and active auctions.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | Fast, interactive UI with TailwindCSS & Redux Toolkit. |
| **Backend** | Node.js + Express | RESTful API and Business Logic. |
| **Database** | MongoDB Atlas | Cloud-hosted NoSQL database for scalable data. |
| **Real-Time** | Socket.io | Bi-directional communication for timers/bids. |
| **Payments** | Stripe Connect | Handling Escrow and Commission splits. |
| **Email** | Nodemailer | Transactional email delivery (Gmail SMTP). |
| **Deployment** | Vercel (FE) + Render (BE) | CI/CD pipeline for automated deployment. |

---

## 📂 Architecture Overview

### The "Soft Close" Algorithm
```javascript
IF (CurrentTime + 5 mins > AuctionEndTime) {
    NewEndTime = CurrentTime + 5 mins;
    Broadcast(NewEndTime);
}

```

### The Escrow Flow

1. **Winner Pays** -> Funds move to Stripe Platform Account (Held).
2. **Seller Ships** -> Funds remain Held.
3. **Buyer Confirms** -> 92% transferred to Seller; 8% retained as Revenue.

---

## 🚀 Getting Started (Local Development)

### Prerequisites

* Node.js (v18+)
* MongoDB Atlas URI
* Stripe Account (Test Mode)

### Installation

1. **Clone the repository**
```bash
git clone [https://github.com/smri29/BidPulse.git](https://github.com/smri29/BidPulse.git)
cd BidPulse

```


2. **Install Dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

```


3. **Environment Variables**
Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
CLIENT_URL=http://localhost:5173

```


Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api

```


4. **Run the App**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

```



---

## 📜 License

This project is licensed under the MIT License.

```

```