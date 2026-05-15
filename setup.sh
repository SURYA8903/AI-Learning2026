#!/bin/bash

# E-Learning Platform - Automatic Setup Script
# This script automates the installation and configuration process

set -e  # Exit on error

echo "============================================"
echo "🎓 E-Learning Platform Setup"
echo "============================================"
echo ""

# Check if Node.js is installed
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js $(node --version) found"
echo "✅ npm $(npm --version) found"
echo ""

# Create .env file if it doesn't exist
echo "📝 Setting up environment configuration..."
if [ ! -f "server/.env" ]; then
    echo "Creating server/.env from template..."
    cp server/.env.example server/.env
    
    echo ""
    echo "⚠️  IMPORTANT: Edit server/.env with your configuration:"
    echo "   - MONGO_URI: MongoDB connection string"
    echo "   - RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET"
    echo "   - Google API credentials"
    echo "   - Email configuration"
    echo ""
    
    echo "Press Enter when you've updated server/.env, or Ctrl+C to cancel..."
    read -r
else
    echo "✅ server/.env already exists"
fi

if [ ! -f "client/.env" ]; then
    echo "Creating client/.env..."
    cat > client/.env << EOF
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_RAZORPAY_KEY_ID=your_test_key
EOF
    echo "✅ client/.env created"
else
    echo "✅ client/.env already exists"
fi

echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..
echo "✅ Backend dependencies installed"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..
echo "✅ Frontend dependencies installed"
echo ""

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs
echo "✅ Logs directory created"
echo ""

# Summary
echo "============================================"
echo "✅ Setup Complete!"
echo "============================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Start Backend:"
echo "   cd server"
echo "   npm run dev"
echo ""
echo "2️⃣  Start Frontend (in another terminal):"
echo "   cd client"
echo "   npm start"
echo ""
echo "3️⃣  Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:3000/api"
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: SETUP_GUIDE.md"
echo "   - API Docs: API_DOCUMENTATION.md"
echo "   - README: README.md"
echo ""
echo "✨ Happy coding! 🚀"
echo ""
