#!/bin/bash

# GitHub Push Helper Script
# Usage: ./push-to-github.sh <repository-url>

if [ $# -eq 0 ]; then
    echo "❌ Error: Repository URL is required"
    echo ""
    echo "Usage: ./push-to-github.sh <repository-url>"
    echo ""
    echo "Example:"
    echo "  ./push-to-github.sh https://github.com/yourusername/personal-fitness-tracker.git"
    echo ""
    echo "Steps to get repository URL:"
    echo "1. Go to GitHub.com"
    echo "2. Click '+' → 'New repository'"
    echo "3. Name: personal-fitness-tracker"
    echo "4. Description: Personal Fitness Tracker - MLH Fellowship Code Sample"
    echo "5. Make it Public"
    echo "6. DO NOT initialize with README/gitignore/license"
    echo "7. Click 'Create repository'"
    echo "8. Copy the repository URL from the page"
    exit 1
fi

REPO_URL=$1

echo "🚀 Pushing Personal Fitness Tracker to GitHub..."
echo "Repository: $REPO_URL"
echo ""

# Add remote origin
echo "📡 Adding remote origin..."
git remote add origin "$REPO_URL"

if [ $? -eq 0 ]; then
    echo "✅ Remote origin added successfully"
else
    echo "❌ Failed to add remote origin"
    echo "This might mean the remote already exists. Trying to update..."
    git remote set-url origin "$REPO_URL"
fi

# Push to GitHub
echo "⬆️ Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your Personal Fitness Tracker has been pushed to GitHub!"
    echo ""
    echo "📋 Repository Details:"
    echo "   URL: $REPO_URL"
    echo "   Branch: main"
    echo "   Files: $(git ls-files | wc -l | xargs) files committed"
    echo ""
    echo "🎯 For MLH Fellowship Application:"
    echo "   1. Copy the repository URL: $REPO_URL"
    echo "   2. Submit this as your code sample"
    echo "   3. The README.md explains the project thoroughly"
    echo "   4. TECHNICAL_DOCS.md provides detailed technical information"
    echo ""
    echo "✨ Your fitness tracker is now live on GitHub!"
else
    echo "❌ Failed to push to GitHub"
    echo "Please check:"
    echo "  - Repository URL is correct"
    echo "  - You have write access to the repository"
    echo "  - Your GitHub credentials are configured"
    echo ""
    echo "To configure Git credentials:"
    echo "  git config --global user.name 'Your Name'"
    echo "  git config --global user.email 'your.email@example.com'"
fi
