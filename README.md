# Adz4Needz Learning Platform

Full-stack learning platform with separate dashboards for students, trainers, and admins.

## Requirements

- Node.js 18 or newer
- npm

## Install

```bash
npm install
```

## Run

```bash
npm start
```

The server starts on `http://localhost:3000`.

## How To Use

1. Open `http://localhost:3000` in your browser.
2. Register or log in as a `student`, `trainer`, or `admin`.
3. After login, you will be redirected to the correct dashboard.

## Notes

- Data is stored in `database.db` using SQLite.
- Tables are created automatically on startup.
- Sample courses are seeded automatically if they do not already exist.
- Duplicate seeded courses are cleaned up on startup.
- Student todos are saved through the backend API.
- Admin settings are saved in the `admin_settings` table.

## Main Files

- `server.js` - Express server and API routes
- `public/index.html` - login and registration page
- `public/student-dashboard.html` - student dashboard
- `public/trainer-dashboard.html` - trainer dashboard
- `public/admin-dashboard.html` - admin dashboard
