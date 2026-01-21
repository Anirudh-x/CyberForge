import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Challenge flags and points
const challenges = {
  c1: { flag: 'flag{example_flag_1}', points: 50 },
  c2: { flag: 'flag{example_flag_2}', points: 100 },
  c3: { flag: 'flag{example_flag_3}', points: 150 },
  c4: { flag: 'flag{example_flag_4}', points: 50 },
  c5: { flag: 'flag{example_flag_5}', points: 100 },
  c6: { flag: 'flag{example_flag_6}', points: 100 },
  c7: { flag: 'flag{example_flag_7}', points: 50 },
  c8: { flag: 'flag{example_flag_8}', points: 50 },
  c9: { flag: 'flag{example_flag_9}', points: 100 },
  c10: { flag: 'flag{example_flag_10}', points: 100 },
  c11: { flag: 'flag{example_flag_11}', points: 100 },
  c12: { flag: 'flag{example_flag_12}', points: 100 },
  c13: { flag: 'flag{example_flag_13}', points: 50 },
  c14: { flag: 'flag{example_flag_14}', points: 100 },
  c15: { flag: 'flag{example_flag_15}', points: 100 },
  c16: { flag: 'flag{example_flag_16}', points: 50 }
};

// Verify flag submission
router.post('/verify-flag', authMiddleware, async (req, res) => {
  try {
    const { challengeId, flag } = req.body;
    const userId = req.userId;

    if (!challengeId || !flag) {
      return res.status(400).json({ 
        success: false, 
        message: 'Challenge ID and flag are required' 
      });
    }

    const challenge = challenges[challengeId];

    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        message: 'Challenge not found' 
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if already solved
    const alreadySolved = user.solvedChallenges.some(
      sc => sc.challengeId === challengeId
    );

    if (alreadySolved) {
      return res.status(400).json({ 
        success: false, 
        message: 'Challenge already solved' 
      });
    }

    // Verify flag
    if (flag.trim() !== challenge.flag) {
      return res.status(400).json({ 
        success: false, 
        message: 'Incorrect flag' 
      });
    }

    // Update user score and solved challenges
    user.score += challenge.points;
    user.solvedChallenges.push({
      challengeId,
      points: challenge.points,
      solvedAt: new Date()
    });
    user.lastSolveTime = new Date();

    await user.save();

    res.json({ 
      success: true, 
      message: 'Correct flag!',
      points: challenge.points,
      totalScore: user.score
    });
  } catch (error) {
    console.error('Flag verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during flag verification' 
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .select('team_name score solvedChallenges lastSolveTime')
      .sort({ score: -1, lastSolveTime: 1 })
      .limit(100);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.team_name,
      score: user.score,
      solved: user.solvedChallenges.length,
      lastSolveTime: user.lastSolveTime
    }));

    res.json({ 
      success: true, 
      leaderboard 
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching leaderboard' 
    });
  }
});

export default router;
