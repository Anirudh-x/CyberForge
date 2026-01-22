const express = require('express');
const app = express();
const PORT = 3000;

// Exposed environment variables (simulated)
const exposedEnv = {
  NODE_ENV: 'production',
  DATABASE_URL: 'mongodb://admin:SuperSecret123@prod-db.internal:27017/company_db',
  AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
  AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  AWS_REGION: 'us-east-1',
  STRIPE_SECRET_KEY: 'sk_live_51ExAmPlE',
  JWT_SECRET: 'my-super-secret-jwt-key-12345',
  REDIS_URL: 'redis://:password123@redis.internal:6379',
  SMTP_PASSWORD: 'email_pass_2026!',
  API_KEY: 'api-key-prod-xyz789',
  FLAG: 'FLAG{ENV_VARS_EXPOSED}',
  SESSION_SECRET: 'session-secret-dont-share',
  ENCRYPTION_KEY: 'aes-256-key-sensitive'
};

app.use(express.json());

// Landing page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Application Dashboard</title>
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
        h1 { text-align: center; color: #00ff00; }
        .info-box { 
          background: #111; 
          padding: 20px; 
          margin: 20px 0; 
          border: 1px solid #00ff00;
        }
        .api-link { 
          color: #00ff00; 
          text-decoration: none; 
          padding: 10px 20px; 
          border: 1px solid #00ff00; 
          display: inline-block; 
          margin: 10px 5px;
        }
        .api-link:hover { background: #003300; }
        .warning { 
          background: #330000; 
          padding: 15px; 
          border: 2px solid #ff0000; 
          color: #ff0000;
          margin: 20px 0;
        }
        code { 
          background: #000; 
          padding: 2px 8px; 
          border: 1px solid #003300;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>⚙️ Application Dashboard</h1>
        
        <div class="info-box">
          <h2>System Status</h2>
          <p><strong>Environment:</strong> ${exposedEnv.NODE_ENV}</p>
          <p><strong>Region:</strong> ${exposedEnv.AWS_REGION}</p>
          <p><strong>Status:</strong> <span style="color: #00ff00;">RUNNING</span></p>
          <p><strong>Uptime:</strong> 42 days</p>
        </div>

        <div class="warning">
          ⚠️ DEBUG MODE ENABLED - Some endpoints may leak sensitive information
        </div>

        <h2>🔌 Available Endpoints</h2>
        <div>
          <a href="/api/health" class="api-link">GET /api/health</a>
          <a href="/api/config" class="api-link">GET /api/config</a>
          <a href="/api/env" class="api-link">GET /api/env</a>
          <a href="/api/debug/vars" class="api-link">GET /api/debug/vars</a>
        </div>

        <h2>📖 Documentation</h2>
        <div class="info-box">
          <p><strong>Health Check:</strong> <code>GET /api/health</code></p>
          <p>Returns application health status</p>
          <br>
          <p><strong>Configuration:</strong> <code>GET /api/config</code></p>
          <p>Returns application configuration</p>
          <br>
          <p><strong>Debug Endpoint:</strong> <code>GET /api/debug/vars</code></p>
          <p>⚠️ WARNING: Should only be accessible in development!</p>
        </div>

        <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
          💡 Hint: Debug endpoints sometimes expose more than they should...
        </p>
      </div>
    </body>
    </html>
  `);
});

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: exposedEnv.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API: Config (safe)
app.get('/api/config', (req, res) => {
  res.json({
    appName: 'CyberForge Cloud App',
    version: '2.0.1',
    region: exposedEnv.AWS_REGION,
    features: {
      authentication: true,
      cloudStorage: true,
      emailNotifications: true
    }
  });
});

// API: Environment variables (EXPOSED - misconfiguration!)
app.get('/api/env', (req, res) => {
  // This should be protected but isn't!
  res.json({
    message: 'Environment variables',
    env: exposedEnv
  });
});

// API: Debug endpoint (should only work in development)
app.get('/api/debug/vars', (req, res) => {
  // Misconfiguration: Debug endpoint left enabled in production
  res.json({
    warning: 'This endpoint should not be accessible in production!',
    environment: exposedEnv,
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage()
    }
  });
});

// API: Simulate a secure endpoint
app.get('/api/secure/data', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || authHeader !== `Bearer ${exposedEnv.API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json({
    message: 'You found the secret data!',
    flag: exposedEnv.FLAG
  });
});

app.listen(PORT, () => {
  console.log(`Environment Variables lab running on port ${PORT}`);
});
