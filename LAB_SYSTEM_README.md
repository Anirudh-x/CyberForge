# CyberForge Lab System - Complete Implementation

## ✅ IMPLEMENTED FEATURES

### 1. Predefined Vulnerable Modules ✓

All modules are **hardcoded** with predefined vulnerable code. **NO AI or dynamic generation.**

#### Web Security Labs (GUI Interface)
- **SQL Injection** - Exploitable login with string concatenation vulnerability
- **XSS** - Reflected cross-site scripting in comment system
- **Auth Bypass** - Client-side cookie authentication vulnerability

#### Red Team Labs (Terminal Interface)
- **Weak SSH Credentials** - Brute-forceable SSH with weak password
- **Privilege Escalation** - SUID binary exploitation

#### Blue Team Labs (File Download Interface)
- **Log Analysis** - Download and analyze system logs for security incidents

#### Cloud Security Labs (API Interface)
- **Exposed Secrets** - Misconfigured API exposing sensitive data

#### Forensics Labs (File Download Interface)
- **Hidden Files** - Digital forensics challenge with hidden data

### 2. Docker Isolation ✓

Every machine runs in its own isolated Docker container:
- Automatic Docker image building from module Dockerfiles
- Container orchestration with port mapping
- Automatic cleanup on machine deletion
- Resource isolation between labs

### 3. MongoDB Schema ✓

```javascript
Machine {
  name: String,
  owner: ObjectId,
  domain: String (enum),
  modules: [String],
  status: 'building' | 'running' | 'stopped' | 'error',
  containerId: String,
  imageName: String,
  solveMethod: 'gui' | 'terminal' | 'file' | 'api',
  access: {
    url: String,
    terminal: String,
    downloads: [String]
  },
  port: Number,
  createdAt: Date
}
```

### 4. Solving Interfaces ✓

**MachineSolver** component routes users to correct interface based on `solveMethod`:

- **GUI** - Embedded iframe + external link for web-based labs
- **Terminal** - SSH instructions + embedded interface for command-line labs
- **File** - Download links for forensics/analysis labs
- **API** - Embedded interface for API exploration labs

### 5. Complete Workflow ✓

1. **User Creates Machine** → Selects domain + modules via drag-and-drop
2. **Backend Receives Request** → Validates input, creates DB record
3. **Docker Deployment** → Builds image, runs container, assigns port
4. **Status Updates** → Machine status changes: `building` → `running`
5. **User Solves Lab** → Clicks "SOLVE LAB" button on My Machines page
6. **Interface Rendered** → Based on solve_method, appropriate UI is shown
7. **Machine Cleanup** → Delete button stops container and removes DB record

## 📁 MODULE STRUCTURE

```
modules/
├── web/
│   ├── sql_injection/
│   │   ├── app.js          # Express app with SQL injection vulnerability
│   │   ├── Dockerfile      # Node.js container config
│   │   └── metadata.json   # Module info (solve_method, flag, hints)
│   ├── xss/
│   └── auth_bypass/
├── red_team/
│   ├── weak_ssh/
│   │   ├── setup.sh        # Creates users, sets passwords, flags
│   │   ├── Dockerfile      # Ubuntu + SSH server
│   │   └── metadata.json
│   └── privilege_escalation/
├── blue_team/
│   └── log_analysis/
│       ├── app.js          # File download server
│       ├── system.log      # Log file with flag hidden inside
│       ├── Dockerfile
│       └── metadata.json
├── cloud/
│   └── exposed_secrets/
│       ├── app.js          # API with exposed config endpoint
│       ├── Dockerfile
│       └── metadata.json
└── forensics/
    └── hidden_files/
        ├── app.js          # ZIP file generation
        ├── .hidden_config  # Hidden file with flag
        ├── readme.txt      # Decoy file
        ├── Dockerfile
        └── metadata.json
```

## 🔧 BACKEND IMPLEMENTATION

### Docker Utility (`server/utils/docker.js`)

```javascript
// Build Docker image from module
buildDockerImage(domain, moduleId)

// Run container with port mapping
runDockerContainer(imageName, port, containerName)

// Stop and remove container
stopDockerContainer(containerId)

// Get module metadata
getModuleMetadata(domain, moduleId)

// Deploy complete machine
deployMachine(machineId, domain, modules)
```

### Machine API (`server/routes/machines.js`)

- `POST /api/machines/create` - Creates machine, triggers Docker deployment
- `GET /api/machines/my-machines` - Lists user's machines
- `GET /api/machines/:id` - Gets specific machine details
- `DELETE /api/machines/:id` - Stops container + deletes machine

## 🎨 FRONTEND IMPLEMENTATION

