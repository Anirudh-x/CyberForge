#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkFlags() {
  console.log('🔍 Checking flag configuration\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cyberforge');
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Get newest machine
    const machines = await db.collection('machines').find({}).sort({ _id: -1 }).limit(3).toArray();
    
    console.log(`📊 Checking ${machines.length} most recent machines:\n`);

    for (const machine of machines) {
      console.log(`🖥️  Machine: ${machine.name} (Created: ${machine._id.getTimestamp()})`);
      console.log(`   Status: ${machine.status}`);
      
      if (machine.vulnerabilities && machine.vulnerabilities.length > 0) {
        machine.vulnerabilities.forEach((vuln, idx) => {
          console.log(`\n   ${idx + 1}. ${vuln.moduleId}`);
          console.log(`      Flag: ${vuln.flag}`);
          
          // Check if it's a unique flag or template flag
          if (vuln.flag && vuln.flag.includes('_')) {
            const flagParts = vuln.flag.match(/FLAG\{([^_]+)_(.+)\}/);
            if (flagParts && flagParts[2].length > 20) {
              console.log(`      Type: ⚠️  UNIQUE (has random ID: ${flagParts[2]})`);
            } else {
              console.log(`      Type: ✅ TEMPLATE (hardcoded from metadata.json)`);
            }
          }
        });
      }
      console.log('\n' + '='.repeat(70));
    }

    console.log('\n💡 Expected behavior:');
    console.log('   - NEW machines (created after fix): Should show TEMPLATE flags');
    console.log('   - OLD machines: May still have UNIQUE flags with random IDs');
    console.log('\n✅ If you see TEMPLATE flags above, the fix is working!');
    console.log('⚠️  If you see UNIQUE flags, create a NEW machine to test.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkFlags();
