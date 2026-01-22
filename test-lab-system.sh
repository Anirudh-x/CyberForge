#!/bin/bash

echo "🔧 CyberForge Lab System - Quick Test"
echo "======================================"
echo ""

# Check if Docker is running
echo "1. Checking Docker..."
if ! docker ps > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker Desktop."
  exit 1
fi
echo "✅ Docker is running"
echo ""

# Check if servers are running
echo "2. Checking Frontend (port 3000)..."
if curl -s http://localhost:3000 > /dev/null; then
  echo "✅ Frontend is running"
else
  echo "❌ Frontend is not running. Run: npm run dev"
fi
echo ""

echo "3. Checking Backend (port 5000)..."
if curl -s http://localhost:5000/api/challenges/leaderboard > /dev/null; then
  echo "✅ Backend is running"
else
  echo "❌ Backend is not running. Run: npm run server"
fi
echo ""

# Check module structure
echo "4. Checking modules..."
MODULES=("web/sql_injection" "web/xss" "web/auth_bypass" "red_team/weak_ssh" "red_team/privilege_escalation" "blue_team/log_analysis" "cloud/exposed_secrets" "forensics/hidden_files")

for module in "${MODULES[@]}"; do
  if [ -f "modules/$module/Dockerfile" ] && [ -f "modules/$module/metadata.json" ]; then
    echo "✅ $module"
  else
    echo "❌ $module (missing files)"
  fi
done
echo ""

echo "5. Testing module build (sql_injection)..."
if docker build -t test-cyberforge-sql modules/web/sql_injection > /dev/null 2>&1; then
  echo "✅ Module builds successfully"
  docker rmi test-cyberforge-sql > /dev/null 2>&1
else
  echo "❌ Module build failed"
fi
echo ""

echo "======================================"
echo "📋 Next Steps:"
echo ""
echo "1. Open http://localhost:3000"
echo "2. Register/Login"
echo "3. Go to Machine Builder"
echo "4. Select a domain (e.g., Web Security)"
echo "5. Drag modules (e.g., SQL Injection)"
echo "6. Create machine"
echo "7. Wait 30-60 seconds for build"
echo "8. Go to My Machines"
echo "9. Click 'SOLVE LAB' button"
echo "10. Hack the lab! 🚀"
echo ""
echo "======================================"
