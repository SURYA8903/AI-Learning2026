const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication Middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: '❌ Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: '❌ Invalid or expired token.' });
    
    db.get('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id], (err, user) => {
      if (err || !user) return res.status(404).json({ error: '❌ User not found.' });
      req.user = user;
      next();
    });
  });
};

// ============= OTP CONFIGURATION =============
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
const OTP_LENGTH = 6;
const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
});
const PAYMENT_GATEWAY = Object.freeze({
  RAZORPAY: 'razorpay',
  FREE: 'free'
});
const PAYMENT_CURRENCY = process.env.RAZORPAY_CURRENCY || 'INR';

// Temporary registration data store
const pendingRegistrations = {};

// OTP store
const otpStore = {};

// Generate OTP
function generateOTP(length = OTP_LENGTH) {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1))
  ).toString();
}

// Send OTP via email
async function sendOTPEmail(email, otp, name) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'surya30.04.05@gmail.com',
        pass: process.env.GMAIL_PASSWORD || 'twwgmjwgvadwazxk',
      },
    });

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 20px auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .content { text-align: center; }
            .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px; margin: 30px 0; font-family: monospace; }
            .message { color: #666; line-height: 1.6; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center; }
            .warning { color: #dc2626; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">SkillsUp</div>
              <p style="color: #666; margin-top: 10px;">AI Learning Platform</p>
            </div>
            <div class="content">
              <h2>OTP Verification</h2>
              <p class="message">Hello ${name || 'User'},</p>
              <p class="message">Your One-Time Password (OTP) for account verification is:</p>
              <div class="otp-code">${otp}</div>
              <p class="message" style="color: #999; font-size: 14px;">This code will expire in 10 minutes.</p>
              <p class="warning">⚠️ Never share this code with anyone</p>
            </div>
            <div class="footer">
              <p>If you didn't request this code, please ignore this email.</p>
              <p>&copy; 2026 SkillsUp. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER || 'surya30.04.05@gmail.com',
      to: email,
      subject: 'Your OTP for SkillsUp Account Verification',
      html: htmlTemplate,
    });

    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

// Verify OTP
function verifyOTP(identifier, inputOTP) {
  const otpData = otpStore[identifier];

  if (!otpData) {
    return { success: false, message: 'No OTP found. Request a new OTP.' };
  }

  if (Date.now() - otpData.timestamp > OTP_EXPIRY_TIME) {
    delete otpStore[identifier];
    return { success: false, message: 'OTP has expired. Request a new OTP.' };
  }

  if (otpData.attempts >= 5) {
    delete otpStore[identifier];
    return { success: false, message: 'Too many failed attempts. Request a new OTP.' };
  }

  if (otpData.code !== inputOTP) {
    otpData.attempts++;
    return { 
      success: false, 
      message: `Invalid OTP. ${5 - otpData.attempts} attempts remaining.` 
    };
  }

  otpData.verified = true;
  return { success: true, message: 'OTP verified successfully!' };
}

// Clear OTP
function clearOTP(identifier) {
  delete otpStore[identifier];
}

// Password Validation Function
function validatePasswordStrength(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special symbol (!@#$%^&* etc.)');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

process.on('uncaughtException', (err) => {
  if (err && err.code === 'SQLITE_CORRUPT') {
    console.error('Database corruption detected:', err.message);
    return;
  }
  throw err;
});

const runQuery = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) reject(err);
    else resolve(this);
  });
});


const getQuery = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

const allQuery = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

let razorpayClient = null;

function getRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  return razorpayClient;
}

