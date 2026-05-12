# ADZ4NEEDZ – AI Learning Platform

An AI-powered education platform connecting learners and trainers.

## Features
- **Role-Based Dashboards**: Customized experiences for Students, Trainers, and Admins.
- **Course Marketplace**: Browse and search through verified courses.
- **Razorpay Integration**: Fully functional payment gateway for course purchases.
- **AI Recommender**: Smart course suggestions based on user skills.
- **Role-Based Auth**: Secure login/register with Firebase.
- **Full-Stack Architecture**: Express backend for sensitive operations (Payments) and Vite frontend for speed.

## Quick Start (Bypass Permission Issues)

If you are facing `EPERM` or `Admin` folder errors on Windows, use this exact command in your terminal to start the server:

```powershell
$env:NVM_HOME="C:\Users\shrey\AppData\Local\nvm"; $env:NVM_SYMLINK="C:\nvm4w\nodejs"; .\node_modules\\.bin\tsx server.ts
```

Once running, visit **http://localhost:3000** in your browser.

## Setup Instructions
1. **Clone & Install**: `npm install`
2. **Environment Variables**:
   - Create a `.env` file based on `.env.example`.
   - Add your `GEMINI_API_KEY`.
   - Add your `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
3. **Run Development**: `npm run dev`
4. **Build for Production**: `npm run build`
5. **Start Production**: `npm run start`

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide React, Framer Motion (Motion).
- **Backend**: Node.js, Express, Razorpay SDK.
- **Database**: Firebase Firestore.
- **Auth**: Firebase Authentication.

## Key Paths
- `/`: Landing Page
- `/courses`: Marketplace
- `/login`: Secure Entry
- `/dashboard/student`: Student Hub
- `/dashboard/trainer`: Trainer Management
- `/dashboard/admin`: System Oversight
