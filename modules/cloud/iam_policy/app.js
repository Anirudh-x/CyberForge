const express = require('express');
const app = express();
const PORT = 3000;

// Simulated IAM policies
const policies = {
  admin_policy: {
    Version: '2026-01-22',
    Statement: [{
      Effect: 'Allow',
      Action: '*',
      Resource: '*'
    }]
  },
  user_policy: {
    Version: '2026-01-22',
    Statement: [{
      Effect: 'Allow',
      Action: ['s3:GetObject', 's3:ListBucket'],
      Resource: 'arn:aws:s3:::public-files/*'
    }]
  }
};

// Simulated users with overly permissive policies
const users = [
  {
    username: 'john.doe',
    role: 'Developer',
    policies: ['admin_policy'],  // MISCONFIGURATION: Developer with admin access!
    accessKey: 'AKIAIOSFODNN7EXAMPLE',
    lastLogin: '2026-01-22'
  },
  {
    username: 'jane.smith',
    role: 'Intern',
    policies: ['admin_policy'],  // MISCONFIGURATION: Intern with admin access!
    accessKey: 'AKIAI44QH8DHBEXAMPLE',
    lastLogin: '2026-01-21'
  },
  {
    username: 'bob.wilson',
    role: 'Security Engineer',
    policies: ['user_policy'],
    accessKey: 'AKIAJWG3EXAMPLE',
    lastLogin: '2026-01-20'
  }
];

// Secret data accessible only with admin privileges
const secretData = {
  companySecrets: {
    database_credentials: {
      host: 'prod-db.internal',
      username: 'admin',
      password: 'SuperSecret123!'
    },
    api_keys: {
      stripe: 'sk_live_51ExAmPlE',
      aws: 'AKIAIOSFODNN7EXAMPLE'
    },
    flag: 'FLAG{IAM_POLICY_MISCONFIGURED}'
  }
};

app.use(express.json());

// Landing page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>IAM Policy Manager</title>
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
        .user-card { 
          background: #111; 
          padding: 20px; 
          margin: 15px 0; 
          border: 1px solid #00ff00;
        }
        .user-card.warning { border-color: #ff0000; }
        .policy-badge { 
          padding: 5px 15px; 
          border-radius: 5px; 
          display: inline-block; 
          margin: 5px;
        }
        .admin-badge { background: #330000; color: #ff0000; }
        .user-badge { background: #003300; color: #00ff00; }
        .api-link { 
          color: #00ff00; 
          text-decoration: none; 
          padding: 10px 20px; 
          border: 1px solid #00ff00; 
          display: inline-block; 
          margin: 10px 5px;
        }
        .api-link:hover { background: #003300; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border: 1px solid #003300; }
        th { background: #003300; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 IAM Policy Manager</h1>
        
        <h2>👥 User Access Overview</h2>
        ${users.map(user => `
          <div class="user-card ${user.policies.includes('admin_policy') ? 'warning' : ''}">
            <h3>${user.username}</h3>
            <p><strong>Role:</strong> ${user.role}</p>
            <p><strong>Policies:</strong> 
              ${user.policies.map(p => `
                <span class="policy-badge ${p === 'admin_policy' ? 'admin-badge' : 'user-badge'}">
                  ${p}
                </span>
              `).join('')}
            </p>
            <p><strong>Access Key:</strong> <code>${user.accessKey}</code></p>
            <p><strong>Last Login:</strong> ${user.lastLogin}</p>
          </div>
        `).join('')}

        <h2>📋 Available Policies</h2>
        <table>
          <tr>
            <th>Policy Name</th>
            <th>Actions</th>
            <th>Resources</th>
          </tr>
          <tr>
            <td>admin_policy</td>
            <td><code>*</code> (All)</td>
            <td><code>*</code> (All)</td>
          </tr>
          <tr>
            <td>user_policy</td>
            <td><code>s3:GetObject, s3:ListBucket</code></td>
            <td><code>arn:aws:s3:::public-files/*</code></td>
          </tr>
        </table>

        <h2>🔌 API Endpoints</h2>
        <div>
          <a href="/api/users" class="api-link">GET /api/users</a>
          <a href="/api/policies" class="api-link">GET /api/policies</a>
          <a href="/api/admin/secrets?key=AKIAIOSFODNN7EXAMPLE" class="api-link">
            GET /api/admin/secrets (requires admin key)
          </a>
        </div>

        <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
          💡 Hint: Find users with overly permissive policies and use their access keys...
        </p>
      </div>
    </body>
    </html>
  `);
});

// API: List all users
app.get('/api/users', (req, res) => {
  res.json({
    users: users.map(u => ({
      username: u.username,
      role: u.role,
      policies: u.policies,
      accessKey: u.accessKey
    }))
  });
});

// API: List all policies
app.get('/api/policies', (req, res) => {
  res.json({ policies });
});

// API: Get secrets (requires admin access key)
app.get('/api/admin/secrets', (req, res) => {
  const { key } = req.query;
  
  // Check if provided access key has admin policy
  const user = users.find(u => u.accessKey === key);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid access key' });
  }
  
  if (!user.policies.includes('admin_policy')) {
    return res.status(403).json({ error: 'Insufficient permissions. Admin policy required.' });
  }
  
  // User has admin access (misconfiguration allows access)
  res.json(secretData);
});

// API: Check policy for user
app.post('/api/check-access', (req, res) => {
  const { accessKey, action, resource } = req.body;
  
  const user = users.find(u => u.accessKey === accessKey);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const hasAdminPolicy = user.policies.includes('admin_policy');
  
  res.json({
    username: user.username,
    role: user.role,
    hasAccess: hasAdminPolicy || action === 's3:GetObject',
    isAdmin: hasAdminPolicy,
    message: hasAdminPolicy ? 'User has FULL ADMIN ACCESS (Potential Security Risk!)' : 'Limited access'
  });
});

app.listen(PORT, () => {
  console.log(`IAM Policy lab running on port ${PORT}`);
});