function normalizeCurrencyAmount(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

function buildLocalOrderReference(userId, courseId) {
  return `skillsup_${userId}_${courseId}_${Date.now()}`;
}

async function getCourseRecord(courseId) {
  return getQuery(
    'SELECT id, title, description, price, duration, level, instructor FROM courses WHERE id = ?',
    [courseId]
  );
}

async function getLatestPaymentRecord(userId, courseId) {
  return getQuery(
    `SELECT *
     FROM payments
     WHERE user_id = ? AND course_id = ?
     ORDER BY id DESC
     LIMIT 1`,
    [userId, courseId]
  );
}

async function getSuccessfulPaymentRecord(userId, courseId) {
  return getQuery(
    `SELECT *
     FROM payments
     WHERE user_id = ? AND course_id = ? AND payment_status = ?
     ORDER BY COALESCE(paid_at, created_at) DESC, id DESC
     LIMIT 1`,
    [userId, courseId, PAYMENT_STATUS.SUCCESS]
  );
}

async function getEnrollmentRecord(userId, courseId) {
  return getQuery(
    `SELECT *
     FROM enrollments
     WHERE user_id = ? AND course_id = ?
     ORDER BY id DESC
     LIMIT 1`,
    [userId, courseId]
  );
}

async function createEnrollmentRecord(userId, courseId) {
  const existingEnrollment = await getEnrollmentRecord(userId, courseId);
  if (existingEnrollment) {
    return existingEnrollment;
  }

  const insertResult = await runQuery(
    'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
    [userId, courseId]
  );

  return getQuery('SELECT * FROM enrollments WHERE id = ?', [insertResult.lastID]);
}

async function getValidatedCourseAccess(userId, courseId) {
  const course = await getCourseRecord(courseId);
  if (!course) {
    return { course: null, enrollment: null, payment: null, hasAccess: false };
  }

  const enrollment = await getEnrollmentRecord(userId, courseId);
  if (!enrollment) {
    return { course, enrollment: null, payment: null, hasAccess: false };
  }

  if (normalizeCurrencyAmount(course.price) <= 0) {
    const payment = await getLatestPaymentRecord(userId, courseId);
    return {
      course,
      enrollment,
      payment,
      hasAccess: true
    };
  }

  const payment = await getSuccessfulPaymentRecord(userId, courseId);
  return {
    course,
    enrollment: payment ? enrollment : null,
    payment,
    hasAccess: Boolean(payment)
  };
}

async function markPaymentRecordStatus(paymentRecordId, status, reason = null) {
  await runQuery(
    `UPDATE payments
     SET payment_status = ?, failure_reason = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND payment_status = ?`,
    [status, reason, paymentRecordId, PAYMENT_STATUS.PENDING]
  );
}

async function finalizeEnrollmentPayment(paymentRecordId, paymentMeta) {
  const paymentRecord = await getQuery('SELECT * FROM payments WHERE id = ?', [paymentRecordId]);
  if (!paymentRecord) {
    throw new Error('Payment record not found.');
  }

  await runQuery('BEGIN TRANSACTION');

  try {
    await runQuery(
      `UPDATE payments
       SET payment_status = ?, gateway_payment_id = ?, gateway_signature = ?, failure_reason = NULL,
           paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        PAYMENT_STATUS.SUCCESS,
        paymentMeta.gatewayPaymentId,
        paymentMeta.gatewaySignature,
        paymentRecordId
      ]
    );

    await createEnrollmentRecord(paymentRecord.user_id, paymentRecord.course_id);
    await runQuery('COMMIT');

    return getEnrollmentRecord(paymentRecord.user_id, paymentRecord.course_id);
  } catch (error) {
    await runQuery('ROLLBACK');
    throw error;
  }
}

const COURSE_SELECT_SQL = `
  SELECT
    c.id,
    c.title,
    c.description,
    c.price,
    c.duration,
    c.level,
    c.instructor,
    c.created_at,
    COUNT(DISTINCT e.user_id) AS students,
    ROUND(COALESCE(AVG(e.progress), 0), 1) AS average_progress,
    COALESCE(c.price * COUNT(DISTINCT e.user_id), 0) AS revenue
  FROM courses c
  LEFT JOIN enrollments e ON e.course_id = c.id
`;

const PRAPTI_KEYWORD_GROUPS = [
  {
    category: 'Frontend Development',
    icon: '🧩',
    keywords: ['html', 'css', 'javascript', 'js', 'frontend', 'web', 'ui', 'ux', 'design', 'react'],
    topics: ['HTML', 'CSS', 'JavaScript', 'Responsive UI']
  },
  {
    category: 'React Development',
    icon: '⚛️',
    keywords: ['react', 'jsx', 'frontend', 'component', 'spa', 'hooks'],
    topics: ['React', 'Components', 'Hooks', 'State Management']
  },
  {
    category: 'Python And Data',
    icon: '🐍',
    keywords: ['python', 'data', 'analysis', 'analytics', 'automation', 'science'],
    topics: ['Python', 'Data Analysis', 'Automation', 'Problem Solving']
  },
  {
    category: 'Programming Foundations',
    icon: '📘',
    keywords: ['beginner', 'basics', 'fundamentals', 'essentials', 'starter', 'intro'],
    topics: ['Logic', 'Syntax', 'Projects', 'Practice']
  }
];

function normalizeKeywordList(value) {
  return String(value || '')
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function inferCourseMetadata(course) {
  const searchableText = `${course.title || ''} ${course.description || ''} ${course.level || ''}`.toLowerCase();
  const matchedGroup = PRAPTI_KEYWORD_GROUPS
    .map((group) => ({
      group,
      matches: group.keywords.filter((keyword) => searchableText.includes(keyword)).length
    }))
    .sort((left, right) => right.matches - left.matches)[0];

  const group = matchedGroup && matchedGroup.matches > 0
    ? matchedGroup.group
    : PRAPTI_KEYWORD_GROUPS[3];

  return {
    category: group.category,
    icon: group.icon,
    topics: group.topics
  };
}

function scoreCourseAgainstProfile(course, profileTerms) {
  const tokens = normalizeKeywordList(`${course.title || ''} ${course.description || ''} ${course.level || ''}`);
  const uniqueTokens = new Set(tokens);
  let score = 0;

  profileTerms.forEach((term) => {
    if (uniqueTokens.has(term)) {
      score += 5;
      return;
    }

    const partialMatch = Array.from(uniqueTokens).some((token) => token.includes(term) || term.includes(token));
    if (partialMatch) {
      score += 2;
    }
  });

  if ((course.level || '').toLowerCase() === 'beginner') {
    score += 1;
  }

  score += Number(course.students || 0) * 0.02;
  return score;
}

function buildPraptiRecommendations(courses, profileTerms) {
  return courses
    .map((course) => {
      const metadata = inferCourseMetadata(course);
      const score = scoreCourseAgainstProfile(course, profileTerms);

      return {
        id: course.id,
        title: course.title,
        desc: course.description,
        duration: course.duration,
        level: course.level,
        instructor: course.instructor,
        price: course.price,
        students: course.students || 0,
        rating: Number((4.3 + Math.min(Number(course.students || 0) * 0.01, 0.6)).toFixed(1)),
        category: metadata.category,
        icon: metadata.icon,
        topics: metadata.topics,
        praptiScore: score,
        reason: profileTerms.length
          ? `Matched to ${profileTerms.slice(0, 3).join(', ')}`
          : 'Recommended as a strong next learning step'
      };
    })
    .sort((left, right) => right.praptiScore - left.praptiScore || Number(right.students || 0) - Number(left.students || 0));
}

process.on('unhandledRejection', (err) => {
  if (err && err.code === 'SQLITE_CORRUPT') {
    console.error('Database corruption detected:', err.message);
    return;
  }
  throw err;
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database Setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.log(err);
  else console.log('✅ Database connected!');
});

const ensureUsersTablePhoneColumn = () => {
  db.all('PRAGMA table_info(users)', (err, columns) => {
    if (err) {
      console.error('Failed to inspect users table schema:', err.message);
      return;
    }

    const hasPhoneColumn = (columns || []).some((column) => column.name === 'phone');
    if (hasPhoneColumn) {
      return;
    }

    db.run('ALTER TABLE users ADD COLUMN phone TEXT', (alterErr) => {
      if (alterErr) {
        console.error('Failed to add phone column to users table:', alterErr.message);
        return;
      }

      console.log('Added missing phone column to users table.');
    });
  });
};

const initializeDatabase = () => {
  db.serialize(() => {
    console.log('--- Initializing Database ---');

    // Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'trainer', 'admin')),
        skills TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => { if (err) console.error('Users table error:', err.message); });

    ensureUsersTablePhoneColumn();

    // Courses Table
    db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        price REAL DEFAULT 0,
        duration TEXT,
        level TEXT,
        instructor TEXT,
        rating REAL,
        students INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Enrollments Table
    db.run(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        progress INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        completion_status TEXT DEFAULT 'In Progress' CHECK(completion_status IN ('In Progress', 'Completed', 'Not Completed', 'In Review')),
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(course_id) REFERENCES courses(id)
      )
    `);

    // Ensure completion_status column exists for existing databases
    db.all("PRAGMA table_info(enrollments)", (err, columns) => {
      if (err || !columns) return;
      const hasColumn = columns.some(c => c.name === 'completion_status');
      if (!hasColumn) {
        db.run("ALTER TABLE enrollments ADD COLUMN completion_status TEXT DEFAULT 'In Progress'");
      }
    });

    // Payments Table
    db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        order_id TEXT UNIQUE,
        payment_gateway TEXT NOT NULL DEFAULT 'razorpay',
        payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending', 'success', 'failed', 'cancelled')),
        amount REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'INR',
        gateway_payment_id TEXT,
        gateway_signature TEXT,
        failure_reason TEXT,
        paid_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(course_id) REFERENCES courses(id)
      )
    `);

    // Trainer Schedule
    db.run(`
      CREATE TABLE IF NOT EXISTS trainer_schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trainer_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        day_label TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(trainer_id) REFERENCES users(id)
      )
    `);

    // Trainer Tasks
    db.run(`
      CREATE TABLE IF NOT EXISTS trainer_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trainer_id INTEGER NOT NULL,
        task TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(trainer_id) REFERENCES users(id)
      )
    `);

    // Assignments Table
    db.run(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(course_id) REFERENCES courses(id)
      )
    `);

    // Submissions Table
    db.run(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT,
        grade TEXT,
        status TEXT DEFAULT 'submitted',
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(assignment_id) REFERENCES assignments(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // Classes Table
    db.run(`
      CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        video_url TEXT,
        live_link TEXT,
        scheduled_at DATETIME,
        duration TEXT,
        FOREIGN KEY(course_id) REFERENCES courses(id)
      )
    `);

    // Certificates Table
    db.run(`
      CREATE TABLE IF NOT EXISTS certificates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        pdf_url TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(course_id) REFERENCES courses(id)
      )
    `);

    // Password Reset Tokens Table
    db.run(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(email) REFERENCES users(email)
      )
    `);

    // Sample Courses
    const sampleCourses = [
      { title: 'JavaScript Essentials', description: 'Learn JavaScript fundamentals', price: 599, duration: '4 weeks', level: 'Beginner', instructor: 'Mr. Kumar' },
      { title: 'React.js Mastery', description: 'Complete React.js guide', price: 999, duration: '6 weeks', level: 'Intermediate', instructor: 'Jane Doe' }
    ];

    sampleCourses.forEach(course => {
      db.run(
        `INSERT INTO courses (title, description, price, duration, level, instructor, rating, students)
         SELECT ?, ?, ?, ?, ?, ?, NULL, 0
         FROM (SELECT 1)
         WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = ? AND instructor = ?)`,
        [course.title, course.description, course.price, course.duration, course.level, course.instructor, course.title, course.instructor]
      );
    });

    console.log('✅ Database initialization sequence queued');
    
    // Call seeding separately to ensure it runs after tables are ready
    setTimeout(() => {
      seedTrainerExtras();
    }, 1000);
  });
};

function seedTrainerExtras() {
  db.all('SELECT id FROM users WHERE role = "trainer"', (err, trainers) => {
    if (err || !trainers) return;

    const defaultSchedule = [
      { title: 'Morning Batch', start_time: '09:00', end_time: '10:30', day_label: 'Mon' },
      { title: 'Live Q&A', start_time: '12:00', end_time: '13:00', day_label: 'Wed' },
      { title: 'Project Review', start_time: '16:00', end_time: '17:30', day_label: 'Fri' }
    ];

    const defaultTasks = [
      { task: 'Review submissions', time: '10:00 AM' },
      { task: 'Prepare next lesson', time: '01:30 PM' },
      { task: 'Reply to student questions', time: '05:00 PM' }
    ];

    trainers.forEach(({ id }) => {
      defaultSchedule.forEach(item => {
        db.run(
          `INSERT INTO trainer_schedule (trainer_id, title, start_time, end_time, day_label)
           SELECT ?, ?, ?, ?, ?
           FROM (SELECT 1)
           WHERE NOT EXISTS (
             SELECT 1 FROM trainer_schedule
             WHERE trainer_id = ? AND title = ? AND start_time = ? AND end_time = ?
           )`,
          [id, item.title, item.start_time, item.end_time, item.day_label, id, item.title, item.start_time, item.end_time]
        );
      });

      defaultTasks.forEach(item => {
        db.run(
          `INSERT INTO trainer_tasks (trainer_id, task, time)
           SELECT ?, ?, ?
           FROM (SELECT 1)
           WHERE NOT EXISTS (
             SELECT 1 FROM trainer_tasks
             WHERE trainer_id = ? AND task = ? AND time = ?
           )`,
          [id, item.task, item.time, id, item.task, item.time]
        );
      });
    });
  });
};

initializeDatabase();

// ============= AUTHENTICATION APIs =============

// Request OTP for Registration (Step 1: Validate and Send OTP)
app.post('/api/register/request-otp', async (req, res) => {
  const { name, email, phone, password, confirmPassword, role, skills } = req.body;

  // Validation
  if (!name || !email || !phone || !password || !confirmPassword || !role) {
    return res.status(400).json({ error: '❌ All fields are required!' });
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ error: `❌ ${passwordValidation.errors[0]}` });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: '❌ Passwords do not match!' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: '❌ Invalid email format!' });
  }

  // Phone validation (basic check)
  if (phone.trim().length < 10) {
    return res.status(400).json({ error: '❌ Please enter a valid phone number!' });
  }

  // Check if email already exists
  db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
    if (err) return res.status(500).json({ error: '❌ Server error!' });

    if (existingUser) {
      return res.status(400).json({ error: '❌ Email already registered!' });
    }

    // Hash password
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) return res.status(500).json({ error: '❌ Server error!' });

      // Generate OTP
      const otp = generateOTP();

      // Store registration data temporarily
      pendingRegistrations[email] = {
        name,
        email,
        phone,
        password: hash,
        role,
        skills: skills || [],
        otp,
        timestamp: Date.now(),
        verified: false
      };

      // Send OTP email
      const emailSent = await sendOTPEmail(email, otp, name);

      if (!emailSent) {
        delete pendingRegistrations[email];
        return res.status(500).json({ error: '❌ Failed to send OTP. Please try again.' });
      }

      // Store OTP
      otpStore[email] = {
        code: otp,
        timestamp: Date.now(),
        attempts: 0,
        verified: false
      };

      res.json({ 
        message: '✅ OTP sent to your email. Please verify to complete registration.',
        email 
      });
    });
  });
});

// Verify OTP and Complete Registration (Step 2: Verify OTP and Create User)
app.post('/api/register/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: '❌ Email and OTP are required!' });
  }

  // Verify OTP
  const otpResult = verifyOTP(email, otp);
  if (!otpResult.success) {
    return res.status(400).json({ error: `❌ ${otpResult.message}` });
  }

  // Get pending registration data
  const pendingReg = pendingRegistrations[email];
  if (!pendingReg) {
    return res.status(400).json({ error: '❌ No registration found. Please register again.' });
  }

  // Create user
  const skillsStr = pendingReg.skills ? pendingReg.skills.join(',') : '';
  db.run(
    'INSERT INTO users (name, email, phone, password, role, skills) VALUES (?, ?, ?, ?, ?, ?)',
    [pendingReg.name, pendingReg.email, pendingReg.phone, pendingReg.password, pendingReg.role, skillsStr],
    function(err) {
      if (err) {
        console.error('Registration failed:', err.message);
        return res.status(500).json({ error: '❌ Registration failed!' });
      }

      const userId = this.lastID;
      if (pendingReg.role === 'trainer') {
        seedTrainerExtras();
      }

      // Clean up
      clearOTP(email);
      delete pendingRegistrations[email];

      // Create JWT token
      const token = jwt.sign({ id: userId, email, role: pendingReg.role }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ 
        message: '✅ Registration successful!', 
        token, 
        user: { 
          id: userId, 
          name: pendingReg.name, 
          email: pendingReg.email, 
          role: pendingReg.role, 
          skills: Array.isArray(pendingReg.skills) ? pendingReg.skills : [] 
        } 
      });
    }
  );
});

// Legacy Register Endpoint (redirects to new flow)
app.post('/api/register', (req, res) => {
  // This endpoint is deprecated. Use /api/register/request-otp instead
  return res.status(400).json({ 
    error: '❌ Use /api/register/request-otp to start registration',
    hint: 'First call /api/register/request-otp, then /api/register/verify-otp with the OTP'
  });
});

// Login Endpoint
app.post('/api/login', (req, res) => {
  const { email, password, role } = req.body;

  // Validation
  if (!email || !password || !role) {
    return res.status(400).json({ error: '❌ Email, password, and role are required!' });
  }

  db.get('SELECT * FROM users WHERE email = ? AND role = ?', [email, role], (err, user) => {
    if (err) return res.status(500).json({ error: '❌ Server error!' });

    if (!user) {
      return res.status(401).json({ error: '❌ Invalid email or role!' });
    }

    // Verify password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: '❌ Server error!' });

      if (!isMatch) {
        return res.status(401).json({ error: '❌ Incorrect password!' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      const userSkills = user.skills
        ? user.skills.split(',').map((item) => item.trim()).filter(Boolean)
        : [];

      res.json({ 
        message: '✅ Login successful!', 
        token, 
        user: { id: user.id, name: user.name, email: user.email, role: user.role, skills: userSkills } 
      });
    });
  });
});

// ============= PASSWORD RESET ENDPOINTS =============

// Generate reset token
function generateResetToken() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

// Forgot Password Endpoint - Send reset token via email
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: '❌ Email is required!' });
  }

  try {
    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: '❌ Server error!' });
      }

      if (!user) {
        // For security, don't reveal if email exists
        return res.status(200).json({ message: '✅ If an account exists with this email, you will receive a password reset link.' });
      }

      try {
        const crypto = require('crypto');
        const resetToken = generateResetToken();
        const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour expiry

        // Store reset token in database
        db.run(
          'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)',
          [email, resetToken, expiresAt.toISOString()],
          async (err) => {
            if (err) {
              console.error('Error storing reset token:', err);
              return res.status(500).json({ error: '❌ Failed to create reset token!' });
            }

            try {
              // Send reset email
              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.GMAIL_USER || 'surya30.04.05@gmail.com',
                  pass: process.env.GMAIL_PASSWORD || 'twwgmjwgvadwazxk',
                },
              });

              const resetLink = `${req.protocol}://${req.get('host')}/reset-password.html?token=${resetToken}`;

              const htmlTemplate = `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="UTF-8">
                    <style>
                      body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
                      .container { max-width: 600px; margin: 20px auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                      .header { text-align: center; margin-bottom: 30px; }
                      .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
                      .content { text-align: center; }
                      .reset-button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 30px 0; font-weight: bold; }
                      .message { color: #666; line-height: 1.6; }
                      .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center; }
                      .warning { color: #dc2626; font-weight: bold; margin-top: 20px; font-size: 14px; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <div class="logo">SkillsUp</div>
                        <p style="color: #666; margin-top: 10px;">AI Learning Platform</p>
                      </div>
                      <div class="content">
                        <h2>Password Reset Request</h2>
                        <p class="message">Hello ${user.name || 'User'},</p>
                        <p class="message">We received a request to reset your password. Click the button below to create a new password.</p>
                        <a href="${resetLink}" class="reset-button">Reset Password</a>
                        <p class="message" style="color: #999; font-size: 14px;">This link will expire in 1 hour.</p>
                        <p class="message">Or copy this link: <br><span style="word-break: break-all; color: #4F46E5; font-size: 12px;">${resetLink}</span></p>
                        <p class="warning">⚠️ If you didn't request this, please ignore this email and your password will remain unchanged.</p>
                      </div>
                      <div class="footer">
                        <p>&copy; 2026 SkillsUp. All rights reserved.</p>
                      </div>
                    </div>
                  </body>
                </html>
              `;

              await transporter.sendMail({
                from: process.env.GMAIL_USER || 'surya30.04.05@gmail.com',
                to: email,
                subject: 'Password Reset Request - SkillsUp',
                html: htmlTemplate,
              });

              return res.status(200).json({ 
                message: '✅ Password reset link sent to your email. Please check your email inbox.' 
              });
            } catch (emailError) {
              console.error('Error sending reset email:', emailError);
              return res.status(500).json({ error: '❌ Failed to send reset email!' });
            }
          }
        );
      } catch (error) {
        console.error('Error in forgot password:', error);
        return res.status(500).json({ error: '❌ An error occurred!' });
      }
    });
  } catch (error) {
    console.error('Error in forgot password endpoint:', error);
    return res.status(500).json({ error: '❌ Server error!' });
  }
});

