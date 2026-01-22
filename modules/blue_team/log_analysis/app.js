const express = require('express');
const path = require('path');
const app = express();

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Log Analysis Lab</title>
      <style>
        body { 
          font-family: 'Courier New', monospace; 
          background: #0a0a0a; 
          color: #00ff00; 
          padding: 40px;
        }
        .container { 
          max-width: 1000px; 
          margin: 0 auto; 
          border: 2px solid #00ff00; 
          padding: 30px;
          border-radius: 10px;
        }
        h1 { text-align: center; color: #00ff00; }
        .instructions {
          background: #001100;
          border: 1px solid #00ff00;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .download-btn { 
          background: #00ff00; 
          color: #000; 
          text-decoration: none;
          padding: 15px 30px; 
          display: inline-block;
          margin: 20px auto;
          font-weight: bold;
          border-radius: 5px;
          text-align: center;
        }
        .download-btn:hover { background: #00cc00; }
        .hint { color: #00aa00; font-size: 12px; margin-top: 10px; }
        .center { text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔍 Blue Team - Log Analysis Challenge</h1>
        
        <div class="instructions">
          <h2>Mission Briefing:</h2>
          <p>Our systems have been compromised! We need you to analyze the system logs and identify:</p>
          <ul>
            <li>🔴 Which IP address attempted brute force attack?</li>
            <li>🔴 What malware was detected?</li>
            <li>🔴 Find any suspicious outbound connections</li>
            <li>🎯 Locate the hidden flag in the logs</li>
          </ul>
        </div>

        <div class="center">
          <a href="/download" class="download-btn">📥 DOWNLOAD SYSTEM LOGS</a>
          <div class="hint">
            💡 Hint: Look for unusual patterns and critical events<br>
            Use grep, search tools, or manual analysis
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/download', (req, res) => {
  const file = path.join(__dirname, 'system.log');
  res.download(file, 'system.log', (err) => {
    if (err) {
      res.status(500).send('Error downloading file');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Log Analysis Lab running on port ${PORT}`);
});
