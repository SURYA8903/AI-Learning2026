@echo off
REM E-Learning Platform - Automatic Setup Script for Windows

echo.
echo ============================================
echo 🎓 E-Learning Platform Setup
echo ============================================
echo.

REM Check if Node.js is installed
echo 📋 Checking prerequisites...
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js v14 or higher.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js %NODE_VERSION% found
echo ✅ npm %NPM_VERSION% found
echo.

REM Create .env file if it doesn't exist
echo 📝 Setting up environment configuration...
if not exist "server\.env" (
    echo Creating server\.env from template...
    copy server\.env.example server\.env
    
    echo.
    echo ⚠️  IMPORTANT: Edit server\.env with your configuration:
    echo    - MONGO_URI: MongoDB connection string
    echo    - RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
    echo    - Google API credentials
    echo    - Email configuration
    echo.
    
    echo Press any key when you've updated server\.env...
    pause
) else (
    echo ✅ server\.env already exists
)

if not exist "client\.env" (
    echo Creating client\.env...
    (
        echo REACT_APP_API_URL=http://localhost:5000/api
        echo REACT_APP_RAZORPAY_KEY_ID=your_test_key
    ) > client\.env
    echo ✅ client\.env created
) else (
    echo ✅ client\.env already exists
)

echo.

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd server
call npm install
cd ..
echo ✅ Backend dependencies installed
echo.

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd client
call npm install
cd ..
echo ✅ Frontend dependencies installed
echo.

REM Create logs directory
echo 📁 Creating logs directory...
if not exist "logs" mkdir logs
echo ✅ Logs directory created
echo.

REM Summary
echo ============================================
echo ✅ Setup Complete!
echo ============================================
echo.
echo 📋 Next Steps:
echo.
echo 1️⃣  Start Backend:
echo    cd server
echo    npm run dev
echo.
echo 2️⃣  Start Frontend (in another terminal):
echo    cd client
echo    npm start
echo.
echo 3️⃣  Access the application:
echo    Frontend: http://localhost:3000
echo    API: http://localhost:5000/api
echo.
echo 📚 Documentation:
echo    - Setup Guide: SETUP_GUIDE.md
echo    - API Docs: API_DOCUMENTATION.md
echo    - README: README.md
echo.
echo ✨ Happy coding! 🚀
echo.

pause
