# Machine Builder Feature Documentation

## Overview

The Machine Builder is a visual drag-and-drop interface that allows users to create custom vulnerable cybersecurity machines for learning and practice.

## Features Implemented

### Frontend

#### 1. **Machine Builder Page** (`/machine-builder`)
- Step-by-step machine creation process
- Visual domain selection interface
- Drag-and-drop module selection
- Machine canvas for building configurations
- Real-time preview of selected modules

#### 2. **My Machines Page** (`/my-machines`)
- View all created machines
- Machine management (delete, view details)
- Status indicators
- Quick access to machine builder

#### 3. **Components**

**DomainSelector**
- Visual selection of cybersecurity domains:
  - 🌐 Web Security
  - ⚔️ Red Team
  - 🛡️ Blue Team
  - ☁️ Cloud Security
  - 🔍 Forensics

**ModuleList**
- Displays available modules for selected domain
- Draggable module cards with difficulty indicators
- Color-coded difficulty levels (Low, Medium, High)

**MachineCanvas**
- Drop zone for selected modules
- Visual feedback during drag operations
- Module removal capability
- Create machine button

### Backend

#### API Endpoints

**Machine Creation**
- `POST /api/machines/create` - Create a new machine
- `GET /api/machines/my-machines` - Get all user machines
- `GET /api/machines/:id` - Get specific machine details
- `DELETE /api/machines/:id` - Delete a machine
- `PATCH /api/machines/:id/status` - Update machine status

#### Database Schema

```javascript
{
  name: String,
  owner: ObjectId (ref: User),
  ownerTeamName: String,
  domain: String (enum),
  modules: [String],
  status: String (enum),
  containerId: String,
  accessUrl: String,
  port: Number,
  createdAt: Date,
  lastModified: Date
}
```

## Modules by Domain

### Web Security
- SQL Injection
- Cross-Site Scripting (XSS)
- CSRF
- File Upload Vulnerability
- Authentication Bypass

### Red Team
- Weak SSH Credentials
- Exposed Services
- Privilege Escalation
- Insecure Cron Jobs

### Blue Team
- Log Analysis Challenge
- Malware Detection
- SIEM Alert Investigation

### Cloud Security
- Public Storage Bucket
- Misconfigured IAM Policy
- Exposed Environment Variables

### Forensics
- Memory Dump Analysis
- Disk Image Investigation
- Hidden Files Challenge

## Technology Stack

### Frontend
- **React** - UI framework
- **@dnd-kit** - Drag and drop library (reused from Trello clone)
  - `@dnd-kit/core` - Core drag-and-drop functionality
  - `@dnd-kit/sortable` - Sortable lists
  - `@dnd-kit/utilities` - Helper utilities
- **React Router** - Navigation
- **Tailwind CSS** - Styling (matching CyberForge theme)

### Backend
- **Express.js** - REST API
- **MongoDB/Mongoose** - Database
- **JWT** - Authentication

## File Structure

```
CyberForge/
├── src/
│   ├── pages/
│   │   ├── MachineBuilder.jsx       # Main machine builder page
│   │   └── MyMachines.jsx           # View created machines
│   ├── components/
│   │   └── MachineBuilder/
│   │       ├── DomainSelector.jsx   # Domain selection UI
│   │       ├── ModuleList.jsx       # Draggable modules
│   │       └── MachineCanvas.jsx    # Drop zone & canvas
│   └── utils/
│       └── machineData.js           # Domain & module definitions
└── server/
    ├── models/
    │   └── Machine.js               # Machine schema
    └── routes/
        └── machines.js              # Machine API routes
```

## Usage Flow

1. **Select Domain** - User chooses a cybersecurity domain
2. **Browse Modules** - Available modules are displayed based on domain
3. **Drag & Drop** - User drags modules into the machine canvas
4. **Configure** - User names the machine and reviews selections
5. **Create** - Machine configuration is saved to database

## Design Consistency

The Machine Builder maintains CyberForge's hacker aesthetic:
- ✅ Black background (`#0a0a0a`)
- ✅ Green terminal theme (`text-green-400`)
- ✅ Monospace font (Courier New)
- ✅ Border styling matching existing components
- ✅ Consistent hover effects and transitions
- ✅ Terminal-style status indicators

## Future Enhancements (Not Implemented)

### Phase 2: Machine Deployment
- Docker container generation
- Predefined vulnerable code modules
- Module assembly logic
- Container orchestration

### Phase 3: Machine Access
- Web-based terminal for non-web labs
- Browser access for web-based machines
- Port management
- Resource monitoring

### Phase 4: Advanced Features
- Machine templates
- Sharing machines with other users
- Difficulty ratings
- Machine challenges/objectives

## API Request Examples

### Create Machine
```javascript
POST /api/machines/create
Headers: { Cookie: token=... }
Body: {
  "name": "My Web Security Lab",
  "domain": "web",
  "modules": ["sql_injection", "xss", "csrf"]
}

Response: {
  "success": true,
  "message": "Machine created successfully",
  "machine": { ... }
}
```

### Get My Machines
```javascript
GET /api/machines/my-machines
Headers: { Cookie: token=... }

Response: {
  "success": true,
  "machines": [{ ... }]
}
```

### Delete Machine
```javascript
DELETE /api/machines/:id
Headers: { Cookie: token=... }

Response: {
  "success": true,
  "message": "Machine deleted successfully"
}
```

## Security Considerations

- ✅ Authentication required for all machine operations
- ✅ Users can only access/modify their own machines
- ✅ Input validation on domain and module selection
- ✅ Protected API routes with JWT middleware
- ⚠️ **TODO**: Rate limiting for machine creation
- ⚠️ **TODO**: Resource quotas per user

## Testing Checklist

- [x] Domain selection works correctly
- [x] Modules load based on selected domain
- [x] Drag and drop functionality
- [x] Module addition to canvas
- [x] Module removal from canvas
- [x] Machine name validation
- [x] API integration
- [x] Machine listing
- [x] Machine deletion
- [x] Authentication protection
- [x] Theme consistency

## Notes

- The Machine Builder reuses drag-and-drop logic from PedroTech's Trello clone
- No external AI or LLMs are used
- Machine deployment (Docker) is planned but not implemented
- Current version focuses on configuration management
- Module definitions are static and predefined

## Contributing

When adding new modules:
1. Update `src/utils/machineData.js` with module definition
2. Ensure module ID is unique within domain
3. Provide clear description and difficulty level
4. Backend module implementation goes in `server/modules/{domain}/{module_id}/`
