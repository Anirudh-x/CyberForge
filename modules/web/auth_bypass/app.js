const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cookieParser());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Auth Bypass Lab</title>
      <style>
        body { 
          font-family: 'Courier New', monospace; 
          background: #0a0a0a; 
          color: #00ff00; 
          padding: 40px;
          text-align: center;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          border: 2px solid #00ff00; 
          padding: 30px;
          border-radius: 10px;
        }
        a { 
          background: #00ff00; 
          color: #000; 
          text-decoration: none;
          padding: 15px 30px; 
          display: inline-block;
          margin: 10px;
          font-weight: bold;
          border-radius: 5px;
        }
        a:hover { background: #00cc00; }
        .hint { color: #00aa00; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 Authentication Bypass Lab</h1>
        <p>Access the admin panel!</p>
        <a href="/admin">ADMIN PANEL →</a>
        <div class="hint">
          💡 Hint: Check how authentication is handled...<br>
          Cookies can be manipulated using browser DevTools
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/admin', (req, res) => {
  // VULNERABLE: Client-side cookie authentication
  const isAdmin = req.cookies.admin === 'true';
  
  if (isAdmin) {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admin Panel</title>
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            background: #0a0a0a; 
            color: #00ff00; 
            padding: 40px;
            text-align: center;
            animation: blink 1s infinite;
          }
          @keyframes blink {
            0%, 50%, 100% { opacity: 1; }
            25%, 75% { opacity: 0.5; }
          }
          .flag {
            font-size: 24px;
            border: 3px solid #00ff00;
            padding: 20px;
            display: inline-block;
            margin: 20px;
          }
          a { color: #00ff00; }
        </style>
      </head>
      <body>
        <h1>✅ ADMIN ACCESS GRANTED!</h1>
        <div class="flag">FLAG{AUTH_BYPASS_SUCCESS}</div>
        <p>You successfully bypassed authentication!</p>
        <a href="/">← Back</a>
      </body>
      </html>
    `);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Access Denied</title>
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            background: #0a0a0a; 
            color: #ff0000; 
            padding: 40px;
            text-align: center;
          }
          .container {
            border: 2px solid #ff0000;
            padding: 30px;
            max-width: 600px;
            margin: 0 auto;
            border-radius: 10px;
          }
          a { color: #00ff00; }
          .hint { color: #ffaa00; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ ACCESS DENIED</h1>
          <p>You need admin privileges to access this page.</p>
          <div class="hint">
            💡 Try setting a cookie: admin=true<br>
            Open DevTools → Application → Cookies
          </div>
          <p><a href="/">← Back</a></p>
        </div>
      </body>
      </html>
    `);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Auth Bypass Lab running on port ${PORT}`);
});
