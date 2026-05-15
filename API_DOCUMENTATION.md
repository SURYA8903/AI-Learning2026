# E-Learning Platform - API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## 💳 Payment Endpoints

### 1. Create Payment Order
**POST** `/payment/create-order`

**Protected:** Yes (Student)

**Request Body:**
```json
{
  "courseId": "65abc123def456789"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "order_1a2b3c4d5e6f",
    "amount": 299,
    "currency": "INR",
    "studentName": "John Doe",
    "studentEmail": "john@example.com",
    "courseName": "Python Programming",
    "paymentId": "65abc123def456789"
  }
}
```

---

### 2. Verify Payment
**POST** `/payment/verify`

**Protected:** Yes

**Request Body:**
```json
{
  "razorpay_payment_id": "pay_1234567890",
  "razorpay_order_id": "order_1a2b3c4d5e6f",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "paymentId": "65abc123def456789",
    "orderId": "order_1a2b3c4d5e6f",
    "status": "completed",
    "courseName": "Python Programming"
  }
}
```

---

### 3. Get Payment History
**GET** `/payment/history`

**Protected:** Yes (Student)

**Response:**
```json
{
  "success": true,
  "message": "Payment history retrieved",
  "data": [
    {
      "_id": "65abc123def456789",
      "studentId": "student_id_123",
      "courseId": "course_id_456",
      "amount": 299,
      "finalAmount": 299,
      "status": "completed",
      "paidAt": "2024-01-15T10:30:00Z",
      "courseName": "Python Programming"
    }
  ]
}
```

---

### 4. Request Refund
**POST** `/payment/refund`

**Protected:** Yes (Student)

**Request Body:**
```json
{
  "paymentId": "65abc123def456789",
  "reason": "Course not suitable for me"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "success": true,
    "refundId": "rfnd_1234567890",
    "refundAmount": 299,
    "message": "Refund processed successfully"
  }
}
```

---

### 5. Check Course Access
**GET** `/payment/check-access/:courseId`

**Protected:** Yes (Student)

**Response:**
```json
{
  "success": true,
  "data": {
    "hasAccess": true,
    "coursePrice": 299,
    "courseName": "Python Programming"
  }
}
```

---

### 6. Payment Webhook
**POST** `/payment/webhook`

**Protected:** No (Razorpay callback)

**Request Body:**
```json
{
  "event": "payment.authorized",
  "payload": {
    "payment": {
      "id": "pay_1234567890",
      "order_id": "order_1a2b3c4d5e6f",
      "amount": 29900,
      "status": "authorized"
    }
  }
}
```

---

## 🎓 Certificate Endpoints

### 1. Generate Certificate
**POST** `/certificate/generate/:studentId/:courseId`

**Protected:** Yes (Admin/Trainer)

**Response:**
```json
{
  "success": true,
  "message": "Certificate generated and sent successfully",
  "data": {
    "_id": "65abc123def456789",
    "courseId": "course_id_456",
    "certificateId": "CERT-TIMESTAMP-RANDOM",
    "googleDocId": "google_doc_123",
    "pdfUrl": "https://drive.google.com/...",
    "driveFileId": "drive_file_123",
    "issuedDate": "2024-01-15T10:30:00Z",
    "validUntil": "2025-01-15T10:30:00Z",
    "status": "issued"
  }
}
```

---

### 2. Get Student Certificates
**GET** `/certificate/my-certificates`

**Protected:** Yes (Student)

**Response:**
```json
{
  "success": true,
  "message": "Certificates retrieved",
  "data": [
    {
      "_id": "65abc123def456789",
      "courseId": {
        "_id": "course_id",
        "title": "Python Programming"
      },
      "certificateId": "CERT-TIMESTAMP-RANDOM",
      "pdfUrl": "https://drive.google.com/...",
      "issuedDate": "2024-01-15T10:30:00Z",
      "validUntil": "2025-01-15T10:30:00Z",
      "status": "issued"
    }
  ]
}
```

---

### 3. Verify Certificate
**GET** `/certificate/verify/:certificateId`

**Protected:** No (Public)

**Response (Valid):**
```json
{
  "success": true,
  "message": "Certificate verified",
  "data": {
    "isValid": true,
    "message": "Certificate is valid",
    "certificateId": "CERT-TIMESTAMP-RANDOM",
    "studentName": "John Doe",
    "courseName": "Python Programming",
    "issuedDate": "2024-01-15T10:30:00Z",
    "validUntil": "2025-01-15T10:30:00Z",
    "pdfUrl": "https://drive.google.com/..."
  }
}
```

