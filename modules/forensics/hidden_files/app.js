const express = require('express');
const path = require('path');
const archiver = require('archiver');
const app = express();

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Forensics Lab</title>
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
        .briefing {
          background: #001100;
          border: 1px solid #00ff00;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .download-btn { 
          background: #00ff00; 
          color: #000; 
          text-decoration: none;
          padding: 15px 30px; 
          display: inline-block;
          margin: 20px auto;
          font-weight: bold;
          border-radius: 5px;
        }
        .download-btn:hover { background: #00cc00; }
        .hint { color: #00aa00; font-size: 12px; margin-top: 20px; }
        .center { text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔬 Digital Forensics Lab</h1>
        
        <div class="briefing">
          <h2>Case File #2026-001</h2>
          <p><strong>Incident:</strong> Suspected data breach at a corporate server</p>
          <p><strong>Evidence:</strong> Disk image recovered from compromised system</p>
          <p><strong>Your Task:</strong> Analyze the evidence and find hidden data</p>
          <ul>
            <li>🔍 Look for hidden files (files starting with .)</li>
            <li>🔍 Check file metadata and timestamps</li>
            <li>🔍 Search for sensitive information</li>
            <li>🎯 Locate the flag to complete the investigation</li>
          </ul>
        </div>

        <div class="center">
          <a href="/download" class="download-btn">📥 DOWNLOAD EVIDENCE (evidence.zip)</a>
          <div class="hint">
            💡 Hint: In Unix systems, files starting with '.' are hidden<br>
            Use 'ls -la' or 'unzip -l' to see all files
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/download', (req, res) => {
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=evidence.zip');

  const archive = archiver('zip', { zlib: { level: 9 } });
  
  archive.on('error', (err) => {
    res.status(500).send('Error creating archive');
  });

  archive.pipe(res);
  
  // Add files to zip
  archive.file(path.join(__dirname, 'readme.txt'), { name: 'readme.txt' });
  archive.file(path.join(__dirname, '.hidden_config'), { name: '.hidden_config' });
  
  archive.finalize();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Forensics Lab running on port ${PORT}`);
});