// Verify Reset Token Endpoint
app.post('/api/verify-reset-token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: '❌ Reset token is required!' });
  }

  db.get(
    'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > datetime("now")',
    [token],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: '❌ Server error!' });
      }

      if (!row) {
        return res.status(400).json({ error: '❌ Invalid or expired reset token!' });
      }

      res.json({ 
        message: '✅ Token is valid',
        email: row.email
      });
    }
  );
});

// Reset Password Endpoint
app.post('/api/reset-password', (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: '❌ All fields are required!' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: '❌ Passwords do not match!' });
  }

  // Validate password strength
  const passwordErrors = validatePasswordStrength(newPassword);
  if (passwordErrors.length > 0) {
    return res.status(400).json({ error: '❌ ' + passwordErrors.join(', ') });
  }

  // Verify token
  db.get(
    'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > datetime("now")',
    [token],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: '❌ Server error!' });
      }

      if (!row) {
        return res.status(400).json({ error: '❌ Invalid or expired reset token!' });
      }

      const email = row.email;

      // Hash new password
      bcrypt.hash(newPassword, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({ error: '❌ Server error!' });
        }

        // Update user password
        db.run(
          'UPDATE users SET password = ? WHERE email = ?',
          [hash, email],
          function(err) {
            if (err) {
              console.error('Error updating password:', err);
              return res.status(500).json({ error: '❌ Failed to reset password!' });
            }

            // Mark token as used
            db.run(
              'UPDATE password_reset_tokens SET used = 1 WHERE token = ?',
              [token],
              (err) => {
                if (err) {
                  console.error('Error marking token as used:', err);
                }

                res.json({ 
                  message: '✅ Password reset successfully! Please login with your new password.' 
                });
              }
            );
          }
        );
      });
    }
  );
});

// ============= OTP API ENDPOINTS (Login OTP) =============

// Send OTP for login
app.post('/api/otp/send', async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: '❌ Email is required!' });
  }

  try {
    // Generate OTP
    const otp = generateOTP();

    // Store OTP
    otpStore[email] = {
      code: otp,
      timestamp: Date.now(),
      attempts: 0,
      verified: false
    };

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, name);

    if (!emailSent) {
      delete otpStore[email];
      return res.status(500).json({ error: '❌ Failed to send OTP. Please try again.' });
    }

    res.json({ 
      message: '✅ OTP sent to your email',
      email 
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ error: '❌ Server error!' });
  }
});

// Verify OTP for login
app.post('/api/otp/verify', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: '❌ Email and OTP are required!' });
  }

  // Verify OTP
  const otpResult = verifyOTP(email, otp);
  if (!otpResult.success) {
    return res.status(400).json({ error: `❌ ${otpResult.message}` });
  }

  // Clear OTP after verification
  clearOTP(email);

  res.json({ 
    message: '✅ OTP verified successfully!' 
  });
});

// ============= COURSE APIs =============

