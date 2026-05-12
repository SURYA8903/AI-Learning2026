# OTP Email Verification Setup Guide

## Overview
Your application now has **OTP (One-Time Password) verification** integrated! Users will receive a 6-digit code via email when they login or register, and must verify it before accessing the dashboard.

## Configuration Steps

### 1. Get Your 16-Digit Gmail App Password

Since Gmail doesn't allow regular passwords for third-party apps, you need to generate an **App Password**:

#### Steps to Generate App Password:
1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. You may need to login and verify your identity
3. Select **Mail** from the "Select app" dropdown
4. Select **Windows Computer** (or your platform) from "Select device" dropdown
5. Click **Generate**
6. Google will show you a 16-digit password (example: `abcd efgh ijkl mnop`)
7. **Copy this password** (remove the spaces)

### 2. Update Your .env File

Edit the `.env` file in the root directory:

```env
# Test Gmail Account
GMAIL_USER=surya30.04.05@gmail.com
GMAIL_PASSWORD=YOUR_16_DIGIT_PASSWORD_HERE
```

Replace `YOUR_16_DIGIT_PASSWORD_HERE` with the 16-digit app password you generated (without spaces).

**Example:**
```env
GMAIL_USER=surya30.04.05@gmail.com
GMAIL_PASSWORD=abcdefghijklmnop
```

### 3. Install Dependencies

Run this command to install the new `nodemailer` package:

```bash
npm install
```

Or if you're using a different package manager:
```bash
yarn install
pnpm install
```

### 4. Restart the Server

Stop the current server and start it again:

```bash
npm run dev
# or
npm run start
```

## How OTP Verification Works

### Login/Register Flow:
1. User enters email and password
2. Backend validates credentials
3. Server generates a 6-digit OTP and sends it via email
4. User sees an **OTP verification modal**
5. User enters the 6-digit code they received
6. OTP is verified and user is logged in

### Key Features:
- ⏱️ **10-minute expiry** - OTP codes expire after 10 minutes
- 🔒 **5 attempt limit** - Users get 5 attempts before code expires
- 🔄 **Resend option** - Users can request a new OTP if they don't receive it
- 📧 **Professional emails** - Beautiful HTML formatted OTP emails
- 🌐 **Email branding** - Emails show "Adz4Needz" branding

## Testing

### Test Credentials:
- **Email:** surya30.04.05@gmail.com (or any email of your choice)
- **App Password:** Your 16-digit password from step 1

### Test Flow:
1. Go to your application login page
2. Enter test email and password
3. You'll see "OTP sent successfully" message
4. Check your email for the 6-digit code
5. Enter the code in the OTP verification modal
6. You'll be redirected to the dashboard

**Note:** First time you test, make sure your email is configured correctly in the `.env` file. If you don't receive the OTP:
- Check your `.env` file has correct GMAIL_PASSWORD (16 digits, no spaces)
- Check Gmail's "App passwords" page to confirm the password was generated
- Look in Gmail spam folder
- Restart the server after changing `.env` file

## Changing Email Account Later

To use a different email account for OTP:

1. Generate a new 16-digit App Password for the new Gmail account
2. Update `.env` file:
   ```env
   GMAIL_USER=your-new-email@gmail.com
   GMAIL_PASSWORD=your-new-16-digit-password
   ```
3. Restart the server

## OTP Endpoints (For Developers)

### Send OTP
```
POST /api/otp/send
Body: { email: "user@example.com", name: "John" }
Response: { success: true, message: "OTP sent successfully", expiresIn: 600000 }
```

### Verify OTP
```
POST /api/otp/verify
Body: { email: "user@example.com", otp: "123456" }
Response: { success: true, message: "OTP verified successfully!", verified: true }
```

### Check Verification Status
```
POST /api/otp/check
Body: { email: "user@example.com" }
Response: { verified: true/false }
```

## Troubleshooting

### OTP not being sent:
1. Verify GMAIL_USER and GMAIL_PASSWORD in .env
2. Ensure you're using 16-digit **App Password**, not regular password
3. Check Gmail's "Less secure apps" settings (if still enabled)
4. Restart the server after changing .env

### OTP email going to spam:
- Check spam folder
- Add noreply@adz4needz.com to contacts
- Gmail might initially mark transactional emails as spam

### User keeps getting "Invalid OTP":
- Ensure user is entering exactly 6 digits
- Check they're not including spaces
- Verify OTP hasn't expired (10-minute limit)
- Try "Resend" to get a new OTP

## Security Notes

✅ **What's Secure:**
- 6-digit OTP is temporary and expires after 10 minutes
- Codes are stored server-side, not sent to client
- Failed attempts are tracked (max 5)
- Email verification adds a second factor

⚠️ **In Production:**
- Use a database (like Redis) for OTP storage instead of memory
- Implement rate limiting on OTP send endpoint
- Use a dedicated email service (SendGrid, AWS SES) for reliability
- Add CAPTCHA to prevent OTP brute force

## Files Modified

- **Backend:** `server.ts` - Added OTP endpoints
- **Frontend:** `public/index.html` - Added OTP modal and verification logic
- **Config:** `.env` - Added Gmail credentials
- **Dependencies:** `package.json` - Added nodemailer
- **Services:** `src/services/otp.ts` - OTP utility functions

---

**You're all set! 🎉 Your OTP email verification is now active.**

For questions or issues, check the browser console and server logs for error messages.
