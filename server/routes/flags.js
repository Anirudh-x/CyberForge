import express from 'express';
import Machine from '../models/Machine.js';
import User from '../models/User.js';
import { getModuleMetadata } from '../utils/docker.js';

const router = express.Router();

// Verify flag and award points
router.post('/verify', async (req, res) => {
  try {
    const { machineId, vulnerabilityInstanceId, flag } = req.body;
    const userId = req.userId; // From auth middleware

    if (!flag || !machineId || !vulnerabilityInstanceId) {
      return res.status(400).json({ 
        success: false,
        error: 'Machine ID, vulnerability instance ID, and flag are required' 
      });
    }

    // Get machine details
    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ 
        success: false,
        error: 'Machine not found' 
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Check if already solved THIS SPECIFIC vulnerability instance
    const alreadySolved = user.solvedVulnerabilities.some(
      v => v.machineId.toString() === machineId && 
           v.vulnerabilityInstanceId === vulnerabilityInstanceId
    );

    if (alreadySolved) {
      return res.status(400).json({ 
        success: false,
        correct: false,
        message: 'You have already captured this flag',
        alreadySolved: true
      });
    }

    // Find the exact vulnerability instance by vulnerabilityInstanceId
    const matchedVuln = machine.vulnerabilities.find(
      vuln => vuln.vulnerabilityInstanceId === vulnerabilityInstanceId
    );

    if (!matchedVuln) {
      return res.status(404).json({ 
        success: false,
        correct: false,
        message: 'Vulnerability instance not found'
      });
    }

    // Verify flag matches THIS specific instance
    if (matchedVuln.flag !== flag.trim()) {
      return res.status(400).json({ 
        success: false,
        correct: false,
        message: 'Incorrect flag. Try again!'
      });
    }

    // Award points based on vulnerability
    const points = matchedVuln.points || 50;
    const domain = machine.domain;
    const moduleId = matchedVuln.moduleId;

    // Update user points
    user.totalPoints += points;
    user.lastSolveTime = new Date();

    // Update domain-specific points
    switch(domain) {
      case 'web':
        user.webPoints += points;
        break;
      case 'red_team':
        user.redTeamPoints += points;
        break;
      case 'blue_team':
        user.blueTeamPoints += points;
        break;
      case 'cloud':
        user.cloudPoints += points;
        break;
      case 'forensics':
        user.forensicsPoints += points;
        break;
    }

    // Add to solved vulnerabilities with vulnerabilityInstanceId
    user.solvedVulnerabilities.push({
      machineId: machine._id,
      vulnerabilityInstanceId: vulnerabilityInstanceId,
      moduleId: moduleId,
      domain: domain,
      points: points,
      flag: flag.trim(),
      solvedAt: new Date()
    });

    // Update machine's solvedBy array for this specific vulnerability instance
    const vulnIndex = machine.vulnerabilities.findIndex(
      v => v.vulnerabilityInstanceId === vulnerabilityInstanceId
    );
    if (vulnIndex !== -1) {
      if (!machine.vulnerabilities[vulnIndex].solvedBy) {
        machine.vulnerabilities[vulnIndex].solvedBy = [];
      }
      if (!machine.vulnerabilities[vulnIndex].solvedBy.includes(userId)) {
        machine.vulnerabilities[vulnIndex].solvedBy.push(userId);
      }
    }

    // Check if ALL vulnerabilities in machine are solved (not just any module)
    const totalVulns = machine.vulnerabilities?.length || machine.modules.length;
    const solvedVulnsForMachine = user.solvedVulnerabilities.filter(
      v => v.machineId.toString() === machineId
    );
    const allVulnerabilitiesSolved = solvedVulnsForMachine.length === totalVulns;

    if (allVulnerabilitiesSolved) {
      const machineAlreadySolved = user.solvedMachines.some(
        m => m.machineId.toString() === machineId
      );

      if (!machineAlreadySolved) {
        user.solvedMachines.push({
          machineId: machine._id,
          completedAt: new Date(),
          totalPoints: machine.totalPoints || points
        });
      }
    }

    await user.save();
    await machine.save();

    res.json({
      success: true,
      correct: true,
      points: points,
      totalPoints: user.totalPoints,
      machineSolved: allVulnerabilitiesSolved,
      message: `🎉 Correct! +${points} points earned!`,
      vulnerabilitySolved: moduleId,
      solvedCount: solvedVulnsForMachine.length,
      totalVulns: totalVulns
    });
  } catch (error) {
    console.error('Flag verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during flag verification'
    });
  }
});

// Get machine-specific solutions
router.get('/solutions/:machineId', async (req, res) => {
  try {
    const { machineId } = req.params;
    const userId = req.userId;

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ 
        success: false,
        error: 'Machine not found' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Get user's solved vulnerabilities for this machine
    const solvedVulnsForMachine = user.solvedVulnerabilities.filter(
      v => v.machineId.toString() === machineId
    );

    // Build solutions response per vulnerability instance
    const solutionsArray = machine.vulnerabilities.map(vuln => {
      // Check if this specific instance is solved
      const isSolved = solvedVulnsForMachine.some(
        v => v.vulnerabilityInstanceId === vuln.vulnerabilityInstanceId
      );
      
      // Get solution from machine.solutions Map using vulnerabilityInstanceId (NOT moduleId)
      // This ensures each instance returns its own unique solution data
      const solutionData = machine.solutions?.get(vuln.vulnerabilityInstanceId) || {};
      
      return {
        vulnerabilityInstanceId: vuln.vulnerabilityInstanceId,
        moduleId: vuln.moduleId,
        route: vuln.route,
        points: vuln.points,
        difficulty: vuln.difficulty,
        solved: isSolved,
        explanation: solutionData.explanation,
        steps: solutionData.steps,
        payload: solutionData.payload,
        hints: solutionData.hints,
        flag: isSolved ? vuln.flag : null  // Only show flag if solved
      };
    });

    res.json({
      success: true,
      solutions: solutionsArray,
      machineName: machine.name,
      domain: machine.domain
    });

  } catch (error) {
    console.error('Solutions fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching solutions'
    });
  }
});

// Get user's solved machines and points
router.get('/stats', async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId)
      .select('totalPoints webPoints redTeamPoints blueTeamPoints cloudPoints forensicsPoints solvedVulnerabilities solvedMachines');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      stats: {
        totalPoints: user.totalPoints || 0,
        domainPoints: {
          web: user.webPoints || 0,
          red_team: user.redTeamPoints || 0,
          blue_team: user.blueTeamPoints || 0,
          cloud: user.cloudPoints || 0,
          forensics: user.forensicsPoints || 0
        },
        solvedCount: user.solvedVulnerabilities.length,
        solvedMachines: user.solvedMachines.map(m => m.machineId.toString()),
        solvedVulnerabilities: user.solvedVulnerabilities.map(v => ({
          machineId: v.machineId.toString(),
          vulnerabilityInstanceId: v.vulnerabilityInstanceId,
          moduleId: v.moduleId,
          points: v.points,
          flag: v.flag,
          solvedAt: v.solvedAt
        }))
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