// ============= SESSION VALIDATION =============
// Called by the student dashboard on page load to ensure the stored
// localStorage user actually exists in this database. Prevents the
// "Student not found" error caused by stale sessions after a DB reset.
app.get('/api/validate-session', async (req, res) => {
  const { user_id, role } = req.query;

  if (!user_id || !role) {
    return res.status(400).json({ valid: false, error: 'Missing user_id or role' });
  }

  try {
    const user = await getQuery(
      'SELECT id, name, email, role FROM users WHERE id = ? AND role = ?',
      [user_id, role]
    );

    if (!user) {
      return res.status(404).json({ valid: false, error: 'Session invalid — user not found in database.' });
    }

    res.json({ valid: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ valid: false, error: 'Server error during session validation.' });
  }
});

// Get All Courses
app.get('/api/courses', (req, res) => {
  db.all(`${COURSE_SELECT_SQL} GROUP BY c.id ORDER BY c.created_at DESC, c.id DESC`, (err, courses) => {
    if (err) return res.status(500).json({ error: '❌ Failed to fetch courses!' });
    res.json(courses);
  });
});


app.post('/api/recommend', (req, res) => {
  const { user_id, skills } = req.body || {};
  const providedSkills = Array.isArray(skills) ? skills.join(', ') : String(skills || '');

  const continueWithProfile = (storedSkillsText) => {
    const profileTerms = Array.from(new Set([
      ...normalizeKeywordList(storedSkillsText),
      ...normalizeKeywordList(providedSkills)
    ]));

    db.all(`${COURSE_SELECT_SQL} GROUP BY c.id ORDER BY c.created_at DESC, c.id DESC`, (courseErr, courses) => {
      if (courseErr) {
        return res.status(500).json({ success: false, error: 'Failed to generate recommendations.' });
      }

      const continueWithEnrollments = (enrolledIds) => {
        const availableCourses = (courses || []).filter((course) => !enrolledIds.includes(Number(course.id)));
        const rankedCourses = buildPraptiRecommendations(availableCourses, profileTerms).slice(0, 3);

        res.json({
          success: true,
          engine: 'Prapti-CourseRecommendations',
          matchedSkills: profileTerms,
          recommendations: rankedCourses
        });
      };

      if (!user_id) {
        return continueWithEnrollments([]);
      }

      db.all(
        `SELECT e.course_id
         FROM enrollments e
         JOIN courses c ON c.id = e.course_id
         LEFT JOIN payments p
           ON p.id = (
             SELECT p2.id
             FROM payments p2
             WHERE p2.user_id = e.user_id
               AND p2.course_id = e.course_id
               AND p2.payment_status = 'success'
             ORDER BY COALESCE(p2.paid_at, p2.created_at) DESC, p2.id DESC
             LIMIT 1
           )
         WHERE e.user_id = ?
           AND (COALESCE(c.price, 0) <= 0 OR p.id IS NOT NULL)`,
        [user_id],
        (enrollmentErr, enrollments) => {
        if (enrollmentErr) {
          return res.status(500).json({ success: false, error: 'Failed to load enrollment context.' });
        }

        const enrolledIds = (enrollments || []).map((item) => Number(item.course_id));
        return continueWithEnrollments(enrolledIds);
      });
    });
  };

  if (!user_id) {
    return continueWithProfile('');
  }

  db.get('SELECT skills FROM users WHERE id = ?', [user_id], (userErr, user) => {
    if (userErr) {
      return res.status(500).json({ success: false, error: 'Failed to load learner profile.' });
    }

    return continueWithProfile(user?.skills || '');
  });
});

// Get Course by ID
app.get('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  db.get(`${COURSE_SELECT_SQL} WHERE c.id = ? GROUP BY c.id`, [id], (err, course) => {
    if (err) return res.status(500).json({ error: '❌ Failed to fetch course!' });
    if (!course) return res.status(404).json({ error: '❌ Course not found!' });
    res.json(course);
  });
});

// Create Course (Admin/Trainer only)
app.post('/api/courses', (req, res) => {
  const { title, description, price, duration, level, instructor } = req.body;

  if (!title || !description || !price || !duration || !level || !instructor) {
    return res.status(400).json({ error: '❌ All fields are required!' });
  }

  db.run(
    'INSERT INTO courses (title, description, price, duration, level, instructor) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, price, duration, level, instructor],
    function(err) {
      if (err) return res.status(500).json({ error: '❌ Failed to create course!' });
      res.status(201).json({ 
        message: '✅ Course created!', 
        courseId: this.lastID 
      });
    }
  );
});

// Update Course
app.put('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, price, duration, level, instructor } = req.body;

  db.run(
    'UPDATE courses SET title = ?, description = ?, price = ?, duration = ?, level = ?, instructor = ? WHERE id = ?',
    [title, description, price, duration, level, instructor, id],
    function(err) {
      if (err) return res.status(500).json({ error: '❌ Failed to update course!' });
      if (this.changes === 0) return res.status(404).json({ error: '❌ Course not found!' });
      res.json({ message: '✅ Course updated!' });
    }
  );
});

// Delete Course
app.delete('/api/courses/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM courses WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: '❌ Failed to delete course!' });
    if (this.changes === 0) return res.status(404).json({ error: '❌ Course not found!' });
    res.json({ message: '✅ Course deleted!' });
  });
});

app.get('/api/course-access/:userId/:courseId', async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    const access = await getValidatedCourseAccess(userId, courseId);
    if (!access.course) {
      return res.status(404).json({ error: 'âŒ Course not found!' });
    }

    const latestPayment = access.payment || await getLatestPaymentRecord(userId, courseId);
    const paymentRequired = normalizeCurrencyAmount(access.course.price) > 0;

    res.json({
      hasAccess: access.hasAccess,
      paymentRequired,
      paymentStatus: latestPayment
        ? latestPayment.payment_status
        : paymentRequired
          ? 'not_started'
          : 'not_required',
      payment: latestPayment
        ? {
            id: latestPayment.id,
            orderId: latestPayment.order_id,
            amount: normalizeCurrencyAmount(latestPayment.amount),
            currency: latestPayment.currency,
            paidAt: latestPayment.paid_at,
            failureReason: latestPayment.failure_reason
          }
        : null
    });
  } catch (error) {
    console.error('Failed to fetch course access state:', error);
    res.status(500).json({ error: 'âŒ Failed to fetch course access status!' });
  }
});

// ============= PAYMENT APIs =============

