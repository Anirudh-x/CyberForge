const express = require('express');
const router = express.Router();

const FLAG = process.env.FLAG_WEAK_SSH || 'FLAG{WEAK_SSH_CREDS}';

// --- MAIN DASHBOARD ROUTE ---
router.get('/', (req, res) => {
  const sshHost = process.env.SSH_HOST || 'localhost';
  const sshPort = process.env.SSH_PORT || '22';
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Weak SSH Credentials Lab</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css" />
      <script src="https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.js"></script>
      <script src="/socket.io/socket.io.js"></script>
      <style>
        body { font-family: 'Courier New', monospace; background: #0a0a0a; color: #00ff00; padding: 20px; }
        .container { max-width: 1000px; margin: 0 auto; border: 2px solid #00ff00; border-radius: 10px; overflow: hidden; }
        
        /* Tabs Styling */
        .tabs { display: flex; background: #1a1a1a; border-bottom: 2px solid #00ff00; align-items: center; }
        .tab-btn { padding: 15px 30px; border: none; background: none; color: #00ff00; cursor: pointer; font-family: inherit; font-size: 16px; transition: 0.3s; }
        .tab-btn:hover { background: #004400; }
        .tab-btn.active { background: #00ff00; color: #000; font-weight: bold; }
        
        .tab-content { display: none; padding: 30px; height: 600px; overflow-y: auto; }
        .tab-content.active { display: block; }

        /* Terminal Tab Controls */
        .term-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .popout-btn { background: #00ff00; color: #000; border: none; padding: 5px 15px; cursor: pointer; font-weight: bold; border-radius: 3px; }
        .popout-btn:hover { background: #00cc00; }

        #terminal-container { background: #000; height: 90%; width: 100%; padding: 10px; border: 1px solid #333; }
        .info-box { background: #001100; border: 1px solid #00ff00; padding: 15px; margin-bottom: 20px; }
        .command { background: #000; border-left: 4px solid #00ffaa; padding: 10px; color: #00ffaa; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="tabs">
          <button class="tab-btn active" onclick="openTab('mission')">📜 Mission</button>
          <button class="tab-btn" onclick="openTab('terminal')">💻 Terminal</button>
        </div>

        <div id="mission" class="tab-content active">
          <h1>🔓 Weak SSH Credentials Lab</h1>
          <div class="info-box">
            <h3>🔌 Connection Target</h3>
            <p><strong>Command:</strong> <code class="command">ssh ctfuser@${sshHost} -p ${sshPort}</code></p>
          </div>
          <div class="info-box">
            <h3>🎯 Objectives</h3>
            <ul>
              <li>Find the credentials (ctfuser:password123)</li>
              <li>SSH into the local service via terminal</li>
              <li>Escalate to root and grab the flag</li>
            </ul>
          </div>
        </div>

        <div id="terminal" class="tab-content">
          <div class="term-header">
            <span>Console Session</span>
            <button class="popout-btn" onclick="popoutTerminal()">↗️ Open in New Window</button>
          </div>
          <div id="terminal-container"></div>
        </div>
      </div>

      <script>
        function openTab(tabName) {
          const contents = document.getElementsByClassName('tab-content');
          const buttons = document.getElementsByClassName('tab-btn');
          for (let content of contents) content.classList.remove('active');
          for (let btn of buttons) btn.classList.remove('active');
          
          document.getElementById(tabName).classList.add('active');
          event.currentTarget.classList.add('active');
        }

        function popoutTerminal() {
          window.open('/terminal-fullscreen', 'Terminal', 'width=900,height=600');
        }

        // Initialize Embedded Terminal
        const term = new Terminal({ cursorBlink: true, theme: { background: '#000000', foreground: '#00ff00' } });
        const socket = io();
        term.open(document.getElementById('terminal-container'));
        term.onData(data => socket.emit('input', data));
        socket.on('output', data => term.write(data));
      </script>
    </body>
    </html>
  `);
});

// --- STANDALONE TERMINAL ROUTE ---
router.get('/terminal-fullscreen', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Lab Terminal - Fullscreen</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css" />
      <script src="https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.js"></script>
      <script src="/socket.io/socket.io.js"></script>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; background: #000; overflow: hidden; }
        #terminal-fullscreen { height: 100vh; width: 100vw; }
      </style>
    </head>
    <body>
      <div id="terminal-fullscreen"></div>
      <script>
        const term = new Terminal({
          cursorBlink: true,
          theme: { background: '#000000', foreground: '#00ff00' },
          fontFamily: 'Courier New, monospace',
          fontSize: 16
        });
        const socket = io();
        term.open(document.getElementById('terminal-fullscreen'));
        
        // Handle window resizing
        window.addEventListener('resize', () => term.refresh(0, term.rows - 1));

        term.onData(data => socket.emit('input', data));
        socket.on('output', data => term.write(data));
        
        term.writeln('--- Fullscreen Terminal Active ---');
        term.writeln('Connect: ssh ctfuser@localhost');
      </script>
    </body>
    </html>
  `);
});

module.exports = router;