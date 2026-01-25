import mongoose from 'mongoose';
import Machine from './server/models/Machine.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function fixIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Show current indexes
    console.log('📋 Current indexes on machines collection:');
    const indexes = await Machine.collection.getIndexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Drop the problematic index
    console.log('\n🔧 Dropping the vulnerabilityInstanceId index...');
    try {
      await Machine.collection.dropIndex('vulnerabilities.vulnerabilityInstanceId_1');
      console.log('✅ Dropped vulnerabilities.vulnerabilityInstanceId_1 index');
    } catch (err) {
      console.log('⚠️  Index not found or already dropped:', err.message);
    }

    // Create sparse unique index (allows documents without the field)
    console.log('\n🔧 Creating new SPARSE unique index...');
    await Machine.collection.createIndex(
      { 'vulnerabilities.vulnerabilityInstanceId': 1 },
      { unique: true, sparse: true, name: 'vulnerabilities_instanceId_sparse' }
    );
    console.log('✅ Created sparse unique index: vulnerabilities_instanceId_sparse');

    // Verify new indexes
    console.log('\n📋 Updated indexes:');
    const newIndexes = await Machine.collection.getIndexes();
    console.log(JSON.stringify(newIndexes, null, 2));

    console.log('\n✨ Index fix complete! Try creating a machine now.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

fixIndexes();
