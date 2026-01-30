// Domain and module definitions for Machine Builder

export const domains = [
  { id: 'web', name: 'Web Security', color: 'green' },
  { id: 'red_team', name: 'Red Team', color: 'red' },
  { id: 'blue_team', name: 'Blue Team', color: 'blue' },
  { id: 'cloud', name: 'Cloud Security', color: 'cyan' },
  { id: 'forensics', name: 'Forensics', color: 'purple' },
  { id: 'social_engineering', name: 'Social Engineering', color: 'yellow' }
];

export const modulesByDomain = {
  web: [
    { id: 'sql_injection', name: 'SQL Injection', description: 'Database query manipulation', difficulty: 'medium', points: 75 },
    { id: 'xss', name: 'Cross-Site Scripting (XSS)', description: 'Client-side code injection', difficulty: 'medium', points: 65 },
    { id: 'csrf', name: 'CSRF', description: 'Cross-Site Request Forgery', difficulty: 'medium', points: 70 },
    { id: 'file_upload', name: 'File Upload Vulnerability', description: 'Insecure file handling', difficulty: 'high', points: 90 },
    { id: 'auth_bypass', name: 'Authentication Bypass', description: 'Broken authentication', difficulty: 'high', points: 95 }
  ],
  red_team: [
    { id: 'weak_ssh', name: 'Weak SSH Credentials', description: 'Brute-forceable SSH', difficulty: 'low', points: 50 },
    { id: 'exposed_services', name: 'Exposed Services', description: 'Misconfigured network services', difficulty: 'medium', points: 70 },
    { id: 'privesc', name: 'Privilege Escalation', description: 'Local privilege escalation', difficulty: 'high', points: 100 },
    { id: 'cron_jobs', name: 'Insecure Cron Jobs', description: 'Misconfigured scheduled tasks', difficulty: 'medium', points: 75 }
  ],
  blue_team: [
    { id: 'log_analysis', name: 'Log Analysis Challenge', description: 'Detect intrusions from logs', difficulty: 'medium', points: 70 },
    { id: 'malware_detection', name: 'Malware Detection', description: 'Identify malicious software', difficulty: 'high', points: 90 },
    { id: 'siem_alert', name: 'SIEM Alert Investigation', description: 'Analyze security alerts', difficulty: 'medium', points: 75 },
    { id: 'ransomware_attack_chain', name: 'Ransomware Attack Chain', description: 'Analyze realistic ransomware attack timeline (MITRE ATT&CK)', difficulty: 'high', points: 500 }
  ],
  cloud: [
    { id: 'public_bucket', name: 'Public Storage Bucket', description: 'Exposed cloud storage', difficulty: 'low', points: 50 },
    { id: 'iam_policy', name: 'Misconfigured IAM Policy', description: 'Excessive permissions', difficulty: 'medium', points: 75 },
    { id: 'env_vars', name: 'Exposed Environment Variables', description: 'Leaked credentials', difficulty: 'low', points: 60 }
  ],
  forensics: [
    { id: 'memory_dump', name: 'Memory Dump Analysis', description: 'Analyze RAM dump', difficulty: 'high', points: 80 },
    { id: 'disk_image', name: 'Disk Image Investigation', description: 'Forensic disk analysis', difficulty: 'high', points: 85 },
    { id: 'hidden_files', name: 'Hidden Files Challenge', description: 'Find concealed data', difficulty: 'medium', points: 70 }
  ],
  social_engineering: [
    { id: 'phishing_email', name: 'Phishing Email Generator', description: 'Create realistic phishing simulations', difficulty: 'medium', points: 60 },
    { id: 'pretexting', name: 'Pretexting Scenarios', description: 'Build social engineering pretexts', difficulty: 'medium', points: 65 },
    { id: 'vishing', name: 'Vishing Scripts', description: 'Voice phishing call scripts', difficulty: 'high', points: 75 },
    { id: 'spear_phishing', name: 'Spear Phishing Campaign', description: 'Targeted phishing attacks', difficulty: 'high', points: 85 }
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
