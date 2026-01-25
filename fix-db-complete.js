import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/test';

async function fixDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    const db = mongoose.connection.db;
    const collection = db.collection('machines');

    // 1. Show current indexes
    console.log('📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(idx => {
      console.log(`   ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // 2. Drop ALL indexes except _id
    console.log('\n🗑️  Dropping all indexes except _id...');
    for (const idx of indexes) {
      if (idx.name !== '_id_') {
        try {
          await collection.dropIndex(idx.name);
          console.log(`   ✓ Dropped: ${idx.name}`);
        } catch (err) {
          console.log(`   ⚠️  Could not drop ${idx.name}: ${err.message}`);
        }
      }
    }

    // 3. Verify indexes are gone
    console.log('\n📋 Remaining indexes:');
    const remaining = await collection.indexes();
    remaining.forEach(idx => {
      console.log(`   ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // 4. Delete all machines (to start fresh)
    console.log('\n🗑️  Deleting all machines...');
    const deleteResult = await collection.deleteMany({});
    console.log(`   ✓ Deleted ${deleteResult.deletedCount} machines`);

    console.log('\n✨ Database cleaned! Now restart your server and create a machine.');
    console.log('   The vulnerabilityInstanceId field will NOT have any indexes.');
    console.log('   Mongoose will not auto-create indexes because we removed unique: true from schema.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

fixDatabase();
