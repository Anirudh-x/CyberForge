import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerTeamName: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true,
    enum: ['web', 'red_team', 'blue_team', 'cloud', 'forensics']
  },
  modules: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['created', 'building', 'running', 'stopped', 'error'],
    default: 'created'
  },
  containerId: {
    type: String,
    default: null
  },
  imageName: {
    type: String,
    default: null
  },
  // Solve method determines UI interface
  solveMethod: {
    type: String,
    enum: ['gui', 'terminal', 'file', 'api'],
    default: 'gui'
  },
  // Access details for solving
  access: {
    url: { type: String, default: null },
    terminal: { type: String, default: null },
    downloads: [{ type: String }]
  },
  accessUrl: {
    type: String,
    default: null
  },
  port: {
    type: Number,
    default: null
  },
  // Points system
  totalPoints: {
    type: Number,
    default: 0
  },
  vulnerabilities: [{
    vulnerabilityInstanceId: { type: String, required: true, unique: true },  // Unique ID for THIS instance
    moduleId: String,       // Type of vulnerability (e.g., 'sql_injection', 'xss')
    route: String,          // Route where vulnerability exists (e.g., /login, /comment)
    points: Number,
    flag: String,           // Unique flag for THIS instance
    difficulty: String,
    solvedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  // Machine-specific solutions (NOT generic)
  solutions: {
    type: Map,
    of: {
      explanation: String,
      steps: [String],
      payload: String,
      flag: String,
      hints: [String]
    },
    default: new Map()
  },
  terminalEnabled: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

// Update lastModified on save
machineSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

const Machine = mongoose.model('Machine', machineSchema);

export default Machine;