**Response (Invalid):**
```json
{
  "success": false,
  "message": "Certificate has been revoked",
  "data": {
    "isValid": false,
    "message": "Certificate has been revoked",
    "revokedAt": "2024-01-20T15:45:00Z"
  }
}
```

---

### 4. Download Certificate
**GET** `/certificate/download/:certificateId`

**Protected:** Optional

**Response:** Redirects to PDF download URL

---

### 5. Revoke Certificate
**POST** `/certificate/revoke/:studentId/:certificateId`

**Protected:** Yes (Admin)

**Request Body:**
```json
{
  "reason": "Breach of integrity"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate revoked successfully",
  "data": {
    "certificateId": "CERT-TIMESTAMP-RANDOM",
    "status": "revoked",
    "revokedAt": "2024-01-20T15:45:00Z",
    "revocationReason": "Breach of integrity"
  }
}
```

---

### 6. Bulk Generate Certificates
**POST** `/certificate/bulk-generate`

**Protected:** Yes (Admin)

**Request Body:**
```json
{
  "enrollments": [
    {
      "studentId": "student_id_1",
      "courseId": "course_id_1"
    },
    {
      "studentId": "student_id_2",
      "courseId": "course_id_2"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk generation completed: 2 success, 0 failures",
  "data": {
    "total": 2,
    "success": 2,
    "failed": 0,
    "results": [
      {
        "studentId": "student_id_1",
        "courseId": "course_id_1",
        "success": true,
        "certificateId": "CERT-...",
        "pdfUrl": "https://drive.google.com/..."
      }
    ]
  }
}
```

---

### 7. Update Status & Auto-Generate Certificate
**PUT** `/certificate/update-status/:studentId/:courseId`

**Protected:** Yes (Admin/Trainer)

**Request Body:**
```json
{
  "status": "completed",
  "completionDate": "2024-01-15T10:30:00Z",
  "progress": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Status updated successfully and certificate generated",
  "data": {
    "student": {
      "id": "student_id",
      "name": "John Doe"
    },
    "enrollment": {
      "courseId": "course_id",
      "status": "certificate_issued",
      "progress": 100,
      "completionDate": "2024-01-15T10:30:00Z"
    },
    "certificate": {
      "certificateId": "CERT-...",
      "pdfUrl": "https://drive.google.com/..."
    }
  }
}
```

---

### 8. Certificate Statistics
**GET** `/certificate/stats`

**Protected:** Yes (Admin)

**Response:**
```json
{
  "success": true,
  "message": "Certificate stats retrieved",
  "data": {
    "totalCertificates": 150,
    "issuedCount": 145,
    "revokedCount": 5,
    "expiredCount": 0
  }
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid request parameters"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Token is invalid or expired"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "User role is not authorized to access this route"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "Error details"
}
```

---

## Rate Limiting

- **Default:** 100 requests per 15 minutes per IP
- Applies to all endpoints except health check

---

## CORS

Allowed origins configured in `.env`:
```
CORS_ORIGIN=http://localhost:3000
```

---

## Webhook Security

Webhook endpoints verify Razorpay signature:
```
X-Razorpay-Signature: <signature>
```

---

## Testing with Postman

1. **Set Base URL:** `{{BASE_URL}}/api`
2. **Add Authorization:** Select `Bearer Token` and add JWT token
3. **Test Endpoints:** Import provided Postman collection

---

## Common Error Codes

| Code | Message | Solution |
|------|---------|----------|
| `INVALID_SIGNATURE` | Payment signature verification failed | Verify Razorpay keys in .env |
| `CERT_NOT_FOUND` | Certificate does not exist | Check certificate ID |
| `STUDENT_NOT_FOUND` | Student record not found | Verify student ID |
| `COURSE_NOT_FOUND` | Course does not exist | Verify course ID |
| `INSUFFICIENT_PROGRESS` | Student hasn't completed course | Progress must be >= 80% |
| `ALREADY_PAID` | Student already purchased course | Check payment history |

---

## Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** on client side
3. **Validate input** before sending requests
4. **Handle errors gracefully** with user-friendly messages
5. **Log API calls** for debugging
6. **Use exponential backoff** for retries
7. **Cache responses** where appropriate
8. **Monitor rate limits** to avoid hitting limits

---

## Support

For API issues, contact: `support@elearning.com`
