# 🚀 CyberForge - Complete Setup Guide & Troubleshooting

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup Steps](#initial-setup-steps)
3. [Running the Project](#running-the-project)
4. [Common Problems & Solutions](#common-problems--solutions)
5. [Database Issues](#database-issues)
6. [Docker Issues](#docker-issues)
7. [Module-Specific Issues](#module-specific-issues)
8. [Development Tips](#development-tips)

---

## Prerequisites

### Required Software
- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+ (comes with Node.js)
- **MongoDB**: v6+ (running locally or connection string)
- **Docker**: Latest stable version
- **Git**: Latest version

### Check Installations
```bash
node --version    # Should be v18+
npm --version     # Should be v9+
docker --version  # Should be 20+
mongod --version  # Should be v6+
git --version
```

---

## Initial Setup Steps

### 1. Clone the Repository
```bash
git clone https://github.com/Anirudh-x/CyberForge.git
cd CyberForge
```

### 2. Checkout the Fixed Branch
```bash
git checkout fix/flag-submission-and-template-flags
```

### 3. Install Dependencies
```bash
# Install all dependencies (frontend + backend)
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
# .env file
PORT=5000
MONGODB_URI=mongodb://localhost:27017/test
NODE_ENV=development
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:5173
```

### 5. Start MongoDB
```bash
# On macOS (using Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# Verify MongoDB is running
mongosh
# You should connect successfully
```

### 6. Clean and Setup Database
```bash
# Run the database cleanup script (IMPORTANT - do this first time)
node fix-db-complete.js

# This will:
# - Drop all problematic indexes
# - Clean the database
# - Prepare it for first use
```

### 7. Start Docker
```bash
# Make sure Docker Desktop is running
docker ps
# Should show running containers (or empty list is fine)
```

---

## Running the Project

### Start Backend Server
```bash
# From project root
npm run server

# You should see:
# Server is running on port 5000
# Environment: development
# MongoDB connected successfully
```

### Start Frontend (in a new terminal)
```bash
# From project root (same directory)
npm run dev

# You should see:
# VITE v5.x.x ready in XXXms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## Common Problems & Solutions

### ❌ Problem 1: MongoDB Connection Error
**Error Message:**
```
MongoServerError: connection refused
```

**Solutions:**
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB

# Check MongoDB status
brew services list | grep mongodb
```

---

### ❌ Problem 2: Duplicate Key Error (vulnerabilityInstanceId)
**Error Message:**
```
E11000 duplicate key error collection: test.machines 
index: vulnerabilities.vulnerabilityInstanceId_1 
dup key: { vulnerabilities.vulnerabilityInstanceId: null }
```

**Solution:**
```bash
# Stop the server first (Ctrl+C)

# Run the database fix script
node fix-db-complete.js

# Restart the server
npm run server
```

**Why this happens:**
- Old database indexes are preventing new machines from being created
- The script drops all problematic indexes and cleans the database

---

### ❌ Problem 3: Port Already in Use
**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
or
Port 5173 is in use, trying another one...
```

**Solutions:**
```bash
# For Backend (Port 5000)
# Find what's using port 5000
lsof -i :5000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or kill all node processes
pkill -9 node

# Restart server
npm run server

# For Frontend (Port 5173)
# Find what's using port 5173
lsof -i :5173

# Kill the process
kill -9 PID

# Restart dev server
npm run dev
```

**Alternative: Change Port**
Edit `.env` file:
```
PORT=5001
```

For frontend, Vite will automatically try the next available port.

---

### ❌ Problem 4: Docker Container Won't Start
**Error Message:**
```
Error running Docker container
Container failed to start
```

**Solutions:**

**1. Check Docker is Running**
```bash
docker ps
# If error, start Docker Desktop
```

**2. Check for Port Conflicts**
```bash
# Check if port 8000-8100 range is available
lsof -i :8000
lsof -i :8001
# Kill processes if needed
```

**3. Clean Up Old Containers**
```bash
# List all containers
docker ps -a

# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Nuclear option - remove everything
docker system prune -a -f
```

**4. Rebuild Docker Image**
```bash
# Delete specific image
docker rmi cyberforge-web-sql_injection:latest
docker rmi cyberforge-web-xss:latest

# Next machine creation will rebuild the image
```

---

### ❌ Problem 5: npm Install Fails
**Error Message:**
```
npm ERR! code ENOENT
npm ERR! syscall open
```

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still fails, try with legacy peer deps
npm install --legacy-peer-deps
```

---

### ❌ Problem 6: Machine Creation Fails Silently
**Error:** Machine shows "building" status forever

**Solutions:**

**1. Check Backend Logs**
Look for errors in the terminal running `npm run server`

**2. Check Docker Logs**
```bash
# List containers
docker ps

# Check logs (replace container_id)
docker logs container_id
```

**3. Verify Module Files Exist**
```bash
# Check if module exists
ls modules/web/sql_injection/
# Should see: Dockerfile, app.js, metadata.json

# Check metadata.json is valid
cat modules/web/sql_injection/metadata.json | jq
```

**4. Manual Docker Build Test**
```bash
cd modules/web/sql_injection
docker build -t test-image .
# Check for build errors
```

---

### ❌ Problem 7: Flag Submission Not Working
**Error:** "Incorrect flag" even with correct flag

**Solutions:**

**1. Check Database Flags**
```bash
# Run diagnostic script
node diagnose.js

# Look for the flag in output
# Should show: FLAG{SQL_INJECTION_MASTER}
# NOT: FLAG{SQL_INJECTION_ABC123...}
```

**2. Check Container Flag**
```bash
# Get container ID
docker ps

# Check environment variables in container
docker exec container_id env | grep FLAG

# Should see template flag:
# FLAG{SQL_INJECTION_MASTER}
```

**3. Check Metadata Files**
```bash
# Verify template flags are in metadata
cat modules/web/sql_injection/metadata.json | grep flag
cat modules/web/xss/metadata.json | grep flag

# Should show hardcoded flags like:
# "flag": "FLAG{SQL_INJECTION_MASTER}"
```

**4. Check Backend Logs**
When you submit a flag, backend should log:
```
🔍 Flag Verification Request:
   Submitted Flag: FLAG{SQL_INJECTION_MASTER}
   Expected Flag: FLAG{SQL_INJECTION_MASTER}
   Flags Match: true
```

If flags don't match, you may have an old machine. Delete it and create a new one.

---

### ❌ Problem 8: Cannot Access Machine URL
**Error:** http://localhost:8001 shows "can't connect"

**Solutions:**

**1. Check Container is Running**
```bash
docker ps
# Look for your machine container
```

**2. Check Port Mapping**
```bash
docker port container_id
# Should show: 3000/tcp -> 0.0.0.0:8001
```

**3. Check Container Logs**
```bash
docker logs container_id
# Look for startup errors
```

**4. Restart Container**
```bash
docker restart container_id
# Wait 2-3 seconds, then try accessing again
```

---

### ❌ Problem 9: XSS Module Not Showing Flag
**Error:** Flag is hidden even after XSS execution

**Solution:**
This is fixed in the current branch. The flag now shows in a green pulsing box.

**Verify Fix:**
```bash
# Check XSS module has updated code
cat modules/web/xss/app.js | grep -A 5 "flag-box"

# Should see CSS for styled flag display
```

**Rebuild Docker Image:**
```bash
# Delete old image
docker rmi cyberforge-web-xss:latest

# Create new machine
# Image will be rebuilt with new code
```

---

### ❌ Problem 10: Frontend Build Errors
**Error Message:**
```
Error: Cannot find module 'lucide-react'
or
Failed to resolve import "react-router-dom"
```

**Solutions:**
```bash
# Install missing dependencies
npm install lucide-react react-router-dom

# If still issues, reinstall all
rm -rf node_modules package-lock.json
npm install

# Start dev server
npm run dev
```

---

## Database Issues

### Reset Database Completely
```bash
# Stop server first (Ctrl+C)

# Connect to MongoDB
mongosh

# Switch to database
use test

# Drop entire database
db.dropDatabase()

# Exit
exit

# Run cleanup script
node fix-db-complete.js

# Restart server
npm run server
```

### Check Database Collections
```bash
mongosh

use test

# Show all collections
show collections

# Check machines
db.machines.find().pretty()

# Check users
db.users.find().pretty()

# Count documents
db.machines.countDocuments()
```

### View Specific Machine
```bash
mongosh

use test

# Find machine by name
db.machines.find({ name: "Your Machine Name" }).pretty()

# Check vulnerabilities array
db.machines.find(
  { name: "Your Machine Name" }, 
  { vulnerabilities: 1 }
).pretty()
```

---

## Docker Issues

### Docker Not Starting Containers
```bash
# Check Docker daemon
docker info

# Restart Docker
# macOS: Restart Docker Desktop app
# Linux:
sudo systemctl restart docker

# Check available resources
docker system df
```

### Clean Up Docker Completely
```bash
# Stop all containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)

# Remove all images
docker rmi $(docker images -q) -f

# Remove all volumes
docker volume prune -f

# Remove all networks
docker network prune -f

# Remove everything
docker system prune -a -f --volumes
```

### Check Docker Logs
```bash
# Real-time logs
docker logs -f container_id

# Last 100 lines
docker logs --tail 100 container_id

# Logs with timestamps
docker logs --timestamps container_id
```

---

## Module-Specific Issues

### SQL Injection Module
**Flag:** `FLAG{SQL_INJECTION_MASTER}`

**Test Payload:**
```sql
' OR '1'='1
```

**Expected Behavior:**
- Login page at http://localhost:XXXX
- Use payload in username field
- Flag displays on success page

**Troubleshooting:**
```bash
# Check module files
ls modules/web/sql_injection/
# Should have: app.js, Dockerfile, metadata.json, package.json

# Check app.js reads flag correctly
cat modules/web/sql_injection/app.js | grep "FLAG"
# Should see: const FLAG = process.env.FLAG_SQL_INJECTION || 'FLAG{SQL_INJECTION_MASTER}'
```

### XSS Module
**Flag:** `FLAG{XSS_EXECUTED}`

**Test Payload:**
```html
<script>alert('XSS')</script>
```

**Expected Behavior:**
- Comment form at http://localhost:XXXX
- Enter XSS payload
- Flag shows in green pulsing box

**Troubleshooting:**
```bash
# Verify updated code
cat modules/web/xss/app.js | grep -A 10 "flag-box"

# Should see CSS styling for flag display

# Rebuild if needed
docker rmi cyberforge-web-xss:latest
```

---

## Development Tips

### Running in Development Mode
```bash
# Backend with auto-restart (install nodemon if needed)
npm install -g nodemon
nodemon server/index.js

# Frontend with hot reload (already configured with Vite)
npm run dev
```

### Debugging

**Enable Verbose Logging:**
Edit `server/index.js` and set:
```javascript
mongoose.set('debug', true);
```

**Check All Logs:**
```bash
# Backend logs: Already visible in terminal running npm run server

# Frontend logs: Open browser DevTools (F12) → Console tab

# Docker logs: docker logs container_id

# MongoDB logs (macOS): 
tail -f /usr/local/var/log/mongodb/mongo.log
```

**Test API Endpoints:**
```bash
# Test flag submission
curl -X POST http://localhost:5000/api/flags/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "machineId": "MACHINE_ID",
    "vulnerabilityInstanceId": "INSTANCE_ID",
    "flag": "FLAG{SQL_INJECTION_MASTER}"
  }'
```

### Creating New Modules

**1. Directory Structure:**
```
modules/web/new_module/
├── Dockerfile
├── app.js
├── metadata.json
└── package.json
```

**2. metadata.json Template:**
```json
{
  "name": "Module Name",
  "description": "Module description",
  "difficulty": "medium",
  "points": 100,
  "port": 3000,
  "solve_method": "gui",
  "route": "/",
  "flag": "FLAG{YOUR_TEMPLATE_FLAG}",
  "solution": {
    "explanation": "How to solve",
    "steps": [
      "Step 1",
      "Step 2"
    ],
    "payload": "exploit code"
  }
}
```

**3. app.js Template:**
```javascript
const FLAG = process.env.FLAG_NEW_MODULE || 'FLAG{YOUR_TEMPLATE_FLAG}';
console.log('FLAG initialized:', FLAG);
```

---

## Quick Reference Commands

### Start Everything
```bash
# Terminal 1: MongoDB (if not auto-started)
brew services start mongodb-community

# Terminal 2: Backend
cd CyberForge
npm run server

# Terminal 3: Frontend (in same project directory)
npm run dev

# Terminal 4: Docker
# (Docker Desktop should be running)
```

### Stop Everything
```bash
# Stop backend: Ctrl+C in Terminal 2
# Stop frontend: Ctrl+C in Terminal 3

# Stop MongoDB
brew services stop mongodb-community

# Stop all Docker containers
docker stop $(docker ps -aq)
```

### Clean Start (when things are broken)
```bash
# 1. Stop everything
pkill -9 node
docker stop $(docker ps -aq)

# 2. Clean database
node fix-db-complete.js

# 3. Clean Docker
docker system prune -a -f

# 4. Restart
npm run server
# (in new terminal) npm run dev
```

---

## Getting Help

### Check Logs First
1. Backend terminal output (where npm run server is running)
2. Frontend DevTools console (F12 in browser)
3. Docker logs: `docker logs container_id`
4. MongoDB logs (if needed)

### Common Log Locations
- **Backend**: Terminal where `npm run server` is running
- **Frontend**: Browser DevTools (F12) → Console tab
- **MongoDB**: `/usr/local/var/log/mongodb/mongo.log` (macOS)
- **Docker**: `docker logs container_id`

### Still Stuck?
1. Check GitHub Issues: https://github.com/Anirudh-x/CyberForge/issues
2. Create new issue with:
   - Error message (full text)
   - Steps to reproduce
   - Your OS and software versions
   - Relevant log output

---

## Maintenance Scripts

### Included Utility Scripts

**fix-db-complete.js** - Complete database cleanup
```bash
node fix-db-complete.js
```
- Drops all indexes except _id
- Deletes all machines
- Prepares database for fresh start

**diagnose.js** - Check machine flags in database
```bash
node diagnose.js
```
- Shows all machines and their flags
- Helps verify if template flags are being used

**drop-old-index.js** - Drop specific problematic indexes
```bash
node drop-old-index.js
```
- Drops only vulnerability-related indexes

**check-flags.js** - Verify flags in system
```bash
node check-flags.js
```
- Shows what flags are configured

---

## Success Checklist

✅ MongoDB is running and accessible
✅ Backend server starts without errors on port 5000
✅ Frontend dev server starts successfully on port 5173
✅ Docker Desktop is running
✅ Can create a new machine without errors
✅ Machine status changes from "building" to "running"
✅ Can access machine URL (http://localhost:XXXX)
✅ Can exploit vulnerability and see flag
✅ Can submit flag and get points
✅ No duplicate key errors in logs

---

## Version Information

**Current Branch:** `fix/flag-submission-and-template-flags`

**Key Changes in This Branch:**
- Fixed MongoDB duplicate key error
- Implemented template flags from metadata.json
- Added comprehensive debug logging
- Enhanced XSS module with visible flag display
- Removed problematic auto-indexing
- Added database cleanup scripts

**Breaking Changes:**
- Old machines in database may not work (delete and recreate)
- Docker images should be rebuilt (automatic on machine creation)
- Database indexes changed (run fix-db-complete.js)

---

## Project Structure

```
CyberForge/
├── src/                    # Frontend source (React + Vite)
│   ├── components/        # React components
│   ├── pages/            # Page components
│   └── styles/           # CSS files
├── server/                # Backend source (Node.js + Express)
│   ├── config/           # Configuration files
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   └── utils/            # Utility functions
├── modules/              # Challenge modules
│   ├── web/             # Web security challenges
│   ├── cloud/           # Cloud security challenges
│   └── ...              # Other categories
├── package.json         # Dependencies
├── .env                 # Environment variables
└── fix-db-complete.js  # Database cleanup script
```

---

## Need More Help?

**Documentation:**
- README.md - Project overview
- CONTRIBUTING.md - Development guidelines (if available)
- This file - Setup and troubleshooting

**Contact:**
- GitHub Issues: https://github.com/Anirudh-x/CyberForge/issues
- Project Repository: https://github.com/Anirudh-x/CyberForge

---

**Last Updated:** January 26, 2026  
**Document Version:** 1.1  
**Tested On:** macOS (Apple Silicon & Intel), Linux (Ubuntu 22.04)
