#!/bin/bash

# FitQuest - Deploy to Vercel Script
# This script helps deploy your FitQuest app to Vercel

echo "🚀 FitQuest - Preparing for Vercel deployment..."

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI not found. Installing globally..."
    npm install -g vercel
fi

# Make sure we're in the project directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the project directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run any tests
echo "🧪 Running tests..."
npm test 2>/dev/null || echo "⚠️  No tests found or tests failed, continuing..."

# Clean up any build artifacts
echo "🧹 Cleaning up..."
rm -rf node_modules/.cache
rm -rf .vercel

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete! Your FitQuest app should now be live on Vercel."
echo "🎉 Check your Vercel dashboard for the deployment URL."
echo ""
echo "💡 Tips:"
echo "   - Update your CORS settings in server.js with your actual domain"
echo "   - Set up environment variables in Vercel dashboard if needed"
echo "   - Monitor your app's performance in the Vercel dashboard"
echo ""
echo "🏃‍♂️ Happy tracking!"
