# 📚 CyberForge Platform - Complete Documentation

## 🏗️ Architecture Overview

CyberForge is a comprehensive Capture The Flag (CTF) cybersecurity training platform that enables users to create, deploy, and solve multi-vulnerability machines. The platform uses a modern MERN stack with Docker containerization for isolated vulnerability environments.

### Technology Stack
- **Frontend:** React 18 + Vite + React Router v6 + TailwindCSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose ODM
- **Containerization:** Docker (for vulnerability modules)
- **Authentication:** JWT with HTTP-only cookies
- **File Storage:** Local filesystem with multer

---

## 📁 Project Structure

```
CyberForge/
├── server/                    # Backend API
│   ├── config/               # Configuration files
│   ├── middleware/           # Express middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API endpoints
│   ├── utils/               # Utility functions
│   └── modules/             # Vulnerability modules (metadata)
├── src/                      # Frontend application
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── context/            # React Context providers
│   ├── utils/              # Frontend utilities
│   └── styles/             # CSS files
├── modules/                  # Vulnerability module implementations
│   ├── web/                # Web security modules
│   ├── cloud/              # Cloud security modules
│   ├── forensics/          # Digital forensics modules
│   ├── red_team/           # Red team modules
│   └── blue_team/          # Blue team modules
└── uploads/                 # User-uploaded files
    └── reports/            # Lab reports
```

---

## 🔧 Backend Architecture

### Server Entry Point: `server/index.js`

**Purpose:** Main Express server configuration and initialization

**Features:**
- Express server setup with middleware
- CORS configuration for cross-origin requests
- Cookie parser for authentication
- Database connection initialization
- API route mounting
- Environment variable configuration

**Key Endpoints:**
- `/api/auth` - Authentication routes
- `/api/challenges` - Legacy challenge system
- `/api/machines` - Machine CRUD operations
- `/api/flags` - Flag verification
- `/api/leaderboard` - Leaderboard data
- `/api/reports` - Lab report generation
- `/api/health` - Server health check

**Configuration:**
```javascript
PORT: 5000 (default)
CLIENT_URL: http://localhost:3000
CORS: Enabled with credentials
```

---

### Database Configuration: `server/config/database.js`

**Purpose:** MongoDB connection management

**Features:**
- Mongoose connection setup
- Connection error handling
- Retry logic on connection failure
- Connection event logging

**Environment Variables:**
- `MONGODB_URI` - MongoDB connection string

---

### Middleware: `server/middleware/auth.js`

**Purpose:** JWT-based authentication middleware

**Features:**
- Token verification from HTTP-only cookies
- User ID extraction from JWT payload
- Team name extraction (if applicable)
- Error handling for invalid/expired tokens
- Attaches `userId` and `teamName` to request object

**Token Structure:**
```javascript
{
  userId: ObjectId,
  teamName: String (optional)
}
```

---

## 📊 Database Models

### User Model: `server/models/User.js`

**Purpose:** User account and progress tracking

