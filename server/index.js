/* eslint-env node */
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase, disconnectFromDatabase } from './config/database.js';
import { authMiddleware } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import challengeRoutes from './routes/challenges.js';
import machineRoutes from './routes/machines.js';
import flagRoutes from './routes/flags.js';
import leaderboardRoutes from './routes/leaderboard.js';
import reportRoutes from './routes/reports.js';
import chatbotRoutes from './routes/chatbot.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to database
connectToDatabase();

// Graceful shutdown handling
const gracefulShutdown = async () => {
  console.log('Received shutdown signal, closing server gracefully...');
  try {
    await disconnectFromDatabase();
    console.log('Database disconnected successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', challengeRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/flags', authMiddleware, flagRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
