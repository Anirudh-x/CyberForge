const express = require('express');
const app = express();

app.use(express.json());

const FLAG = process.env.FLAG || 'FLAG{SPEAR_PHISHING_EXPERT}';

const spearPhishingExamples = [
  {
    title: 'CEO Fraud / Whaling',
    description: 'Highly targeted attack impersonating C-level executives',
    indicators: [
      'Uses real executive names and titles',
      'References actual company projects',
      'Sent during business hours',
      'Requests wire transfers or sensitive data'
    ]
  },
  {
    title: 'Vendor Email Compromise',
    description: 'Attacker compromises or impersonates trusted vendor',
    indicators: [
      'Legitimate-looking invoice with changed bank details',
      'Comes from similar domain (typosquatting)',
      'References real purchase orders',
      'Urgency around payment deadlines'
    ]
  },
  {
    title: 'LinkedIn Reconnaissance',
    description: 'Attacker uses LinkedIn to gather info for targeted attack',
    indicators: [
      'References your job role specifically',
      'Mentions colleagues by name',
      'Uses industry-specific terminology',
      'Appears to come from professional contact'
    ]
  }
];

app.get('/', (req, res) => {
  var examplesHtml = spearPhishingExamples.map(function (e) {
    var indicatorsList = e.indicators.map(function (i) { return '<li>' + i + '</li>'; }).join('');
    return '<div class="card"><h2>🎯 ' + e.title + '</h2><p>' + e.description + '</p><div class="indicators"><strong>Key Indicators:</strong><ul>' + indicatorsList + '</ul></div></div>';
  }).join('');

  res.send('<!DOCTYPE html><html><head><title>Spear Phishing Defense</title><style>body { font-family: Arial; background: #0a0a0a; color: #e0e0e0; padding: 20px; } .container { max-width: 800px; margin: 0 auto; } h1 { color: #22c55e; text-align: center; } .card { background: #111; border: 1px solid #ef444466; border-radius: 8px; padding: 20px; margin: 15px 0; } h2 { color: #ef4444; } .indicators { background: #1a1a1a; padding: 15px; border-radius: 5px; } .flag { font-family: monospace; background: #000; color: #22c55e; padding: 15px; text-align: center; border: 2px solid #22c55e; margin-top: 20px; } .warning { background: #7f1d1d; padding: 15px; border-radius: 5px; margin-bottom: 20px; }</style></head><body><div class="container"><h1>🎯 Spear Phishing Defense Training</h1><div class="warning"><strong>⚠️ Advanced Threat:</strong> Spear phishing attacks are highly targeted and sophisticated. They use personal information gathered from social media, company websites, and data breaches.</div>' + examplesHtml + '<div class="flag"><h2>🏆 Expert Level Complete!</h2><p>' + FLAG + '</p></div></div></body></html>');
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', function () {
  console.log('Spear Phishing module on port ' + PORT);
});
