import fetch from 'node-fetch';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const API_URL = 'http://localhost:5000';

async function testFlagSubmission() {
  console.log('🔍 Testing Flag Submission Issue\n');
  
  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cyberforge');
    console.log('✅ Connected to MongoDB\n');

    // Get all machines
    const Machine = mongoose.model('machines');
    const machines = await Machine.find({}).limit(5);
    
    console.log(`📊 Found ${machines.length} machines\n`);

    for (const machine of machines) {
      console.log(`\n🖥️  Machine: ${machine.name} (ID: ${machine._id})`);
      console.log(`   Domain: ${machine.domain}`);
      console.log(`   Status: ${machine.status}`);
      console.log(`   Modules: ${machine.modules?.join(', ')}`);
      console.log(`   Vulnerabilities: ${machine.vulnerabilities?.length || 0}`);
      
      if (machine.vulnerabilities && machine.vulnerabilities.length > 0) {
        console.log('\n   📋 Vulnerability Details:');
        machine.vulnerabilities.forEach((vuln, idx) => {
          console.log(`   ${idx + 1}. ${vuln.moduleId}`);
          console.log(`      Instance ID: ${vuln.vulnerabilityInstanceId}`);
          console.log(`      Flag: ${vuln.flag}`);
          console.log(`      Points: ${vuln.points}`);
          console.log(`      Route: ${vuln.route || 'N/A'}`);
          console.log(`      Solved By: ${vuln.solvedBy?.length || 0} users`);
        });
      }
    }

    // Get a SQL injection machine for testing
    const sqlMachine = machines.find(m => 
      m.vulnerabilities?.some(v => v.moduleId === 'sql_injection')
    );

    if (sqlMachine) {
      const sqlVuln = sqlMachine.vulnerabilities.find(v => v.moduleId === 'sql_injection');
      console.log('\n\n🎯 SQL Injection Machine Found!');
      console.log(`   Machine ID: ${sqlMachine._id}`);
      console.log(`   Vulnerability Instance ID: ${sqlVuln.vulnerabilityInstanceId}`);
      console.log(`   Correct Flag: ${sqlVuln.flag}`);
      console.log(`\n💡 To test flag submission:`);
      console.log(`   1. Make sure you're logged in`);
      console.log(`   2. Open the machine solver page`);
      console.log(`   3. Submit this flag: ${sqlVuln.flag}`);
      console.log(`   4. If it doesn't work, check browser console for errors`);
    }

    // Check users to see if any have solved vulnerabilities
    const User = mongoose.model('users');
    const users = await User.find({}).limit(3);
    
    console.log(`\n\n👥 Found ${users.length} users`);
    for (const user of users) {
      console.log(`\n   User: ${user.teamName}`);
      console.log(`   Total Points: ${user.totalPoints}`);
      console.log(`   Solved Vulnerabilities: ${user.solvedVulnerabilities?.length || 0}`);
      console.log(`   Solved Machines: ${user.solvedMachines?.length || 0}`);
      
      if (user.solvedVulnerabilities && user.solvedVulnerabilities.length > 0) {
        console.log('   Recent Solutions:');
        user.solvedVulnerabilities.slice(0, 3).forEach(sv => {
          console.log(`     - ${sv.moduleId} (${sv.points} pts)`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

testFlagSubmission();
