# Quick Testing Guide - Vulnerability Instance Isolation

## Prerequisites
- Backend server running on port 5000
- Frontend running on port 3000
- MongoDB running
- User account created

## Test Scenarios

### Test 1: Multiple Vulnerabilities in Same Machine
**Goal:** Verify that solving one vulnerability doesn't mark others as solved

**Steps:**
1. Login to the application
2. Create a new machine with multiple vulnerabilities:
   - Name: "Test Multi-Vuln"
   - Domain: Web
   - Modules: Select "SQL Injection" + "XSS"
3. Wait for machine to deploy
4. Open the machine solver
5. Verify flag counter shows "0/2"
6. Click the "SQL Injection" tab to make it active
7. View the machine details in browser console:
   ```javascript
   // Each vulnerability should have unique vulnerabilityInstanceId
   console.log(machine.vulnerabilities);
   // Example output:
   // [
   //   { vulnerabilityInstanceId: "abc-sql_injection-0-...", flag: "FLAG{SQL_INJECTION_ABC...}" },
   //   { vulnerabilityInstanceId: "abc-xss-1-...", flag: "FLAG{XSS_XYZ...}" }
   // ]
   ```
8. Submit the SQL Injection flag (copy from machine.vulnerabilities[0].flag in console for testing)
9. **EXPECTED:** Counter shows "1/2", SQL Injection marked solved, XSS still unsolved
10. Switch to XSS tab
11. Submit the XSS flag
12. **EXPECTED:** Counter shows "2/2", machine marked complete

**What Would Fail Before Fix:**
- Submitting SQL Injection flag would mark XSS as solved too (both use same moduleId)
- Counter would jump from 0/2 to 2/2 after one flag

### Test 2: Same Vulnerability Type Across Different Machines
**Goal:** Verify that solving a vulnerability in one machine doesn't affect another machine

**Steps:**
1. Create Machine A:
   - Name: "SQL Test A"
   - Domain: Web
   - Modules: "SQL Injection"
2. Wait for deployment, note the flag in browser console:
   ```javascript
   // In Machine A solver page
   console.log(machine.vulnerabilities[0]);
   // { vulnerabilityInstanceId: "machineA-sql_injection-0-...", flag: "FLAG{SQL_INJECTION_ABC...}" }
   ```
3. Create Machine B:
   - Name: "SQL Test B"
   - Domain: Web
   - Modules: "SQL Injection"
4. Wait for deployment, note the flag:
   ```javascript
   // In Machine B solver page
   console.log(machine.vulnerabilities[0]);
   // { vulnerabilityInstanceId: "machineB-sql_injection-0-...", flag: "FLAG{SQL_INJECTION_XYZ...}" }
   ```
5. **VERIFY:** Flags are DIFFERENT (unique per machine)
6. Open Machine A, submit its flag
7. **EXPECTED:** Machine A shows 1/1 complete
8. Open Machine B
9. **EXPECTED:** Machine B still shows 0/1 (NOT affected by Machine A)
10. Try submitting Machine A's flag in Machine B
11. **EXPECTED:** Error "Incorrect flag"
12. Submit Machine B's correct flag
13. **EXPECTED:** Machine B shows 1/1 complete

**What Would Fail Before Fix:**
- Both machines would have the same flag (from metadata)
- Solving in Machine A would mark Machine B as solved
- Machine B would show 1/1 immediately after Machine A solved

### Test 3: Backend API Testing (Using curl/Postman)

**Get Machine Details:**
```bash
curl -X GET http://localhost:5000/api/machines/:machineId \
  --cookie "token=YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "machine": {
    "_id": "...",
    "vulnerabilities": [
      {
        "vulnerabilityInstanceId": "abc-sql_injection-0-1234-567890abcdef",
        "moduleId": "sql_injection",
        "route": "/login",
        "points": 75,
        "flag": "FLAG{SQL_INJECTION_A1B2C3D4E5F6789012345678}",
        "difficulty": "medium",
        "solvedBy": []
      }
    ]
  }
}
```

**Submit Flag:**
```bash
curl -X POST http://localhost:5000/api/flags/verify \
  -H "Content-Type: application/json" \
  --cookie "token=YOUR_JWT_TOKEN" \
  -d '{
    "machineId": "YOUR_MACHINE_ID",
    "vulnerabilityInstanceId": "abc-sql_injection-0-1234-567890abcdef",
    "flag": "FLAG{SQL_INJECTION_A1B2C3D4E5F6789012345678}"
  }'
```

**Expected Response (Correct Flag):**
```json
{
  "success": true,
  "correct": true,
  "points": 75,
  "message": "🎉 Correct! +75 points earned!",
  "vulnerabilitySolved": "sql_injection",
  "solvedCount": 1,
  "totalVulns": 2,
  "machineSolved": false
}
```

