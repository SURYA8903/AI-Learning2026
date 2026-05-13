# 🎓 E-Learning Platform with Automatic Certificate Generation & Payment Integration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v4.4%2B-green)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-v18.0%2B-blue)](https://react.dev/)

## 📌 Project Overview

A **production-ready, enterprise-level E-Learning Platform** with:

✅ **Automatic Certificate Generation & Distribution**
✅ **Secure Payment Integration (Razorpay)**
✅ **Payment-Gated Course Enrollment**
✅ **Admin Dashboard for Student Management**
✅ **Google Docs/Drive Integration**
✅ **Automated Email Notifications**
✅ **Role-Based Access Control**
✅ **Comprehensive API Documentation**

---

## 🎯 Key Features

### 🔐 Security
- JWT-based authentication
- Bcrypt password hashing
- CORS protection
- Rate limiting
- Payment signature verification
- Secure Google OAuth2 integration

### 💳 Payment System
- Razorpay integration
- Multiple payment methods (Card, UPI, Netbanking)
- Automatic enrollment after payment
- Refund processing with validation
- Payment history & receipts
- Revenue analytics

### 📜 Certificate Management
- Automatic certificate generation on course completion
- Google Docs template-based design
- PDF export and storage in Google Drive
- Unique certificate IDs for verification
- Certificate validity tracking
- Public verification endpoint
- Bulk certificate generation
- Certificate revocation support

### 🎓 Course Management
- Free and paid courses
- Dynamic pricing with discounts
- Course progress tracking
- Enrollment status management
- Course completion criteria

### 📧 Email Notifications
- Welcome emails
- Payment receipts
- Certificate issuance notifications
- Progress reminders
- Account verification emails

### 📊 Admin Dashboard
- Student management interface
- Enrollment status updates
- Certificate generation controls
- Payment tracking
- Analytics & statistics

---

## 🏗️ Architecture

### Backend Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Payment:** Razorpay API
- **Email:** Nodemailer + Gmail
- **Google APIs:** Docs, Drive, Gmail
- **Logging:** Winston
- **Validation:** Joi

### Frontend Stack
- **Framework:** React 18
- **HTTP Client:** Axios
- **Styling:** CSS3 + Responsive Design
- **Payment:** Razorpay Checkout
- **State Management:** React Hooks

### Database Schema
- **Students:** User profiles, enrollments, certificates, payments
- **Courses:** Course details, pricing, certificate templates
- **Payments:** Transaction records, refunds, receipts
- **Admin:** User management, course management

---

## 📁 Project Structure

```
elearning-platform/
├── server/
│   ├── models/
│   │   ├── Student.js          # Student schema with payment & certificate fields
│   │   ├── Course.js            # Course schema with pricing & certificate config
│   │   └── Payment.js           # Payment transaction schema
│   ├── controllers/
│   │   ├── paymentController.js # Payment order, verification, refunds
│   │   └── certificateController.js # Certificate generation & management
│   ├── services/
│   │   ├── googleApiService.js  # Google Docs/Drive API wrapper
│   │   ├── certificateService.js # Certificate generation logic
│   │   ├── paymentService.js    # Razorpay payment processing
│   │   ├── emailService.js      # Email notifications
│   │   └── logger.js            # Winston logging configuration
│   ├── middlewares/
│   │   └── auth.js              # JWT authentication & authorization
│   ├── routes/
│   │   └── transactionRoutes.js # Payment & Certificate routes
│   ├── server.js                # Express app configuration
│   ├── .env.example             # Environment variables template
│   └── package.json             # Node.js dependencies
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StudentManagement.jsx # Admin student dashboard
│   │   │   ├── CourseEnrollment.jsx  # Payment & enrollment component
│   │   │   ├── MyCertificates.jsx    # Certificate display & sharing
│   │   │   └── *.css                 # Component styles
│   │   └── App.jsx              # Main React app
│   ├── public/
│   └── package.json             # React dependencies
├── API_DOCUMENTATION.md         # Complete API reference
├── SETUP_GUIDE.md               # Installation & configuration
├── README.md                    # This file
└── .env.example                 # Environment template

```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- MongoDB Atlas account
- Razorpay account
- Google Cloud account
- Gmail account

### 1. Installation
```bash
# Clone repository
git clone <repository-url>
cd elearning-platform

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Configuration
```bash
# Create .env file
cd server
cp .env.example .env
# Edit .env with your credentials
```

### 3. Run Application
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm start
```

### 4. Access Application
- **Frontend:** http://localhost:3000
- **API:** http://localhost:5000/api
- **API Health:** http://localhost:5000/api/health

---

## 💳 Payment Flow

```
1. Student selects course
   ↓
2. Payment order created (Razorpay)
   ↓
3. Razorpay checkout modal opens
   ↓
4. Payment completed
   ↓
5. Signature verification
   ↓
6. Student enrolled & email receipt sent
   ↓
7. Access to course materials granted
   ↓
8. On course completion → Certificate auto-generated
   ↓
9. Certificate email sent + stored in Drive
```

