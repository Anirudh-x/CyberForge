const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Get unique flag from environment variable (set during deployment)
const FLAG = process.env.FLAG_MEMORY_DUMP || 'FLAG{MEMORY_FORENSICS_MASTER}';
console.log('Memory Dump Analysis Lab initialized with flag:', FLAG);

// Simulated memory dump data
const memoryData = {
  processInfo: [
    { pid: 1234, name: 'svchost.exe', memory: '45 MB' },
    { pid: 2156, name: 'chrome.exe', memory: '256 MB' },
    { pid: 3421, name: 'explorer.exe', memory: '89 MB' },
    { pid: 4532, name: 'malware.exe', memory: '12 MB' },
    { pid: 5643, name: 'notepad.exe', memory: '8 MB' }
  ],
  strings: [
    'User logged in: admin',
    'Password: TempPass2026!',
    'Connecting to C2 server: evil.com',
    'Encrypting files...',
    FLAG,
    'Exfiltrating data to: 192.168.1.100',
    'Keylogger active',
    'Screenshot captured'
  ],
  networkConnections: [
    { ip: '192.168.1.100', port: 4444, status: 'ESTABLISHED' },
    { ip: '10.0.0.5', port: 445, status: 'LISTENING' },
    { ip: '172.16.0.10', port: 8080, status: 'TIME_WAIT' }
  ]
};

app.use(express.json());

// Landing page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Memory Dump Analysis</title>
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
        .info-box { 
          background: #111; 
          padding: 20px; 
          margin: 20px 0; 
          border: 1px solid #00ff00;
        }
        .download-btn { 
          color: #00ff00; 
          text-decoration: none; 
          padding: 15px 30px; 
          border: 2px solid #00ff00; 
          display: inline-block; 
          margin: 10px 5px;
          font-size: 1.1em;
        }
        .download-btn:hover { background: #003300; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border: 1px solid #003300; }
        th { background: #003300; }
        .malicious { color: #ff0000; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🧠 Memory Dump Analysis Lab</h1>
        
        <div class="info-box">
          <h2>Incident Overview</h2>
          <p>A Windows 10 workstation was compromised. A memory dump was captured during the incident.</p>
          <p><strong>Date:</strong> 2026-01-22</p>
          <p><strong>System:</strong> Windows 10 x64</p>
          <p><strong>Dump Size:</strong> 4.2 GB (simulated)</p>
        </div>

        <h2>📥 Download Memory Dump</h2>
        <div>
          <a href="/download/memory.dmp" class="download-btn">⬇️ Download memory.dmp</a>
          <a href="/download/strings.txt" class="download-btn">⬇️ Download extracted strings</a>
        </div>

        <h2>🔍 Quick Analysis</h2>
        
        <h3>Running Processes</h3>
        <table>
          <tr>
            <th>PID</th>
            <th>Process Name</th>
            <th>Memory</th>
          </tr>
          ${memoryData.processInfo.map(p => `
            <tr class="${p.name === 'malware.exe' ? 'malicious' : ''}">
              <td>${p.pid}</td>
              <td>${p.name}</td>
              <td>${p.memory}</td>
            </tr>
          `).join('')}
        </table>

        <h3>Network Connections</h3>
        <table>
          <tr>
            <th>Remote IP</th>
            <th>Port</th>
            <th>Status</th>
          </tr>
          ${memoryData.networkConnections.map(c => `
            <tr>
              <td>${c.ip}</td>
              <td>${c.port}</td>
              <td>${c.status}</td>
            </tr>
          `).join('')}
        </table>

        <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
          💡 Hint: Use strings command or download extracted strings to find hidden data...
        </p>

        <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
          🔧 Optional: Use terminal to run <code>curl http://localhost:PORT/api/strings | grep FLAG</code>
        </p>
      </div>
    </body>
    </html>
  `);
});

// API: Download memory dump (simulated small file)
app.get('/download/memory.dmp', (req, res) => {
  const dumpContent = `MEMORY DUMP - Windows 10 x64
Captured: 2026-01-22 14:30:00
System: DESKTOP-ABC123

Process List:
${memoryData.processInfo.map(p => `[${p.pid}] ${p.name} - ${p.memory}`).join('\n')}

Extracted Strings:
${memoryData.strings.join('\n')}

Network Connections:
${memoryData.networkConnections.map(c => `${c.ip}:${c.port} [${c.status}]`).join('\n')}

End of dump.
`;
  
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="memory.dmp"');
  res.send(dumpContent);
});

// API: Download extracted strings
app.get('/download/strings.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="strings.txt"');
  res.send(memoryData.strings.join('\n'));
});

// API: Get strings (for terminal access)
app.get('/api/strings', (req, res) => {
  res.json({ strings: memoryData.strings });
});

// API: Get processes
app.get('/api/processes', (req, res) => {
  res.json({ processes: memoryData.processInfo });
});

// API: Get network connections
app.get('/api/connections', (req, res) => {
  res.json({ connections: memoryData.networkConnections });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Memory Dump Analysis Lab running on port ${PORT}`);
  console.log(`Flag: ${FLAG}`);
});
