import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Machine from '../models/Machine.js';
import { authMiddleware } from '../middleware/auth.js';
import { deployMachine, stopDockerContainer, getModuleMetadata } from '../utils/docker.js';

// eslint-disable-next-line no-undef
const processEnv = process.env;

// Proper flag generation with HMAC (same as ransomware app)
function generateFlag(stage, flagSecret = processEnv.FLAG_SECRET || 'CHANGE_THIS_IN_PRODUCTION') {
  const hmac = crypto.createHmac('sha256', flagSecret);
  hmac.update(`STAGE_${stage}`);
  return `FLAG{${hmac.digest('hex').substring(0, 32)}}`;
}

const router = express.Router();

// Helper function to generate unique vulnerability instance ID
const generateVulnInstanceId = (machineId, moduleId, index) => {
  if (!machineId || !moduleId || index === undefined) {
    console.error('❌ Invalid parameters for generateVulnInstanceId:', { machineId, moduleId, index });
    throw new Error('Missing required parameters for vulnerability instance ID generation');
  }
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const instanceId = `${machineId}-${moduleId}-${index}-${timestamp}-${random}`;
  console.log(`✓ Generated instance ID: ${instanceId}`);
  return instanceId;
};

// Helper function to generate unique flag for each vulnerability instance
const generateUniqueFlag = (moduleId, machineId) => {
  const random = crypto.randomBytes(12).toString('hex').toUpperCase();
  const modulePrefix = moduleId.toUpperCase().replace(/_/g, '_');
  return `FLAG{${modulePrefix}_${random}}`;
};