app.post('/api/payments/create-order', async (req, res) => {
  const { user_id, course_id } = req.body;

  if (!user_id || !course_id) {
    return res.status(400).json({ error: 'âŒ User ID and Course ID are required!' });
  }

  try {
    const user = await getQuery(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [user_id]
    );
    if (!user || user.role !== 'student') {
      return res.status(404).json({ error: 'âŒ Student not found!' });
    }

    const course = await getCourseRecord(course_id);
    if (!course) {
      return res.status(404).json({ error: 'âŒ Course not found!' });
    }

    const validatedAccess = await getValidatedCourseAccess(user_id, course_id);
    if (validatedAccess.hasAccess) {
      return res.status(200).json({
        enrolled: true,
        requiresPayment: false,
        message: 'âœ… You already have access to this course.'
      });
    }

    const amount = normalizeCurrencyAmount(course.price);

    if (amount <= 0) {
      const orderReference = buildLocalOrderReference(user_id, course_id);
      const freePaymentInsert = await runQuery(
        `INSERT INTO payments (
          user_id, course_id, order_id, payment_gateway, payment_status, amount, currency, paid_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          user_id,
          course_id,
          orderReference,
          PAYMENT_GATEWAY.FREE,
          PAYMENT_STATUS.SUCCESS,
          0,
          PAYMENT_CURRENCY
        ]
      );

      await createEnrollmentRecord(user_id, course_id);

      return res.status(201).json({
        enrolled: true,
        requiresPayment: false,
        paymentRecordId: freePaymentInsert.lastID,
        message: 'âœ… Free course enrolled successfully.'
      });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(503).json({
        error: 'âŒ Payment gateway is not configured. Add Razorpay keys before enrolling in paid courses.'
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: PAYMENT_CURRENCY,
      receipt: buildLocalOrderReference(user_id, course_id),
      notes: {
        userId: String(user_id),
        courseId: String(course_id),
        courseTitle: course.title
      }
    });

    const paymentInsert = await runQuery(
      `INSERT INTO payments (
        user_id, course_id, order_id, payment_gateway, payment_status, amount, currency, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        user_id,
        course_id,
        razorpayOrder.id,
        PAYMENT_GATEWAY.RAZORPAY,
        PAYMENT_STATUS.PENDING,
        amount,
        PAYMENT_CURRENCY
      ]
    );

    res.status(201).json({
      enrolled: false,
      requiresPayment: true,
      message: 'Proceed to secure checkout to finish enrollment.',
      payment: {
        paymentRecordId: paymentInsert.lastID,
        orderId: razorpayOrder.id,
        amount,
        amountPaise: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        courseTitle: course.title,
        studentName: user.name,
        studentEmail: user.email
      }
    });
  } catch (error) {
    console.error('Failed to create payment order:', error);
    res.status(500).json({ error: 'âŒ Failed to start the payment process!' });
  }
});

app.post('/api/payments/verify', async (req, res) => {
  const {
    paymentRecordId,
    user_id,
    course_id,
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature
  } = req.body;

  if (!paymentRecordId || !user_id || !course_id || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ error: 'âŒ Payment verification data is incomplete!' });
  }

  try {
    const paymentRecord = await getQuery(
      'SELECT * FROM payments WHERE id = ? AND user_id = ? AND course_id = ?',
      [paymentRecordId, user_id, course_id]
    );

    if (!paymentRecord) {
      return res.status(404).json({ error: 'âŒ Payment record not found!' });
    }

    if (paymentRecord.payment_status === PAYMENT_STATUS.SUCCESS) {
      await createEnrollmentRecord(user_id, course_id);
      return res.json({
        message: 'âœ… Payment already verified. Course access is active.',
        paymentStatus: PAYMENT_STATUS.SUCCESS
      });
    }

    if (paymentRecord.order_id !== razorpay_order_id) {
      await markPaymentRecordStatus(paymentRecordId, PAYMENT_STATUS.FAILED, 'Order mismatch during verification');
      return res.status(400).json({ error: 'âŒ Payment order mismatch detected.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (!expectedSignature || expectedSignature !== razorpay_signature) {
      await markPaymentRecordStatus(paymentRecordId, PAYMENT_STATUS.FAILED, 'Invalid payment signature');
      return res.status(400).json({ error: 'âŒ Payment verification failed. Enrollment was not created.' });
    }

    await finalizeEnrollmentPayment(paymentRecordId, {
      gatewayPaymentId: razorpay_payment_id,
      gatewaySignature: razorpay_signature
    });

    res.json({
      message: 'âœ… Payment verified and enrollment activated successfully!',
      paymentStatus: PAYMENT_STATUS.SUCCESS
    });
  } catch (error) {
    console.error('Failed to verify payment:', error);
    res.status(500).json({ error: 'âŒ Failed to verify payment!' });
  }
});

app.post('/api/payments/failure', async (req, res) => {
  const { paymentRecordId, reason, status } = req.body;

  if (!paymentRecordId) {
    return res.status(400).json({ error: 'âŒ Payment record ID is required!' });
  }

  const targetStatus = status === PAYMENT_STATUS.CANCELLED
    ? PAYMENT_STATUS.CANCELLED
    : PAYMENT_STATUS.FAILED;

  try {
    await markPaymentRecordStatus(paymentRecordId, targetStatus, reason || null);
    res.json({
      message: targetStatus === PAYMENT_STATUS.CANCELLED
        ? 'Payment cancelled. Enrollment was not created.'
        : 'Payment marked as failed. Enrollment was not created.'
    });
  } catch (error) {
    console.error('Failed to update payment status:', error);
    res.status(500).json({ error: 'âŒ Failed to update payment status.' });
  }
});

// ============= ENROLLMENT APIs =============

// Enroll in Course
app.post('/api/enrollments', async (req, res) => {
  const { user_id, course_id } = req.body;

  if (!user_id || !course_id) {
    return res.status(400).json({ error: '❌ User ID and Course ID are required!' });
  }

  try {
    const course = await getCourseRecord(course_id);
    if (!course) {
      return res.status(404).json({ error: 'âŒ Course not found!' });
    }

    const validatedAccess = await getValidatedCourseAccess(user_id, course_id);
    if (validatedAccess.hasAccess) {
      return res.status(200).json({ message: 'âœ… You already have access to this course.' });
    }

    if (normalizeCurrencyAmount(course.price) > 0) {
      const latestPayment = await getLatestPaymentRecord(user_id, course_id);
      return res.status(402).json({
        error: 'âŒ Payment verification is required before enrollment.',
        paymentStatus: latestPayment ? latestPayment.payment_status : 'not_started'
      });
    }

    const paymentInsert = await runQuery(
      `INSERT INTO payments (
        user_id, course_id, order_id, payment_gateway, payment_status, amount, currency, paid_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        user_id,
        course_id,
        buildLocalOrderReference(user_id, course_id),
        PAYMENT_GATEWAY.FREE,
        PAYMENT_STATUS.SUCCESS,
        0,
        PAYMENT_CURRENCY
      ]
    );

    await createEnrollmentRecord(user_id, course_id);

    res.status(201).json({
      message: 'âœ… Enrolled successfully!',
      paymentRecordId: paymentInsert.lastID
    });
  } catch (error) {
    console.error('Enrollment failed:', error);
    res.status(500).json({ error: 'Enrollment failed!' });
  }
});

// Get User Enrollments
app.get('/api/enrollments/:userId', (req, res) => {
  const { userId } = req.params;

  db.all(
    `SELECT
       e.*,
       c.title,
       c.description,
       c.price,
       c.duration,
       c.level,
       c.instructor,
       p.payment_status,
       p.amount AS paid_amount,
       p.paid_at
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     LEFT JOIN payments p
       ON p.id = (
         SELECT p2.id
         FROM payments p2
         WHERE p2.user_id = e.user_id
           AND p2.course_id = e.course_id
           AND p2.payment_status = 'success'
         ORDER BY COALESCE(p2.paid_at, p2.created_at) DESC, p2.id DESC
         LIMIT 1
       )
     WHERE e.user_id = ?
       AND (COALESCE(c.price, 0) <= 0 OR p.id IS NOT NULL)
     ORDER BY e.enrolled_at DESC, e.id DESC`,
    [userId],
    (err, enrollments) => {
      if (err) return res.status(500).json({ error: '❌ Failed to fetch enrollments!' });
      res.json(enrollments);
    }
  );
});

app.get('/api/students/:trainerId', (req, res) => {
  const { trainerId } = req.params;

  db.all(
    `SELECT DISTINCT u.id, u.name, u.email,
            'STD' || SUBSTR('0000' || u.id, -4, 4) AS rollno
     FROM enrollments e
     JOIN users u ON u.id = e.user_id
     JOIN courses c ON c.id = e.course_id
     JOIN users t ON t.name = c.instructor AND t.role = 'trainer'
     WHERE u.role = 'student' AND t.id = ?
     ORDER BY u.name ASC`,
    [trainerId],
    (err, students) => {
      if (err) return res.status(500).json({ error: '❌ Failed to fetch students!' });
      res.json(students);
    }
  );
});

app.get('/api/schedule/:trainerId', (req, res) => {
  const { trainerId } = req.params;

  db.all(
    'SELECT id, title, start_time, end_time, day_label FROM trainer_schedule WHERE trainer_id = ? ORDER BY start_time ASC',
    [trainerId],
    (err, schedule) => {
      if (err) return res.status(500).json({ error: '❌ Failed to fetch schedule!' });
      res.json(schedule);
    }
  );
});

app.get('/api/tasks/:trainerId', (req, res) => {
  const { trainerId } = req.params;

  db.all(
    'SELECT id, task, time, status FROM trainer_tasks WHERE trainer_id = ? ORDER BY id ASC',
    [trainerId],
    (err, tasks) => {
      if (err) return res.status(500).json({ error: '❌ Failed to fetch tasks!' });
      res.json(tasks);
    }
  );
});

app.post('/api/tasks', (req, res) => {
  const { trainer_id, task, time, status } = req.body;

  if (!trainer_id || !task || !time) {
    return res.status(400).json({ error: 'Trainer, task, and time are required!' });
  }

  db.run(
    'INSERT INTO trainer_tasks (trainer_id, task, time, status) VALUES (?, ?, ?, ?)',
    [trainer_id, task, time, status || 'pending'],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to add trainer task!' });
      res.status(201).json({ message: 'Trainer task added!', taskId: this.lastID });
    }
  );
});

app.put('/api/tasks/:taskId', (req, res) => {
  const { taskId } = req.params;
  const { task, time, status } = req.body;

  db.run(
    'UPDATE trainer_tasks SET task = COALESCE(?, task), time = COALESCE(?, time), status = COALESCE(?, status) WHERE id = ?',
    [task || null, time || null, status || null, taskId],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to update trainer task!' });
      if (this.changes === 0) return res.status(404).json({ error: 'Trainer task not found!' });
      res.json({ message: 'Trainer task updated!' });
    }
  );
});

app.delete('/api/tasks/:taskId', (req, res) => {
  const { taskId } = req.params;

  db.run('DELETE FROM trainer_tasks WHERE id = ?', [taskId], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to delete trainer task!' });
    if (this.changes === 0) return res.status(404).json({ error: 'Trainer task not found!' });
    res.json({ message: 'Trainer task deleted!' });
  });
});

app.get('/api/trainer/stats/:trainerId', (req, res) => {
  const { trainerId } = req.params;

  db.get('SELECT name FROM users WHERE id = ? AND role = "trainer"', [trainerId], (userErr, trainer) => {
    if (userErr) return res.status(500).json({ error: '❌ Failed to fetch trainer stats!' });
    if (!trainer) return res.status(404).json({ error: '❌ Trainer not found!' });

    db.get(
      `SELECT
         COUNT(DISTINCT c.id) AS courses,
         COUNT(DISTINCT e.user_id) AS students,
         COALESCE(SUM(CASE WHEN e.id IS NOT NULL THEN c.price ELSE 0 END), 0) AS earnings
       FROM courses c
       LEFT JOIN enrollments e ON e.course_id = c.id
       WHERE c.instructor = ?`,
      [trainer.name],
      (err, stats) => {
        if (err) return res.status(500).json({ error: '❌ Failed to fetch trainer stats!' });
        res.json({
          courses: stats.courses || 0,
          students: stats.students || 0,
          earnings: Math.round(stats.earnings || 0)
        });
      }
    );
  });
});

app.get('/api/trainer/analytics-legacy/:trainerId', (req, res) => {
  const { trainerId } = req.params;

  db.get('SELECT id FROM users WHERE id = ? AND role = "trainer"', [trainerId], (userErr, trainer) => {
    if (userErr) return res.status(500).json({ error: '❌ Failed to fetch analytics!' });
    if (!trainer) return res.status(404).json({ error: '❌ Trainer not found!' });

    db.all(
      'SELECT day_label, COUNT(*) AS total FROM trainer_schedule WHERE trainer_id = ? GROUP BY day_label',
      [trainerId],
      (err, rows) => {
        if (err) return res.status(500).json({ error: '❌ Failed to fetch analytics!' });

        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const scheduleMap = Object.fromEntries(labels.map(label => [label, 0]));
        rows.forEach(row => {
          if (row.day_label && row.day_label in scheduleMap) {
            scheduleMap[row.day_label] = row.total * 8;
          }
        });

        res.json({
          labels,
          students: labels.map(label => scheduleMap[label])
        });
      }
    );
  });
});

app.get('/api/trainer/analytics/:trainerId', async (req, res) => {
  const { trainerId } = req.params;

  try {
    const trainer = await getQuery('SELECT id, name FROM users WHERE id = ? AND role = "trainer"', [trainerId]);
    if (!trainer) {
      return res.status(404).json({ error: 'Trainer not found!' });
    }

    const courseBreakdown = await allQuery(
      `SELECT
         c.id,
         c.title,
         c.duration,
         c.level,
         c.price,
         COUNT(DISTINCT e.user_id) AS students,
         ROUND(COALESCE(AVG(e.progress), 0), 1) AS averageProgress,
         COALESCE(c.price * COUNT(DISTINCT e.user_id), 0) AS revenue
       FROM courses c
       LEFT JOIN enrollments e ON e.course_id = c.id
       WHERE c.instructor = ?
       GROUP BY c.id
       ORDER BY students DESC, c.title ASC`,
      [trainer.name]
    );

    const progressRows = await allQuery(
      `SELECT
         CASE
           WHEN e.status = 'completed' OR e.progress >= 100 THEN 'Completed'
           WHEN COALESCE(e.progress, 0) = 0 THEN 'Not started'
           ELSE 'In progress'
         END AS label,
         COUNT(*) AS count
       FROM courses c
       LEFT JOIN enrollments e ON e.course_id = c.id
       WHERE c.instructor = ? AND e.id IS NOT NULL
       GROUP BY label`,
      [trainer.name]
    );

    const progressMap = { 'Not started': 0, 'In progress': 0, Completed: 0 };
    progressRows.forEach((row) => {
      progressMap[row.label] = row.count;
    });

    res.json({
      courseBreakdown,
      progressDistribution: [
        { label: 'Not started', count: progressMap['Not started'] || 0 },
        { label: 'In progress', count: progressMap['In progress'] || 0 },
        { label: 'Completed', count: progressMap.Completed || 0 }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trainer analytics!' });
  }
});

// GET Trainer's Students
app.get('/api/trainer/students', authenticate, (req, res) => {
  if (req.user.role !== 'trainer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: '❌ Access denied. Trainer or Admin role required.' });
  }

  const trainerName = req.user.name;

  const sql = `
    SELECT 
      u.id as studentId, u.name as studentName, u.email as studentEmail,
      e.id as enrollmentId, e.progress, e.status, e.completion_status, e.enrolled_at,
      c.id as courseId, c.title as courseTitle
    FROM users u
    JOIN enrollments e ON u.id = e.user_id
    JOIN courses c ON e.course_id = c.id
    WHERE c.instructor = ?
  `;

  db.all(sql, [trainerName], (err, rows) => {
    if (err) {
      console.error('Error fetching trainer students:', err);
      return res.status(500).json({ error: '❌ Failed to fetch students.' });
    }
    res.json({ data: rows });
  });
});

// Approve/Update Completion Status
app.put('/api/trainer/approve-completion', authenticate, (req, res) => {
  if (req.user.role !== 'trainer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: '❌ Access denied. Trainer or Admin role required.' });
  }

  const { enrollmentId, completion_status } = req.body;

  if (!['Completed', 'Not Completed', 'In Review', 'In Progress'].includes(completion_status)) {
    return res.status(400).json({ error: '❌ Invalid status.' });
  }

  db.run(
    'UPDATE enrollments SET completion_status = ? WHERE id = ?',
    [completion_status, enrollmentId],
    function(err) {
      if (err) {
        console.error('Error updating completion status:', err);
        return res.status(500).json({ error: '❌ Failed to update status.' });
      }

      if (completion_status === 'Completed') {
        // Fetch student and course info for the email
        const infoSql = `
          SELECT u.name, u.email, c.title, e.user_id, e.course_id
          FROM enrollments e
          JOIN users u ON e.user_id = u.id
          JOIN courses c ON e.course_id = c.id
          WHERE e.id = ?
        `;
        
        db.get(infoSql, [enrollmentId], (err, info) => {
          if (err || !info) return;

          // Generate a simple certificate record
          const certificateId = `CERT-${Date.now()}-${info.user_id}`;
          const certificateUrl = `http://localhost:${PORT}/certificates/${certificateId}.pdf`; // Placeholder URL

          db.run(
            `INSERT INTO certificates (user_id, course_id, pdf_url) 
             SELECT ?, ?, ? 
             FROM (SELECT 1)
             WHERE NOT EXISTS (SELECT 1 FROM certificates WHERE user_id = ? AND course_id = ?)`,
            [info.user_id, info.course_id, certificateUrl, info.user_id, info.course_id],
            async function(certErr) {
              if (certErr) {
                console.error('Certificate record creation failed:', certErr);
              } else {
                // Send congratulatory email
                await sendCertificateEmail(info.email, info.name, info.title, certificateUrl);
              }
            }
          );
        });
      }

      res.json({ message: `✅ Student status updated to ${completion_status}!` });
    }
  );
});

