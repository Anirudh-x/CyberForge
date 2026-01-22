# 🚀 Quick Start: Testing Multi-Vulnerability System

## ⚡ Fast Track (5 Minutes)

### 1. Start Both Servers (2 terminals)
```bash
# Terminal 1 - Backend
cd /Users/ashwingajbhiye/Desktop/CyberForge/CyberForge
npm run server

# Terminal 2 - Frontend
cd /Users/ashwingajbhiye/Desktop/CyberForge/CyberForge
npm run dev
```

### 2. Open Browser
```
http://localhost:3000
```

### 3. Create Test Machine
```
1. Register/Login
2. Click "Machine Builder" or "Create Machine"
3. Select:
   Domain: Web
   Modules: SQL Injection + XSS
4. Name: "Multi-Vuln Test"
5. Click "Create"
6. Wait for status: "Running"
7. Click "Open Lab"
```

### 4. Test Flag Counter
**Expected:** Flag counter shows `0 / 2`

### 5. Solve First Vulnerability
```
1. Go to "Flags" tab
2. Click "SQL Injection" vulnerability tab
3. Enter flag: FLAG{SQL_1NJ3CT10N_M4ST3R}
4. Click Submit
```
**Expected:** 
- ✅ Counter updates to `1 / 2`
- ✅ SQL Injection tab shows checkmark ✓
- ❌ Lab NOT marked complete yet

### 6. Solve Second Vulnerability
```
1. Click "XSS" vulnerability tab
2. Enter flag: FLAG{XSS_VULN3RABILITY_D3T3CT3D}
3. Click Submit
```
**Expected:**
- ✅ Counter updates to `2 / 2`
- ✅ XSS tab shows checkmark ✓
- ✅ Banner: "🎉 Lab Completed!"
- ✅ Report upload enabled

### 7. Test Machine-Specific Solutions
```
1. Click "💡 Need Help? View Solution Walkthrough"
2. Solutions section expands
```
**Expected:**
- ✅ SQL Injection card shows:
  - Explanation: "This lab contains a SQL injection..."
  - Steps: Navigate to /login, Enter ' OR '1'='1...
  - Payload: `' OR '1'='1' --`
  - Flag: `FLAG{SQL_1NJ3CT10N_M4ST3R}` (actual flag shown)
- ✅ XSS card shows:
  - Explanation: "This lab contains a reflected XSS..."
  - Steps: Navigate to /comment, Enter <script>...
  - Payload: `<img src=x onerror=alert(1)>`
  - Flag: `FLAG{XSS_VULN3RABILITY_D3T3CT3D}` (actual flag shown)

---

## 🧪 Detailed Test Cases

### Test Case 1: Flag Validation Per Vulnerability
```
Objective: Verify flags are validated against specific vulnerabilities

Steps:
1. Open machine with SQL Injection + XSS
2. Click "SQL Injection" tab (active)
3. Enter XSS flag: FLAG{XSS_VULN3RABILITY_D3T3CT3D}
4. Submit

Expected: ❌ Error: "Incorrect flag. Try again!"
Why: XSS flag submitted for SQL Injection vulnerability

Actual Fix:
5. Enter SQL flag: FLAG{SQL_1NJ3CT10N_M4ST3R}
6. Submit
Expected: ✅ Correct! +75 points
```

### Test Case 2: Independent Vulnerability Tracking
```
Objective: Verify vulnerabilities can be solved in any order

Test A - SQL First:
1. Solve SQL Injection → Counter: 1/2
2. Solve XSS → Counter: 2/2 → Complete!

Test B - XSS First:
1. Solve XSS → Counter: 1/2
2. Solve SQL Injection → Counter: 2/2 → Complete!

Both paths should work identically.
```

