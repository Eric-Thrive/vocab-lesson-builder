#!/bin/bash

# Script to check if your app is ready for Netlify deployment

echo "🔍 Checking Deployment Readiness..."
echo ""

# Check if netlify.toml exists
if [ -f "netlify.toml" ]; then
  echo "✅ netlify.toml found"
else
  echo "❌ netlify.toml missing"
fi

# Check if .env exists
if [ -f ".env" ]; then
  echo "✅ .env file found"
  
  # Check for required variables
  if grep -q "VITE_GOOGLE_API_KEY" .env; then
    echo "  ✅ Google API key configured"
  else
    echo "  ❌ Google API key missing"
  fi
  
  if grep -q "VITE_GITHUB_TOKEN" .env; then
    echo "  ✅ GitHub token configured"
  else
    echo "  ⚠️  GitHub token not configured (optional for local)"
  fi
else
  echo "❌ .env file missing"
fi

# Check if public/lessons exists
if [ -d "public/lessons" ]; then
  echo "✅ public/lessons folder exists"
  LESSON_COUNT=$(ls -1 public/lessons/*.json 2>/dev/null | wc -l)
  echo "  📚 $LESSON_COUNT lesson file(s) found"
else
  echo "❌ public/lessons folder missing"
fi

# Check if package.json has build script
if grep -q '"build"' package.json; then
  echo "✅ Build script found in package.json"
else
  echo "❌ Build script missing in package.json"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
  echo "✅ Dependencies installed"
else
  echo "⚠️  Dependencies not installed (run: npm install)"
fi

# Try to build
echo ""
echo "🔨 Testing build..."
if npm run build > /dev/null 2>&1; then
  echo "✅ Build successful!"
  
  # Check if dist folder was created
  if [ -d "dist" ]; then
    echo "✅ dist folder created"
    DIST_SIZE=$(du -sh dist | cut -f1)
    echo "  📦 Build size: $DIST_SIZE"
  fi
else
  echo "❌ Build failed (run: npm run build to see errors)"
fi

echo ""
echo "📋 Summary:"
echo "─────────────────────────────────────"

# Check git status
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo "✅ Git repository initialized"
  
  REMOTE=$(git remote get-url origin 2>/dev/null)
  if [ ! -z "$REMOTE" ]; then
    echo "✅ GitHub remote configured: $REMOTE"
  else
    echo "❌ GitHub remote not configured"
  fi
  
  # Check if there are uncommitted changes
  if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No uncommitted changes"
  else
    echo "⚠️  Uncommitted changes detected"
    echo "   Run: git add . && git commit -m 'message' && git push"
  fi
else
  echo "❌ Not a git repository"
fi

echo ""
echo "🚀 Next Steps:"
echo "─────────────────────────────────────"
echo "1. Go to: https://app.netlify.com/signup"
echo "2. Sign up with GitHub"
echo "3. Import your repository: vocab-lesson-builder"
echo "4. Deploy settings:"
echo "   - Build command: npm run build"
echo "   - Publish directory: dist"
echo "5. Add environment variable in Netlify:"
echo "   - VITE_GOOGLE_API_KEY = (your API key)"
echo ""
echo "📖 See NETLIFY_SETUP.md for detailed instructions"
