# CyberForge - CTF Platform

A full-stack Capture The Flag (CTF) platform built with React and Express, featuring cybersecurity challenges, user authentication with MongoDB, and a real-time leaderboard system.

## Features

- 🔐 **User Authentication** - Complete login/register system with JWT tokens
- 🎯 **Challenge System** - 16 CTF challenges with flag submission and verification
- 🏆 **Real-time Leaderboard** - Track top performers with scores and solve times
- 💻 **Hacker-themed UI** - Terminal aesthetics with green-on-black design
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🔒 **Secure Backend** - Password hashing, JWT authentication, and session management

## Tech Stack

### Frontend
- **React 18** with Vite
- **React Router DOM v6** for routing
- **Tailwind CSS** for styling

### Backend
- **Express.js** for REST API
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Cookie-based sessions**

## Project Structure

```
CyberForge/
├── public/              # Static assets
├── src/                 # Frontend React application
│   ├── components/      # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── QuestCard.jsx
│   │   └── LeaderboardCard.jsx
│   ├── pages/          # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Challenges.jsx
│   │   └── Leaderboard.jsx
│   ├── context/        # React Context
│   │   └── AuthContext.jsx
│   ├── hooks/          # Custom hooks
│   │   └── useAuth.js
│   ├── styles/         # CSS files
│   ├── App.jsx
│   └── main.jsx
├── server/             # Backend Express application
│   ├── config/         # Configuration
│   │   └── database.js
│   ├── models/         # Mongoose models
│   │   └── User.js
│   ├── routes/         # API routes
│   │   ├── auth.js
│   │   └── challenges.js
│   ├── middleware/     # Custom middleware
│   │   └── auth.js
│   └── index.js        # Server entry point
├── .env                # Environment variables
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB installation

### Installation

1. **Navigate to the project directory:**
```bash
cd CyberForge
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Open the `.env` file and add your MongoDB connection string:

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string_here

# JWT Secret (change this to a random secret key)
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

**To get your MongoDB URI:**
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Click "Connect" → "Connect your application"
- Copy the connection string
- Replace `<password>` with your database password

4. **Update challenge flags (Optional):**

Edit `server/routes/challenges.js` to set your own flags:

```javascript
const challenges = {
  c1: { flag: 'your_flag_here', points: 50 },
  // ... update other challenges
};
```

### Running the Application

You need to run both the frontend and backend servers:

**Terminal 1 - Start the backend server:**
```bash
npm run server:dev
```
Server will run on `http://localhost:5000`

**Terminal 2 - Start the frontend:**
```bash
npm run dev
```
Frontend will run on `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start frontend development server (Vite)
- `npm run server` - Start backend server (production mode)
- `npm run server:dev` - Start backend with nodemon (auto-restart on changes)
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify authentication status
- `POST /api/auth/logout` - Logout user

### Challenges
- `POST /api/verify-flag` - Submit and verify challenge flags
- `GET /api/leaderboard` - Get leaderboard data

### Health Check
- `GET /api/health` - Server health status

## Database Schema

### User Model
```javascript
{
  team_name: String (unique),
  email: String (unique),
  password: String (hashed),
  score: Number,
  solvedChallenges: [{
    challengeId: String,
    solvedAt: Date,
    points: Number
  }],
  createdAt: Date,
  lastSolveTime: Date
}
```

## Usage

1. **Register an account** at `/register`
2. **Login** at `/login`
3. **View challenges** at `/challenges`
4. **Submit flags** on each challenge card
5. **Check leaderboard** at `/leaderboard`

## Security Features

- Password hashing with bcryptjs (10 salt rounds)
- JWT token-based authentication
- HTTP-only cookies for token storage
- Protected API routes with authentication middleware
- CORS configuration for secure cross-origin requests

## Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder

### Backend (Railway/Render/Heroku)
1. Set environment variables
2. Set start command: `npm run server`
3. Deploy

## Troubleshooting

**Backend won't start:**
- Check if MongoDB URI is correctly set in `.env`
- Ensure port 5000 is not in use

**Frontend can't connect to backend:**
- Verify backend is running on port 5000
- Check CORS settings in `server/index.js`
- Ensure `vite.config.js` proxy is configured correctly

**Authentication not working:**
- Clear browser cookies
- Check JWT_SECRET is set in `.env`
- Verify MongoDB connection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by SequriQuest CTF platform
- Built with ❤️ by the Security Team
- Hacker aesthetic inspired by terminal interfaces

