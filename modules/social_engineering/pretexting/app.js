const express = require('express');
const app = express();

app.use(express.json());

const FLAG = process.env.FLAG || 'FLAG{PRETEXT_MASTER_COMPLETE}';

// Pretexting scenarios for training
const scenarios = [
  {
    title: 'IT Support Pretext',
    description: 'Attacker poses as IT support needing remote access to fix a "critical issue"',
    redFlags: ['Unsolicited contact', 'Urgency to grant access', 'Request for credentials']
  },
  {
    title: 'New Employee Pretext',
    description: 'Attacker claims to be a new employee needing help accessing systems',
    redFlags: ['Cannot verify through HR', 'Asks for sensitive access', 'Unfamiliar with procedures']
  },
  {
    title: 'Vendor/Partner Pretext',
    description: 'Attacker impersonates a vendor requiring urgent payment or information',
    redFlags: ['Changed payment details', 'Unusual communication channel', 'Pressure tactics']
  }
];

app.get('/', (req, res) => {
  var scenarioHtml = scenarios.map(function (s) {
    var flagsList = s.redFlags.map(function (f) { return '<li>' + f + '</li>'; }).join('');
    return '<div class="card"><h2>' + s.title + '</h2><p>' + s.description + '</p><h3>Red Flags:</h3><ul>' + flagsList + '</ul></div>';
  }).join('');

  res.send('<!DOCTYPE html><html><head><title>Pretexting Awareness</title><style>body { font-family: Arial; background: #0a0a0a; color: #e0e0e0; padding: 20px; } .container { max-width: 800px; margin: 0 auto; } h1 { color: #22c55e; text-align: center; } .card { background: #111; border: 1px solid #22c55e33; border-radius: 8px; padding: 20px; margin: 15px 0; } h2 { color: #22c55e; } .flag { font-family: monospace; background: #000; color: #22c55e; padding: 15px; text-align: center; border: 2px solid #22c55e; margin-top: 20px; }</style></head><body><div class="container"><h1>🎭 Pretexting Scenarios Training</h1>' + scenarioHtml + '<div class="flag"><h2>🏆 Flag</h2><p>' + FLAG + '</p></div></div></body></html>');
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', function () {
  console.log('Pretexting module on port ' + PORT);
});