// Update Progress
app.put('/api/enrollments/:enrollmentId', (req, res) => {
  const { enrollmentId } = req.params;
  const { progress, status } = req.body;

  db.run(
    'UPDATE enrollments SET progress = ?, status = ? WHERE id = ?',
    [progress, status, enrollmentId],
    function(err) {
      if (err) return res.status(500).json({ error: '❌ Failed to update progress!' });

      // Removed auto-certificate generation. Trainer must approve completion.
      
      res.json({ message: '✅ Progress updated!' });
    }
  );
});

// ============= ASSIGNMENTS APIs =============

app.post('/api/assignments', (req, res) => {
  const { course_id, title, description, due_date } = req.body;
  if (!course_id || !title) return res.status(400).json({ error: 'Course ID and title are required' });

  db.run(
    'INSERT INTO assignments (course_id, title, description, due_date) VALUES (?, ?, ?, ?)',
    [course_id, title, description, due_date],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to create assignment' });
      res.status(201).json({ message: 'Assignment created', id: this.lastID });
    }
  );
});

app.get('/api/assignments/user/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT a.*, c.title as course_title, s.status as submission_status, s.grade
    FROM assignments a
    JOIN enrollments e ON e.course_id = a.course_id
    JOIN courses c ON c.id = a.course_id
    LEFT JOIN submissions s ON s.assignment_id = a.id AND s.user_id = e.user_id
    WHERE e.user_id = ?
      AND (
        COALESCE(c.price, 0) <= 0 OR EXISTS (
          SELECT 1
          FROM payments p
          WHERE p.user_id = e.user_id
            AND p.course_id = e.course_id
            AND p.payment_status = 'success'
        )
      )
  `;
  db.all(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch assignments' });
    
    const result = {
      pending: rows.filter(r => !r.submission_status),
      submitted: rows.filter(r => r.submission_status)
    };
    res.json(result);
  });
});

app.post('/api/submissions', async (req, res) => {
  const { assignment_id, user_id, content } = req.body;
  if (!assignment_id || !user_id) return res.status(400).json({ error: 'Assignment ID and User ID are required' });

  try {
    const assignment = await getQuery(
      `SELECT a.id, a.course_id
       FROM assignments a
       WHERE a.id = ?`,
      [assignment_id]
    );

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const access = await getValidatedCourseAccess(user_id, assignment.course_id);
    if (!access.hasAccess) {
      return res.status(403).json({ error: 'Verified enrollment is required before submitting this assignment' });
    }

    db.run(
      'INSERT INTO submissions (assignment_id, user_id, content) VALUES (?, ?, ?)',
      [assignment_id, user_id, content],
      function(err) {
        if (err) return res.status(500).json({ error: 'Failed to submit assignment' });
        res.status(201).json({ message: 'Assignment submitted', id: this.lastID });
      }
    );
  } catch (error) {
    console.error('Failed to submit assignment:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
});

app.get('/api/submissions/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT s.*, a.title as assignment_title FROM submissions s JOIN assignments a ON a.id = s.assignment_id WHERE s.user_id = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch submissions' });
    res.json(rows);
  });
});

// ============= CLASSES APIs =============

app.post('/api/classes', (req, res) => {
  const { course_id, title, video_url, live_link, scheduled_at, duration } = req.body;
  if (!course_id || !title) return res.status(400).json({ error: 'Course ID and title are required' });

  db.run(
    'INSERT INTO classes (course_id, title, video_url, live_link, scheduled_at, duration) VALUES (?, ?, ?, ?, ?, ?)',
    [course_id, title, video_url, live_link, scheduled_at, duration],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to schedule class' });
      res.status(201).json({ message: 'Class scheduled', id: this.lastID });
    }
  );
});

app.get('/api/classes/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT cl.*, co.title as course_title
    FROM classes cl
    JOIN enrollments e ON e.course_id = cl.course_id
    JOIN courses co ON co.id = cl.course_id
    WHERE e.user_id = ?
      AND (
        COALESCE(co.price, 0) <= 0 OR EXISTS (
          SELECT 1
          FROM payments p
          WHERE p.user_id = e.user_id
            AND p.course_id = e.course_id
            AND p.payment_status = 'success'
        )
      )
    ORDER BY cl.scheduled_at ASC
  `;
  db.all(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch classes' });
    res.json(rows);
  });
});

