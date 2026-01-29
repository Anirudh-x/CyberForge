#!/usr/bin/env node
import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Helper functions (same as in machines.js)
const generateVulnInstanceId = (machineId, moduleId, index) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${machineId}-${moduleId}-${index}-${timestamp}-${random}`;
};

const generateUniqueFlag = (moduleId, machineId) => {
  const random = crypto.randomBytes(12).toString('hex').toUpperCase();
  const modulePrefix = moduleId.toUpperCase().replace(/_/g, '_');
  return `FLAG{${modulePrefix}_${random}}`;
};

async function fixOldMachines() {
  console.log('🔧 Fixing old machines without vulnerability instance IDs\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cyberforge');
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const machinesCollection = db.collection('machines');
    
    // Find machines with undefined vulnerabilityInstanceId
    const machines = await machinesCollection.find({
      'vulnerabilities.vulnerabilityInstanceId': { $exists: false }
    }).toArray();
    
    console.log(`📊 Found ${machines.length} machines that need fixing\n`);

    let fixed = 0;
    for (const machine of machines) {
      console.log(`\n🖥️  Fixing Machine: ${machine.name} (ID: ${machine._id})`);
      
      if (!machine.vulnerabilities || machine.vulnerabilities.length === 0) {
        console.log('   ⚠️  No vulnerabilities to fix, skipping...');
        continue;
      }

      const updatedVulnerabilities = machine.vulnerabilities.map((vuln, index) => {
        const instanceId = generateVulnInstanceId(machine._id.toString(), vuln.moduleId, index);
        const uniqueFlag = generateUniqueFlag(vuln.moduleId, machine._id.toString());
        
        console.log(`   ✓ Fixed: ${vuln.moduleId}`);
        console.log(`     Old Flag: ${vuln.flag}`);
        console.log(`     New Flag: ${uniqueFlag}`);
        console.log(`     Instance ID: ${instanceId}`);
        
        return {
          ...vuln,
          vulnerabilityInstanceId: instanceId,
          flag: uniqueFlag
        };
      });

      // Update the machine
      await machinesCollection.updateOne(
        { _id: machine._id },
        { $set: { vulnerabilities: updatedVulnerabilities } }
      );
      
      fixed++;
      console.log(`   ✅ Machine fixed!`);
    }

    console.log(`\n\n🎉 Successfully fixed ${fixed} machines!`);
    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('   1. All old flags have been replaced with new unique flags');
    console.log('   2. Users who solved these machines with old flags need to re-solve them');
    console.log('   3. The new flags are now unique per machine instance');
    console.log('\n💡 You can now test flag submission with the new flags!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

fixOldMachines();
