require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';

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

// Create Tables
const initializeDatabase = () => {
  db.serialize(() => {
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
    `);

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
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(course_id) REFERENCES courses(id)
      )
    `);

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
        certificate_url TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(course_id) REFERENCES courses(id)
      )
    `);

    db.run(`
      UPDATE enrollments
      SET course_id = (
        SELECT MIN(keep_course.id)
        FROM courses current_course
        JOIN courses keep_course
          ON keep_course.title = current_course.title
         AND keep_course.instructor = current_course.instructor
        WHERE current_course.id = enrollments.course_id
      )
      WHERE course_id IN (
        SELECT duplicate.id
        FROM courses duplicate
        WHERE EXISTS (
          SELECT 1
          FROM courses original
          WHERE original.title = duplicate.title
            AND original.instructor = duplicate.instructor
            AND original.id < duplicate.id
        )
      )
    `);

    db.run(`
      DELETE FROM courses
      WHERE id IN (
        SELECT duplicate.id
        FROM courses duplicate
        WHERE EXISTS (
          SELECT 1
          FROM courses original
          WHERE original.title = duplicate.title
            AND original.instructor = duplicate.instructor
            AND original.id < duplicate.id
        )
      )
    `);

    db.run('UPDATE courses SET rating = NULL, students = 0');

    const sampleCourses = [
      { title: 'JavaScript Essentials', description: 'Learn JavaScript fundamentals', price: 599, duration: '4 weeks', level: 'Beginner', instructor: 'Mr. Kumar' },
      { title: 'React.js Mastery', description: 'Complete React.js guide', price: 999, duration: '6 weeks', level: 'Intermediate', instructor: 'Jane Doe' },
      { title: 'HTML Basics', description: 'Web development fundamentals', price: 399, duration: '2 weeks', level: 'Beginner', instructor: 'John Smith' },
      { title: 'CSS Fundamentals', description: 'Master CSS styling', price: 499, duration: '3 weeks', level: 'Beginner', instructor: 'Sarah Johnson' },
      { title: 'Advanced Python', description: 'Python for data science', price: 1299, duration: '8 weeks', level: 'Advanced', instructor: 'Dr. Sharma' },
      { title: 'Web Design Masterclass', description: 'Professional UI/UX design', price: 899, duration: '5 weeks', level: 'Intermediate', instructor: 'Sarah Jenkins' }
    ];

    sampleCourses.forEach(course => {
      db.run(
        `INSERT INTO courses (title, description, price, duration, level, instructor, rating, students)
         SELECT ?, ?, ?, ?, ?, ?, NULL, 0
         WHERE NOT EXISTS (
           SELECT 1 FROM courses WHERE title = ? AND instructor = ?
         )`,
        [course.title, course.description, course.price, course.duration, course.level, course.instructor, course.title, course.instructor],
        (err) => {
          if (err) {
            console.error('Course seed skipped:', err.message);
          }
        }
      );
    });

    console.log('✅ Database initialized with tables and sample data');
  });
};

initializeDatabase();

const seedTrainerExtras = () => {
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
           WHERE NOT EXISTS (
             SELECT 1 FROM trainer_schedule
             WHERE trainer_id = ? AND title = ? AND start_time = ? AND end_time = ?
           )`,
          [id, item.title, item.start_time, item.end_time, item.day_label, id, item.title, item.start_time, item.end_time],
          (insertErr) => {
            if (insertErr) {
              console.error('Trainer schedule seed skipped:', insertErr.message);
            }
          }
        );
      });

      defaultTasks.forEach(item => {
        db.run(
          `INSERT INTO trainer_tasks (trainer_id, task, time)
           SELECT ?, ?, ?
           WHERE NOT EXISTS (
             SELECT 1 FROM trainer_tasks
             WHERE trainer_id = ? AND task = ? AND time = ?
           )`,
          [id, item.task, item.time, id, item.task, item.time],
          (insertErr) => {
            if (insertErr) {
              console.error('Trainer task seed skipped:', insertErr.message);
            }
          }
        );
      });
    });
  });
};

seedTrainerExtras();

// ============= AUTHENTICATION APIs =============

