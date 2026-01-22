const express = require('express');
const app = express();

app.use(express.json());

// Simulated cloud config with exposed secrets
const cloudConfig = {
  service: "CyberForge Cloud API",
  version: "1.0",
  database: {
    host: "db.cyberforge.internal",
    port: 5432,
    username: "admin",
    password: "SuperSecret123!",  // EXPOSED!
  },
  api_keys: {
    aws_access_key: "AKIAIOSFODNN7EXAMPLE",
    aws_secret_key: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
  },
  internal: {
    admin_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    flag: "FLAG{CLOUD_SECRETS_EXPOSED}"
  }
};

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cloud Security Lab</title>
      <style>
        body { 
          font-family: 'Courier New', monospace; 
          background: #0a0a0a; 
          color: #00ff00; 
          padding: 40px;
        }
        .container { 
          max-width: 900px; 
          margin: 0 auto; 
          border: 2px solid #00ff00; 
          padding: 30px;
          border-radius: 10px;
        }
        h1 { text-align: center; }
        .endpoint {
          background: #001100;
          border: 1px solid #00ff00;
          padding: 20px;
          margin: 15px 0;
          border-radius: 5px;
          cursor: pointer;
        }
        .endpoint:hover { background: #002200; }
        button { 
          background: #00ff00; 
          color: #000; 
          border: none; 
          padding: 10px 20px; 
          cursor: pointer;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          border-radius: 5px;
          margin: 5px;
        }
        button:hover { background: #00cc00; }
        pre {
          background: #000;
          color: #00ff00;
          padding: 15px;
          border: 1px solid #00ff00;
          border-radius: 5px;
          overflow-x: auto;
          white-space: pre-wrap;
        }
        .hint { color: #00aa00; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>☁️ Cloud Security Lab</h1>
        <p>Welcome to the Cloud API Dashboard. Explore the available endpoints:</p>
        
        <div class="endpoint">
          <h3>📊 GET /api/status</h3>
          <p>Check API status</p>
          <button onclick="fetch('/api/status').then(r=>r.json()).then(d=>alert(JSON.stringify(d, null, 2)))">Test Endpoint</button>
        </div>

        <div class="endpoint">
          <h3>⚙️ GET /api/config</h3>
          <p>Retrieve configuration settings</p>
          <button onclick="fetch('/api/config').then(r=>r.json()).then(d=>{document.getElementById('result').innerHTML='<pre>'+JSON.stringify(d,null,2)+'</pre>'})">Test Endpoint</button>
        </div>

        <div id="result"></div>

        <div class="hint">
          💡 Hint: Cloud misconfigurations often expose sensitive data through APIs<br>
          Try exploring different endpoints...
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: "online",
    uptime: "99.9%",
    message: "All systems operational"
  });
});

app.get('/api/config', (req, res) => {
  // VULNERABLE: Exposing sensitive configuration
  res.json(cloudConfig);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cloud Security Lab running on port ${PORT}`);
});
