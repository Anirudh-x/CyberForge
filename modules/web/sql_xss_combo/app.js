const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();

// Flags for individual vulnerabilities (mirrors existing modules)
const FLAG_SQL = process.env.FLAG_SQL_INJECTION || 'FLAG{SQL_INJECTION_MASTER}';
const FLAG_XSS = process.env.FLAG_XSS || 'FLAG{XSS_EXECUTED}';
// Optional chained/final flag (awarded after BOTH are solved)
const FLAG_FINAL = process.env.FLAG_FINAL || 'FLAG{COMBO_SQL_THEN_XSS_MASTERED}';

console.log('SQL+XSS Combo Lab initialized with flags:', { FLAG_SQL, FLAG_XSS });

// ---- SQL INJECTION SETUP (based on modules/web/sql_injection/app.js router) ----

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, user TEXT, pass TEXT, role TEXT)');
  db.run("INSERT INTO users VALUES (1, 'admin', 'admin123', 'admin')");
  db.run("INSERT INTO users VALUES (2, 'user', 'user123', 'user')");
});

// Landing page: let user choose which lab to open
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>SQL + XSS Combo Lab</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          background: #050505;
          color: #00ff9f;
          padding: 40px;
          text-align: center;
        }
        .grid {
          display: flex;
          gap: 40px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .card {
          border: 2px solid #00ff9f;
          padding: 24px;
          border-radius: 10px;
          width: 260px;
          background: #020202;
          box-shadow: 0 0 20px rgba(0, 255, 159, 0.15);
        }
        .steps {
          max-width: 700px;
          margin: 0 auto 28px;
          text-align: left;
          border: 1px solid rgba(0, 255, 159, 0.25);
          background: #010101;
          padding: 18px 20px;
          border-radius: 10px;
          color: rgba(0, 255, 159, 0.85);
        }
        .steps h2 { margin: 0 0 10px; font-size: 14px; letter-spacing: 0.25em; text-transform: uppercase; }
        .steps ol { margin: 0; padding-left: 18px; font-size: 13px; }
        .steps li { margin: 6px 0; }
        a.button {
          display: inline-block;
          margin-top: 16px;
          padding: 10px 24px;
          background: #00ff9f;
          color: #000;
          text-decoration: none;
          font-weight: bold;
        }
        a.button:hover { background: #00cc7a; }
      </style>
    </head>
    <body>
      <h1>🔐 SQL + XSS Combo Lab</h1>
      <div class="steps">
        <h2>Chain Objective</h2>
        <ol>
          <li>Exploit <b>SQL Injection</b> to obtain the SQL flag and unlock the next stage.</li>
          <li>Exploit <b>XSS</b> (stage unlock required) to obtain the XSS flag.</li>
          <li>After both are solved, the <b>final combo flag</b> will be revealed.</li>
        </ol>
      </div>
      <p>Select a vector to attack:</p>
      <div class="grid">
        <div class="card">
          <h2>SQL Injection</h2>
          <p>Classic login form vulnerable to SQL injection.</p>
          <a href="/sql" class="button">Open SQL Lab</a>
        </div>
        <div class="card">
          <h2>XSS Comment Box</h2>
          <p>Reflected XSS in a comment field (locked until SQL is solved).</p>
          <a href="/xss" class="button">Open XSS Lab</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Minimal cookie parser (no extra dependencies)
const getCookie = (req, name) => {
  const header = req.headers.cookie || '';
  const parts = header.split(';').map(p => p.trim()).filter(Boolean);
  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const k = decodeURIComponent(part.slice(0, eq));
    const v = decodeURIComponent(part.slice(eq + 1));
    if (k === name) return v;
  }
  return null;
};

const hasSolvedSql = (req) => getCookie(req, 'sql_solved') === '1';
const hasSolvedXss = (req) => getCookie(req, 'xss_solved') === '1';

// Final flag (only after BOTH are solved)
app.get('/final', (req, res) => {
  if (!hasSolvedSql(req) || !hasSolvedXss(req)) {
    return res.status(403).send(`
      <html><body style="font-family:Courier New;background:#0a0a0a;color:#ffcc00;padding:40px;">
      <h2>🔒 Final flag locked</h2>
      <p>You must solve <b>SQL Injection</b> and <b>XSS</b> first.</p>
      <p><a style="color:#00ff9f" href="/">Back</a></p>
      </body></html>
    `);
  }

  res.send(`
    <html>
    <head>
      <title>Final Combo Flag</title>
      <style>
        body { font-family:'Courier New', monospace; background:#0a0a0a; color:#00ff00; padding:40px; text-align:center; }
        .flag { display:inline-block; border:3px solid #00ff00; padding:18px 22px; font-size:22px; margin-top:18px; }
        a { color:#00ff9f; }
      </style>
    </head>
    <body>
      <h1>🏁 Combo Complete</h1>
      <p>You solved both stages. Submit the final flag:</p>
      <div class="flag">${FLAG_FINAL}</div>
      <p style="margin-top:18px;"><a href="/">Back to hub</a></p>
    </body>
    </html>
  `);
});

// SQL Injection lab (mounted under /sql and /sql/login)
app.get('/sql', (req, res) => {
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
        a { color: #00ff9f; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔓 SQL Injection Lab</h1>
        <p>Try to login as admin!</p>
        <form action="/sql/login" method="GET">
          <input type="text" name="u" placeholder="Username" required />
          <input type="password" name="p" placeholder="Password" required />
          <button type="submit">LOGIN</button>
        </form>
        <div class="hint">
          💡 Hint: SQL queries are vulnerable to injection...<br>
          Try: ' OR '1'='1
        </div>
        <p style="margin-top:20px;"><a href="/">← Back to Combo Hub</a></p>
      </div>
    </body>
    </html>
  `);
});

app.get('/sql/login', (req, res) => {
  const username = req.query.u;
  const password = req.query.p;

  const query = `SELECT * FROM users WHERE user='${username}' AND pass='${password}'`;
  console.log('Executing SQL query:', query);

  db.get(query, (err, row) => {
    if (err) {
      res.send(`<pre>SQL Error: ${err.message}</pre><p><a href="/sql">Try Again</a></p>`);
    } else if (row && row.role === 'admin') {
      // Mark SQL stage as solved (used to unlock XSS stage)
      res.setHeader('Set-Cookie', [
        'sql_solved=1; Path=/; SameSite=Lax',
      ]);
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
            }
            .flag {
              font-size: 24px;
              border: 3px solid #00ff00;
              padding: 20px;
              display: inline-block;
              margin: 20px;
            }
            .next {
              display: inline-block;
              margin-top: 10px;
              padding: 10px 18px;
              border: 1px solid rgba(0, 255, 159, 0.35);
              color: #00ff9f;
              text-decoration: none;
            }
            a { color: #00ff9f; }
          </style>
        </head>
        <body>
          <h1>✅ LOGIN SUCCESSFUL!</h1>
          <p>Stage 1 complete: SQL Injection solved. XSS stage is now unlocked.</p>
          <div class="flag">${FLAG_SQL}</div>
          <p>Submit this SQL flag, then proceed to Stage 2.</p>
          <a class="next" href="/xss">Proceed to Stage 2: XSS →</a>
          <p style="margin-top:16px;"><a href="/sql">Back to SQL Lab</a> | <a href="/">Combo Hub</a></p>
        </body>
        </html>
      `);
    } else if (row) {
      res.send(`<p>Login OK but not admin. Try harder.</p><p><a href="/sql">Back</a></p>`);
    } else {
      res.send(`<p>Invalid credentials.</p><p><a href="/sql">Back</a></p>`);
    }
  });
});