**Test Missing vulnerabilityInstanceId:**
```bash
curl -X POST http://localhost:5000/api/flags/verify \
  -H "Content-Type: application/json" \
  --cookie "token=YOUR_JWT_TOKEN" \
  -d '{
    "machineId": "YOUR_MACHINE_ID",
    "flag": "FLAG{...}"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Machine ID, vulnerability instance ID, and flag are required"
}
```

## Verification Points

### Database Checks
```javascript
// MongoDB shell
db.machines.findOne({ name: "Test Multi-Vuln" })

// Check vulnerabilities array has unique instance IDs
// vulnerabilities: [
//   { vulnerabilityInstanceId: "abc-sql_injection-0-...", ... },
//   { vulnerabilityInstanceId: "abc-xss-1-...", ... }
// ]

// Check each has unique flag
// flags should be different, generated with crypto.randomBytes
```

```javascript
// Check user's solved vulnerabilities
db.users.findOne({ team_name: "YourTeam" })

// solvedVulnerabilities should have vulnerabilityInstanceId
// solvedVulnerabilities: [
//   {
//     machineId: ObjectId("..."),
//     vulnerabilityInstanceId: "abc-sql_injection-0-...",
//     moduleId: "sql_injection",
//     points: 75,
//     ...
//   }
// ]
```

### Console Debugging

**In Browser Console (Machine Solver Page):**
```javascript
// Check machine data structure
console.log('Machine:', machine);
console.log('Vulnerabilities:', machine.vulnerabilities);

// Check each vulnerability has unique instance ID
machine.vulnerabilities.forEach((v, i) => {
  console.log(`Vuln ${i}:`, {
    instanceId: v.vulnerabilityInstanceId,
    moduleId: v.moduleId,
    flag: v.flag,
    route: v.route
  });
});

// Check solved vulnerabilities
console.log('Solved:', solvedVulns);

// Verify no duplicates in instance IDs
const instanceIds = machine.vulnerabilities.map(v => v.vulnerabilityInstanceId);
const uniqueIds = new Set(instanceIds);
console.log('All unique?', instanceIds.length === uniqueIds.size);
```

## Expected Behavior Summary

✅ **CORRECT:**
- Each vulnerability has unique `vulnerabilityInstanceId`
- Each vulnerability has unique flag (crypto-generated)
- Submitting flag only marks that specific instance as solved
- Flag counters accurate per machine
- Multiple machines with same vuln type have different flags
- Solutions show per-instance data

❌ **INCORRECT (Before Fix):**
- Same moduleId matched multiple instances
- Same flag used across machines
- Solving one instance marked all instances of that type as solved
- Flag counters inaccurate

## Troubleshooting

### Issue: Old machines without vulnerabilityInstanceId
**Solution:** Delete old machines and create new ones, or run migration:
```javascript
// In MongoDB shell
db.machines.find({ "vulnerabilities.vulnerabilityInstanceId": { $exists: false } }).forEach(machine => {
  machine.vulnerabilities.forEach((vuln, i) => {
    vuln.vulnerabilityInstanceId = `${machine._id}-${vuln.moduleId}-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  });
  db.machines.save(machine);
});
```

### Issue: Frontend not sending vulnerabilityInstanceId
**Check:** MachineSolver.jsx should have:
```javascript
body: JSON.stringify({
  machineId: machine._id,
  vulnerabilityInstanceId: activeVulnerability.vulnerabilityInstanceId,  // Must be present
  flag: flagInput.trim()
})
```

### Issue: Flags not unique
**Check:** machines.js should be using `generateUniqueFlag()` not `metadata.flag`:
```javascript
const uniqueFlag = generateUniqueFlag(moduleId, tempMachineId);
vulnerabilities.push({
  ...,
  flag: uniqueFlag,  // NOT metadata.flag
  ...
});
```

## Success Criteria

- ✅ Creating machine generates unique instance IDs and flags
- ✅ Flag submission requires vulnerabilityInstanceId
- ✅ Only specified instance marked as solved
- ✅ Other instances remain unsolved
- ✅ Counter shows correct progress (1/N, 2/N, etc.)
- ✅ Machine marked complete only when ALL instances solved
- ✅ No cross-contamination between machines
- ✅ No cross-contamination between vulnerabilities in same machine

## Performance Check

Monitor in production:
- Flag verification response time: Should be <100ms
- Machine creation time: Should be ~2-5 seconds
- Solutions fetch time: Should be <200ms
- Database query performance: Index on vulnerabilityInstanceId recommended

---

**All tests passing = Bug fixed! 🎉**
