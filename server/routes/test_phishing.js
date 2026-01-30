import express from 'express';

const router = express.Router();

const FLAG = process.env.FLAG || 'FLAG{PHISHING_AWARENESS_COMPLETE}';

// Build a simple phishing email with an obfuscated (base64) flag embedded
const base64Flag = Buffer.from(FLAG).toString('base64');
const customPhishingEmail = {
  from: 'security-alerts@payflow.example',
  to: 'employee@company.local',
  subject: 'Urgent: Verify your account activity',
  body: `Hello,\n\nWe detected unusual activity on your PayFlow account. Please confirm your identity immediately to avoid service interruption.\n\nClick to review: https://secure-payflow.example/verify?ref=${base64Flag}\n\nRegards,\nPayFlow Security Team`
};

const phishingIndicators = {
  easy: ['Generic greeting (Dear User/Customer)', 'Obvious spelling and grammar errors', 'Suspicious sender domain'],
  medium: ['Slight urgency', 'Nearly legitimate-looking sender domain', 'Minor grammatical inconsistencies'],
  hard: ['Highly personalized content', 'Perfect grammar and professional tone', 'Very convincing sender spoofing']
};

router.get('/', (req, res) => {
  res.send(`<!doctype html><html><head><meta charset="utf-8"><title>Phishing Test</title></head><body>` +
    `<h1>Phishing Email (Test)</h1>` +
    `<pre>From: ${customPhishingEmail.from}\nTo: ${customPhishingEmail.to}\nSubject: ${customPhishingEmail.subject}\n\n${customPhishingEmail.body}</pre>` +
    `<form id="f" action="/test/phishing/submit" method="post"><input name="flag" placeholder="flag"/><button type="submit">Submit</button></form>` +
    `<script>document.getElementById('f').addEventListener('submit', async e=>{e.preventDefault();const f=new FormData(e.target);const r=await fetch('/test/phishing/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(f))});const j=await r.json();alert(JSON.stringify(j));});</script>` +
    `</body></html>`);
});

router.post('/submit', express.json(), (req, res) => {
  const submitted = (req.body.flag || '').trim();
  if (!submitted) return res.status(400).json({ success: false, message: 'No flag provided' });
  if (submitted === FLAG) return res.json({ success: true, message: 'Correct! Flag captured.' });
  return res.json({ success: false, message: 'Incorrect flag. Keep investigating.' });
});

export default router;
