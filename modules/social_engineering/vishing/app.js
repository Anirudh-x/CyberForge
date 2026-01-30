const express = require('express');
const app = express();

app.use(express.json());

const FLAG = process.env.FLAG || 'FLAG{VISHING_DEFENSE_MASTER}';

const vishingScripts = [
  {
    title: 'Bank Fraud Alert',
    script: 'This is your bank\'s fraud department. We\'ve detected suspicious activity on your account. Please verify your account number and PIN to secure your account.',
    technique: 'Fear and urgency',
    defense: 'Hang up and call the official bank number directly'
  },
  {
    title: 'Tech Support Scam',
    script: 'This is Microsoft support. Your computer has been infected with a virus. We need remote access to remove it immediately.',
    technique: 'Authority impersonation',
    defense: 'Microsoft never calls unsolicited. Hang up immediately.'
  },
  {
    title: 'IRS/Tax Scam',
    script: 'This is the IRS. You owe back taxes and a warrant will be issued for your arrest unless you pay immediately via gift cards.',
    technique: 'Fear of legal consequences',
    defense: 'IRS always contacts via mail first, never demands gift cards'
  }
];

app.get('/', (req, res) => {
  var scriptsHtml = vishingScripts.map(function (v) {
    return '<div class="card"><h2>⚠️ ' + v.title + '</h2><div class="script">"' + v.script + '"</div><p><strong>Technique:</strong> ' + v.technique + '</p><div class="defense">✅ <strong>Defense:</strong> ' + v.defense + '</div></div>';
  }).join('');

  res.send('<!DOCTYPE html><html><head><title>Vishing Defense Training</title><style>body { font-family: Arial; background: #0a0a0a; color: #e0e0e0; padding: 20px; } .container { max-width: 800px; margin: 0 auto; } h1 { color: #22c55e; text-align: center; } .card { background: #111; border: 1px solid #22c55e33; border-radius: 8px; padding: 20px; margin: 15px 0; } h2 { color: #ef4444; } .script { background: #1a1a1a; padding: 15px; border-left: 3px solid #ef4444; margin: 10px 0; font-style: italic; } .defense { background: #064e3b; padding: 10px; border-radius: 5px; margin-top: 10px; } .flag { font-family: monospace; background: #000; color: #22c55e; padding: 15px; text-align: center; border: 2px solid #22c55e; margin-top: 20px; }</style></head><body><div class="container"><h1>📞 Vishing (Voice Phishing) Defense</h1>' + scriptsHtml + '<div class="flag"><h2>🏆 Training Complete!</h2><p>' + FLAG + '</p></div></div></body></html>');
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', function () {
  console.log('Vishing module on port ' + PORT);
});
