const express = require('express');
const app = express();
const PORT = 3000;

// Simulated disk image data
const diskStructure = {
  '/': {
    'home/': {
      'user/': {
        'Documents/': {
          'passwords.txt': 'admin:SuperSecret123\nroot:RootPass456\nFLAG{DISK_FORENSICS_COMPLETE}',
          'notes.txt': 'Remember to delete sensitive files before backup!',
          'work.docx': '[Document content...]'
        },
        'Downloads/': {
          'malware.exe': '[Malicious payload]',
          'backup.zip': '[Compressed archive]'
        },
        '.hidden_secrets': 'API_KEY=sk_live_secret_key_12345\nDATABASE_PASS=hidden_db_pass'
      }
    },
    'var/': {
      'log/': {
        'auth.log': 'Jan 22 10:15:32 Failed login attempt for root\nJan 22 10:16:45 Successful login: admin',
        'access.log': 'GET /admin - 192.168.1.50 - 200\nPOST /upload - 10.0.0.5 - 401'
      }
    },
    'tmp/': {
      'cache.db': '[Temporary cache data]'
    }
  }
};

app.use(express.json());

// Landing page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Disk Image Investigation</title>
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
        .file-tree { 
          background: #000; 
          padding: 20px; 
          border: 1px solid #003300; 
          font-family: monospace;
        }
        .file { color: #00ff00; cursor: pointer; padding: 2px 0; }
        .file:hover { background: #003300; }
        .hidden { color: #ff0000; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>💾 Disk Image Investigation Lab</h1>
        
        <div class="info-box">
          <h2>Investigation Details</h2>
          <p>A Linux system disk image was seized during a security incident.</p>
          <p><strong>Date:</strong> 2026-01-22</p>
          <p><strong>File System:</strong> ext4</p>
          <p><strong>Size:</strong> 20 GB (simulated)</p>
          <p><strong>Task:</strong> Find evidence and retrieve the flag</p>
        </div>

        <h2>📥 Download Disk Image</h2>
        <div>
          <a href="/download/disk.img" class="download-btn">⬇️ Download disk.img</a>
          <a href="/download/file-list.txt" class="download-btn">⬇️ Download file list</a>
        </div>

        <h2>🗂️ File System Structure</h2>
        <div class="file-tree">
          <div>📁 /</div>
          <div>  📁 home/</div>
          <div>    📁 user/</div>
          <div>      📁 Documents/</div>
          <div>        <span class="file" onclick="viewFile('passwords.txt')">📄 passwords.txt</span></div>
          <div>        <span class="file" onclick="viewFile('notes.txt')">📄 notes.txt</span></div>
          <div>        <span class="file">📄 work.docx</span></div>
          <div>      📁 Downloads/</div>
          <div>        <span class="file">📄 malware.exe</span></div>
          <div>        <span class="file">📄 backup.zip</span></div>
          <div>      <span class="file hidden" onclick="viewFile('.hidden_secrets')">🔒 .hidden_secrets (hidden)</span></div>
          <div>  📁 var/</div>
          <div>    📁 log/</div>
          <div>      <span class="file" onclick="viewFile('auth.log')">📄 auth.log</span></div>
          <div>      <span class="file" onclick="viewFile('access.log')">📄 access.log</span></div>
        </div>

        <div id="file-content" class="info-box" style="display: none;">
          <h3 id="file-name"></h3>
          <pre id="file-text" style="color: #00ff00; white-space: pre-wrap;"></pre>
        </div>

        <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
          💡 Hint: Check hidden files (starting with .) and look in Documents folder...
        </p>

        <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
          🔧 Terminal: <code>curl http://localhost:PORT/api/file?path=/home/user/Documents/passwords.txt</code>
        </p>

        <script>
          function viewFile(filename) {
            fetch('/api/file?path=' + encodeURIComponent(filename))
              .then(r => r.json())
              .then(data => {
                document.getElementById('file-name').textContent = filename;
                document.getElementById('file-text').textContent = data.content;
                document.getElementById('file-content').style.display = 'block';
              });
          }
        </script>
      </div>
    </body>
    </html>
  `);
});

// API: Download disk image (simulated)
app.get('/download/disk.img', (req, res) => {
  const diskContent = `DISK IMAGE - Linux ext4
Captured: 2026-01-22
Total Size: 20 GB

File System:
${JSON.stringify(diskStructure, null, 2)}

Important Files:
/home/user/Documents/passwords.txt - Contains credentials
/home/user/.hidden_secrets - Hidden file with API keys
/var/log/auth.log - Authentication logs

Use forensic tools to extract files and analyze the image.
`;
  
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="disk.img"');
  res.send(diskContent);
});

// API: Download file list
app.get('/download/file-list.txt', (req, res) => {
  const fileList = `
/home/user/Documents/passwords.txt
/home/user/Documents/notes.txt
/home/user/Documents/work.docx
/home/user/Downloads/malware.exe
/home/user/Downloads/backup.zip
/home/user/.hidden_secrets
/var/log/auth.log
/var/log/access.log
/tmp/cache.db
  `.trim();
  
  res.setHeader('Content-Type', 'text/plain');
  res.send(fileList);
});

// API: Read specific file
app.get('/api/file', (req, res) => {
  const { path } = req.query;
  
  let content = '';
  
  if (path === 'passwords.txt' || path === '/home/user/Documents/passwords.txt') {
    content = diskStructure['/']['home/']['user/']['Documents/']['passwords.txt'];
  } else if (path === '.hidden_secrets' || path === '/home/user/.hidden_secrets') {
    content = diskStructure['/']['home/']['user/']['.hidden_secrets'];
  } else if (path === 'notes.txt' || path === '/home/user/Documents/notes.txt') {
    content = diskStructure['/']['home/']['user/']['Documents/']['notes.txt'];
  } else if (path === 'auth.log' || path === '/var/log/auth.log') {
    content = diskStructure['/']['var/']['log/']['auth.log'];
  } else if (path === 'access.log' || path === '/var/log/access.log') {
    content = diskStructure['/']['var/']['log/']['access.log'];
  } else {
    return res.status(404).json({ error: 'File not found' });
  }
  
  res.json({ path, content });
});

// API: List all files
app.get('/api/files', (req, res) => {
  res.json({
    files: [
      '/home/user/Documents/passwords.txt',
      '/home/user/Documents/notes.txt',
      '/home/user/.hidden_secrets',
      '/var/log/auth.log',
      '/var/log/access.log'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Disk Image lab running on port ${PORT}`);
});
