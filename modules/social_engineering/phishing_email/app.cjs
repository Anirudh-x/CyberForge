import process from 'process';
import express from 'express';
import { Buffer } from 'buffer';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Phishing Email Training Module
// This module provides an interactive interface for phishing awareness training

const FLAG = process.env.FLAG || 'FLAG{PHISHING_AWARENESS_COMPLETE}';

// Get custom phishing email data if available
let customPhishingEmail = null;
try {
  if (process.env.CUSTOM_PHISHING_EMAIL) {
    customPhishingEmail = JSON.parse(process.env.CUSTOM_PHISHING_EMAIL);
    console.log('Loaded custom phishing email data');
  }
} catch (error) {
  console.error('Error parsing custom phishing email data:', error);
}

// Sample phishing indicators for training
const phishingIndicators = {
  easy: [
    'Generic greeting (Dear User/Customer)',
    'Obvious spelling and grammar errors',
    'Suspicious sender domain',
    'Threatening language demanding immediate action',
    'Request for password or sensitive information',
    'Mismatched URLs (hover vs display)'
  ],
  medium: [
    'Slight urgency without being too obvious',
    'Nearly legitimate-looking sender domain',
    'Minor grammatical inconsistencies',
    'Request to verify account information',
    'Links to unfamiliar subdomains'
  ],
  hard: [
    'Highly personalized content',
    'Perfect grammar and professional tone',
    'Very convincing sender spoofing',
    'Subtle URL variations (typosquatting)',
    'Context-aware timing'
  ]
};

// Ensure there is always a phishing email to investigate; append an obfuscated flag
const base64Flag = Buffer.from(FLAG).toString('base64');
if (!customPhishingEmail) {
  customPhishingEmail = {
    from: 'security-alerts@payflow.example',
    to: 'employee@company.local',
    subject: 'Urgent: Verify your account activity',
    body: `Hello,\n\nWe detected unusual activity on your PayFlow account. Please confirm your identity immediately to avoid service interruption.\n\nClick to review: https://secure-payflow.example/verify?ref=${base64Flag}\n\nRegards,\nPayFlow Security Team`
  };
} else {
  // If a custom email exists, append a subtle encoded token to the body to hide the flag
  if (!/ref=/.test(customPhishingEmail.body || '')) {
    customPhishingEmail.body = `${customPhishingEmail.body}\n\nReference ID: ${base64Flag}`;
  }
}

