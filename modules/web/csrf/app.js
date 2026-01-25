const express = require('express');
const router = express.Router();

// CSRF vulnerable transfer endpoint
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>CSRF Vulnerability Lab</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .container { background: #f5f5f5; padding: 30px; border-radius: 10px; }
        h1 { color: #333; }
        form { margin: 20px 0; }
        input, button { margin: 10px 0; padding: 10px; width: 100%; }
        button { background: #007bff; color: white; border: none; cursor: pointer; }
        button:hover { background: #0056b3; }
        .hint { background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔒 CSRF Vulnerability Lab</h1>
        <p>Perform an unauthorized money transfer!</p>
        
        <form action="/csrf/transfer" method="POST">
          <label>Transfer Amount:</label>
          <input type="number" name="amount" placeholder="Amount" required />
          
          <label>Recipient Account:</label>
          <input type="text" name="to" placeholder="Account ID" required />
          
          <button type="submit">Transfer Money</button>
        </form>
        
        <div class="hint">
          <strong>💡 Hint:</strong> This form has no CSRF token validation. 
          Try creating a malicious page that auto-submits this form!
        </div>
      </div>
    </body>
    </html>
  `);
});

router.post('/transfer', (req, res) => {
  const { amount, to } = req.body;
  
  // Vulnerable - no CSRF token check!
  if (amount && to) {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transfer Success</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .success { background: #d4edda; padding: 30px; border-radius: 10px; color: #155724; }
          .flag { background: #fff; padding: 15px; margin: 20px 0; border: 2px solid #28a745; border-radius: 5px; font-family: monospace; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="success">
          <h1>✅ Transfer Successful!</h1>
          <p>Transferred $${amount} to account ${to}</p>
          <p>You've exploited the CSRF vulnerability!</p>
          <div class="flag">
            🚩 ${process.env.FLAG || 'FLAG{CSRF_VULNERABILITY_EXPLOITED}'}
          </div>
        </div>
      </body>
      </html>
    `);
  } else {
    res.status(400).send('Invalid transfer request');
  }
});

module.exports = router;