// ---- XSS LAB (based on modules/web/xss/app.js) mounted under /xss ----

app.get('/xss', (req, res) => {
  if (!hasSolvedSql(req)) {
    return res.status(403).send(`
      <html>
      <head>
        <title>XSS Locked</title>
        <style>
          body { font-family:'Courier New', monospace; background:#0a0a0a; color:#ffcc00; padding:40px; text-align:center; }
          a { color:#00ff9f; }
          .box { max-width: 700px; margin: 0 auto; border:1px solid rgba(255,204,0,0.25); padding:20px; background:#050505; }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>🔒 XSS Stage Locked</h2>
          <p>You must solve <b>SQL Injection</b> first to unlock this stage.</p>
          <p><a href="/sql">Go solve SQL Injection</a></p>
          <p><a href="/">Back to hub</a></p>
        </div>
      </body>
      </html>
    `);
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>XSS Lab</title>
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
          width: 80%;
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
        a { color: #00ff9f; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>💬 XSS Lab - Comment Section</h1>
        <p>Post a comment below!</p>
        <form action="/xss/comment" method="GET">
          <input type="text" name="msg" placeholder="Your comment..." required />
          <br>
          <button type="submit">POST COMMENT</button>
        </form>
        <div class="hint">
          💡 Hint: User input is directly rendered...<br>
          Try: &lt;script&gt;alert('XSS')&lt;/script&gt;
        </div>
        <p style="margin-top:20px;"><a href="/">← Back to Combo Hub</a></p>
      </div>
    </body>
    </html>
  `);
});

app.get('/xss/comment', (req, res) => {
  if (!hasSolvedSql(req)) {
    return res.status(403).send(`<p>XSS locked. Solve SQL first: <a href="/sql">/sql</a></p>`);
  }

  const message = req.query.msg || '';
  // Mark XSS stage as solved as soon as user hits the vulnerable sink page.
  // (They still must actually exploit it client-side to reveal the flag visually.)
  res.setHeader('Set-Cookie', [
    'xss_solved=1; Path=/; SameSite=Lax',
  ]);
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>XSS Lab - Comment</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          background: #0a0a0a;
          color: #00ff00;
          padding: 40px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          border: 2px solid #00ff00;
          padding: 30px;
          border-radius: 10px;
        }
        .comment {
          background: #001100;
          border: 1px solid #00ff00;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .flag-box {
          background: #003300;
          border: 3px solid #00ff00;
          padding: 20px;
          margin: 20px 0;
          border-radius: 10px;
          text-align: center;
        }
        .flag {
          font-size: 24px;
          font-weight: bold;
          color: #00ff00;
          margin: 10px 0;
        }
        a { color: #00ff9f; text-decoration: none; }
      </style>
      <script>
        window.addEventListener('load', () => {
          const flagElement = document.getElementById('xss-flag');
          if (flagElement) {
            flagElement.style.display = 'block';
            console.log('✅ XSS executed successfully!');
          }
        });
      </script>
    </head>
    <body>
      <div class="container">
        <h1>💬 Comment Posted</h1>
        <div class="comment">
          <h2>Your Comment:</h2>
          ${message}
        </div>
        <div id="xss-flag" class="flag-box" style="display:none;">
          <h2>✅ XSS Executed Successfully!</h2>
          <p>Congratulations! You exploited the XSS vulnerability!</p>
          <div class="flag">${FLAG_XSS}</div>
          <p style="font-size: 12px; margin-top: 15px;">Copy this flag and submit it to earn points!</p>
        </div>
        <div class="flag-box" style="margin-top:20px; border-style:dashed;">
          <h2>🏁 Final Step</h2>
          <p>After submitting the SQL + XSS flags, claim your final combo flag:</p>
          <p><a href="/final" style="color:#00ff9f;">Open Final Flag</a></p>
        </div>
        <p><a href="/xss">← Back to Comments</a></p>
      </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SQL+XSS Combo Lab running on port ${PORT}`);
});