// Main page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Phishing Awareness Training</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
          color: #e0e0e0;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
        }
        h1 {
          color: #22c55e;
          text-align: center;
          text-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
        }
        .card {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid #22c55e33;
          border-radius: 10px;
          padding: 25px;
          margin: 20px 0;
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.1);
        }
        h2 { color: #22c55e; margin-top: 0; }
        h3 { color: #4ade80; }
        ul { line-height: 1.8; }
        li { margin: 8px 0; }
        .difficulty { 
          display: inline-block;
          padding: 3px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        .easy { background: #22c55e33; color: #22c55e; }
        .medium { background: #eab30833; color: #eab308; }
        .hard { background: #ef444433; color: #ef4444; }
        .flag-section {
          background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
          border: 2px solid #22c55e;
          text-align: center;
          margin-top: 30px;
        }
        .flag {
          font-family: monospace;
          font-size: 18px;
          color: #22c55e;
          background: #000;
          padding: 15px 25px;
          border-radius: 5px;
          display: inline-block;
          margin: 15px 0;
          text-shadow: 0 0 10px #22c55e;
        }
        .info {
          background: #1e3a5f;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎣 Phishing Awareness Training</h1>
        
        <div class="card">
          <h2>Welcome to Phishing Detection Training</h2>
          <p>This module helps you learn to identify phishing emails at various difficulty levels. 
          Understanding these techniques is crucial for cybersecurity defense.</p>
          
          <div class="info">
            <strong>📌 Educational Purpose:</strong> This training is designed to help security 
            professionals and employees recognize social engineering attacks before they cause harm.
          </div>
        </div>

        ${customPhishingEmail ? `
        <div class="card">
          <h2>🎯 Generated Phishing Email Challenge</h2>
          <p>A realistic phishing email has been generated for this training session. Analyze it carefully and identify the red flags.</p>

          <div class="email-container" style="background: #0e0e10; border: 1px solid #333; border-radius: 8px; padding: 20px; margin: 20px 0; font-family: 'Courier New', monospace; color: #e6e6e6;">
            <div style="display:flex; justify-content:space-between; border-bottom: 1px solid #222; padding-bottom: 10px; margin-bottom: 12px;">
              <div>
                <div><strong>From:</strong> ${customPhishingEmail.from || 'support@secure-payments.com'}</div>
                <div><strong>To:</strong> ${customPhishingEmail.to || 'you@company.local'}</div>
              </div>
              <div style="text-align:right; font-size:12px; color:#9ca3af">${new Date().toLocaleString()}</div>
            </div>
            <div style="margin-bottom:12px;"><strong>Subject:</strong> ${customPhishingEmail.subject}</div>
            <div style="line-height:1.6; white-space:pre-wrap; margin-bottom:16px;">
              ${customPhishingEmail.body}
            </div>

            <div style="background:#081214; border:1px dashed #164e63; padding:10px; border-radius:6px; color:#93c5fd; font-size:13px;">
              <strong>Hint:</strong> Inspect links, encoded tokens, and any unusual identifiers in the email.
            </div>

            <form id="flagForm" method="POST" action="/submit" style="margin-top:14px; display:flex; gap:8px;">
              <input name="flag" placeholder="Enter captured flag" style="flex:1; padding:8px; border-radius:6px; border:1px solid #222; background:#050506; color:#e6e6e6" />
              <button type="submit" style="padding:8px 12px; background:#10b981; color:#001; border-radius:6px; font-weight:700;">SUBMIT</button>
            </form>
            <div id="result" style="margin-top:10px; color:#ffd7d7; font-weight:700"></div>
          </div>
        </div>
        ` : ''}

        <div class="card">
          <h2>Red Flags by Difficulty</h2>
          
          <h3><span class="difficulty easy">EASY</span> Indicators</h3>
          <ul>
            ${phishingIndicators.easy.map(i => '<li>' + i + '</li>').join('')}
          </ul>
          
          <h3><span class="difficulty medium">MEDIUM</span> Indicators</h3>
          <ul>
            ${phishingIndicators.medium.map(i => '<li>' + i + '</li>').join('')}
          </ul>
          
          <h3><span class="difficulty hard">HARD</span> Indicators</h3>
          <ul>
            ${phishingIndicators.hard.map(i => '<li>' + i + '</li>').join('')}
          </ul>
        </div>

        <div class="card flag-section">
          <h2>🏆 Training Complete!</h2>
          <p>Analyze the email above to find the hidden or encoded artifact. Submit the flag using the form in the challenge card.</p>
          <p><em>Flags are not shown publicly — you must inspect the email to discover it.</em></p>
        </div>
      </div>
    </body>
    <script>
      (function(){
        const form = document.getElementById('flagForm');
        const result = document.getElementById('result');
        if (!form) return;
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          result.textContent = 'Checking...';
          const fd = new FormData(form);
          const data = {};
          fd.forEach((v,k)=>data[k]=v);
          try {
            const resp = await fetch('/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            const json = await resp.json();
            if (json.success) {
              result.style.color = '#a7f3d0';
              result.textContent = json.message || 'Correct!';
            } else {
              result.style.color = '#ffd7d7';
              result.textContent = json.message || 'Incorrect';
            }
          } catch (err) {
            result.style.color = '#ffd7d7';
            result.textContent = 'Network error';
          }
        });
      })();
    </script>
    </html>
  `);
});

// Endpoint to receive flag submissions from the email challenge
app.post('/submit', (req, res) => {
  const submitted = (req.body.flag || '').trim();
  if (!submitted) return res.status(400).json({ success: false, message: 'No flag provided' });
  if (submitted === FLAG) {
    return res.json({ success: true, message: 'Correct! Flag captured.' });
  }
  return res.json({ success: false, message: 'Incorrect flag. Keep investigating.' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', module: 'phishing_email' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Phishing Email Training module running on port ' + PORT);
});