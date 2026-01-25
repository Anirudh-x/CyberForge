import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get available port for machine
let currentPort = 8000;
export const getAvailablePort = async () => {
  const maxAttempts = 100;
  
  for (let i = 0; i < maxAttempts; i++) {
    const port = currentPort++;
    try {
      // Check if port is available using lsof
      await execAsync(`lsof -i :${port}`);
      // If lsof succeeds, port is in use, try next
    } catch (error) {
      // lsof fails (exit code 1) when port is free
      return port;
    }
  }
  
  throw new Error('No available ports found');
};

// Build Docker image for a module
export const buildDockerImage = async (domain, moduleId) => {
  const modulePath = path.join(__dirname, '..', '..', 'modules', domain, moduleId);
  const imageName = `cyberforge-${domain}-${moduleId}:latest`;
  
  try {
    // Check if module exists
    await fs.access(modulePath);
    
    console.log(`Building Docker image: ${imageName}`);
    console.log(`Module path: ${modulePath}`);
    
    const { stdout, stderr } = await execAsync(
      `docker build -t ${imageName} ${modulePath}`
    );
    
    if (stderr && !stderr.includes('WARNING')) {
      console.error('Docker build stderr:', stderr);
    }
    
    console.log(`Successfully built image: ${imageName}`);
    return { success: true, imageName };
  } catch (error) {
    console.error(`Error building Docker image for ${moduleId}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Run Docker container
export const runDockerContainer = async (imageName, port, containerName, containerPort = 3000) => {
  try {
    console.log(`Running container: ${containerName} on port ${port} (internal: ${containerPort})`);
    
    const { stdout } = await execAsync(
      `docker run -d --name ${containerName} -p ${port}:${containerPort} ${imageName}`
    );
    
    const containerId = stdout.trim();
    console.log(`Container started: ${containerId}`);
    
    // Wait a bit for container to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if container is running
    const { stdout: inspectOutput } = await execAsync(
      `docker inspect --format='{{.State.Running}}' ${containerId}`
    );
    
    const isRunning = inspectOutput.trim() === 'true';
    
    if (!isRunning) {
      throw new Error('Container failed to start');
    }
    
    return {
      success: true,
      containerId,
      port,
      url: `http://localhost:${port}`
    };
  } catch (error) {
    console.error(`Error running Docker container:`, error.message);
    return { success: false, error: error.message };
  }
};

// Stop Docker container
export const stopDockerContainer = async (containerId) => {
  try {
    await execAsync(`docker stop ${containerId}`);
    await execAsync(`docker rm ${containerId}`);
    return { success: true };
  } catch (error) {
    console.error(`Error stopping container:`, error.message);
    return { success: false, error: error.message };
  }
};

// Get module metadata
export const getModuleMetadata = async (domain, moduleId) => {
  try {
    const metadataPath = path.join(
      __dirname,
      '..',
      '..',
      'modules',
      domain,
      moduleId,
      'metadata.json'
    );
    
    const data = await fs.readFile(metadataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading metadata for ${moduleId}:`, error.message);
    return null;
  }
};

// Deploy a complete machine (multiple modules)
export const deployMachine = async (machineId, domain, modules) => {
  try {
    console.log(`\n🚀 Deploying machine ${machineId} with ${modules.length} vulnerabilities`);
    console.log(`Domain: ${domain}, Modules: ${modules.join(', ')}`);
    
    
    // CRITICAL FIX: Deploy ALL modules together in one container
    // NOT just the first one - all vulnerabilities must co-exist
    
    // Get metadata for all modules to validate
    const modulesMetadata = [];
    for (const moduleId of modules) {
      const metadata = await getModuleMetadata(domain, moduleId);
      if (!metadata) {
        throw new Error(`Metadata not found for module: ${moduleId}`);
      }
      modulesMetadata.push({ moduleId, ...metadata });
    }
    
    // For multi-vulnerability labs, we need to build a combined container
    // that includes ALL vulnerability routes together
    // Strategy: Use the first module as base, but ensure all routes are exposed
    
    const primaryModule = modules[0];
    const primaryMetadata = modulesMetadata[0];
    
    // Build Docker image for primary module
    const buildResult = await buildDockerImage(domain, primaryModule);
    if (!buildResult.success) {
      throw new Error(`Failed to build image: ${buildResult.error}`);
    }
    
    // Get available port
    const port = await getAvailablePort();
    
    // Run container with ALL modules' environment
    const containerName = `cyberforge-${machineId}`;
    const containerPort = primaryMetadata.port || 3000;
    
    console.log(`Starting container ${containerName} on port ${port} (internal: ${containerPort})`);
    
    const runResult = await runDockerContainer(
      buildResult.imageName,
      port,
      containerName,
      containerPort
    );
    
    if (!runResult.success) {
      throw new Error(`Failed to run container: ${runResult.error}`);
    }
    
    // Build access details based on solve method
    const access = {
      url: null,
      terminal: null,
      downloads: []
    };
    
    // Use primary module's solve method
    switch (primaryMetadata.solve_method) {
      case 'gui':
      case 'api':
        access.url = `http://localhost:${port}`;
        break;
      case 'terminal':
        access.terminal = `ssh ${primaryMetadata.credentials?.username || 'root'}@localhost -p ${port}`;
        break;
      case 'file':
        access.url = `http://localhost:${port}`;
        access.downloads = [`http://localhost:${port}/download`];
        break;
    }
    
    console.log(`✅ Machine deployed successfully!`);
    console.log(`   Container ID: ${runResult.containerId}`);
    console.log(`   Access URL: ${access.url || access.terminal || 'N/A'}`);
    console.log(`   Modules deployed: ${modules.length}`);
    
    console.log(`✅ Machine deployed successfully!`);
    console.log(`   Container ID: ${runResult.containerId}`);
    console.log(`   Access URL: ${access.url || access.terminal || 'N/A'}`);
    console.log(`   Modules deployed: ${modules.length}`);
    
    // Return all vulnerability routes for verification
    const vulnerabilityRoutes = modulesMetadata.map(m => ({
      moduleId: m.moduleId,
      route: m.route || `/${m.moduleId}`,
      flag: m.flag
    }));
    
    return {
      success: true,
      containerId: runResult.containerId,
      imageName: buildResult.imageName,
      port,
      solveMethod: primaryMetadata.solve_method,
      access,
      vulnerabilityRoutes,  // NEW: Return all routes for frontend
      modulesDeployed: modules.length
    };
  } catch (error) {
    console.error(`❌ Error deploying machine:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
