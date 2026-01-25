# 🚀 QUICK START: Testing Multi-Vulnerability Deployment

## ⚡ TL;DR
The system now deploys ALL vulnerabilities in ONE container. No more fake metadata-only modules.

---

## 🧪 TEST STEPS

### 1. Start Servers
```bash
# Terminal 1: Backend
cd /Users/ashwingajbhiye/Desktop/CyberForge/CyberForge
npm run server

# Terminal 2: Frontend
npm run dev
```

### 2. Create Test Machine

1. **Open Browser:** http://localhost:3000
2. **Login/Register** if needed
3. **Navigate to Machine Builder:** Click "CREATE NEW MACHINE" or go to `/machine-builder`
4. **Configure Machine:**
   - Name: "Multi Vuln Test"
   - Domain: Web
   - Select modules: **SQL Injection + XSS + CSRF** (click all three)
5. **Click "Deploy Machine"**

### 3. Verify Deployment

#### A. Check Docker Container Count
```bash
docker ps --filter "name=cyberforge"
```
**Expected:** ONLY 1 container (not 3)

#### B. Check Container Logs
```bash
# Get container name from docker ps above
docker logs <container-name>
```
**Expected Output:**
```
🚀 Multi-Vulnerability Machine running on port 3000
📍 Active vulnerabilities: 3
   - SQL Injection at /sql_injection
   - XSS at /xss
   - CSRF at /csrf
```

#### C. Test Routes Directly
```bash
# Replace 8000 with your machine's port
curl http://localhost:8000/
curl http://localhost:8000/sql_injection
curl http://localhost:8000/xss
curl http://localhost:8000/csrf
```
**Expected:** All return HTTP 200 with HTML/JSON content

### 4. Test in UI

1. **Navigate to My Machines:** `/my-machines`
2. **Click "SOLVE LAB"** on your test machine
3. **Go to Flags Tab**
4. **Verify:** You should see **3 separate flag input fields**
   - One for SQL Injection
   - One for XSS
   - One for CSRF

### 5. Test Flag Submission

#### Get Actual Flags
```bash
# Option 1: Check backend logs when machine was created
# Option 2: Query database
# Option 3: Check metadata.json files
cat modules/web/sql_injection/metadata.json | grep flag
cat modules/web/xss/metadata.json | grep flag
cat modules/web/csrf/metadata.json | grep flag
```

**Default Flags (from metadata):**
- SQL Injection: `FLAG{SQL_INJECTION_MASTER}`
- XSS: `FLAG{XSS_MASTER}`
- CSRF: `FLAG{CSRF_MASTER}`

#### Submit Flags One by One
1. Submit SQL Injection flag → **Counter should show 1/3**
2. Submit XSS flag → **Counter should show 2/3**
3. Submit CSRF flag → **Counter should show 3/3 + completion banner**

---

## 🔍 AUTOMATED TEST

```bash
chmod +x test-multi-vuln-deployment.sh
./test-multi-vuln-deployment.sh
```

This script will:
- ✅ Verify server is running
- ✅ Check container count (must be 1)
- ✅ Test all vulnerability routes
- ✅ Verify flag validation endpoint
- ✅ Display summary

---

## ❌ TROUBLESHOOTING

### Problem: Container fails to start
**Check:**
```bash
docker logs <container-id>
```
**Common Causes:**
- Port already in use
- Build failed (missing dependencies)
- Module app.js has syntax errors

### Problem: Routes return 404
**Check:**
```bash
# Inside container
docker exec -it <container-name> cat /app/main-server.js
```
**Verify:** Routes are mounted correctly in generated server

### Problem: Only 1 vulnerability shows in UI
**Check Backend Response:**
```bash
curl http://localhost:5000/api/machines/<machine-id>
```
**Verify:** `vulnerabilities` array has all 3 entries with unique `vulnerabilityInstanceId`

### Problem: Flags don't work
**Check:**
1. Make sure you're using the actual flag from `metadata.json`
2. Verify `vulnerabilityInstanceId` matches between frontend and backend
3. Check backend logs for flag verification attempts

---

## 📊 EXPECTED BEHAVIOR

### ✅ CORRECT (After Refactor)
```
Create machine with [SQLi, XSS, CSRF]
    ↓
ONE Docker container starts
    ↓
Container has 3 routes:
  - /sql_injection
  - /xss  
  - /csrf
    ↓
UI shows 3 flag inputs
    ↓
Each flag submission is independent
    ↓
Counter: 0/3 → 1/3 → 2/3 → 3/3
```

### ❌ INCORRECT (Before Refactor)
```
Create machine with [SQLi, XSS, CSRF]
    ↓
ONE Docker container starts with ONLY SQLi
    ↓
XSS and CSRF are metadata-only (fake)
    ↓
Only /sql_injection route works
    ↓
Flag counter shows 3/3 but only 1 is real
```

---

## 🎯 SUCCESS CRITERIA

Your deployment is correct if:

- [ ] Only 1 container runs per machine
- [ ] Docker logs show all 3 vulnerabilities
- [ ] All routes return 200 OK
- [ ] UI shows 3 separate flag inputs
- [ ] Submitting one flag doesn't affect others
- [ ] Counter increments: 1/3 → 2/3 → 3/3
- [ ] Machine completes only after ALL flags submitted

---

## 🚨 IF SOMETHING BREAKS

1. **Stop all containers:**
   ```bash
   docker ps -a --filter "name=cyberforge" --format "{{.Names}}" | xargs -I {} docker rm -f {}
   ```

2. **Check backend logs:**
   ```bash
   # In terminal running npm run server
   # Look for deployment errors
   ```

3. **Rebuild from scratch:**
   ```bash
   # Delete machine in UI
   # Create new machine
   # Verify deployment logs
   ```

4. **Check temporary build folder** (if deployment fails):
   ```bash
   ls -la /tmp/cyberforge-build-*
   cat /tmp/cyberforge-build-*/main-server.js
   cat /tmp/cyberforge-build-*/Dockerfile
   ```

---

## 📝 NOTES

- **Build Context:** Temporary folder `/tmp/cyberforge-build-{machineId}/` is auto-deleted after build
- **Image Name:** `cyberforge-machine-{machineId}:latest`
- **Container Name:** `cyberforge-{machineId}`
- **Internal Port:** 3000 (always)
- **External Port:** 8000+ (auto-assigned)

---

## 🎓 WHAT CHANGED

**File:** `/server/utils/docker.js`

**Changes:**
1. Added `generateMainServerCode()` - Creates dynamic Express server
2. Added `generateCombinedDockerfile()` - Creates Dockerfile with all modules
3. Added `createMachineBuildContext()` - Generates temp build folder
4. Added `buildMachineImage()` - Builds combined Docker image
5. Refactored `deployMachine()` - Orchestrates entire deployment
6. Removed `buildDockerImage()` - Old single-module build

**Result:** ALL vulnerabilities deployed, not just first one.

---

## 🏆 NEXT STEPS

After successful testing:

1. **Test with different combinations:**
   - 1 vulnerability (edge case)
   - 5+ vulnerabilities (stress test)
   - Different domains (cloud, forensics, etc.)

2. **Test flag isolation:**
   - Create 2 machines with same vulnerability types
   - Verify flags are different and independent

3. **Test edge cases:**
   - Stop/restart containers
   - Delete machines
   - Create multiple machines simultaneously

4. **Performance test:**
   - Create 10 machines
   - Verify all deploy correctly
   - Check Docker resource usage

---

**Happy Testing! 🎉**