// ============= CERTIFICATE APIs =============

// Get Student Certificates
app.get('/api/certificate/my-certificates', authenticate, (req, res) => {
  const userId = req.user.id;
  
  const sql = `
    SELECT 
      ce.id as _id, 
      ce.id as certificateId, 
      ce.issued_at as issuedDate, 
      'issued' as status,
      ce.certificate_url as pdfUrl,
      co.title as courseTitle,
      co.id as courseId
    FROM certificates ce 
    JOIN courses co ON co.id = ce.course_id 
    WHERE ce.user_id = ?
    ORDER BY ce.issued_at DESC
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching certificates:', err);
      return res.status(500).json({ error: '❌ Failed to fetch certificates.' });
    }
    
    // Transform to match frontend expectation if needed
    const data = rows.map(r => ({
      ...r,
      courseId: { id: r.courseId, title: r.courseTitle }
    }));
    
    res.json({ data });
  });
});

// Helper function to send certificate email (logic simplified for monolith)
async function sendCertificateEmail(email, name, courseTitle, certificateUrl) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'surya30.04.05@gmail.com',
        pass: process.env.GMAIL_PASSWORD || 'twwgmjwgvadwazxk',
      },
    });

    const html = `
      <h1>Congratulations, ${name}!</h1>
      <p>You have successfully completed the course: <strong>${courseTitle}</strong>.</p>
      <p>Your certificate is now available for download.</p>
      <a href="${certificateUrl}" style="padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Download Certificate</a>
      <p>Keep learning!</p>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER || 'surya30.04.05@gmail.com',
      to: email,
      subject: `🎓 Certificate of Completion: ${courseTitle}`,
      html
    });
    return true;
  } catch (error) {
    console.error('Failed to send certificate email:', error);
    return false;
  }
}

// ============= ADMIN APIs =============

// Get All Users (Admin)
app.get('/api/admin/users-legacy', (req, res) => {
  db.all('SELECT id, name, email, role, created_at FROM users', (err, users) => {
    if (err) return res.status(500).json({ error: '❌ Failed to fetch users!' });
    res.json(users);
  });
});

app.get('/api/admin/users', (req, res) => {
  const { search = '', role = 'all', sortBy = 'created_at', sortDir = 'desc' } = req.query;
  const allowedSortFields = new Set(['name', 'email', 'role', 'created_at']);
  const orderBy = allowedSortFields.has(sortBy) ? sortBy : 'created_at';
  const direction = String(sortDir).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const filters = [];
  const params = [];

  if (search) {
    filters.push('(name LIKE ? OR email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (role && role !== 'all') {
    filters.push('role = ?');
    params.push(role);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const sql = `SELECT id, name, email, role, created_at FROM users ${whereClause} ORDER BY ${orderBy} ${direction}, id DESC`;

  db.all(sql, params, (err, users) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch users!' });
    res.json(users);
  });
});

// Create User (Admin)
app.post('/api/admin/users', (req, res) => {
  const { name, email, password, role, skills } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: '❌ All fields are required!' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: '❌ Password must be at least 8 characters!' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: '❌ Invalid email format!' });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: '❌ Server error!' });

    const skillsStr = skills ? skills.join(',') : '';
    db.run(
      'INSERT INTO users (name, email, password, role, skills) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, role, skillsStr],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: '❌ Email already exists!' });
          }
          return res.status(500).json({ error: '❌ Failed to create user!' });
        }
        if (role === 'trainer') {
          seedTrainerExtras();
        }

        res.status(201).json({ 
          message: '✅ User created successfully!', 
          userId: this.lastID 
        });
      }
    );
  });
});

// Update User (Admin)
app.put('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role, skills } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: '❌ All fields are required!' });
  }

  const skillsStr = skills ? skills.join(',') : '';
  db.run(
    'UPDATE users SET name = ?, email = ?, role = ?, skills = ? WHERE id = ?',
    [name, email, role, skillsStr, id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: '❌ Email already exists!' });
        }
        return res.status(500).json({ error: '❌ Failed to update user!' });
      }
      if (this.changes === 0) return res.status(404).json({ error: '❌ User not found!' });
      res.json({ message: '✅ User updated successfully!' });
    }
  );
});

// Delete User (Admin)
app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;

  // Don't allow deleting the admin itself
  db.get('SELECT role FROM users WHERE id = ?', [id], (err, user) => {
    if (err) return res.status(500).json({ error: '❌ Server error!' });
    if (!user) return res.status(404).json({ error: '❌ User not found!' });

    // Delete user and their enrollments
    db.serialize(() => {
      db.run('DELETE FROM enrollments WHERE user_id = ?', [id]);
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: '❌ Failed to delete user!' });
        res.json({ message: '✅ User deleted successfully!' });
      });
    });
  });
});

// Get All Courses (Admin)
app.get('/api/admin/courses', (req, res) => {
  db.all(`${COURSE_SELECT_SQL} GROUP BY c.id ORDER BY c.created_at DESC, c.id DESC`, (err, courses) => {
    if (err) return res.status(500).json({ error: '❌ Failed to fetch courses!' });
    res.json(courses);
  });
});

// Edit Course (Admin)
app.put('/api/admin/courses/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, price, duration, level, instructor } = req.body;

  if (!title || !description || !price || !duration || !level || !instructor) {
    return res.status(400).json({ error: '❌ All fields are required!' });
  }

  db.run(
    'UPDATE courses SET title = ?, description = ?, price = ?, duration = ?, level = ?, instructor = ? WHERE id = ?',
    [title, description, price, duration, level, instructor, id],
    function(err) {
      if (err) return res.status(500).json({ error: '❌ Failed to update course!' });
      if (this.changes === 0) return res.status(404).json({ error: '❌ Course not found!' });
      res.json({ message: '✅ Course updated successfully!' });
    }
  );
});

// Delete Course (Admin)
app.delete('/api/admin/courses/:id', (req, res) => {
  const { id } = req.params;

  db.serialize(() => {
    // Delete enrollments first
    db.run('DELETE FROM enrollments WHERE course_id = ?', [id]);
    // Then delete course
    db.run('DELETE FROM courses WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ error: '❌ Failed to delete course!' });
      if (this.changes === 0) return res.status(404).json({ error: '❌ Course not found!' });
      res.json({ message: '✅ Course deleted successfully!' });
    });
  });
});

// Get Platform Stats
app.get('/api/admin/stats-legacy', (req, res) => {
  db.serialize(() => {
    let stats = {};

    db.get('SELECT COUNT(*) as count FROM users WHERE role = "student"', (err, row) => {
      stats.students = row.count;
    });

    db.get('SELECT COUNT(*) as count FROM users WHERE role = "trainer"', (err, row) => {
      stats.trainers = row.count;
    });

    db.get('SELECT COUNT(*) as count FROM courses', (err, row) => {
      stats.courses = row.count;
    });

    db.get('SELECT COUNT(*) as count FROM enrollments', (err, row) => {
      stats.enrollments = row.count;
      res.json(stats);
    });
  });
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const [studentRow, trainerRow, courseRow, enrollmentRow, revenueRow] = await Promise.all([
      getQuery('SELECT COUNT(*) as count FROM users WHERE role = "student"'),
      getQuery('SELECT COUNT(*) as count FROM users WHERE role = "trainer"'),
      getQuery('SELECT COUNT(*) as count FROM courses'),
      getQuery('SELECT COUNT(*) as count FROM enrollments'),
      getQuery('SELECT COALESCE(SUM(c.price), 0) as totalRevenue FROM enrollments e JOIN courses c ON c.id = e.course_id')
    ]);

    res.json({
      students: studentRow?.count || 0,
      trainers: trainerRow?.count || 0,
      courses: courseRow?.count || 0,
      enrollments: enrollmentRow?.count || 0,
      totalRevenue: revenueRow?.totalRevenue || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin stats!' });
  }
});

// ============= STUDENT TODO APIs =============

// Create student_todos table
db.run(`
  CREATE TABLE IF NOT EXISTS student_todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    task TEXT NOT NULL,
    due_date TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`);

// Create admin_settings table
db.run(`
  CREATE TABLE IF NOT EXISTS admin_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL
  )
`);

// Get student todos
app.get('/api/todos/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT * FROM student_todos WHERE user_id = ? ORDER BY CASE priority WHEN "high" THEN 1 WHEN "medium" THEN 2 ELSE 3 END, id DESC', [userId], (err, todos) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch todos' });
    res.json(todos);
  });
});

