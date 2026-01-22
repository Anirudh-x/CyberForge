# CyberForge Testing Guide

## ✅ Features Implemented

### 1. Points System
- ✅ User schema updated with totalPoints and domain-specific points (web, red_team, blue_team, cloud, forensics)
- ✅ Machine schema updated with totalPoints calculated from module metadata
- ✅ Points automatically calculated during machine creation

### 2. Flag Verification System
- ✅ POST `/api/flags/verify` - Submit flags and earn points
- ✅ GET `/api/flags/stats` - Get user's current points and stats
- ✅ Duplicate submission prevention
- ✅ Domain-specific point awarding
- ✅ Machine completion tracking

### 3. Leaderboard System
- ✅ 6 Leaderboard endpoints:
  - `/api/leaderboard/overall` - Overall rankings
  - `/api/leaderboard/web` - Web Security rankings
  - `/api/leaderboard/red-team` - Red Team rankings
  - `/api/leaderboard/blue-team` - Blue Team rankings
  - `/api/leaderboard/cloud` - Cloud Security rankings
  - `/api/leaderboard/forensics` - Forensics rankings
- ✅ Updated Leaderboard page with category tabs
- ✅ Enhanced LeaderboardCard with medals for top 3

### 4. Lab Report Upload System
- ✅ POST `/api/reports/:machineId/upload` - Upload report (PDF/MD/TXT)
- ✅ GET `/api/reports/:machineId` - Get report info
- ✅ GET `/api/reports/:machineId/download` - Download report
- ✅ DELETE `/api/reports/:machineId` - Delete report
- ✅ 10MB file size limit
- ✅ Validation: Only solved machines can upload reports

### 5. Frontend Updates
- ✅ MachineSolver shows:
  - Points display (total + domain breakdown)
  - Flag submission form
  - Lab report upload section (after solving)
  - Machine points display
- ✅ Enhanced Leaderboard page with category filtering
- ✅ Real-time stats updates after flag submission

## 🧪 How to Test

### Test Flag Submission
1. Create a machine (e.g., SQL Injection from Web domain)
2. Open the machine in MachineSolver
3. Find the flag (e.g., `FLAG{SQL_INJECTION_SUCCESS}`)
4. Enter flag in submission form
5. Verify:
   - ✅ Points awarded message appears
   - ✅ Total points updated
   - ✅ Domain-specific points updated (e.g., webPoints)
   - ✅ Report upload section appears

### Test Leaderboard
1. Navigate to `/leaderboard`
2. Verify:
   - ✅ Overall leaderboard shows all players
   - ✅ Category tabs work (Web, Red Team, Blue Team, Cloud, Forensics)
   - ✅ Top 3 players have medals (🥇🥈🥉)
   - ✅ Rankings show points, vulnerabilities, machines solved

### Test Lab Report Upload
1. Solve a machine (submit correct flag)
2. Verify report upload section appears
3. Select a PDF/MD/TXT file
4. Click "Upload Report"
5. Verify:
   - ✅ Success message appears
   - ✅ File saved to `/uploads/reports/`
   - ✅ Can re-upload to replace

### Test New Lab Modules
**Cloud Security:**
- `public_bucket` (50pts) - http://localhost:8000+port
- `iam_policy` (75pts) - http://localhost:8000+port
- `env_vars` (60pts) - http://localhost:8000+port

**Forensics:**
- `memory_dump` (80pts) - Download memory dump and analyze
- `disk_image` (85pts) - Explore disk image files
- `hidden_files` (70pts) - Find hidden files

## 🔑 Sample Flags

### Cloud Labs
- **public_bucket**: `FLAG{PUBLIC_BUCKET_EXPOSED}`
- **iam_policy**: `FLAG{IAM_PRIVILEGE_ESCALATION}`
- **env_vars**: `FLAG{ENV_VARS_EXPOSED}`

### Forensics Labs
- **memory_dump**: `FLAG{MEMORY_FORENSICS_MASTER}`
- **disk_image**: `FLAG{DISK_FORENSICS_COMPLETE}`
- **hidden_files**: `FLAG{FOUND_THE_HIDDEN_FILE}`

## 🐛 Troubleshooting

### Points not updating?
1. Check browser console for errors
2. Verify backend is running: `http://localhost:5000/api/health`
3. Check MongoDB connection
4. Verify you're logged in (credentials include)

### Leaderboard empty?
1. Submit at least one flag first
2. Check specific category (not all categories may have data)
3. Refresh the page

### Report upload fails?
1. Ensure machine is solved first (flag submitted)
2. Check file type (only PDF, MD, TXT allowed)
3. Check file size (max 10MB)
4. Verify uploads/reports directory exists

### Flag submission fails?
1. Verify flag format (e.g., `FLAG{...}`)
2. Check machine is running
3. Ensure not already solved (duplicate prevention)
4. Check backend logs for errors

## 📊 API Endpoints Summary

### Flags
- `POST /api/flags/verify` (auth required)
- `GET /api/flags/stats` (auth required)

### Leaderboard
- `GET /api/leaderboard/overall`
- `GET /api/leaderboard/web`
- `GET /api/leaderboard/red-team`
- `GET /api/leaderboard/blue-team`
- `GET /api/leaderboard/cloud`
- `GET /api/leaderboard/forensics`

### Reports
- `POST /api/reports/:machineId/upload` (auth required)
- `GET /api/reports/:machineId` (auth required)
- `GET /api/reports/:machineId/download` (auth required)
- `DELETE /api/reports/:machineId` (auth required)

## ✨ Next Steps

1. Test all features with real machines
2. Verify points calculation accuracy
3. Test leaderboard ranking logic
4. Confirm report upload/download works
5. Check mobile responsiveness
6. Add more lab modules if needed

## 🎯 Success Criteria

- ✅ Points visible after flag submission
- ✅ Leaderboard updates in real-time
- ✅ Report upload available after solving
- ✅ All 6 new lab modules working
- ✅ Domain-specific scoring working
- ✅ No duplicate point awarding

Happy Testing! 🚀
