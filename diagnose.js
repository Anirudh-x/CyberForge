#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function diagnose() {
  console.log('🔍 Diagnosing Flag Submission Issue\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cyberforge');
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Get machines
    const machines = await db.collection('machines').find({}).limit(5).toArray();
    console.log(`📊 Found ${machines.length} machines\n`);

    for (const machine of machines) {
      console.log(`\n🖥️  Machine: ${machine.name}`);
      console.log(`   ID: ${machine._id}`);
      console.log(`   Domain: ${machine.domain}`);
      console.log(`   Status: ${machine.status}`);
      
      if (machine.vulnerabilities && machine.vulnerabilities.length > 0) {
        console.log(`\n   📋 ${machine.vulnerabilities.length} Vulnerabilities:`);
        machine.vulnerabilities.forEach((vuln, idx) => {
          console.log(`\n   ${idx + 1}. ${vuln.moduleId.toUpperCase()}`);
          console.log(`      Instance ID: ${vuln.vulnerabilityInstanceId}`);
          console.log(`      Flag: ${vuln.flag}`);
          console.log(`      Points: ${vuln.points}`);
          console.log(`      Solved: ${vuln.solvedBy?.length || 0} users`);
        });
      }
      console.log('\n' + '='.repeat(70));
    }

    // Get users
    const users = await db.collection('users').find({}).limit(3).toArray();
    console.log(`\n\n👥 Found ${users.length} users\n`);
    
    for (const user of users) {
      console.log(`User: ${user.teamName} (${user.username})`);
      console.log(`Points: ${user.totalPoints}`);
      console.log(`Solved: ${user.solvedVulnerabilities?.length || 0} vulnerabilities`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

diagnose();
