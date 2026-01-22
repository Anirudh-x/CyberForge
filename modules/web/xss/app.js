const express = require('express');
const app = express();

app.get('/', (req, res) => {
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
      </style>
    </head>
    <body>
      <div class="container">
        <h1>💬 XSS Lab - Comment Section</h1>
        <p>Post a comment below!</p>
        <form action="/comment" method="GET">
          <input type="text" name="msg" placeholder="Your comment..." required />
          <br>
          <button type="submit">POST COMMENT</button>
        </form>
        <div class="hint">
          💡 Hint: User input is directly rendered...<br>
          Try: &lt;script&gt;alert('XSS')&lt;/script&gt;
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/comment', (req, res) => {
  const message = req.query.msg || '';
  
  // VULNERABLE: Direct rendering without sanitization
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
        a { color: #00ff00; text-decoration: none; }
        a:hover { color: #00cc00; }
      </style>
      <script>
        // Check if XSS was successful
        window.addEventListener('load', () => {
          if (document.getElementById('xss-flag')) {
            console.log('XSS executed successfully!');
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
        <div id="xss-flag" style="display:none;">FLAG{XSS_EXECUTED}</div>
        <p><a href="/">← Back to Comments</a></p>
      </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`XSS Lab running on port ${PORT}`);
});
