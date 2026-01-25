import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function dropOldIndex() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    const db = mongoose.connection.db;
    const collection = db.collection('machines');

    // List all indexes
    console.log('📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)} ${idx.sparse ? '[SPARSE]' : ''} ${idx.unique ? '[UNIQUE]' : ''}`);
    });

    // Drop the NON-sparse index
    console.log('\n🗑️  Dropping non-sparse index: vulnerabilities.vulnerabilityInstanceId_1');
    try {
      await collection.dropIndex('vulnerabilities.vulnerabilityInstanceId_1');
      console.log('✅ Dropped successfully');
    } catch (err) {
      console.log('⚠️  Could not drop:', err.message);
    }

    // Verify
    console.log('\n📋 Remaining indexes:');
    const remainingIndexes = await collection.indexes();
    remainingIndexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)} ${idx.sparse ? '[SPARSE]' : ''} ${idx.unique ? '[UNIQUE]' : ''}`);
    });

    console.log('\n✨ Done! Restart server and try creating a machine.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

dropOldIndex();
