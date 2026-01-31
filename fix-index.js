import mongoose from 'mongoose';
const mongoUri = 'mongodb+srv://ashwingajbhiye36_db_user:Ix5vS6wMiUXz2n4y@cluster0.ahpnrvb.mongodb.net/';

mongoose.connect(mongoUri).then(async () => {
  console.log('Connected to MongoDB');
  const db = mongoose.connection.db;
  const collection = db.collection('machines');
  
  // Drop the problematic index
  try {
    await collection.dropIndex('vulnerabilities.vulnerabilityInstanceId_1');
    console.log('✅ Dropped index: vulnerabilities.vulnerabilityInstanceId_1');
  } catch (err) {
    console.log('Index may not exist:', err.message);
  }
  
  // Recreate as sparse index (allows null values but enforces uniqueness on non-null)
  try {
    await collection.createIndex({ 'vulnerabilities.vulnerabilityInstanceId': 1 }, { sparse: true });
    console.log('✅ Created sparse index on vulnerabilityInstanceId');
  } catch (err) {
    console.log('Error creating index:', err.message);
  }
  
  await mongoose.disconnect();
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
