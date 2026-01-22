import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  team_name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  // New points system
  totalPoints: {
    type: Number,
    default: 0
  },
  redTeamPoints: {
    type: Number,
    default: 0
  },
  blueTeamPoints: {
    type: Number,
    default: 0
  },
  webPoints: {
    type: Number,
    default: 0
  },
  cloudPoints: {
    type: Number,
    default: 0
  },
  forensicsPoints: {
    type: Number,
    default: 0
  },
  solvedVulnerabilities: [{
    machineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine' },
    vulnerabilityInstanceId: String,  // Unique instance ID
    moduleId: String,                 // Type of vulnerability
    domain: String,
    points: Number,
    flag: String,
    solvedAt: { type: Date, default: Date.now }
  }],
  solvedMachines: [{
    machineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine' },
    completedAt: { type: Date, default: Date.now },
    totalPoints: Number
  }],
  solvedChallenges: [{
    challengeId: String,
    solvedAt: {
      type: Date,
      default: Date.now
    },
    points: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastSolveTime: {
    type: Date
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
