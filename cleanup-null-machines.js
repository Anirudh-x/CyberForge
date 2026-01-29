import mongoose from 'mongoose';
import Machine from './server/models/Machine.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function cleanupNullMachines() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find machines with null or missing vulnerabilityInstanceId
    console.log('🔍 Looking for machines with null vulnerabilityInstanceId...');
    
    const machinesWithNullIds = await Machine.find({
      'vulnerabilities.vulnerabilityInstanceId': null
    });

    console.log(`\n📊 Found ${machinesWithNullIds.length} machines with null vulnerabilityInstanceId:`);
    
    if (machinesWithNullIds.length === 0) {
      console.log('✨ No machines with null IDs found. Database is clean!');
      await mongoose.connection.close();
      return;
    }

    // Show details
    machinesWithNullIds.forEach((machine, index) => {
      console.log(`\n${index + 1}. Machine: ${machine.name} (ID: ${machine._id})`);
      console.log(`   Domain: ${machine.domain}`);
      console.log(`   Modules: ${machine.modules.join(', ')}`);
      console.log(`   Status: ${machine.status}`);
      console.log(`   Vulnerabilities with null IDs: ${
        machine.vulnerabilities.filter(v => !v.vulnerabilityInstanceId).length
      }`);
    });

    // Delete them
    console.log('\n🗑️  Deleting machines with null vulnerabilityInstanceId...');
    const deleteResult = await Machine.deleteMany({
      'vulnerabilities.vulnerabilityInstanceId': null
    });

    console.log(`✅ Deleted ${deleteResult.deletedCount} machines\n`);

    // Drop and recreate the index to make it sparse
    console.log('🔧 Fixing the unique index to be sparse...');
    try {
      await Machine.collection.dropIndex('vulnerabilities.vulnerabilityInstanceId_1');
      console.log('   Dropped old index');
    } catch (err) {
      console.log('   Index already dropped or doesn\'t exist');
    }

    // Create sparse unique index (allows multiple nulls but ensures non-null values are unique)
    await Machine.collection.createIndex(
      { 'vulnerabilities.vulnerabilityInstanceId': 1 },
      { unique: true, sparse: true }
    );
    console.log('   Created new sparse unique index');

    console.log('\n✨ Cleanup complete! You can now create new machines.');

  } catch (error) {
    console.error('❌ Cleanup error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

cleanupNullMachines();