// Add student todo
app.post('/api/todos', (req, res) => {
  const { user_id, task, due_date, priority } = req.body;
  if (!user_id || !task) return res.status(400).json({ error: 'User ID and task required' });
  db.run('INSERT INTO student_todos (user_id, task, due_date, priority) VALUES (?, ?, ?, ?)',
    [user_id, task, due_date || null, priority || 'medium'],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to add todo' });
      res.status(201).json({ message: 'Todo added', id: this.lastID });
    });
});

// Update student todo status
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { status, task, due_date, priority } = req.body;
  if (task !== undefined) {
    db.run('UPDATE student_todos SET task=?, due_date=?, priority=?, status=? WHERE id=?',
      [task, due_date, priority, status || 'pending', id], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to update todo' });
        res.json({ message: 'Todo updated' });
      });
  } else {
    db.run('UPDATE student_todos SET status = ? WHERE id = ?', [status, id], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to update todo' });
      res.json({ message: 'Todo updated' });
    });
  }
});

// Delete student todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM student_todos WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to delete todo' });
    res.json({ message: 'Todo deleted' });
  });
});

// Get students enrolled in a specific course
app.get('/api/courses/:courseId/students', (req, res) => {
  const { courseId } = req.params;
  db.all(
    `SELECT u.id, u.name, u.email, e.progress, e.status, e.enrolled_at, e.id as enrollmentId, e.completion_status
     FROM enrollments e
     JOIN users u ON u.id = e.user_id
     WHERE e.course_id = ? AND u.role = 'student'
     ORDER BY u.name ASC`,
    [courseId],
    (err, students) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch students' });
      res.json(students);
    }
  );
});

// Get all students not yet enrolled in a specific course (for trainer assignment)
app.get('/api/courses/:courseId/available-students', (req, res) => {
  const { courseId } = req.params;
  db.all(
    `SELECT u.id, u.name, u.email
     FROM users u
     WHERE u.role = 'student'
     AND u.id NOT IN (
       SELECT e.user_id FROM enrollments e WHERE e.course_id = ?
     )
     ORDER BY u.name ASC`,
    [courseId],
    (err, students) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch available students' });
      res.json(students);
    }
  );
});

// Assign/enroll students to a course (trainer action)
app.post('/api/courses/:courseId/assign-students', (req, res) => {
  const { courseId } = req.params;
  const { studentIds } = req.body;

  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ error: 'Student IDs array is required' });
  }

  let assigned = 0;
  let failed = 0;
  const errors = [];

  const assignNext = (index) => {
    if (index >= studentIds.length) {
      return res.status(200).json({
        message: `Successfully assigned ${assigned} student(s)${failed > 0 ? ` (${failed} already enrolled)` : ''}`,
        assigned,
        failed,
        errors: errors.length > 0 ? errors : undefined
      });
    }

    const studentId = studentIds[index];

    // Check if already enrolled
    db.get(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [studentId, courseId],
      (err, existing) => {
        if (existing) {
          failed++;
          errors.push(`Student ${studentId} is already enrolled`);
          return assignNext(index + 1);
        }

        // Enroll student
        db.run(
          'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
          [studentId, courseId],
          (insertErr) => {
            if (insertErr) {
              failed++;
              errors.push(`Failed to enroll student ${studentId}: ${insertErr.message}`);
            } else {
              assigned++;
            }
            assignNext(index + 1);
          }
        );
      }
    );
  };

  assignNext(0);
});

// ============= ADMIN ANALYTICS API =============
app.get('/api/admin/analytics-legacy', (req, res) => {
  const result = {};

  db.all(`SELECT DATE(e.enrolled_at) as date, COUNT(*) as count FROM enrollments e GROUP BY DATE(e.enrolled_at) ORDER BY date DESC LIMIT 30`, (err, enrollmentTrend) => {
    result.enrollmentTrend = enrollmentTrend || [];

    db.all(`SELECT c.title, COUNT(e.id) as enrolled FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id GROUP BY c.id ORDER BY enrolled DESC`, (err2, coursePopularity) => {
      result.coursePopularity = coursePopularity || [];

      db.all(`SELECT u.name as trainer, COUNT(DISTINCT e.user_id) as students, COUNT(DISTINCT c.id) as courses FROM users u JOIN courses c ON c.instructor = u.name LEFT JOIN enrollments e ON e.course_id = c.id WHERE u.role = 'trainer' GROUP BY u.id ORDER BY students DESC`, (err3, trainerPerformance) => {
        result.trainerPerformance = trainerPerformance || [];

        db.all(`SELECT u.role, COUNT(*) as count FROM users u GROUP BY u.role`, (err4, userDist) => {
          result.userDistribution = userDist || [];

          db.all(`SELECT c.title, c.price, COUNT(e.id) as enrollments, (c.price * COUNT(e.id)) as revenue FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id GROUP BY c.id ORDER BY revenue DESC`, (err5, revenueData) => {
            result.revenueByCoursee = revenueData || [];

            db.get(`SELECT COALESCE(SUM(c.price), 0) as total FROM enrollments e JOIN courses c ON c.id = e.course_id`, (err6, rev) => {
              result.totalRevenue = rev ? rev.total : 0;
              res.json(result);
            });
          });
        });
      });
    });
  });
});

app.get('/api/admin/analytics', async (req, res) => {
  try {
    const [enrollmentTrend, trainerPerformance, studentProgress, topStudents, courseRevenue, userDistribution, revenueRow] = await Promise.all([
      allQuery(
        `SELECT DATE(enrolled_at) as date, COUNT(*) as count
         FROM enrollments
         GROUP BY DATE(enrolled_at)
         ORDER BY date ASC`
      ),
      allQuery(
        `SELECT
           u.name as trainer,
           COUNT(DISTINCT c.id) as courses,
           COUNT(DISTINCT e.user_id) as students,
           COUNT(e.id) as enrollments,
           ROUND(COALESCE(AVG(e.progress), 0), 1) as averageProgress,
           COALESCE(SUM(c.price), 0) as revenue
         FROM users u
         LEFT JOIN courses c ON c.instructor = u.name
         LEFT JOIN enrollments e ON e.course_id = c.id
         WHERE u.role = 'trainer'
         GROUP BY u.id
         ORDER BY students DESC, revenue DESC, u.name ASC`
      ),
      allQuery(
        `SELECT
           CASE
             WHEN status = 'completed' OR progress >= 100 THEN 'Completed'
             WHEN COALESCE(progress, 0) = 0 THEN 'Not started'
             ELSE 'In progress'
           END AS label,
           COUNT(*) AS count
         FROM enrollments
         GROUP BY label`
      ),
      allQuery(
        `SELECT
           u.name,
           COUNT(e.id) AS enrolledCourses,
           ROUND(COALESCE(AVG(e.progress), 0), 1) AS averageProgress
         FROM users u
         JOIN enrollments e ON e.user_id = u.id
         WHERE u.role = 'student'
         GROUP BY u.id
         ORDER BY averageProgress DESC, enrolledCourses DESC, u.name ASC
         LIMIT 5`
      ),
      allQuery(
        `SELECT
           c.title,
           COUNT(e.id) as enrollments,
           COALESCE(SUM(c.price), 0) as revenue
         FROM courses c
         LEFT JOIN enrollments e ON e.course_id = c.id
         GROUP BY c.id
         ORDER BY revenue DESC, enrollments DESC, c.title ASC`
      ),
      allQuery(`SELECT role, COUNT(*) as count FROM users GROUP BY role`),
      getQuery(`SELECT COALESCE(SUM(c.price), 0) as totalRevenue FROM enrollments e JOIN courses c ON c.id = e.course_id`)
    ]);

    const progressMap = { 'Not started': 0, 'In progress': 0, Completed: 0 };
    studentProgress.forEach((row) => {
      progressMap[row.label] = row.count;
    });

    res.json({
      enrollmentTrend,
      trainerPerformance,
      studentProgress: [
        { label: 'Not started', count: progressMap['Not started'] || 0 },
        { label: 'In progress', count: progressMap['In progress'] || 0 },
        { label: 'Completed', count: progressMap.Completed || 0 }
      ],
      topStudents,
      courseRevenue,
      userDistribution,
      totalRevenue: revenueRow?.totalRevenue || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin analytics!' });
  }
});

// ============= ADMIN SETTINGS APIs =============
app.get('/api/admin/settings', (req, res) => {
  db.all('SELECT key, value FROM admin_settings', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch settings' });
    const settings = {};
    (rows || []).forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  });
});

app.put('/api/admin/settings', (req, res) => {
  const settings = req.body;
  const keys = Object.keys(settings);

  if (!keys.length) {
    return res.json({ message: 'No settings to save' });
  }

  let responded = false;
  let completed = 0;
  keys.forEach(key => {
    db.run('INSERT INTO admin_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
      [key, settings[key], settings[key]], (err) => {
        if (err) {
          if (responded) return;
          responded = true;
          return res.status(500).json({ error: 'Failed to save settings' });
        }
        if (responded) return;
        completed++;
        if (completed === keys.length) {
          responded = true;
          res.json({ message: 'Settings saved successfully' });
        }
      });
  });
});

// ============= Serve Frontend =============

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: '❌ Route not found!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 AI Learning Platform Server Running!`);
  console.log(`📍 Frontend: http://localhost:${PORT}`);
  console.log(`📍 API Base: http://localhost:${PORT}/api`);
  console.log(`\n✅ Ready to accept requests!\n`);
});
app.get('/api/ping', (req, res) => res.send('pong'));
