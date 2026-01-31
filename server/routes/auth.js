import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { team_name, email, password } = req.body;

    // Validation
    if (!team_name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { team_name }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Team name already taken' 
      });
    }

    // Create new user
    const user = new User({
      team_name,
      email,
      password
    });

    await user.save();

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide username and password' 
      });
    }

    // Find user by team_name
    const user = await User.findOne({ team_name: username });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        teamName: user.team_name 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        teamName: user.team_name,
        score: user.score
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Verify authentication
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        isAuthenticated: false 
      });
    }

    res.json({ 
      success: true,
      isAuthenticated: true,
      teamName: user.team_name,
      score: user.score
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ 
      success: false, 
      isAuthenticated: false 
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true,
      profile: {
        teamName: user.team_name,
        email: user.email,
        github: user.github,
        field: user.field,
        callsign: user.callsign,
        primaryOS: user.primaryOS,
        bio: user.bio,
        yearsOfExperience: user.yearsOfExperience,
        certifications: user.certifications,
        linkedin: user.linkedin,
        favoriteTools: user.favoriteTools,
        score: user.score,
        totalPoints: user.totalPoints,
        redTeamPoints: user.redTeamPoints,
        blueTeamPoints: user.blueTeamPoints,
        webPoints: user.webPoints,
        cloudPoints: user.cloudPoints,
        forensicsPoints: user.forensicsPoints,
        solvedVulnerabilities: user.solvedVulnerabilities,
        solvedMachines: user.solvedMachines,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching profile' 
    });
  }
});

// Get public profile by team name (no auth required)
router.get('/profile/:teamName', async (req, res) => {
  try {
    const user = await User.findOne({ team_name: req.params.teamName }).select('-password -email');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true,
      profile: {
        teamName: user.team_name,
        github: user.github,
        field: user.field,
        callsign: user.callsign,
        primaryOS: user.primaryOS,
        bio: user.bio,
        yearsOfExperience: user.yearsOfExperience,
        certifications: user.certifications,
        linkedin: user.linkedin,
        favoriteTools: user.favoriteTools,
        score: user.score,
        totalPoints: user.totalPoints,
        redTeamPoints: user.redTeamPoints,
        blueTeamPoints: user.blueTeamPoints,
        webPoints: user.webPoints,
        cloudPoints: user.cloudPoints,
        forensicsPoints: user.forensicsPoints,
        solvedVulnerabilities: user.solvedVulnerabilities,
        solvedMachines: user.solvedMachines,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Public profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching profile' 
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { github, field, callsign, primaryOS, bio, yearsOfExperience, certifications, linkedin, favoriteTools } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update fields if provided
    if (github !== undefined) user.github = github;
    if (field !== undefined) user.field = field;
    if (callsign !== undefined) user.callsign = callsign;
    if (primaryOS !== undefined) user.primaryOS = primaryOS;
    if (bio !== undefined) user.bio = bio;
    if (yearsOfExperience !== undefined) user.yearsOfExperience = yearsOfExperience;
    if (certifications !== undefined) user.certifications = certifications;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (favoriteTools !== undefined) user.favoriteTools = favoriteTools;

    await user.save();

    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      profile: {
        github: user.github,
        field: user.field,
        callsign: user.callsign,
        primaryOS: user.primaryOS,
        bio: user.bio,
        yearsOfExperience: user.yearsOfExperience,
        certifications: user.certifications,
        linkedin: user.linkedin,
        favoriteTools: user.favoriteTools
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating profile' 
    });
  }
});

export default router;
