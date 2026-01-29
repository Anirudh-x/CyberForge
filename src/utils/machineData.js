// Domain and module definitions for Machine Builder

export const domains = [
  { id: 'web', name: 'Web Security', color: 'green' },
  { id: 'red_team', name: 'Red Team', color: 'red' },
  { id: 'blue_team', name: 'Blue Team', color: 'blue' },
  { id: 'cloud', name: 'Cloud Security', color: 'cyan' },
  { id: 'forensics', name: 'Forensics', color: 'purple' }
];

export const modulesByDomain = {
  web: [
    { id: 'sql_injection', name: 'SQL Injection', description: 'Database query manipulation', difficulty: 'medium', points: 75 },
    { id: 'xss', name: 'Cross-Site Scripting (XSS)', description: 'Client-side code injection', difficulty: 'medium', points: 65 },
    { id: 'csrf', name: 'CSRF', description: 'Cross-Site Request Forgery', difficulty: 'medium', points: 70 },
    { id: 'auth_bypass', name: 'Authentication Bypass', description: 'Broken authentication', difficulty: 'high', points: 95 }
  ],
  red_team: [
    { id: 'weak_ssh', name: 'Weak SSH Credentials', description: 'Brute-forceable SSH', difficulty: 'low', points: 50 },
    { id: 'privilege_escalation', name: 'Privilege Escalation', description: 'Escalate privileges to root/admin', difficulty: 'high', points: 100 }
  ],
  blue_team: [
    { id: 'log_analysis', name: 'Log Analysis Challenge', description: 'Detect intrusions from logs', difficulty: 'medium', points: 70 }
  ],
  cloud: [
    { id: 'public_bucket', name: 'Public Storage Bucket', description: 'Exposed cloud storage', difficulty: 'low', points: 50 },
    { id: 'iam_policy', name: 'Misconfigured IAM Policy', description: 'Excessive permissions', difficulty: 'medium', points: 75 },
    { id: 'env_vars', name: 'Exposed Environment Variables', description: 'Leaked credentials', difficulty: 'low', points: 60 },
    { id: 'exposed_secrets', name: 'Exposed Secrets', description: 'Secrets leaked in app/config', difficulty: 'medium', points: 70 }
  ],
  forensics: [
    { id: 'memory_dump', name: 'Memory Dump Analysis', description: 'Analyze RAM dump', difficulty: 'high', points: 80 },
    { id: 'disk_image', name: 'Disk Image Investigation', description: 'Forensic disk analysis', difficulty: 'high', points: 85 },
    { id: 'hidden_files', name: 'Hidden Files Challenge', description: 'Find concealed data', difficulty: 'medium', points: 70 }
  ]
};

export const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'low':
      return 'text-green-400 border-green-500';
    case 'medium':
      return 'text-yellow-400 border-yellow-500';
    case 'high':
      return 'text-red-400 border-red-500';
    default:
      return 'text-green-400 border-green-500';
  }
};