---

## 🎓 Certificate Generation Flow

```
1. Admin marks student as "Completed"
   ↓
2. Backend validates completion criteria
   ↓
3. Copy certificate template from Google Docs
   ↓
4. Replace placeholders (Name, Course, Date, ID)
   ↓
5. Export document as PDF
   ↓
6. Upload PDF to Google Drive
   ↓
7. Make PDF shareable (public link)
   ↓
8. Save certificate URL in database
   ↓
9. Send certificate email to student
   ↓
10. Display download option in dashboard
```

---

## 🔒 Security Features

### Authentication
- JWT tokens with expiration
- Refresh token mechanism
- Secure password hashing (bcrypt)
- Account lockout after failed attempts

### Authorization
- Role-based access control (Student, Trainer, Admin)
- Endpoint-level permission checking
- Student isolation (can only access own data)

### Payment Security
- Razorpay signature verification
- Amount validation
- Duplicate payment prevention
- Secure webhook handling

### Data Protection
- MongoDB injection prevention (Mongoose)
- CORS protection
- Rate limiting
- Request validation with Joi/Express-validator

---

## 📚 API Endpoints

### Payment Endpoints
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/payment/create-order` | ✅ Student | Create payment order |
| POST | `/payment/verify` | ✅ Student | Verify payment signature |
| GET | `/payment/history` | ✅ Student | Get payment history |
| POST | `/payment/refund` | ✅ Student | Request refund |
| GET | `/payment/check-access/:courseId` | ✅ Student | Check course access |
| POST | `/payment/webhook` | ❌ Public | Razorpay webhook |

### Certificate Endpoints
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/certificate/generate/:studentId/:courseId` | ✅ Admin | Generate certificate |
| GET | `/certificate/my-certificates` | ✅ Student | Get student certificates |
| GET | `/certificate/verify/:certificateId` | ❌ Public | Verify certificate |
| GET | `/certificate/download/:certificateId` | ✅ Public | Download certificate |
| POST | `/certificate/revoke/:studentId/:certificateId` | ✅ Admin | Revoke certificate |
| POST | `/certificate/bulk-generate` | ✅ Admin | Bulk generate |
| PUT | `/certificate/update-status/:studentId/:courseId` | ✅ Admin | Update & auto-generate |
| GET | `/certificate/stats` | ✅ Admin | Get statistics |

---

## 📋 Database Collections

### Students
```javascript
{
  firstName, lastName, email, phoneNumber,
  enrolledCourses: [{courseId, status, progress, completionDate}],
  payments: [{courseId, orderId, paymentId, amount, status, paidAt}],
  certificates: [{courseId, certificateId, pdfUrl, driveFileId, issuedDate}]
}
```

### Courses
```javascript
{
  title, description, category, level,
  pricing: {amount, isFree, discountPercentage, refundPolicy},
  certificate: {isEnabled, template, criteriaToIssue},
  stats: {totalEnrollments, totalCompletions, certificatesIssued}
}
```

### Payments
```javascript
{
  studentId, courseId, orderId, paymentId,
  amount, finalAmount, currency, status,
  paymentGateway, paymentMethod, paidAt,
  refund: {isRefunded, refundAmount, refundId}
}
```

---

## 🧪 Testing

### Test Payment (Razorpay)
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits

### Test Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Create order (with token)
curl -X POST http://localhost:5000/api/payment/create-order \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseId": "course_id"}'

# Verify certificate
curl http://localhost:5000/api/certificate/verify/CERT-ID
```

---

## 📊 Admin Dashboard Features

- **Student List:** Search, filter by course/status
- **Enrollment Management:** Update student status
- **Certificate Generation:** Single or bulk generation
- **Payment Tracking:** View transaction history
- **Analytics:** Statistics & reports
- **Email Notifications:** Track delivery status

---

## 🛠️ Environment Variables

Required environment variables are documented in `.env.example`:

```
NODE_ENV, PORT, MONGO_URI, JWT_SECRET
GOOGLE_CLIENT_ID, GOOGLE_SERVICE_ACCOUNT_KEY
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
EMAIL_USER, EMAIL_PASS
FRONTEND_URL, CORS_ORIGIN
```

See `SETUP_GUIDE.md` for detailed configuration instructions.

---

## 📖 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Installation & configuration
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API reference & examples

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

Created as a production-ready E-Learning Platform with enterprise-level features.

---

## 🙏 Acknowledgments

- **Razorpay** for payment processing
- **Google Cloud** for document & storage services
- **MongoDB** for database services
- **Node.js Community** for amazing libraries

---

## 📞 Support

For support, email: support@elearning.com

---

## 🗺️ Roadmap

- [ ] Social login integration (Facebook, GitHub)
- [ ] Video streaming integration
- [ ] Live class support
- [ ] Student peer review system
- [ ] Mobile app (React Native)
- [ ] Blockchain certificate verification
- [ ] AI-powered course recommendations
- [ ] Internationalization (i18n)

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Happy Learning! 🚀**

Last Updated: January 2024