// Create a new machine
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { name, domain, modules } = req.body;
    const userId = req.userId;
    const teamName = req.teamName;

    // Validation
    if (!name || !domain || !modules || modules.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide machine name, domain, and at least one module'
      });
    }

    // Validate domain
    const validDomains = ['web', 'red_team', 'blue_team', 'cloud', 'forensics'];
    if (!validDomains.includes(domain)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid domain selected'
      });
    }

    // Calculate machine points from module metadata
    let totalPoints = 0;
    const vulnerabilities = [];
    const solutions = new Map();

    // Pre-generate machineId for vulnerability instance IDs
    const tempMachineId = new mongoose.Types.ObjectId().toString();
    console.log(`🆔 Generated temp machine ID: ${tempMachineId}`);

    for (let i = 0; i < modules.length; i++) {
      const moduleId = modules[i];
      try {
        const metadata = await getModuleMetadata(domain, moduleId);
        if (metadata && metadata.points) {
          // Special handling for ransomware_attack_chain - create 6 stages
          if (moduleId === 'ransomware_attack_chain' && metadata.attack_stages) {
            console.log(`🎯 Creating ransomware attack chain with ${metadata.attack_stages.length} stages`);

            // Create a vulnerability instance for each attack stage
            for (let stageIdx = 0; stageIdx < metadata.attack_stages.length; stageIdx++) {
              const stage = metadata.attack_stages[stageIdx];
              const stageModuleId = `${moduleId}_stage_${stage.stage}`;
              const vulnerabilityInstanceId = generateVulnInstanceId(tempMachineId, stageModuleId, stageIdx);

              // Generate stage-specific flag using HMAC (same as app.js)
              const stageFlag = generateFlag(stage.stage);

              totalPoints += stage.points;

              console.log(`🔍 Creating vulnerability for ${stageModuleId}:`);
              console.log(`   Stage: ${stage.stage} - ${stage.name}`);
              console.log(`   Instance ID: ${vulnerabilityInstanceId}`);
              console.log(`   Flag: ${stageFlag}`);
              console.log(`   Points: ${stage.points}`);

              vulnerabilities.push({
                vulnerabilityInstanceId: vulnerabilityInstanceId,
                moduleId: moduleId, // Keep original moduleId for grouping
                route: metadata.route || `/${moduleId}?stage=${stage.name.toLowerCase().replace(/\s+/g, '_')}`,
                points: stage.points,
                flag: stageFlag,
                difficulty: metadata.difficulty || 'high',
                solvedBy: [],
                stage: stage.stage,
                stageName: stage.name,
                mitreId: stage.mitre_id
              });

              // Store solution for this stage
              solutions.set(vulnerabilityInstanceId, {
                explanation: `Complete Stage ${stage.stage}: ${stage.name} (${stage.mitre_id}) - ${stage.description}. Analyze the attack artifacts and identify indicators of compromise.`,
                steps: [
                  `Access the ransomware attack chain interface`,
                  `Navigate to Stage ${stage.stage}: ${stage.name}`,
                  `Review the attack artifacts: logs, commands, and files`,
                  `Identify the attack indicators following MITRE ATT&CK ${stage.mitre_id}`,
                  `Submit the flag for this stage to proceed to the next`
                ],
                payload: `Stage ${stage.stage} artifacts include: ${stage.description}`,
                hints: [
                  `Follow the MITRE ATT&CK technique ${stage.mitre_id}`,
                  `Analyze the provided logs, commands, and files carefully`,
                  `Each stage builds on the previous one - complete them sequentially`
                ]
              });
            }
          } else {
            // Standard module handling
            totalPoints += metadata.points;

            // Generate unique instance ID but use metadata flag (hardcoded)
            const vulnerabilityInstanceId = generateVulnInstanceId(tempMachineId, moduleId, i);

            console.log(`🔍 Creating vulnerability for ${moduleId}:`);
            console.log(`   Instance ID: ${vulnerabilityInstanceId}`);
            console.log(`   Flag from metadata: ${metadata.flag}`);

            // Add vulnerability with unique instance ID and METADATA FLAG (hardcoded)
            vulnerabilities.push({
              vulnerabilityInstanceId: vulnerabilityInstanceId,
              moduleId: moduleId,
              route: metadata.route || `/${moduleId}`,
              points: metadata.points,
              flag: metadata.flag,  // Use hardcoded flag from metadata.json
              difficulty: metadata.difficulty || 'medium',
              solvedBy: []
            });

            // Store solution keyed by vulnerabilityInstanceId (NOT moduleId)
            // This ensures each instance has its own solution data
            solutions.set(vulnerabilityInstanceId, {
              explanation: metadata.solution?.explanation || `Exploit the ${moduleId.replace(/_/g, ' ')} vulnerability to capture the flag.`,
              steps: metadata.solution?.steps || [
                `Navigate to ${metadata.route || '/' + moduleId}`,
                `Identify the ${moduleId.replace(/_/g, ' ')} vulnerability`,
                `Craft your exploit payload`,
                `Execute the attack and capture the flag`
              ],
              payload: metadata.solution?.payload || 'Payload varies based on implementation',
              hints: metadata.solution?.hints || [
                `Look for input fields`,
                `Try common ${moduleId.replace(/_/g, ' ')} payloads`,
                `Check the response carefully`
              ]
            });
          }
        }
      } catch (error) {
        console.error(`Error loading metadata for ${moduleId}:`, error);
      }
    }

    // Create machine record with initial status
    const machine = new Machine({
      _id: tempMachineId,  // Use pre-generated ID
      name,
      owner: userId,
      ownerTeamName: teamName,
      domain,
      modules,
      totalPoints,
      vulnerabilities,
      solutions: solutions,  // Store machine-specific solutions
      status: 'building'
    });

    await machine.save();

    // Deploy machine asynchronously
    deployMachine(machine._id.toString(), domain, modules)
      .then(async (deployResult) => {
        if (deployResult.success) {
          machine.status = 'running';
          machine.containerId = deployResult.containerId;
          machine.imageName = deployResult.imageName;
          machine.port = deployResult.port;
          machine.solveMethod = deployResult.solveMethod;
          machine.access = deployResult.access;
          machine.accessUrl = deployResult.access.url;
          await machine.save();
          console.log(`Machine ${machine._id} deployed successfully`);
        } else {
          machine.status = 'error';
          await machine.save();
          console.error(`Machine ${machine._id} deployment failed:`, deployResult.error);
        }
      })
      .catch(async (error) => {
        machine.status = 'error';
        await machine.save();
        console.error(`Machine ${machine._id} deployment error:`, error);
      });

    res.status(201).json({
      success: true,
      message: 'Machine creation started. It will be ready in a few moments.',
      machine: {
        id: machine._id,
        name: machine.name,
        domain: machine.domain,
        modules: machine.modules,
        status: machine.status,
        createdAt: machine.createdAt
      }
    });
  } catch (error) {
    console.error('Machine creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during machine creation'
    });
  }
});

// Get all machines for the authenticated user
router.get('/my-machines', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const machines = await Machine.find({ owner: userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      machines
    });
  } catch (error) {
    console.error('Error fetching machines:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching machines'
    });
  }
});

// Get a specific machine by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const machine = await Machine.findOne({ _id: id, owner: userId });

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    res.json({
      success: true,
      machine
    });
  } catch (error) {
    console.error('Error fetching machine:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching machine'
    });
  }
});

// Delete a machine
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const machine = await Machine.findOne({ _id: id, owner: userId });

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    // Stop and remove Docker container if it exists
    if (machine.containerId) {
      console.log(`Stopping container: ${machine.containerId}`);
      const stopResult = await stopDockerContainer(machine.containerId);
      if (!stopResult.success) {
        console.error(`Failed to stop container: ${stopResult.error}`);
        // Continue with deletion even if container stop fails
      }
    }

    await Machine.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Machine deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting machine:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting machine'
    });
  }
});

// Update machine status (for starting/stopping)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    const validStatuses = ['created', 'building', 'running', 'stopped', 'error'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const machine = await Machine.findOne({ _id: id, owner: userId });

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    machine.status = status;
    await machine.save();

    // TODO: In production, handle Docker container state changes here

    res.json({
      success: true,
      message: 'Machine status updated',
      machine
    });
  } catch (error) {
    console.error('Error updating machine status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating machine status'
    });
  }
});

export default router;
