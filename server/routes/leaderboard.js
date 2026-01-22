import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Overall leaderboard
router.get('/overall', async (req, res) => {
  try {
    const users = await User.find()
      .select('team_name totalPoints solvedVulnerabilities solvedMachines lastSolveTime')
      .sort({ totalPoints: -1, lastSolveTime: 1 })
      .limit(50);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      team_name: user.team_name,
      points: user.totalPoints || 0,
      solvedCount: user.solvedVulnerabilities?.length || 0,
      machinesSolved: user.solvedMachines?.length || 0,
      lastSolveTime: user.lastSolveTime
    }));

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Web security leaderboard
router.get('/web', async (req, res) => {
  try {
    const users = await User.find()
      .select('team_name webPoints solvedVulnerabilities lastSolveTime')
      .sort({ webPoints: -1, lastSolveTime: 1 })
      .limit(50);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      team_name: user.team_name,
      points: user.webPoints || 0,
      solvedCount: user.solvedVulnerabilities?.filter(v => v.domain === 'web').length || 0
    }));

    res.json({ success: true, leaderboard, domain: 'Web Security' });
  } catch (error) {
    console.error('Web leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Red Team leaderboard
router.get('/red-team', async (req, res) => {
  try {
    const users = await User.find()
      .select('team_name redTeamPoints solvedVulnerabilities lastSolveTime')
      .sort({ redTeamPoints: -1, lastSolveTime: 1 })
      .limit(50);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      team_name: user.team_name,
      points: user.redTeamPoints || 0,
      solvedCount: user.solvedVulnerabilities?.filter(v => v.domain === 'red_team').length || 0
    }));

    res.json({ success: true, leaderboard, domain: 'Red Team' });
  } catch (error) {
    console.error('Red Team leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Blue Team leaderboard
router.get('/blue-team', async (req, res) => {
  try {
    const users = await User.find()
      .select('team_name blueTeamPoints solvedVulnerabilities lastSolveTime')
      .sort({ blueTeamPoints: -1, lastSolveTime: 1 })
      .limit(50);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      team_name: user.team_name,
      points: user.blueTeamPoints || 0,
      solvedCount: user.solvedVulnerabilities?.filter(v => v.domain === 'blue_team').length || 0
    }));

    res.json({ success: true, leaderboard, domain: 'Blue Team' });
  } catch (error) {
    console.error('Blue Team leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Cloud Security leaderboard
router.get('/cloud', async (req, res) => {
  try {
    const users = await User.find()
      .select('team_name cloudPoints solvedVulnerabilities lastSolveTime')
      .sort({ cloudPoints: -1, lastSolveTime: 1 })
      .limit(50);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      team_name: user.team_name,
      points: user.cloudPoints || 0,
      solvedCount: user.solvedVulnerabilities?.filter(v => v.domain === 'cloud').length || 0
    }));

    res.json({ success: true, leaderboard, domain: 'Cloud Security' });
  } catch (error) {
    console.error('Cloud leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Forensics leaderboard
router.get('/forensics', async (req, res) => {
  try {
    const users = await User.find()
      .select('team_name forensicsPoints solvedVulnerabilities lastSolveTime')
      .sort({ forensicsPoints: -1, lastSolveTime: 1 })
      .limit(50);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      team_name: user.team_name,
      points: user.forensicsPoints || 0,
      solvedCount: user.solvedVulnerabilities?.filter(v => v.domain === 'forensics').length || 0
    }));

    res.json({ success: true, leaderboard, domain: 'Forensics' });
  } catch (error) {
    console.error('Forensics leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