### Machine Builder (`src/pages/MachineBuilder.jsx`)
- Domain selection (5 domains)
- Module drag-and-drop (@dnd-kit)
- Canvas for machine assembly
- Create API call

### My Machines (`src/pages/MyMachines.jsx`)
- Grid display of created machines
- Status indicators (building, running, stopped, error)
- **SOLVE LAB** button (only for running machines)
- Delete button

### Machine Solver (`src/pages/MachineSolver.jsx`)
- Fetches machine details
- Polls status if building
- Renders appropriate interface:
  - **GUI/API** → Iframe + open in new tab
  - **Terminal** → SSH instructions + iframe
  - **File** → Download instructions + iframe
- Status messages (building, error, stopped)

## 🚀 USAGE

### 1. Create a Machine

```
http://localhost:3000/machine-builder
→ Select domain (e.g., Web Security)
→ Drag modules (e.g., SQL Injection, XSS)
→ Name machine
→ Create
```

### 2. Wait for Build

Machine status: `building` (30-60 seconds)
- Docker image is built
- Container is started
- Port is assigned

### 3. Solve Lab

```
http://localhost:3000/my-machines
→ Find machine (status: running)
→ Click "🚀 SOLVE LAB"
→ Redirected to /solve/:id
→ Interface renders based on solve_method
```

### 4. Access Lab

- **Web Labs** → Opens in iframe, can open in new tab
- **Terminal Labs** → Shows SSH command + instructions
- **File Labs** → Shows download button
- **API Labs** → Embedded API explorer

## 📊 SOLVE METHODS BY DOMAIN

| Domain | Solve Method | Interface |
|--------|-------------|-----------|
| Web | GUI | Browser/Iframe |
| Red Team | Terminal | SSH + Instructions |
| Blue Team | File | Download + Analysis |
| Cloud | API | Browser/Iframe |
| Forensics | File | Download + Analysis |

## 🔒 SECURITY NOTES

### Safe Isolation
- Each machine runs in separate Docker container
- No direct host access
- Port mapping controlled by backend
- Containers are ephemeral (deleted when machine is deleted)

### Predefined Vulnerabilities
- All vulnerable code is **hardcoded**
- No dynamic code generation
- No AI/LLM APIs used
- Flags are embedded in module files

### User Authentication
- JWT-based authentication required
- Users can only access their own machines
- Cookie-based session management

## 🐛 TROUBLESHOOTING

### Docker Not Running
```bash
# Start Docker Desktop or Docker daemon
docker ps
```

### Module Build Fails
- Check Dockerfile syntax
- Ensure all files exist in module directory
- Check Docker logs: `docker logs <container_id>`

### Port Already in Use
- Ports start at 8000 and increment
- Check running containers: `docker ps`
- Stop conflicts: `docker stop <container_id>`

### Machine Stuck in "Building"
- Check backend logs for errors
- Verify Docker has resources (CPU/Memory)
- Try deleting and recreating machine

## 📝 ADDING NEW MODULES

1. Create module directory:
```bash
mkdir -p modules/<domain>/<module_id>
```

2. Add files:
- `app.js` or equivalent application code
- `Dockerfile` with build instructions
- `metadata.json` with module info

3. Metadata structure:
```json
{
  "id": "module_id",
  "name": "Display Name",
  "domain": "web|red_team|blue_team|cloud|forensics",
  "difficulty": "low|medium|high",
  "description": "What the lab teaches",
  "solve_method": "gui|terminal|file|api",
  "port": 3000,
  "flag": "FLAG{YOUR_FLAG_HERE}",
  "hints": ["Hint 1", "Hint 2"]
}
```

4. Update `src/utils/machineData.js` to include new module in UI

## 🎯 NEXT STEPS (Not Implemented)

- [ ] Multi-module orchestration (Docker Compose)
- [ ] Real web-based terminal (xterm.js + WebSocket)
- [ ] Machine templates/presets
- [ ] Resource limits per user
- [ ] Machine sharing/collaboration
- [ ] Automated flag verification
- [ ] Progress tracking/achievements

## ✅ COMPLETION CHECKLIST

- [x] Predefined vulnerable modules (8 modules across 5 domains)
- [x] Docker isolation and deployment
- [x] MongoDB schema with solve_method and access fields
- [x] Machine creation API with Docker integration
- [x] Solving interfaces (GUI/Terminal/File/API)
- [x] Frontend routing and status management
- [x] Container cleanup on deletion
- [x] Port management
- [x] Status polling for building machines
- [x] Theme consistency maintained

---

**CyberForge Lab System is now fully operational!**

🎓 Users can create, deploy, and solve cybersecurity labs
🐳 All labs run in isolated Docker containers
🎨 Clean, terminal-themed interface
🔒 Secure, predefined vulnerable code (no AI generation)
