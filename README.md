# Fibax Pharma — Ayurvedic PCD Pharma Franchise Landing Page

A high-converting landing page for **Fibax Pharma** built with **React + Vite** (frontend) and **Node.js + Express** (backend).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Setup & Run

```bash
# 1. Install client dependencies
cd client
npm install

# 2. Install server dependencies
cd ../server
npm install

# 3. Start the backend (Terminal 1)
cd server
npm run dev
# Server runs on http://localhost:5000

# 4. Start the frontend (Terminal 2)
cd client
npm run dev
# React app runs on http://localhost:3000
```

### Production Build

```bash
# Build the React frontend
cd client
npm run build

# Start the server (serves built React app)
cd ../server
npm start
# Visit http://localhost:5000
```

## 📁 Project Structure

```
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app
│   │   └── index.css       # Global styles
│   ├── index.html          # Entry HTML
│   ├── vite.config.js      # Vite config
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── index.js            # Express server
│   ├── data/
│   │   └── enquiries.json  # Lead storage
│   └── package.json
│
└── README.md
```

## 🎨 Tech Stack

- **Frontend**: React 18, Vite, React Icons, CSS
- **Backend**: Node.js, Express, Nodemailer (optional)
- **Design**: Mobile-first, Ayurvedic green & gold theme

## 📝 Configuration

Update placeholder values in the components:
- Phone number: Search for `XXXXXXXXXX`
- Email: Search for `info@fiabxpharma.com`
- Address: Search for `Company Address Placeholder`
- WhatsApp: Search for `wa.me`

## 📧 Email Notifications (Optional)

Uncomment the Nodemailer section in `server/index.js` and configure:
```js
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-specific-password'
  }
});
```