### Test Case 3: Solution Visibility Rules
```
Objective: Verify flags hidden until vulnerability solved

Before Solving:
1. Click "View Solution Walkthrough"
2. Check SQL Injection card

Expected:
- ✅ Shows: Objective, Steps, Payload, Hints
- ❌ NO flag visible
- ✅ Shows: "The actual flag for THIS machine will be revealed..."

After Solving:
1. Solve SQL Injection
2. Re-open solutions

Expected:
- ✅ Shows: Objective, Steps, Payload, Hints
- ✅ Shows actual flag: FLAG{SQL_1NJ3CT10N_M4ST3R}
- ✅ Card highlighted green
- ✅ Checkmark ✓ icon
```

### Test Case 4: Different Machines = Different Solutions
```
Objective: Verify solutions are machine-specific

Steps:
1. Create Machine A: SQL Injection + XSS
   - Note SQL flag: FLAG{SQL_1NJ3CT10N_M4ST3R}
2. Create Machine B: SQL Injection only
   - Note SQL flag: (should be same for now, but architecture supports unique)
3. View solutions for Machine A
4. View solutions for Machine B

Expected:
- Each machine has its own solutions document
- Flags are tied to specific machine instance
- Solutions fetched via GET /api/flags/solutions/:machineId
```

---

## 🔍 Backend Verification

### Check MongoDB Documents
```javascript
// Connect to MongoDB
mongosh

use cyberforge  // or your database name

// Check machine document
db.machines.findOne({ name: "Multi-Vuln Test" })

// Should show:
{
  vulnerabilities: [
    {
      moduleId: "sql_injection",
      route: "/login",
      points: 75,
      flag: "FLAG{SQL_1NJ3CT10N_M4ST3R}",
      difficulty: "medium",
      solvedBy: [ObjectId("...")]  // Your user ID after solving
    },
    {
      moduleId: "xss",
      route: "/comment",
      points: 65,
      flag: "FLAG{XSS_VULN3RABILITY_D3T3CT3D}",
      difficulty: "medium",
      solvedBy: [ObjectId("...")]
    }
  ],
  solutions: {
    "sql_injection": {
      explanation: "This lab contains a SQL injection...",
      steps: [...],
      payload: "' OR '1'='1' --",
      flag: "FLAG{SQL_1NJ3CT10N_M4ST3R}",
      hints: [...]
    },
    "xss": {
      explanation: "This lab contains a reflected XSS...",
      steps: [...],
      payload: "<img src=x onerror=alert(1)>",
      flag: "FLAG{XSS_VULN3RABILITY_D3T3CT3D}",
      hints: [...]
    }
  }
}

// Check user progress
db.users.findOne({ team_name: "YourTeam" })

// Should show:
{
  solvedVulnerabilities: [
    {
      machineId: ObjectId("..."),
      moduleId: "sql_injection",
      domain: "web",
      points: 75,
      flag: "FLAG{SQL_1NJ3CT10N_M4ST3R}",
      solvedAt: ISODate("...")
    },
    {
      machineId: ObjectId("..."),
      moduleId: "xss",
      domain: "web",
      points: 65,
      flag: "FLAG{XSS_VULN3RABILITY_D3T3CT3D}",
      solvedAt: ISODate("...")
    }
  ],
  solvedMachines: [
    {
      machineId: ObjectId("..."),
      completedAt: ISODate("..."),
      totalPoints: 140
    }
  ]
}
```

### Test API Endpoints Directly
```bash
# Get machine details
curl -X GET http://localhost:5000/api/machines/:machineId \
  -H "Cookie: token=YOUR_JWT_TOKEN"

# Submit flag
curl -X POST http://localhost:5000/api/flags/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "machineId": "MACHINE_ID",
    "vulnerabilityId": "sql_injection",
    "flag": "FLAG{SQL_1NJ3CT10N_M4ST3R}"
  }'

# Get solutions
curl -X GET http://localhost:5000/api/flags/solutions/:machineId \
  -H "Cookie: token=YOUR_JWT_TOKEN"

# Response should show:
{
  "success": true,
  "solutions": {
    "sql_injection": {
      "explanation": "...",
      "steps": [...],
      "payload": "...",
      "flag": "FLAG{...}",  // Only if solved
      "solved": true
    }
  }
}
```

