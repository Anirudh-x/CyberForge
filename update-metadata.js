#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Metadata updates with points and terminal_enabled
const updates = {
  'web/xss': { points: 50, terminal_enabled: false, learning_objectives: ["Understand XSS vulnerabilities", "Learn reflected XSS exploitation", "Practice payload crafting"] },
  'web/auth_bypass': { points: 60, terminal_enabled: false, learning_objectives: ["Understand client-side auth weaknesses", "Learn cookie manipulation", "Practice browser dev tools"] },
  'red_team/weak_ssh': { points: 70, terminal_enabled: true, learning_objectives: ["Learn SSH brute forcing", "Practice privilege escalation", "Understand weak credentials"] },
  'red_team/privilege_escalation': { points: 90, terminal_enabled: true, learning_objectives: ["Master privilege escalation", "Understand SUID exploitation", "Practice Linux enumeration"] },
  'blue_team/log_analysis': { points: 65, terminal_enabled: true, learning_objectives: ["Learn log analysis", "Practice incident response", "Understand log correlation"] },
  'cloud/exposed_secrets': { points: 55, terminal_enabled: false, learning_objectives: ["Understand secret exposure", "Learn API enumeration", "Practice cloud security"] }
};

const modulesDir = path.join(__dirname, 'modules');

Object.entries(updates).forEach(([modulePath, updates]) => {
  const metadataPath = path.join(modulesDir, modulePath, 'metadata.json');
  
  if (fs.existsSync(metadataPath)) {
    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      
      // Add new fields
      metadata.points = updates.points;
      metadata.terminal_enabled = updates.terminal_enabled;
      metadata.learning_objectives = updates.learning_objectives;
      
      // Write back
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
      console.log(`✓ Updated ${modulePath}`);
    } catch (err) {
      console.error(`✗ Failed to update ${modulePath}:`, err.message);
    }
  } else {
    console.log(`⚠ Not found: ${modulePath}`);
  }
});

console.log('\n✅ Metadata update complete!');
