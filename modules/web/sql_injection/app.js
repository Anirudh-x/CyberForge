const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

// Get unique flag from environment variable (set during deployment)
const FLAG = process.env.FLAG_SQL_INJECTION || 'FLAG{SQL_INJECTION_MASTER}';
console.log('SQL Injection Lab initialized with flag:', FLAG);

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

// Create users table
db.serialize(() => {
  db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, user TEXT, pass TEXT, role TEXT)');
  db.run("INSERT INTO users VALUES (1, 'admin', 'admin123', 'admin')");
  db.run("INSERT INTO users VALUES (2, 'user', 'user123', 'user')");
});

router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>SQL Injection Lab</title>
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
        input { 
          background: #000; 
          border: 1px solid #00ff00; 
          color: #00ff00; 
          padding: 10px; 
          margin: 10px;
          font-family: 'Courier New', monospace;
        }
        button { 
          background: #00ff00; 
          color: #000; 
          border: none; 
          padding: 10px 30px; 
          cursor: pointer;
          font-family: 'Courier New', monospace;
          font-weight: bold;
        }
        button:hover { background: #00cc00; }
        .hint { color: #00aa00; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔓 SQL Injection Lab</h1>
        <p>Try to login as admin!</p>
        <form action="/login" method="GET">
          <input type="text" name="u" placeholder="Username" required />
          <input type="password" name="p" placeholder="Password" required />
          <button type="submit">LOGIN</button>
        </form>
        <div class="hint">
          💡 Hint: SQL queries are vulnerable to injection...<br>
          Try: ' OR '1'='1
        </div>
      </div>
    </body>
    </html>
  `);
});

router.get('/login', (req, res) => {
  const username = req.query.u;
  const password = req.query.p;
  
  // VULNERABLE: String concatenation - SQL Injection
  const query = `SELECT * FROM users WHERE user='${username}' AND pass='${password}'`;
  
  console.log('Executing query:', query);
  
  db.get(query, (err, row) => {
    if (err) {
      res.send(`
        <html>
        <head>
          <style>
            body { font-family: 'Courier New'; background: #0a0a0a; color: #ff0000; padding: 40px; text-align: center; }
            a { color: #00ff00; }
          </style>
        </head>
        <body>
          <h1>❌ SQL Error!</h1>
          <p>${err.message}</p>
          <a href="/">Try Again</a>
        </body>
        </html>
      `);
    } else if (row) {
      if (row.role === 'admin') {
        res.send(`
          <html>
          <head>
            <style>
              body { 
                font-family: 'Courier New'; 
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
            <h1>✅ LOGIN SUCCESSFUL!</h1>
            <div class="flag">${FLAG}</div>
            <p>Congratulations! You exploited SQL Injection!</p>
            <a href="/">Back to Lab</a>
          </body>
          </html>
        `);
      } else {
        res.send(`
          <html>
          <head>
            <style>
              body { font-family: 'Courier New'; background: #0a0a0a; color: #ffaa00; padding: 40px; text-align: center; }
              a { color: #00ff00; }
            </style>
          </head>
          <body>
            <h1>⚠️ Login Successful</h1>
            <p>But you're not admin! Try harder.</p>
            <a href="/">Try Again</a>
          </body>
          </html>
        `);
      }
    } else {
      res.send(`
        <html>
        <head>
          <style>
            body { font-family: 'Courier New'; background: #0a0a0a; color: #ff0000; padding: 40px; text-align: center; }
            a { color: #00ff00; }
          </style>
        </head>
        <body>
          <h1>❌ Invalid Credentials</h1>
          <a href="/">Try Again</a>
        </body>
        </html>
      `);
    }
  });
});

module.exports = router;
