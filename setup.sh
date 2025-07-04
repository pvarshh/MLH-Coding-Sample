#!/bin/bash

echo "🏃‍♂️ Setting up Personal Fitness Tracker..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create database directory if it doesn't exist
mkdir -p database

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  npm start     - Start the production server"
echo "  npm run dev   - Start the development server with auto-reload"
echo "  npm test      - Run tests"
echo ""
echo "The application will be available at http://localhost:3000"
echo ""
echo "Happy tracking! 💪"
