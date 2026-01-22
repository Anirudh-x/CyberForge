const express = require('express');
const app = express();
const PORT = 3000;

// Simulated S3 bucket data
const bucketData = {
  bucketName: 'company-backups',
  region: 'us-east-1',
  public: true,
  files: [
    { name: 'database-backup.sql', size: '2.4 GB', lastModified: '2026-01-15' },
    { name: 'customer-data.csv', size: '1.2 GB', lastModified: '2026-01-18' },
    { name: 'credentials.txt', size: '4 KB', lastModified: '2026-01-20' },
    { name: 'api-keys.json', size: '2 KB', lastModified: '2026-01-19' },
    { name: 'flag.txt', size: '45 B', lastModified: '2026-01-10' }
  ]
};

// Secret credentials file (exposed)
const credentials = {
  aws_access_key: 'AKIAIOSFODNN7EXAMPLE',
  aws_secret_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  database_password: 'SuperSecretPass123!',
  flag: 'FLAG{PUBLIC_BUCKET_EXPOSED}'
};

app.use(express.json());
app.use(express.static('public'));

// Landing page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cloud Storage Dashboard</title>
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
        .bucket-info { 
          background: #111; 
          padding: 20px; 
          margin: 20px 0; 
          border: 1px solid #00ff00;
        }
        .file-list { list-style: none; padding: 0; }
        .file-item { 
          padding: 10px; 
          margin: 5px 0; 
          background: #0a0a0a; 
          border: 1px solid #003300;
        }
        .file-item:hover { background: #003300; }
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
      </style>
    </head>
    <body>
      <div class="container">
        <h1>☁️ Cloud Storage Bucket</h1>
        
        <div class="bucket-info">
          <h2>Bucket: ${bucketData.bucketName}</h2>
          <p><strong>Region:</strong> ${bucketData.region}</p>
          <p><strong>Access:</strong> <span style="color: #ff0000;">PUBLIC</span></p>
          <p><strong>Total Files:</strong> ${bucketData.files.length}</p>
        </div>

        <div class="warning">
          ⚠️ WARNING: This bucket is publicly accessible! Anyone can list and download files.
        </div>

        <h2>📁 Files</h2>
        <ul class="file-list">
          ${bucketData.files.map(file => `
            <li class="file-item">
              <strong>${file.name}</strong> - ${file.size} (Modified: ${file.lastModified})
              <a href="/api/download/${file.name}" style="color: #00ff00; margin-left: 20px;">[Download]</a>
            </li>
          `).join('')}
        </ul>

        <h2>🔌 API Endpoints</h2>
        <div>
          <a href="/api/bucket/info" class="api-link">GET /api/bucket/info</a>
          <a href="/api/bucket/files" class="api-link">GET /api/bucket/files</a>
          <a href="/api/credentials" class="api-link">GET /api/credentials</a>
        </div>

        <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
          💡 Hint: Check all API endpoints. Some might expose sensitive data...
        </p>
      </div>
    </body>
    </html>
  `);
});

// API: Get bucket info
app.get('/api/bucket/info', (req, res) => {
  res.json({
    name: bucketData.bucketName,
    region: bucketData.region,
    public: bucketData.public,
    acl: 'public-read',
    versioning: 'disabled',
    encryption: 'none'
  });
});

// API: List files
app.get('/api/bucket/files', (req, res) => {
  res.json({
    bucket: bucketData.bucketName,
    files: bucketData.files
  });
});

// API: Download file (credentials.txt contains flag)
app.get('/api/download/:filename', (req, res) => {
  const { filename } = req.params;
  
  if (filename === 'credentials.txt') {
    res.setHeader('Content-Type', 'text/plain');
    res.send(`AWS Credentials
==================
Access Key: ${credentials.aws_access_key}
Secret Key: ${credentials.aws_secret_key}
Database Password: ${credentials.database_password}

Flag: ${credentials.flag}
`);
  } else if (filename === 'flag.txt') {
    res.send('FLAG{PUBLIC_BUCKET_EXPOSED}');
  } else {
    res.status(404).json({ error: 'File not found or access denied' });
  }
});

// API: Exposed credentials endpoint (misconfiguration)
app.get('/api/credentials', (req, res) => {
  res.json(credentials);
});

app.listen(PORT, () => {
  console.log(`Cloud Storage lab running on port ${PORT}`);
});
