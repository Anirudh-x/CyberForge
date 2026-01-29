# CyberForge - CTF Platform

A comprehensive Capture The Flag (CTF) cybersecurity training platform that enables users to create, deploy, and solve multi-vulnerability machines with Docker containerization.

## Features

- 🔐 **User Authentication** - JWT-based login/register with HTTP-only cookies
- 🎯 **Machine Builder** - Drag-and-drop interface to create custom vulnerable machines
- 🐳 **Docker Isolation** - Each machine runs in isolated Docker containers
- 🚩 **Multi-Vulnerability Support** - Multiple vulnerabilities per machine, each with unique flags
- 🏆 **Leaderboard** - Track progress across domains (Web, Cloud, Red Team, Blue Team, Forensics)
- 📝 **Lab Reports** - Upload reports for completed machines
- 💡 **Solution Walkthroughs** - Built-in hints and solutions for learning

## Tech Stack

- **Frontend:** React 18 + Vite + TailwindCSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Containerization:** Docker

## Quick Start

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Docker Desktop

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start MongoDB (if local)
mongod

# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
npm run dev
```

**Access:** http://localhost:3000

## Available Modules

| Domain        | Modules                                    |
| ------------- | ------------------------------------------ |
| **Web**       | SQL Injection, XSS, CSRF, Auth Bypass      |
| **Red Team**  | Weak SSH, Privilege Escalation             |
| **Blue Team** | Log Analysis                               |
| **Cloud**     | Exposed Secrets, Public Bucket, IAM Policy |
| **Forensics** | Hidden Files, Memory Dump, Disk Image      |

## Documentation

- **[Setup & Troubleshooting](CYBERFORGE_SETUP_AND_TROUBLESHOOTING.md)** - Detailed setup guide and common issues
- **[Technical Documentation](DOCUMENTATION.md)** - API reference, schemas, and architecture

## Scripts

```bash
npm run dev          # Start frontend
npm run server       # Start backend
npm run server:dev   # Backend with auto-reload
npm run build        # Production build
```

## License

MIT License
