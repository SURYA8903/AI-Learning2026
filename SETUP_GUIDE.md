# E-Learning Platform - Complete Setup Guide

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Environment Configuration](#environment-configuration)
5. [Google APIs Setup](#google-apis-setup)
6. [Database Setup](#database-setup)
7. [Payment Gateway Setup](#payment-gateway-setup)
8. [Running the Application](#running-the-application)
9. [Verification Steps](#verification-steps)
10. [Troubleshooting](#troubleshooting)

---

## 🖥️ System Requirements

- **Node.js:** v14.0.0 or higher
- **npm:** v6.0.0 or higher
- **MongoDB:** v4.4 or higher (local or cloud)
- **Git:** For version control
- **RAM:** Minimum 2GB
- **Disk Space:** Minimum 500MB

---

## 📦 Prerequisites

You'll need accounts/credentials for:

1. **MongoDB Atlas** - Cloud database
   - Visit: https://www.mongodb.com/cloud/atlas
   - Create free cluster

2. **Google Cloud Platform**
   - Service Account with Drive & Docs API enabled
   - OAuth 2.0 credentials for Google login

3. **Razorpay** - Payment gateway
   - Test account: https://razorpay.com/
   - Get API keys from dashboard

4. **Gmail** - Email sending
   - Gmail account with app password

---

## ⚙️ Installation Steps

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/elearning-platform.git
cd elearning-platform
```

### Step 2: Install Backend Dependencies
```bash
cd server
npm install
```

**Key packages installed:**
- express: Web framework
- mongoose: MongoDB ORM
- razorpay: Payment gateway
- googleapis: Google APIs
- nodemailer: Email service
- jsonwebtoken: Authentication
- winston: Logging

### Step 3: Install Frontend Dependencies
```bash
cd ../client
npm install
```

**Key packages installed:**
- react: UI framework
- axios: HTTP client
- react-router-dom: Navigation
- tailwindcss: Styling

### Step 4: Create .env File
```bash
cd server
cp .env.example .env
```

---

## 🔧 Environment Configuration

### Edit `.server/.env` file with your credentials:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
LOG_LEVEL=debug

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/elearning
DB_NAME=elearning

# JWT
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRY=7d

# Google APIs
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-email@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY=path/to/service-account-key.json
GOOGLE_TEMPLATE_DOC_ID=your_template_id
GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM_NAME=E-Learning Platform

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key

# Frontend
FRONTEND_URL=http://localhost:3000
CLIENT_REDIRECT_URL=http://localhost:3000/dashboard
```

### Edit `client/.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

---

## 🔐 Google APIs Setup

### Step 1: Create Google Cloud Project
1. Go to: https://console.cloud.google.com
2. Create a new project
3. Enable APIs:
   - Google Docs API
   - Google Drive API
   - Gmail API (optional)

### Step 2: Create Service Account
1. Go to: Service Accounts
2. Create Service Account
3. Generate JSON key
4. Save to: `server/config/service-account-key.json`

```bash
chmod 600 server/config/service-account-key.json
```

### Step 3: Create Certificate Template
1. Go to Google Drive
2. Create new Google Doc
3. Add placeholders:
   ```
   {{NAME}}
   {{COURSE}}
   {{DATE}}
   {{CERTIFICATE_ID}}
   ```
4. Copy Document ID from URL
5. Add to `.env` as `GOOGLE_TEMPLATE_DOC_ID`

### Step 4: Create Drive Folder
1. Create folder in Google Drive for certificates
2. Share with service account email
3. Copy Folder ID
4. Add to `.env` as `GOOGLE_DRIVE_FOLDER_ID`

---

## 🗄️ Database Setup

### Option A: MongoDB Atlas (Recommended)

1. Visit: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Get connection string
5. Replace in `.env`:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/elearning
   ```

### Option B: Local MongoDB

1. Install MongoDB: https://docs.mongodb.com/manual/installation/
2. Start MongoDB:
   ```bash
   mongod
   ```
3. Update `.env`:
   ```
   MONGO_URI=mongodb://localhost:27017/elearning
   ```

### Create Indexes (Optional)
```bash
node server/scripts/createIndexes.js
```

---

## 💳 Payment Gateway Setup

### Razorpay Configuration

1. Visit: https://razorpay.com/
2. Sign up and create account
3. Get API keys:
   - Key ID (public key)
   - Secret (private key)
4. Add to `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=your_secret
   ```

### Test Credentials

For testing use Razorpay test mode:
```
Key ID: rzp_test_xxxxx
Secret: test_secret_xxxxx
```

Test card numbers:
```
Visa: 4111 1111 1111 1111
MasterCard: 5555 5555 5555 4444
Expiry: Any future date
CVV: Any 3 digits
```

---

## 📧 Email Configuration

### Gmail Setup

1. Enable 2FA on Google Account
2. Generate App Password:
   - Visit: https://myaccount.google.com/apppasswords
   - Select Mail and Windows
   - Copy password
3. Add to `.env`:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

---

## 🚀 Running the Application

### Terminal 1: Backend
```bash
cd server
npm run dev
```

Expected output:
```
Server running in development mode on port 5000
MongoDB Connected: cluster.mongodb.net
Google APIs initialized successfully
Email service initialized successfully
```

### Terminal 2: Frontend
```bash
cd client
npm start
```

Expected output:
```
webpack compiled successfully
Compiled app is running at: http://localhost:3000
```

---

## ✅ Verification Steps

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test Payment Order
```bash
curl -X POST http://localhost:5000/api/payment/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseId": "course_id"}'
```

### Test Certificate Generation
```bash
curl -X POST http://localhost:5000/api/certificate/generate/student_id/course_id \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Frontend Verification
- Open http://localhost:3000
- Login with test account
- Try enrolling in a course
- Verify payment process
- Check certificate generation

---

## 🔍 Troubleshooting

### 1. MongoDB Connection Failed

**Error:**
```
Error connecting to MongoDB: connect ECONNREFUSED
```

**Solution:**
- Check MongoDB is running: `mongod`
- Verify connection string in `.env`
- Check firewall settings
- Verify credentials

### 2. Google APIs Not Initialized

**Error:**
```
Failed to initialize Google APIs
```

**Solution:**
- Check service account JSON exists
- Verify file path in `.env`
- Check API is enabled in Google Cloud
- Verify service account has Drive API access

### 3. Email Not Sending

**Error:**
```
Failed to initialize email service
```

**Solution:**
- Verify Gmail credentials in `.env`
- Check if 2FA enabled and app password generated
- Check email provider settings
- Verify firewall allows SMTP

### 4. Razorpay Payment Failing

**Error:**
```
Payment verification failed
```

**Solution:**
- Verify API keys in `.env`
- Check Razorpay account is active
- Verify webhook secret
- Check CORS settings
- Use test credentials in development

### 5. Certificate Generation Fails

**Error:**
```
Failed to copy certificate template
```

**Solution:**
- Verify template document ID exists
- Check service account has access
- Verify template has placeholders
- Check Drive folder ID is correct
- Verify Drive folder permissions

### 6. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### 7. CORS Issues

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Update `CORS_ORIGIN` in `.env`
- Check frontend URL matches
- Clear browser cache
- Restart server

### 8. JWT Token Issues

**Error:**
```
Token is invalid or expired
```

**Solution:**
- Verify token format (Bearer token)
- Check JWT_SECRET in `.env`
- Verify token not expired
- Check token claims

---

## 📊 Database Schema

### Students Collection
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  phoneNumber: String,
  enrolledCourses: [{
    courseId: ObjectId,
    status: String,
    progress: Number
  }],
  payments: [{...}],
  certificates: [{...}]
}
```

### Courses Collection
```javascript
{
  title: String,
  description: String,
  pricing: {
    amount: Number,
    currency: String,
    isFree: Boolean
  },
  certificate: {
    isEnabled: Boolean,
    template: {googleDocId: String}
  }
}
```

### Payments Collection
```javascript
{
  studentId: ObjectId,
  courseId: ObjectId,
  orderId: String,
  paymentId: String,
  amount: Number,
  status: String,
  paidAt: Date
}
```

---

## 📚 Additional Resources

- **Node.js Docs:** https://nodejs.org/docs/
- **MongoDB Docs:** https://docs.mongodb.com/
- **React Docs:** https://react.dev/
- **Razorpay Docs:** https://razorpay.com/docs/
- **Google APIs:** https://developers.google.com/

---

## 🆘 Support & Contact

- **Email:** support@elearning.com
- **Documentation:** See API_DOCUMENTATION.md
- **Issues:** Check GitHub issues
- **Community:** Join our Discord server

---

## 📄 License

MIT License - See LICENSE file

---

## ✨ Next Steps

1. Configure all environment variables
2. Set up Google APIs and service account
3. Create Razorpay account and get keys
4. Set up Gmail for email notifications
5. Create certificate template in Google Docs
6. Run the application
7. Test payment flow
8. Deploy to production

---

**Happy Learning! 🚀**