**Schema Fields:**
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  teamName: String (optional),
  totalPoints: Number (default: 0),
  rank: String (default: 'Novice'),
  
  // Challenge system (legacy)
  solvedChallenges: [Number],
  
  // Machine system (current)
  solvedMachines: [{
    machineId: ObjectId,
    solvedAt: Date,
    points: Number
  }],
  
  // Vulnerability tracking (per-instance)
  solvedVulnerabilities: [{
    machineId: ObjectId,
    vulnerabilityInstanceId: String (unique per machine),
    moduleId: String,
    points: Number,
    solvedAt: Date
  }],
  
  // Lab reports
  labReports: [{
    machineId: ObjectId,
    reportPath: String,
    submittedAt: Date
  }],
  
  createdAt: Date,
  updatedAt: Date
}
```

**Features:**
- Tracks individual vulnerability solves (not just machines)
- Each vulnerability instance has unique ID
- Points calculated per vulnerability
- Rank system based on total points
- Lab report storage with file paths

**Rank System:**
- 0-99 points: Novice
- 100-499: Intermediate
- 500-999: Advanced
- 1000+: Expert

---

### Machine Model: `server/models/Machine.js`

**Purpose:** Machine configuration and deployment tracking

**Schema Fields:**
```javascript
{
  name: String (required),
  description: String,
  domain: String (enum: web, cloud, forensics, red_team, blue_team),
  difficulty: String (default: 'medium'),
  
  // Ownership
  createdBy: ObjectId (ref: User),
  teamName: String,
  
  // Deployment configuration
  modules: [String], // Array of module IDs
  
  // Vulnerabilities (each module creates vulnerability instances)
  vulnerabilities: [{
    moduleId: String,
    vulnerabilityInstanceId: String (UNIQUE per machine),
    name: String,
    points: Number,
    flag: String (unique generated flag),
    route: String,
    solveMethod: String (gui, terminal, api, file)
  }],
  
  // Docker deployment
  containerId: String,
  imageName: String,
  port: Number,
  status: String (enum: building, running, stopped, error),
  
  // Machine metadata
  totalPoints: Number,
  baseUrl: String,
  access: {
    url: String,
    terminal: String,
    downloads: [String]
  },
  
  // Solution storage (keyed by vulnerabilityInstanceId)
  solutions: Map (String -> Object) {
    [vulnerabilityInstanceId]: {
      hint: String,
      solution: String,
      methodology: String
    }
  },
  
  deployedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Critical Design:**
- `vulnerabilities` array contains INSTANCES, not types
- Each vulnerability has unique `vulnerabilityInstanceId`
- `solutions` Map keyed by `vulnerabilityInstanceId` (NOT moduleId)
- Each machine with 3 modules = 3 unique vulnerability instances
- Flags are unique per instance, not shared

---

### LabReport Model: `server/models/LabReport.js`

**Purpose:** Lab report metadata storage

**Schema Fields:**
```javascript
{
  userId: ObjectId (ref: User),
  machineId: ObjectId (ref: Machine),
  machineName: String,
  teamName: String,
  reportPath: String,
  fileName: String,
  fileSize: Number,
  submittedAt: Date
}
```

**Features:**
- Stores report file metadata
- Links reports to users and machines
- File size tracking
- Timestamp for submission

---

## 🛣️ API Routes

### Authentication Routes: `server/routes/auth.js`

**Base Path:** `/api/auth`

#### `POST /register`
**Purpose:** Create new user account

**Request Body:**
```javascript
{
  username: String,
  email: String,
  password: String,
  teamName: String (optional)
}
```

**Response:**
```javascript
{
  success: true,
  message: 'Registration successful',
  userId: ObjectId
}
```

**Features:**
- Password hashing with bcrypt (10 rounds)
- Duplicate username/email validation
- JWT token generation
- HTTP-only cookie creation

---

#### `POST /login`
**Purpose:** Authenticate existing user

**Request Body:**
```javascript
{
  username: String,
  password: String
}
```

**Response:**
```javascript
{
  success: true,
  user: {
    username: String,
    email: String,
    teamName: String,
    totalPoints: Number,
    rank: String
  }
}
```

**Features:**
- Password verification with bcrypt
- JWT token generation (24h expiry)
- HTTP-only cookie creation
- User profile data return

---

#### `POST /logout`
**Purpose:** Clear authentication cookie

**Response:**
```javascript
{
  success: true,
  message: 'Logged out successfully'
}
```

---

#### `GET /verify`
**Purpose:** Verify JWT token validity

**Response:**
```javascript
{
  success: true,
  user: {
    username: String,
    email: String,
    teamName: String,
    totalPoints: Number,
    rank: String
  }
}
```

**Features:**
- Validates token from cookie
- Returns current user data
- Used for session persistence

---

### Machine Routes: `server/routes/machines.js`

**Base Path:** `/api/machines`

#### `POST /create`
**Purpose:** Create and deploy new machine

**Authentication:** Required

**Request Body:**
```javascript
{
  name: String,
  domain: String (web, cloud, forensics, red_team, blue_team),
  modules: [String] // Array of module IDs
}
```

**Process Flow:**
1. Validate input (domain, modules)
2. Load module metadata for each module
3. Generate unique vulnerability instances:
   - Create `vulnerabilityInstanceId` using crypto
   - Generate unique flag per instance
   - Store module points
4. Create Machine document with status='building'
5. Deploy Docker container (async):
   - Generate combined build context
   - Build Docker image with ALL modules
   - Run single container
   - Update machine status to 'running'
6. Store solutions in Map (keyed by vulnerabilityInstanceId)

**Response:**
```javascript
{
  success: true,
  machine: {
    _id: ObjectId,
    name: String,
    domain: String,
    modules: [String],
    vulnerabilities: [{
      moduleId: String,
      vulnerabilityInstanceId: String,
      name: String,
      points: Number,
      flag: String,
      route: String
    }],
    containerId: String,
    port: Number,
    baseUrl: String,
    status: 'running',
    totalPoints: Number
  }
}
```

**Key Features:**
- **Unique Vulnerability Instances:** Each module creates a unique vulnerability with unique ID and flag
- **Combined Docker Build:** ALL modules deployed in ONE container
- **Solution Storage:** Solutions keyed by vulnerabilityInstanceId for isolation
- **Dynamic Flag Generation:** Each instance gets crypto-random flag
- **Port Allocation:** Automatic port assignment starting from 8000

---

#### `GET /my-machines`
**Purpose:** Get all machines created by authenticated user

**Authentication:** Required

**Response:**
```javascript
{
  success: true,
  machines: [{
    _id: ObjectId,
    name: String,
    domain: String,
    modules: [String],
    status: String,
    totalPoints: Number,
    port: Number,
    createdAt: Date,
    // ... other fields
  }]
}
```

---

#### `GET /:id`
**Purpose:** Get detailed machine information

**Authentication:** Required

**Response:**
```javascript
{
  success: true,
  machine: {
    _id: ObjectId,
    name: String,
    domain: String,
    modules: [String],
    vulnerabilities: [{
      vulnerabilityInstanceId: String,
      moduleId: String,
      name: String,
      points: Number,
      route: String,
      solveMethod: String
    }],
    containerId: String,
    port: Number,
    baseUrl: String,
    access: {
      url: String,
      terminal: String,
      downloads: [String]
    },
    status: String,
    totalPoints: Number
  }
}
```

**Note:** Flag values are NOT included in response (security)

---

#### `DELETE /:id`
**Purpose:** Delete machine and stop container

**Authentication:** Required (must be creator)

**Process:**
1. Find machine
2. Verify user is creator
3. Stop Docker container
4. Delete machine document

**Response:**
```javascript
{
  success: true,
  message: 'Machine deleted successfully'
}
```

---

### Flag Routes: `server/routes/flags.js`

**Base Path:** `/api/flags`

#### `POST /verify`
**Purpose:** Verify flag for specific vulnerability instance

**Authentication:** Required

**Request Body:**
```javascript
{
  machineId: ObjectId,
  vulnerabilityInstanceId: String,
  flag: String
}
```

**Process Flow:**
1. Validate input (all fields required)
2. Get machine and user documents
3. Check if THIS vulnerability instance already solved:
   - Search `user.solvedVulnerabilities` for exact `vulnerabilityInstanceId`
   - NOT just moduleId (critical for instance isolation)
4. Find vulnerability in machine.vulnerabilities array by `vulnerabilityInstanceId`
5. Compare submitted flag with vulnerability.flag
6. If correct:
   - Add to `user.solvedVulnerabilities` with instance ID
   - Add points to `user.totalPoints`
   - Update user rank if threshold crossed
   - Check if ALL vulnerabilities in machine solved
   - If all solved, add to `user.solvedMachines`
7. Return result

**Response (Correct Flag):**
```javascript
{
  success: true,
  correct: true,
  message: 'Flag captured!',
  points: Number,
  totalPoints: Number,
  rank: String,
  allVulnerabilitiesSolved: Boolean,
  machineSolved: Boolean
}
```

**Response (Incorrect Flag):**
```javascript
{
  success: false,
  correct: false,
  message: 'Incorrect flag'
}
```

**Response (Already Solved):**
```javascript
{
  success: false,
  correct: false,
  message: 'You have already captured this flag',
  alreadySolved: true
}
```

**Critical Feature:** Flag verification is PER vulnerability instance, not per module type. This ensures:
- Machine A's SQLi and Machine B's SQLi have different flags
- Solving one doesn't affect the other
- Flag counter accurately tracks per-instance progress

---

#### `GET /solutions/:machineId`
**Purpose:** Get solutions for all vulnerabilities in machine

**Authentication:** Required

**Response:**
```javascript
{
  success: true,
  solutions: [{
    vulnerabilityInstanceId: String,
    moduleId: String,
    name: String,
    hint: String,
    solution: String,
    methodology: String
  }]
}
```

**Features:**
- Returns solutions for ALL vulnerability instances
- Each solution retrieved by `vulnerabilityInstanceId` from Map
- Includes hints, step-by-step solutions, and methodology

---

### Leaderboard Routes: `server/routes/leaderboard.js`

**Base Path:** `/api/leaderboard`

#### `GET /`
**Purpose:** Get global leaderboard

**Response:**
```javascript
{
  success: true,
  leaderboard: [{
    _id: ObjectId,
    username: String,
    teamName: String,
    totalPoints: Number,
    rank: String,
    solvedMachines: Number,
    position: Number
  }]
}
```

**Features:**
- Sorted by totalPoints descending
- Includes position ranking (1, 2, 3, ...)
- Shows solved machines count
- Public data (no authentication required)

---

### Report Routes: `server/routes/reports.js`

**Base Path:** `/api/reports`

#### `POST /submit`
**Purpose:** Upload lab report for machine

**Authentication:** Required

**Request:** `multipart/form-data`
```javascript
{
  machineId: ObjectId,
  file: File (PDF, max 10MB)
}
```

**Process:**
1. Validate file type (PDF only)
2. Validate file size (max 10MB)
3. Generate unique filename
4. Save to `uploads/reports/`
5. Create LabReport document
6. Link report to user profile

**Response:**
```javascript
{
  success: true,
  message: 'Report submitted successfully',
  report: {
    _id: ObjectId,
    fileName: String,
    fileSize: Number,
    submittedAt: Date
  }
}
```

---

#### `GET /my-reports`
**Purpose:** Get all reports submitted by user

**Authentication:** Required

**Response:**
```javascript
{
  success: true,
  reports: [{
    _id: ObjectId,
    machineName: String,
    fileName: String,
    fileSize: Number,
    submittedAt: Date
  }]
}
```

---

## 🐳 Docker Deployment System

### Docker Utilities: `server/utils/docker.js`

**Purpose:** Multi-vulnerability machine deployment with Docker

---

#### Function: `getAvailablePort()`

**Purpose:** Find available port for machine

**Algorithm:**
```javascript
1. Start from port 8000
2. Use lsof to check if port is in use
3. If lsof succeeds (exit 0), port is occupied
4. If lsof fails (exit 1), port is free
5. Return first free port
6. Max 100 attempts
```

**Returns:** `Number` (8000-8100)

---

#### Function: `generateMainServerCode(modulesMetadata)`

**Purpose:** Generate dynamic Express server that loads ALL modules

**Input:**
```javascript
[{
  id: 'sql_injection',
  domain: 'web',
  name: 'SQL Injection',
  route: '/sql_injection',
  solve_method: 'gui',
  points: 75
}, ...]
```

**Generated Code Structure:**
```javascript
// Requires for each module
const module0 = require('./modules/web/sql_injection/app.js');
const module1 = require('./modules/web/xss/app.js');
const module2 = require('./modules/web/csrf/app.js');

// Route mounting
app.use('/sql_injection', module0);
app.use('/xss', module1);
app.use('/csrf', module2);

// Health check at /
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    vulnerabilities: [...]
  });
});
```

**Returns:** `String` - Complete main-server.js code

**Features:**
- Dynamically requires ALL modules
- Mounts each on designated route
- Health check endpoint
- 404 handler with available routes
- Comprehensive logging

---

#### Function: `generateCombinedDockerfile(modulesMetadata)`

**Purpose:** Generate Dockerfile that includes ALL modules

**Input:** Array of module metadata

**Generated Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Copy ALL module folders
COPY modules ./modules

# Copy main server
COPY main-server.js .

# Install dependencies (collected from all modules)
RUN npm init -y
RUN npm install express sqlite3 jsonwebtoken ...

EXPOSE 3000

CMD ["node", "main-server.js"]
```

**Features:**
- Single image for ALL modules
- Collects dependencies from all modules
- Lightweight alpine base
- Standard port 3000

---

#### Function: `createMachineBuildContext(machineId, domain, modules)`

**Purpose:** Create temporary build folder with ALL modules

**Process:**
```
1. Create /tmp/cyberforge-build-{machineId}/
2. Create modules/ subdirectory
3. For each module:
   - Load metadata from modules/{domain}/{moduleId}/metadata.json
   - Copy entire module folder to build context
   - Recursively copy all files (app.js, Dockerfile, metadata, etc.)
4. Generate main-server.js with all routes
5. Generate combined Dockerfile
6. Write both to build context
```

**Directory Structure Created:**
```
/tmp/cyberforge-build-abc123/
├── Dockerfile (combined)
├── main-server.js (routes all modules)
└── modules/
    └── web/
        ├── sql_injection/
        │   ├── app.js
        │   ├── metadata.json
        │   └── Dockerfile (ignored, using combined)
        ├── xss/
        │   └── ... (full module)
        └── csrf/
            └── ... (full module)
```

**Returns:**
```javascript
{
  buildPath: String,
  modulesMetadata: [{
    id: String,
    name: String,
    domain: String,
    route: String,
    flag: String,
    points: Number,
    solve_method: String
  }]
}
```

---

#### Function: `copyDirectory(src, dest)`

**Purpose:** Recursively copy directory (helper)

**Features:**
- Creates destination directories
- Handles nested folders
- Copies all file types
- Preserves structure

---

#### Function: `buildMachineImage(buildPath, machineId)`

**Purpose:** Build Docker image from combined build context

**Process:**
```bash
docker build -t cyberforge-machine-{machineId}:latest {buildPath}
```

**Image Naming:** `cyberforge-machine-{machineId}:latest`

**Returns:**
```javascript
{
  success: Boolean,
  imageName: String,
  error: String (if failed)
}
```

**Features:**
- 10MB buffer for large builds
- Stderr parsing (ignores warnings)
- Comprehensive error logging

---

#### Function: `runDockerContainer(imageName, port, containerName, containerPort)`

**Purpose:** Run Docker container from image

**Process:**
```bash
docker run -d --name {containerName} -p {port}:{containerPort} {imageName}
```

**Parameters:**
- `imageName`: cyberforge-machine-{machineId}:latest
- `port`: External port (8000+)
- `containerName`: cyberforge-{machineId}
- `containerPort`: 3000 (internal)

**Validation:**
1. Start container (detached mode)
2. Wait 2 seconds for startup
3. Check running status with `docker inspect`
4. Return container ID and URL

**Returns:**
```javascript
{
  success: Boolean,
  containerId: String,
  port: Number,
  url: String,
  error: String (if failed)
}
```

---

#### Function: `stopDockerContainer(containerId)`

**Purpose:** Stop and remove container

**Process:**
```bash
docker stop {containerId}
docker rm {containerId}
```

---

#### Function: `cleanupBuildContext(buildPath)`

**Purpose:** Remove temporary build folder

**Process:**
```bash
rm -rf /tmp/cyberforge-build-{machineId}
```

**Features:**
- Force removal
- Recursive deletion
- Error handling (logs warning if fails)

---

#### Function: `deployMachine(machineId, domain, modules)` ⭐

**Purpose:** Main orchestration function for machine deployment

**Input:**
```javascript
deployMachine('abc123', 'web', ['sql_injection', 'xss', 'csrf'])
```

**Complete Process Flow:**

```
STEP 1: Validate Input
├─ Check modules array not empty
└─ Validate domain

STEP 2: Create Build Context
├─ Call createMachineBuildContext()
├─ Generate /tmp/cyberforge-build-{machineId}/
├─ Copy ALL module folders
├─ Generate main-server.js
└─ Generate Dockerfile

STEP 3: Build Docker Image
├─ Call buildMachineImage()
├─ docker build -t cyberforge-machine-{machineId} {buildPath}
└─ Returns image name

STEP 4: Allocate Port
├─ Call getAvailablePort()
└─ Returns 8000+

STEP 5: Run Container
├─ Call runDockerContainer()
├─ docker run -d -p {port}:3000 {imageName}
├─ Wait 2s for startup
└─ Verify running

STEP 6: Build Route Information
├─ Create vulnerabilityRoutes array
├─ For each module:
│   ├─ route: /sql_injection, /xss, /csrf
│   ├─ url: http://localhost:8000/sql_injection
│   ├─ flag: Unique flag per instance
│   └─ points: From metadata
└─ Build access object

STEP 7: Cleanup
├─ Call cleanupBuildContext()
└─ Remove /tmp/cyberforge-build-{machineId}/

STEP 8: Return Result
└─ Return deployment details
```

**Returns:**
```javascript
{
  success: true,
  machineId: String,
  containerId: String,
  imageName: String,
  port: Number,
  baseUrl: String,
  solveMethod: String,
  access: {
    url: String,
    terminal: String,
    downloads: [String]
  },
  vulnerabilityRoutes: [{
    moduleId: String,
    name: String,
    route: String,
    url: String,
    flag: String,
    points: Number,
    solveMethod: String
  }],
  modulesDeployed: Number,
  totalVulnerabilities: Number
}
```

**Critical Design Decisions:**

1. **NO primaryModule Logic:** ALL modules treated equally
2. **Combined Build:** ONE image for ALL vulnerabilities
3. **Single Container:** ONE container, MULTIPLE routes
4. **Dynamic Generation:** Server code generated on-the-fly
5. **Temporary Context:** Build folder auto-cleaned after deployment
6. **Port Isolation:** Each machine gets unique port
7. **Route Namespace:** Each vulnerability gets unique route

**Error Handling:**
- Validates all inputs
- Catches Docker build failures
- Catches container run failures
- Cleans up on error
- Returns detailed error messages

---

## 🎨 Frontend Architecture

### Entry Point: `src/main.jsx`

**Purpose:** React application initialization

**Features:**
- React 18 with StrictMode
- Root DOM rendering
- Global styles import

---

### App Router: `src/App.jsx`

**Purpose:** Main application routing and layout

**Routes:**
```javascript
/ → Home (landing page)
/login → Login
/register → Register
/challenges → Challenges (legacy)
/leaderboard → Leaderboard
/machine-builder → Machine Builder
/my-machines → My Machines
/solve/:machineId → Machine Solver
```

**Layout:**
- Navbar on all pages
- Footer on all pages
- React Router v6 navigation

---

### Authentication Hook: `src/hooks/useAuth.js`

**Purpose:** Authentication state management

**Features:**
```javascript
const { isAuthenticated, isLoading, user } = useAuth();
```

**Functions:**
- Checks for JWT cookie on mount
- Calls `/api/auth/verify` to validate token
- Returns user data if authenticated
- Loading state during verification
- Used for protected routes

---

## 📄 Frontend Pages

### Home Page: `src/pages/Home.jsx`

**Purpose:** Landing page with platform overview

**Sections:**
- Hero section with CTA
- Features showcase
- Platform statistics
- Getting started guide

**Features:**
- Animated terminal effect
- Responsive design
- Navigation to register/login

---

### Login Page: `src/pages/Login.jsx`

**Purpose:** User authentication

**Form Fields:**
- Username
- Password

**Features:**
- Form validation
- Error message display
- JWT cookie creation on success
- Redirect to home on success
- Link to registration page

**API Call:**
```javascript
POST /api/auth/login
Body: { username, password }
```

---

### Register Page: `src/pages/Register.jsx`

**Purpose:** User account creation

**Form Fields:**
- Username
- Email
- Password
- Confirm Password
- Team Name (optional)

**Features:**
- Password match validation
- Email format validation
- Duplicate username detection
- Success message
- Redirect to login

**API Call:**
```javascript
POST /api/auth/register
Body: { username, email, password, teamName }
```

---

### Machine Builder: `src/pages/MachineBuilder.jsx`

**Purpose:** Visual machine creation interface

**Components:**
1. **DomainSelector:** Choose domain (web, cloud, forensics, red_team, blue_team)
2. **ModuleList:** Available modules for selected domain
3. **MachineCanvas:** Selected modules visualization

**Workflow:**
```
1. User selects domain
2. Available modules load for that domain
3. User drags/clicks modules to add
4. Selected modules shown in canvas
5. User enters machine name
6. Click "Deploy Machine"
7. API call to create machine
8. Machine builds in background
9. Navigate to My Machines
```

**Features:**
- Drag-and-drop module selection
- Visual feedback for selected modules
- Module metadata display (points, difficulty)
- Real-time module count
- Total points calculation
- Deployment progress indicator

**State Management:**
```javascript
{
  selectedDomain: String,
  selectedModules: [String],
  machineName: String,
  availableModules: [{...}],
  isDeploying: Boolean
}
```

**API Call:**
```javascript
POST /api/machines/create
Body: {
  name: String,
  domain: String,
  modules: [String]
}
```

---

#### Component: `DomainSelector.jsx`

**Purpose:** Domain selection interface

**Domains:**
- 🌐 Web (SQLi, XSS, CSRF, Auth Bypass)
- ☁️ Cloud (IAM, S3 Buckets, Secrets)
- 🔍 Forensics (Memory, Disk, Hidden Files)
- ⚔️ Red Team (Privilege Escalation, SSH)
- 🛡️ Blue Team (Log Analysis, Incident Response)

**Features:**
- Visual cards with icons
- Hover effects
- Active state highlighting
- Module count display

---

#### Component: `ModuleList.jsx`

**Purpose:** Display available modules for domain

**Module Display:**
- Module name
- Description
- Difficulty badge
- Points value
- Add/Remove button

**Features:**
- Filterable by difficulty
- Searchable by name
- Sorted by points
- Visual selection state

---

#### Component: `MachineCanvas.jsx`

**Purpose:** Selected modules visualization

**Display:**
- Grid layout of selected modules
- Module cards with remove option
- Total points counter
- Module count
- Empty state message

**Features:**
- Remove module button
- Drag-to-reorder (optional)
- Visual module relationships

---

### My Machines: `src/pages/MyMachines.jsx`

**Purpose:** User's created machines management

**Features:**
- Grid display of machines
- Status indicators (building, running, stopped, error)
- Machine details:
  - Name
  - Domain icon
  - Status badge
  - Module count
  - Creation date
  - Action buttons

**Machine Actions:**
- 🚀 **SOLVE LAB:** Navigate to solver (if running)
- ⏳ **Building:** Wait indicator (if building)
- ❌ **Build Failed:** Error message (if error)
- 🗑️ **Delete:** Remove machine and stop container

**Status Colors:**
- Running: Green
- Building: Yellow
- Stopped: Gray
- Error: Red

**API Calls:**
```javascript
GET /api/machines/my-machines
DELETE /api/machines/:id
```

---

### Machine Solver: `src/pages/MachineSolver.jsx` ⭐

**Purpose:** Multi-vulnerability solving interface

**This is the CORE solving interface with the recent multi-flag refactor**

---

#### Solver Architecture

**State Management:**
```javascript
{
  machine: Object,                    // Machine details
  solvedVulns: [{...}],              // User's solved vulnerabilities
  allUserMachines: [{...}],          // For navigation
  
  // PER-INSTANCE STATE (critical for isolation)
  flagInputs: {                       // Object keyed by vulnerabilityInstanceId
    'vuln-id-1': 'FLAG{...}',
    'vuln-id-2': '',
    'vuln-id-3': ''
  },
  flagResults: {                      // Per-instance results
    'vuln-id-1': { success: true, message: '...' },
    'vuln-id-2': null,
    'vuln-id-3': null
  },
  submittingFlags: {                  // Per-instance submission state
    'vuln-id-1': false,
    'vuln-id-2': true,  // Currently submitting
    'vuln-id-3': false
  },
  
  activeTab: String,                  // 'overview' | 'terminal' | 'flags'
  userStats: Object,                  // User progress
  solutions: [{...}]                  // Available solutions
}
```

---

#### Tabs

**1. Overview Tab**
- Machine name and description
- Domain badge
- Difficulty indicator
- Total points
- Module list with status
- Deployment information
- Access URL/terminal command

**2. Terminal/Access Tab**
- Web GUI: iFrame of machine URL
- Terminal: SSH command with copy button
- File Download: Download links
- Port and URL information

**3. Flags Tab** (REFACTORED - Multi-Input)

**OLD (Broken):**
```
Single flag input for ALL vulnerabilities
Active vulnerability banner
Tab-based selection
Shared state
```

**NEW (Correct):**
```
N separate inputs for N vulnerabilities
Each input bound to vulnerabilityInstanceId
Independent submission buttons
Per-instance state management
Progress bar showing completion
Machine counter (Machine X of Y)
Completion banner
Auto-navigation after completion
```

---

#### Flag Submission Flow

**Function:** `handleFlagSubmit(e, vulnerabilityInstanceId)`

```javascript
1. Prevent form default
2. Get flag value from flagInputs[vulnerabilityInstanceId]
3. Validate flag not empty
4. Set submittingFlags[vulnerabilityInstanceId] = true
5. Call API:
   POST /api/flags/verify
   Body: {
     machineId,
     vulnerabilityInstanceId,  // CRITICAL: Instance, not moduleId
     flag
   }
6. Handle response:
   - If correct:
     * Show success message
     * Clear input
     * Refresh solved vulnerabilities
     * Refresh user stats
     * Check if all vulnerabilities solved
     * If complete: Show banner, navigate to next machine after 2s
   - If incorrect:
     * Show error message
     * Keep input (allow retry)
   - If already solved:
     * Show "Already captured" message
7. Set submittingFlags[vulnerabilityInstanceId] = false
```

---

#### Auto-Navigation Feature

**Function:** `checkAndNavigateToNextMachine()`

```javascript
1. Check if ALL vulnerabilities solved:
   solvedCount === totalVulnerabilities
2. If not complete, return
3. If complete:
   - Show completion banner
   - Get all running machines
   - Find current machine index
   - Get next machine in list
   - Wait 2 seconds (show completion message)
   - Navigate to next machine: /solve/{nextMachineId}
4. If no next machine:
   - Navigate to /my-machines
```

**Features:**
- Seamless progression through machines
- 2-second delay for user feedback
- Banner animation during transition
- Handles edge case (last machine)

---

#### Flags Tab Rendering

**Function:** `renderFlagsTab()`

**Structure:**
```jsx
<div className="flags-tab">
  {/* Machine Counter */}
  <div className="machine-counter">
    Machine {currentIndex} of {totalMachines}
  </div>
  
  {/* Progress Bar */}
  <div className="progress-bar-container">
    <div className="progress-bar-fill" style={{ width: '{percent}%' }} />
  </div>
  
  {/* Completion Banner (if all solved) */}
  {allSolved && (
    <div className="all-flags-captured-banner">
      🎉 All flags captured! Loading next machine...
    </div>
  )}
  
  {/* Flag Submissions List */}
  <div className="flag-submissions-list">
    {machine.vulnerabilities.map((vuln) => {
      const isSolved = solvedVulns.some(
        v => v.vulnerabilityInstanceId === vuln.vulnerabilityInstanceId
      );
      
      return (
        <div key={vuln.vulnerabilityInstanceId} 
             className={`flag-submission-item ${isSolved ? 'solved' : ''}`}>
          
          {/* Header */}
          <div className="flag-item-header">
            <span className="vuln-number">#{index + 1}</span>
            <span className="vuln-name">{vuln.name}</span>
            <span className="vuln-points">{vuln.points} pts</span>
            {isSolved && <span className="solved-badge-inline">✓ SOLVED</span>}
          </div>
          
          {/* Input or Solved Display */}
          {isSolved ? (
            <div className="flag-solved-display">
              <span className="solved-checkmark">✓</span>
              <span>Flag Captured!</span>
            </div>
          ) : (
            <form onSubmit={(e) => handleFlagSubmit(e, vuln.vulnerabilityInstanceId)}>
              <input
                value={flagInputs[vuln.vulnerabilityInstanceId] || ''}
                onChange={(e) => setFlagInputs({
                  ...flagInputs,
                  [vuln.vulnerabilityInstanceId]: e.target.value
                })}
                placeholder="FLAG{...}"
              />
              <button 
                type="submit"
                disabled={submittingFlags[vuln.vulnerabilityInstanceId]}
              >
                {submittingFlags[vuln.vulnerabilityInstanceId] 
                  ? 'Verifying...' 
                  : 'Submit Flag'}
              </button>
            </form>
          )}
          
          {/* Result Message */}
          {flagResults[vuln.vulnerabilityInstanceId] && (
            <div className={`result-message ${success ? 'success' : 'error'}`}>
              {flagResults[vuln.vulnerabilityInstanceId].message}
            </div>
          )}
        </div>
      );
    })}
  </div>
  
  {/* Solutions Button */}
  <button onClick={fetchSolutions}>
    View Solutions & Hints
  </button>
</div>
```

**Key Features:**
- **Per-Vulnerability Cards:** Each vulnerability gets own card
- **Independent Inputs:** Separate input per vulnerabilityInstanceId
- **Visual Hierarchy:** Number badge, name, points, status
- **Solved State:** Checkmark and disabled input when solved
- **Progress Tracking:** Visual progress bar and counter
- **Completion Detection:** Banner when all flags captured
- **Auto-Navigation:** Moves to next machine after completion

---

#### Solutions Feature

**Function:** `fetchSolutions()`

**Process:**
```javascript
1. Call GET /api/flags/solutions/:machineId
2. Receive solutions for ALL vulnerability instances
3. Display in modal/section:
   - Vulnerability name
   - Hint
   - Step-by-step solution
   - Methodology explanation
4. Solutions keyed by vulnerabilityInstanceId
```

**Features:**
- Available after attempting flags
- Shows hints first (expandable)
- Detailed methodology
- Code examples where applicable
- Learning-focused (not just answers)

---

### Leaderboard Page: `src/pages/Leaderboard.jsx`

**Purpose:** Display global rankings

**Display:**
- Position ranking (1, 2, 3, ...)
- Username
- Team name (if applicable)
- Total points
- Rank badge
- Solved machines count

**Features:**
- Sorted by points (descending)
- Highlight current user
- Medal icons for top 3
- Real-time updates
- Responsive table/card layout

**API Call:**
```javascript
GET /api/leaderboard
```

---

### Challenges Page: `src/pages/Challenges.jsx` (Legacy)

**Purpose:** Original CTF challenge system

**Note:** This is the legacy system before machines were implemented. Still functional but deprecated in favor of machines.

**Features:**
- Static challenge list
- Difficulty filters
- Download buttons
- Flag submission
- Points tracking

---

## 🧩 Components

### Navbar: `src/components/Navbar.jsx`

**Purpose:** Global navigation header

**Elements:**
- Logo/Brand
- Navigation links:
  - Home
  - Challenges (legacy)
  - Machine Builder
  - My Machines
  - Leaderboard
- User menu (if authenticated):
  - Username display
  - Points display
  - Rank badge
  - Logout button
- Login/Register buttons (if not authenticated)

**Features:**
- Responsive mobile menu
- Active route highlighting
- Dropdown user menu
- Logout functionality

---

### Footer: `src/components/Footer.jsx`

**Purpose:** Global footer

**Content:**
- Copyright information
- Social links
- Quick links
- Platform description

---

### LeaderboardCard: `src/components/LeaderboardCard.jsx`

**Purpose:** Individual leaderboard entry card

**Props:**
```javascript
{
  position: Number,
  username: String,
  teamName: String,
  points: Number,
  rank: String,
  solvedMachines: Number,
  isCurrentUser: Boolean
}
```

**Features:**
- Medal icons for top 3
- Highlight current user
- Rank badge
- Points display
- Solved count

---

### QuestCard: `src/components/QuestCard.jsx` (Legacy)

**Purpose:** Challenge card for legacy system

**Props:**
```javascript
{
  id: Number,
  title: String,
  description: String,
  difficulty: String,
  points: Number,
  solved: Boolean
}
```

---

## 📦 Vulnerability Modules

### Module Structure

Each vulnerability module follows this structure:

```
modules/
└── {domain}/
    └── {module_id}/
        ├── Dockerfile (optional, overridden by combined build)
        ├── app.js (Express routes)
        ├── metadata.json (configuration)
        └── package.json (optional)
```

---

### Metadata Schema: `metadata.json`

```json
{
  "id": "sql_injection",
  "name": "SQL Injection",
  "domain": "web",
  "difficulty": "medium",
  "description": "Exploit SQL injection vulnerability to gain admin access",
  "solve_method": "gui",
  "port": 3000,
  "terminal_enabled": false,
  "route": "/sql_injection",
  "points": 75,
  "flag": "FLAG{SQL_INJECTION_MASTER}",
  "hints": [
    "SQL queries are built using string concatenation",
    "Try using quotes and logical operators",
    "Classic payload: ' OR '1'='1"
  ],
  "learning_objectives": [
    "Understand SQL injection vulnerabilities",
    "Learn authentication bypass techniques",
    "Practice SQL injection exploitation"
  ]
}
```

**Fields:**
- `id`: Unique module identifier
- `name`: Display name
- `domain`: Parent domain
- `difficulty`: easy | medium | hard
- `solve_method`: gui | terminal | api | file
- `route`: URL path (e.g., /sql_injection)
- `points`: Points awarded for solving
- `flag`: Default flag (overridden during deployment)
- `hints`: Array of progressive hints
- `learning_objectives`: Educational goals

---

### Example: SQL Injection Module

**File:** `modules/web/sql_injection/app.js`

**Features:**
- Express router
- SQLite in-memory database
- Vulnerable login form
- Intentional SQL injection point
- Admin flag reveal on successful injection

**Vulnerable Code:**
```javascript
const query = `SELECT * FROM users WHERE user='${username}' AND pass='${password}'`;
// No parameterized queries = vulnerable
```

**Exploit:**
```
Username: admin' OR '1'='1' --
Password: anything
```

**Flag Location:** Revealed after successful injection

---

### Example: XSS Module

**File:** `modules/web/xss/app.js`

**Features:**
- Comment posting system
- No input sanitization
- Reflected XSS vulnerability
- Stored XSS in comments
- Flag hidden in admin cookies

**Vulnerable Code:**
```javascript
app.get('/comments', (req, res) => {
  const search = req.query.search;
  res.send(`<h1>Search results for: ${search}</h1>`);
  // Direct output without escaping = XSS
});
```

**Exploit:**
```html
<script>alert(document.cookie)</script>
```

---

### Example: Auth Bypass Module

**File:** `modules/web/auth_bypass/app.js`

**Features:**
- JWT token system
- Weak secret key
- Token manipulation vulnerability
- Admin panel access control
- Flag in admin panel

**Vulnerable Code:**
```javascript
const secret = 'weak_secret';  // Hardcoded weak secret
const token = jwt.sign({ user, role }, secret);
```

**Exploit:**
```javascript
// Decode token, change role to 'admin', re-sign with weak secret
```

---

### Example: Cloud - Exposed Secrets

**File:** `modules/cloud/exposed_secrets/app.js`

**Features:**
- Simulated AWS credentials in code
- .env file exposure
- Git repository with secrets
- API key leakage
- Flag in environment variables

**Vulnerable Code:**
```javascript
const AWS_KEY = 'AKIAIOSFODNN7EXAMPLE';  // Hardcoded in source
```

**Exploit:**
```bash
# Access .git/config or .env file
curl http://target/.env
```

---

### Example: Forensics - Hidden Files

**File:** `modules/forensics/hidden_files/app.js`

**Features:**
- Hidden files and directories
- Metadata in exif data
- Flag in .hidden_config
- Steganography in images
- Deleted file recovery

**File Structure:**
```
.hidden_config (flag inside)
.git/
uploads/image.png (steganography)
```

**Exploit:**
```bash
ls -la  # Show hidden files
cat .hidden_config
```

---

## 🎨 Styling

### Global Styles: `src/styles/index.css`

**Features:**
- TailwindCSS base classes
- Custom CSS variables
- Global typography
- Color scheme (terminal green theme)
- Responsive utilities

---

### Machine Solver Styles: `src/styles/MachineSolver.css`

**Critical Styles for Multi-Flag System:**

```css
/* Flag Submissions Container */
.flag-submissions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Individual Vulnerability Card */
.flag-submission-item {
  border: 1px solid #00ff00;
  padding: 20px;
  border-radius: 8px;
  transition: all 0.3s;
}

.flag-submission-item:hover {
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
}

.flag-submission-item.solved {
  opacity: 0.7;
  background: rgba(0, 255, 0, 0.05);
}

/* Vulnerability Header */
.flag-item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.vuln-number {
  background: #00ff00;
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.vuln-name {
  text-transform: uppercase;
  font-weight: bold;
}

.vuln-points {
  margin-left: auto;
  color: #00ff00;
}

.solved-badge-inline {
  background: #00ff00;
  color: #000;
  padding: 4px 12px;
  border-radius: 12px;
}

/* Progress Bar */
.progress-bar-container {
  height: 8px;
  background: rgba(0, 255, 0, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff00, #00cc00);
  transition: width 0.5s ease;
}

/* Completion Banner */
.all-flags-captured-banner {
  background: linear-gradient(135deg, #00ff00, #00cc00);
  color: #000;
  padding: 20px;
  text-align: center;
  font-weight: bold;
  border-radius: 8px;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Machine Counter */
.machine-counter {
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  padding: 10px 20px;
  border-radius: 20px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 20px;
}
```

---

## 🔐 Security Features

### Authentication
- **JWT Tokens:** HTTP-only cookies (prevents XSS theft)
- **Password Hashing:** bcrypt with 10 salt rounds
- **Token Expiry:** 24 hours
- **CSRF Protection:** SameSite cookie policy

### Authorization
- **User Ownership:** Users can only delete their own machines
- **Flag Verification:** Per-user tracking prevents sharing
- **Protected Routes:** Authentication middleware on sensitive endpoints

### Input Validation
- **MongoDB Injection:** Mongoose schema validation
- **XSS Prevention:** React auto-escaping (frontend)
- **File Upload:** Type and size validation
- **SQL Injection:** Parameterized queries (in production code, not modules)

### Docker Isolation
- **Container Sandboxing:** Each machine in isolated container
- **Port Mapping:** External port mapped to internal 3000
- **Network Isolation:** Containers don't communicate
- **Resource Limits:** (can be added) CPU/memory constraints

---

## 🚀 Deployment & Production

### Environment Variables

**Backend (.env):**
```bash
MONGODB_URI=mongodb://localhost:27017/cyberforge
JWT_SECRET=your-secret-key-here
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend (vite):**
```bash
VITE_API_URL=http://localhost:5000
```

### Build Commands

**Backend:**
```bash
npm run server       # Development
node server/index.js # Production
```

**Frontend:**
```bash
npm run dev          # Development (Vite)
npm run build        # Production build
npm run preview      # Preview production build
```

### Production Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure MongoDB URI for production
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up Docker registry for images
- [ ] Configure file upload limits
- [ ] Set up logging (Winston/Morgan)
- [ ] Configure rate limiting
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

---

## 📊 Database Schema Summary

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  teamName: String,
  totalPoints: Number,
  rank: String,
  solvedChallenges: [Number],
  solvedMachines: [{machineId, solvedAt, points}],
  solvedVulnerabilities: [{
    machineId,
    vulnerabilityInstanceId,  // UNIQUE per machine
    moduleId,
    points,
    solvedAt
  }],
  labReports: [{machineId, reportPath, submittedAt}],
  createdAt: Date,
  updatedAt: Date
}
```

### Machines Collection
```javascript
{
  _id: ObjectId,
  name: String,
  domain: String,
  createdBy: ObjectId (User),
  teamName: String,
  modules: [String],
  vulnerabilities: [{
    moduleId: String,
    vulnerabilityInstanceId: String,  // UNIQUE
    name: String,
    points: Number,
    flag: String,  // UNIQUE per instance
    route: String,
    solveMethod: String
  }],
  containerId: String,
  imageName: String,
  port: Number,
  status: String,
  totalPoints: Number,
  baseUrl: String,
  access: {url, terminal, downloads},
  solutions: Map<String, Object>,  // Keyed by vulnerabilityInstanceId
  deployedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### LabReports Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (User),
  machineId: ObjectId (Machine),
  machineName: String,
  teamName: String,
  reportPath: String,
  fileName: String,
  fileSize: Number,
  submittedAt: Date
}
```

---

## 🔄 Data Flow Examples

### Machine Creation Flow
```
1. User fills Machine Builder form
2. Frontend: POST /api/machines/create
3. Backend: Validate input
4. Backend: Load module metadata
5. Backend: Generate vulnerability instances with unique IDs and flags
6. Backend: Create Machine document (status='building')
7. Backend: Call deployMachine()
8. Docker: Create build context with ALL modules
9. Docker: Build combined image
10. Docker: Run container
11. Backend: Update Machine (status='running', containerId, port)
12. Backend: Store solutions Map (keyed by vulnerabilityInstanceId)
13. Frontend: Navigate to /my-machines
14. User sees machine with 'running' status
```

### Flag Submission Flow
```
1. User opens Machine Solver: /solve/:machineId
2. Frontend: GET /api/machines/:machineId
3. Backend: Return machine with vulnerabilities array
4. Frontend: Render N input fields for N vulnerabilities
5. User enters flag in specific vulnerability input
6. User clicks submit on that specific form
7. Frontend: POST /api/flags/verify with {machineId, vulnerabilityInstanceId, flag}
8. Backend: Find machine
9. Backend: Find user
10. Backend: Check if THIS vulnerabilityInstanceId already solved
11. Backend: Find vulnerability in machine.vulnerabilities by vulnerabilityInstanceId
12. Backend: Compare submitted flag with vulnerability.flag
13. If correct:
    - Add to user.solvedVulnerabilities with vulnerabilityInstanceId
    - Add points to user.totalPoints
    - Update rank if threshold crossed
    - Check if ALL vulnerabilities solved
    - If all solved, add to user.solvedMachines
14. Frontend: Update UI for that specific vulnerability
15. Frontend: Show success/error message
16. Frontend: Update progress bar
17. If all solved: Show completion banner, navigate to next machine
```

### Machine Deletion Flow
```
1. User clicks delete button on My Machines
2. Confirmation dialog
3. Frontend: DELETE /api/machines/:machineId
4. Backend: Verify user is creator
5. Backend: Call stopDockerContainer(containerId)
6. Docker: docker stop {containerId}
7. Docker: docker rm {containerId}
8. Backend: Delete Machine document
9. Frontend: Remove from UI
10. Frontend: Show success message
```

---

## 🧪 Testing Scenarios

### Multi-Vulnerability Machine Test
```
1. Create machine with 3 modules: SQLi + XSS + CSRF
2. Verify only 1 container runs: docker ps
3. Check container logs for all 3 routes
4. Test each route:
   - curl http://localhost:8000/sql_injection
   - curl http://localhost:8000/xss
   - curl http://localhost:8000/csrf
5. Open Machine Solver
6. Verify 3 separate flag inputs shown
7. Submit SQLi flag → Counter: 1/3
8. Submit XSS flag → Counter: 2/3
9. Submit CSRF flag → Counter: 3/3, completion banner
10. Wait 2s → Auto-navigate to next machine
11. Verify points added correctly
12. Verify rank updated if threshold crossed
```

### Instance Isolation Test
```
1. Create Machine A with SQLi
2. Create Machine B with SQLi
3. Verify different vulnerabilityInstanceIds
4. Verify different flags
5. Solve Machine A's SQLi
6. Verify Machine B's SQLi still unsolved
7. Verify independent flag counters
```

---

## 🐛 Common Issues & Debugging

### Issue: "Only first module deploys"
**Cause:** Using old primaryModule logic
**Fix:** Ensure using refactored docker.js with combined build

### Issue: "Flag already captured" for different machines
**Cause:** Solutions keyed by moduleId instead of vulnerabilityInstanceId
**Fix:** Verify solutions stored as `Map<vulnerabilityInstanceId, data>`

### Issue: "Multiple containers per machine"
**Cause:** Building separate images per module
**Fix:** Verify deployMachine creates ONE container with ALL modules

### Issue: "Ports exhausted"
**Cause:** Containers not cleaned up
**Fix:** Run `docker ps -a | grep cyberforge` and remove old containers

### Issue: "Build context not found"
**Cause:** Cleanup ran before build completed
**Fix:** Verify cleanupBuildContext only runs after successful deployment

---

## 📈 Performance Considerations

### Database Optimization
- Index on `username` and `email` (unique)
- Index on `solvedVulnerabilities.vulnerabilityInstanceId`
- Index on `machines.createdBy` for user queries
- Compound index on `(machineId, vulnerabilityInstanceId)` for flag verification

### Docker Optimization
- Use Alpine base images (smaller size)
- Multi-stage builds (if needed)
- Cache npm dependencies
- Limit container resources
- Clean up stopped containers regularly

### Frontend Optimization
- Code splitting with React.lazy()
- Image optimization
- Lazy load module metadata
- Cache API responses
- Debounce search/filter inputs

---

## 🔮 Future Enhancements

### Planned Features
1. **Team System:** Multi-user teams with shared progress
2. **Machine Templates:** Pre-built machine configurations
3. **Custom Flags:** User-defined flags during machine creation
4. **Hint System:** Progressive hints with point deductions
5. **Time Limits:** Timed challenges with leaderboards
6. **Difficulty Scaling:** Dynamic difficulty based on performance
7. **Achievements:** Badges for milestones
8. **Social Features:** Comments, ratings, sharing
9. **Analytics Dashboard:** Solve rates, time tracking
10. **Mobile App:** Native mobile experience

### Technical Improvements
1. **WebSocket:** Real-time progress updates
2. **Kubernetes:** Production container orchestration
3. **Redis:** Caching and session management
4. **GraphQL:** Flexible API queries
5. **TypeScript:** Type safety throughout
6. **Testing:** Unit tests, integration tests, e2e tests
7. **CI/CD:** Automated deployment pipeline
8. **Monitoring:** Prometheus, Grafana
9. **Logging:** Centralized logging with ELK
10. **Documentation:** API docs with Swagger/OpenAPI

---

## 📝 Contributing Guidelines

### Code Style
- ESLint configuration
- Prettier formatting
- Meaningful variable names
- Comprehensive comments
- JSDoc for functions

### Git Workflow
- Feature branches
- Descriptive commit messages
- Pull request reviews
- Squash merges

### Testing Requirements
- Unit tests for utilities
- Integration tests for API routes
- E2E tests for critical flows
- Minimum 80% coverage

---

## 📞 Support & Contact

### Documentation
- README.md - Quick start guide
- MULTI_VULN_DEPLOYMENT_REFACTOR.md - Technical deep-dive
- QUICK_START_MULTI_VULN.md - Testing guide

### Issues
- GitHub Issues for bug reports
- Feature requests welcome
- Security vulnerabilities: private disclosure

---

**Last Updated:** January 23, 2026
**Version:** 2.0.0 (Multi-Vulnerability Deployment)
**Maintained By:** CyberForge Development Team