// Register Endpoint
app.post('/api/register', (req, res) => {
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

  // Hash password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: '❌ Server error!' });

    const skillsStr = skills ? skills.join(',') : '';
    db.run(
      'INSERT INTO users (name, email, phone, password, role, skills) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, hash, role, skillsStr],
      function(err) {
        if (err) {
          console.error('Registration failed:', err.message);
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: '❌ Email already registered!' });
          }
          return res.status(500).json({ error: '❌ Registration failed!' });
        }

        const userId = this.lastID;
        if (role === 'trainer') {
          seedTrainerExtras();
        }

        const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ 
          message: '✅ Registration successful!', 
          token, 
          user: { id: userId, name, email, role } 
        });
      }
    );
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
      res.json({ 
        message: '✅ Login successful!', 
        token, 
        user: { id: user.id, name: user.name, email: user.email, role: user.role } 
      });
    });
  });
});

// ============= COURSE APIs =============

// Get All Courses
app.get('/api/courses', (req, res) => {
  db.all(`${COURSE_SELECT_SQL} GROUP BY c.id ORDER BY c.created_at DESC, c.id DESC`, (err, courses) => {
    if (err) return res.status(500).json({ error: '❌ Failed to fetch courses!' });
    res.json(courses);
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

// ============= ENROLLMENT APIs =============

// Enroll in Course
app.post('/api/enrollments', (req, res) => {
  const { user_id, course_id } = req.body;

  if (!user_id || !course_id) {
    return res.status(400).json({ error: '❌ User ID and Course ID are required!' });
  }

  db.get(
    'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
    [user_id, course_id],
    (lookupErr, existingEnrollment) => {
      if (lookupErr) return res.status(500).json({ error: 'Enrollment failed!' });
      if (existingEnrollment) {
        return res.status(400).json({ error: 'Student is already enrolled in this course!' });
      }

      return db.run(
        'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
        [user_id, course_id],
        function(err) {
          if (err) return res.status(500).json({ error: 'Enrollment failed!' });
          res.status(201).json({ message: 'Enrolled successfully!' });
        }
      );
    }
  );
});

// Get User Enrollments
app.get('/api/enrollments/:userId', (req, res) => {
  const { userId } = req.params;

  db.all(
    `SELECT e.*, c.title, c.description, c.price, c.duration, c.level, c.instructor 
     FROM enrollments e 
     JOIN courses c ON e.course_id = c.id 
     WHERE e.user_id = ?`,
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

// Update Progress
app.put('/api/enrollments/:enrollmentId', (req, res) => {
  const { enrollmentId } = req.params;
  const { progress, status } = req.body;

  db.run(
    'UPDATE enrollments SET progress = ?, status = ? WHERE id = ?',
    [progress, status, enrollmentId],
    function(err) {
      if (err) return res.status(500).json({ error: '❌ Failed to update progress!' });

      // Auto-generate certificate if progress is 100%
      if (Number(progress) >= 100) {
        db.get('SELECT user_id, course_id FROM enrollments WHERE id = ?', [enrollmentId], (err, enrollment) => {
          if (enrollment) {
            db.run(
              'INSERT INTO certificates (user_id, course_id) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM certificates WHERE user_id = ? AND course_id = ?)',
              [enrollment.user_id, enrollment.course_id, enrollment.user_id, enrollment.course_id]
            );
          }
        });
      }

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

app.post('/api/submissions', (req, res) => {
  const { assignment_id, user_id, content } = req.body;
  if (!assignment_id || !user_id) return res.status(400).json({ error: 'Assignment ID and User ID are required' });

  db.run(
    'INSERT INTO submissions (assignment_id, user_id, content) VALUES (?, ?, ?)',
    [assignment_id, user_id, content],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to submit assignment' });
      res.status(201).json({ message: 'Assignment submitted', id: this.lastID });
    }
  );
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
    ORDER BY cl.scheduled_at ASC
  `;
  db.all(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch classes' });
    res.json(rows);
  });
});

// ============= CERTIFICATE APIs =============

app.get('/api/certificates/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT ce.*, co.title as course_title FROM certificates ce JOIN courses co ON co.id = ce.course_id WHERE ce.user_id = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch certificates' });
    res.json(rows);
  });
});

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
    `SELECT u.id, u.name, u.email, e.progress, e.status, e.enrolled_at
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

const AI_COURSES = [
  { id: 1, title: 'Python for Beginners', category: 'Programming', level: 'Beginner', duration: '6 weeks', rating: 4.8, students: 12400, icon: '🐍', topics: ['Variables', 'Loops', 'Functions', 'OOP', 'File Handling'], desc: 'Learn Python from scratch.' },
  { id: 2, title: 'Data Science with Python', category: 'Data Science', level: 'Intermediate', duration: '10 weeks', rating: 4.9, students: 9800, icon: '📊', topics: ['NumPy', 'Pandas', 'Matplotlib', 'Statistics', 'EDA'], desc: 'Master data analysis and visualization.' },
  { id: 3, title: 'Machine Learning A-Z', category: 'AI / ML', level: 'Intermediate', duration: '12 weeks', rating: 4.7, students: 15200, icon: '🤖', topics: ['Regression', 'Trees', 'SVM', 'Clustering', 'Evaluation'], desc: 'Build real ML models with Scikit-learn.' },
  { id: 4, title: 'Deep Learning & Neural Networks', category: 'AI / ML', level: 'Advanced', duration: '16 weeks', rating: 4.9, students: 7400, icon: '🧠', topics: ['CNN', 'RNN', 'LSTM', 'Transfer Learning'], desc: 'Neural networks with TensorFlow.' },
  { id: 5, title: 'Natural Language Processing', category: 'AI / ML', level: 'Advanced', duration: '10 weeks', rating: 4.8, students: 5600, icon: '💬', topics: ['Tokenization', 'NER', 'BERT', 'Text Classification'], desc: 'NLP with Python and Transformers.' },
  { id: 6, title: 'Python DSA & Algorithms', category: 'Computer Science', level: 'Intermediate', duration: '8 weeks', rating: 4.7, students: 11000, icon: '🧮', topics: ['Arrays', 'Trees', 'Graphs', 'DP', 'Sorting'], desc: 'Master DSA for coding interviews.' },
  { id: 7, title: 'Web Development Bootcamp', category: 'Web Development', level: 'Beginner', duration: '14 weeks', rating: 4.8, students: 22100, icon: '🌐', topics: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap', 'Node.js'], desc: 'Complete web development course.' },
  { id: 8, title: 'Advanced CSS & Animations', category: 'Web Development', level: 'Intermediate', duration: '5 weeks', rating: 4.6, students: 6700, icon: '🎨', topics: ['CSS Grid', 'Flexbox', 'Animations', 'SASS'], desc: 'Master modern CSS layouts.' },
  { id: 9, title: 'JavaScript: The Complete Guide', category: 'Web Development', level: 'Intermediate', duration: '8 weeks', rating: 4.9, students: 18900, icon: '⚡', topics: ['ES6+', 'DOM', 'Promises', 'Async/Await'], desc: 'Modern JavaScript deep dive.' },
  { id: 10, title: 'React.js for Frontend Devs', category: 'Web Development', level: 'Intermediate', duration: '8 weeks', rating: 4.8, students: 14600, icon: '⚛️', topics: ['Components', 'Hooks', 'Redux', 'React Router'], desc: 'Build UIs with React.' },
  { id: 11, title: 'Node.js & Express Backend', category: 'Web Development', level: 'Intermediate', duration: '7 weeks', rating: 4.7, students: 9200, icon: '🟢', topics: ['Node.js Core', 'REST APIs', 'Middleware', 'Auth'], desc: 'Backend APIs with Node.js.' },
  { id: 12, title: 'TypeScript for JS Developers', category: 'Web Development', level: 'Intermediate', duration: '5 weeks', rating: 4.7, students: 7800, icon: '🔷', topics: ['Types', 'Generics', 'Decorators', 'TS with React'], desc: 'Strong typing for JavaScript.' },
  { id: 13, title: 'Java Backend Development', category: 'Backend', level: 'Intermediate', duration: '10 weeks', rating: 4.7, students: 8300, icon: '☕', topics: ['Spring Boot', 'REST APIs', 'Spring Security', 'JPA'], desc: 'Backend with Java and Spring Boot.' },
  { id: 14, title: 'Java DSA & Algorithms', category: 'Computer Science', level: 'Intermediate', duration: '8 weeks', rating: 4.8, students: 11200, icon: '☕🧮', topics: ['Trees', 'Graphs', 'DP', 'Heaps'], desc: 'Java-based DSA for interviews.' },
  { id: 15, title: 'Java for Beginners', category: 'Programming', level: 'Beginner', duration: '6 weeks', rating: 4.6, students: 13500, icon: '☕🚀', topics: ['Syntax', 'OOP', 'Collections', 'Exception Handling'], desc: 'Start learning Java from zero.' },
  { id: 16, title: 'SQL & Database Design', category: 'Database', level: 'Beginner', duration: '5 weeks', rating: 4.6, students: 9900, icon: '🗄️', topics: ['SELECT', 'JOINs', 'Indexes', 'Normalization'], desc: 'SQL from basics to advanced queries.' },
  { id: 17, title: 'MongoDB for Developers', category: 'Database', level: 'Intermediate', duration: '4 weeks', rating: 4.5, students: 6100, icon: '🍃', topics: ['CRUD', 'Aggregations', 'Indexing', 'Mongoose'], desc: 'NoSQL database with MongoDB.' },
  { id: 18, title: 'Docker & Kubernetes', category: 'DevOps', level: 'Intermediate', duration: '6 weeks', rating: 4.8, students: 7200, icon: '🐳', topics: ['Dockerfiles', 'Compose', 'K8s Pods', 'Helm'], desc: 'Containerization and orchestration.' },
  { id: 19, title: 'AWS Cloud Practitioner', category: 'Cloud', level: 'Beginner', duration: '6 weeks', rating: 4.7, students: 10300, icon: '☁️', topics: ['EC2', 'S3', 'Lambda', 'IAM', 'RDS'], desc: 'AWS cloud fundamentals.' },
  { id: 20, title: 'Android with Kotlin', category: 'Mobile', level: 'Intermediate', duration: '10 weeks', rating: 4.7, students: 8800, icon: '📱', topics: ['Kotlin', 'RecyclerView', 'Retrofit', 'Room DB'], desc: 'Build Android apps with Kotlin.' },
  { id: 21, title: 'Flutter & Dart', category: 'Mobile', level: 'Intermediate', duration: '10 weeks', rating: 4.8, students: 9500, icon: '🦋', topics: ['Widgets', 'State Management', 'Firebase', 'Navigation'], desc: 'Cross-platform apps with Flutter.' },
  { id: 22, title: 'Cybersecurity Fundamentals', category: 'Cybersecurity', level: 'Beginner', duration: '6 weeks', rating: 4.6, students: 7600, icon: '🔒', topics: ['Encryption', 'Firewalls', 'Network Security', 'Ethical Hacking'], desc: 'Core cybersecurity concepts.' },
  { id: 23, title: 'UI/UX Design with Figma', category: 'Design', level: 'Beginner', duration: '7 weeks', rating: 4.7, students: 11400, icon: '🎭', topics: ['Wireframing', 'Prototyping', 'Design Systems', 'User Research'], desc: 'UI/UX design and Figma from scratch.' },
  { id: 24, title: 'Beginner Programming Fundamentals', category: 'Programming', level: 'Beginner', duration: '4 weeks', rating: 4.5, students: 30100, icon: '🚀', topics: ['Logic', 'Variables', 'Loops', 'Functions'], desc: 'Your first step into programming.' },
  { id: 25, title: 'Git & GitHub for Developers', category: 'Tools', level: 'Beginner', duration: '2 weeks', rating: 4.8, students: 25600, icon: '🐙', topics: ['Commit', 'Branching', 'Merging', 'Pull Requests'], desc: 'Master version control with Git.' }
];

function aiRecommend(input) {
  const normalizedInput = String(input || '').toLowerCase();
  const words = normalizedInput.split(/[\s,;+&|]+/).filter((word) => word.length > 1);
  const rules = {
    python: [1, 2, 3, 6, 4],
    'data science': [2, 3, 4, 5],
    'machine learning': [3, 4, 2, 5],
    ml: [3, 4, 2],
    'deep learning': [4, 3, 5],
    neural: [4, 3],
    tensorflow: [4, 3],
    ai: [3, 4, 5, 2],
    nlp: [5, 4, 3],
    bert: [5, 4],
    html: [7, 8, 9],
    css: [7, 8, 9],
    javascript: [9, 7, 10, 11],
    js: [9, 7, 10],
    react: [10, 9, 12],
    nodejs: [11, 9],
    node: [11, 9],
    express: [11, 9],
    typescript: [12, 9],
    web: [7, 9, 10, 11],
    frontend: [7, 8, 9, 10],
    backend: [11, 13, 16, 17],
    java: [13, 14, 15],
    spring: [13],
    kotlin: [20],
    android: [20, 21],
    sql: [16, 17],
    database: [16, 17],
    mongodb: [17, 11],
    nosql: [17],
    docker: [18, 19],
    kubernetes: [18],
    devops: [18, 19, 25],
    aws: [19, 18],
    cloud: [19, 18],
    mobile: [20, 21],
    flutter: [21],
    dart: [21],
    ios: [21],
    cybersecurity: [22],
    security: [22],
    hacking: [22],
    figma: [23],
    design: [23],
    ux: [23],
    ui: [23, 7],
    algorithms: [6, 14],
    dsa: [6, 14],
    beginner: [24, 1, 7, 15],
    git: [25],
    github: [25]
  };
  const scores = {};

  Object.entries(rules).forEach(([phrase, ids]) => {
    if (normalizedInput.includes(phrase)) {
      ids.forEach((id, index) => {
        scores[id] = (scores[id] || 0) + ids.length - index + 3;
      });
    }
  });

  words.forEach((word) => {
    Object.entries(rules).forEach(([phrase, ids]) => {
      if (phrase === word || phrase.includes(word) || word.includes(phrase)) {
        ids.forEach((id, index) => {
          scores[id] = (scores[id] || 0) + ids.length - index + 1;
        });
      }
    });
  });

  if (!Object.keys(scores).length) {
    return AI_COURSES.filter((course) => course.level === 'Beginner').slice(0, 4);
  }

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id]) => AI_COURSES.find((course) => course.id === Number(id)))
    .filter(Boolean);
}

function aiRuleBasedAnswer(question, courseContext) {
  const normalizedQuestion = String(question || '').toLowerCase();

  if (normalizedQuestion.includes('variable')) {
    return 'A **variable** stores a value. Example: `x = 10` stores the value `10` in `x`.';
  }
  if (normalizedQuestion.includes('loop') || normalizedQuestion.includes('for loop') || normalizedQuestion.includes('while')) {
    return 'A **loop** repeats code:\n\n```python\nfor i in range(5):\n    print(i)\n```';
  }
  if (normalizedQuestion.includes('function') || normalizedQuestion.includes('def ')) {
    return 'A **function** is reusable code:\n\n```python\ndef greet(name):\n    return "Hello, " + name\n```';
  }
  if (normalizedQuestion.includes('class') || normalizedQuestion.includes('oop')) {
    return '**OOP** groups behavior inside classes:\n\n```python\nclass Dog:\n    def __init__(self, name):\n        self.name = name\n```';
  }
  if (normalizedQuestion.includes('git') || normalizedQuestion.includes('github')) {
    return '**Git basics:**\n```bash\ngit init\ngit add .\ngit commit -m "message"\ngit push origin main\n```';
  }
  if (courseContext?.title) {
    return `Good question about **${courseContext.title}**. Share what you tried or the exact error so I can help more precisely.`;
  }

  return 'Share what you want to do, what you tried, and any error message, and I will help break it down.';
}

app.post('/api/recommend', (req, res) => {
  const skills = String(req.body.skills || req.body.query || '').trim();
  if (!skills) {
    return res.status(400).json({ error: 'Skills or interests are required.' });
  }

  res.json({
    success: true,
    recommendations: aiRecommend(skills)
  });
});

app.post('/api/ask-doubt', async (req, res) => {
  const { question, courseContext, history } = req.body;
  if (!String(question || '').trim()) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  const contextNote = courseContext?.title
    ? `The student is studying "${courseContext.title}" (${courseContext.category}, ${courseContext.level}). Topics: ${(courseContext.topics || []).join(', ')}.`
    : 'The student is using a programming learning platform.';

  const systemPrompt = `You are a friendly programming tutor. ${contextNote} Answer clearly, be beginner-friendly, and use code examples when they help.`;
  const messages = Array.isArray(history)
    ? history.slice(-6).map((message) => ({ role: message.role, content: message.content }))
    : [];

  messages.push({ role: 'user', content: question });

  if (!process.env.ANTHROPIC_API_KEY || typeof fetch !== 'function') {
    return res.json({ success: true, answer: aiRuleBasedAnswer(question, courseContext), fallback: true });
  }

  try {
    const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages
      })
    });

    if (!apiResponse.ok) {
      if (apiResponse.status === 401 || apiResponse.status === 403) {
        return res.json({ success: true, answer: aiRuleBasedAnswer(question, courseContext), fallback: true });
      }
      return res.status(500).json({ error: 'AI service error.' });
    }

    const data = await apiResponse.json();
    return res.json({
      success: true,
      answer: data.content?.[0]?.text || 'Sorry, I could not generate a response right now.'
    });
  } catch (error) {
    return res.json({ success: true, answer: aiRuleBasedAnswer(question, courseContext), fallback: true });
  }
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