---

## ✅ Success Criteria Checklist

After testing, verify all these work:

### Flag System
- [ ] Counter shows `0 / N` where N = number of vulnerabilities
- [ ] Counter increments correctly: `0/2 → 1/2 → 2/2`
- [ ] Lab NOT marked complete until ALL flags captured
- [ ] Wrong flag shows error message
- [ ] Correct flag awards points and updates counter
- [ ] Each vulnerability tracks independently

### Solution System
- [ ] Help button always visible (not just after solving)
- [ ] Solutions load from backend `/api/flags/solutions/:machineId`
- [ ] Each vulnerability shows its own solution
- [ ] Solutions include: Objective, Steps, Payload, Hints
- [ ] Flags HIDDEN for unsolved vulnerabilities
- [ ] Flags SHOWN for solved vulnerabilities
- [ ] Solutions are machine-specific (not generic)

### UI/UX
- [ ] Vulnerability selector tabs appear when multiple vulns
- [ ] Active vulnerability highlighted
- [ ] Solved vulnerabilities show checkmark ✓
- [ ] Lab complete banner appears when all solved
- [ ] Report upload only enabled when complete
- [ ] Green theme consistent throughout

### Database
- [ ] Machine has `vulnerabilities` array with route, flag, solvedBy
- [ ] Machine has `solutions` Map with actual flags
- [ ] User has `solvedVulnerabilities` array
- [ ] User has `solvedMachines` array (only when all complete)
- [ ] Points awarded correctly per vulnerability

---

## 🐛 Troubleshooting

### Issue: "Only 1/1 flags showing"
**Cause:** Machine created before fix
**Solution:** Create NEW machine after fix

### Issue: "Solutions showing same content"
**Cause:** Generic fallback being used
**Solution:** 
1. Check metadata files have `solution` field
2. Verify `/api/flags/solutions/:machineId` returns data
3. Check browser console for fetch errors

### Issue: "Flag submission not working"
**Cause:** Missing `vulnerabilityId` parameter
**Solution:**
1. Check browser network tab
2. Verify request includes:
   ```json
   {
     "machineId": "...",
     "vulnerabilityId": "sql_injection",
     "flag": "..."
   }
   ```
3. Check `activeVulnerability` state is set

### Issue: "Lab marked complete with partial solve"
**Cause:** Backend counting logic error
**Solution:** Check logs:
```javascript
console.log('Total vulns:', totalVulns);
console.log('Solved for machine:', solvedVulnsForMachine.length);
console.log('All solved?', solvedVulnsForMachine.length === totalVulns);
```

---

## 📞 Need Help?

### Check Logs
```bash
# Backend logs
# Check terminal running npm run server

# Frontend logs  
# Open browser console (F12)
# Look for "Machine data:" log
```

### Debug Mode
Add to `MachineSolver.jsx`:
```javascript
console.log('DEBUG:', {
  vulnerabilities: machine.vulnerabilities,
  solvedVulns,
  machineSolutions,
  activeVulnerability
});
```

### Test Flags Reference
```
SQL Injection: FLAG{SQL_1NJ3CT10N_M4ST3R}
XSS: FLAG{XSS_VULN3RABILITY_D3T3CT3D}
CSRF: FLAG{CSRF_T0K3N_BYP4SS}
```

---

## 🎉 Success!

If all tests pass, you now have:
✅ **TRUE multi-vulnerability system**
✅ **Machine-specific solutions with actual flags**
✅ **Independent vulnerability tracking**
✅ **Correct flag counting**
✅ **Solution walkthrough accessible anytime**

**Your CyberForge platform is ready for production!** 🚀
