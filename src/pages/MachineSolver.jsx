import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/MachineSolver.css';

// Solution data helpers
const getSolutionObjective = (moduleId) => {
  const objectives = {
    sql_injection: "Exploit SQL injection vulnerability to bypass authentication and extract database information.",
    xss: "Inject malicious JavaScript code that executes in the victim's browser to steal data or perform actions.",
    csrf: "Craft a malicious request that tricks authenticated users into performing unwanted actions.",
    file_upload: "Upload a malicious file that bypasses filters and gain code execution on the server.",
    auth_bypass: "Bypass authentication mechanisms through logic flaws or weak credential handling.",
    weak_ssh: "Brute force weak SSH credentials to gain unauthorized access to the system.",
    exposed_services: "Identify and exploit misconfigured network services running with excessive permissions.",
    privesc: "Escalate privileges from a low-privileged user to root/administrator level.",
    cron_jobs: "Exploit misconfigured cron jobs or scheduled tasks to execute malicious code.",
    log_analysis: "Analyze security logs to identify indicators of compromise and attack patterns.",
    malware_detection: "Identify and analyze malicious software samples to extract IOCs.",
    siem_alert: "Investigate SIEM alerts to determine if they represent genuine security incidents.",
    public_bucket: "Discover and access publicly exposed cloud storage buckets containing sensitive data.",
    iam_policy: "Exploit overly permissive IAM policies to escalate privileges in cloud environments.",
    env_vars: "Extract sensitive credentials from exposed environment variables.",
    memory_dump: "Analyze memory dumps to extract credentials, encryption keys, or other sensitive data.",
    disk_image: "Perform forensic analysis on disk images to recover deleted files and artifacts.",
    hidden_files: "Locate hidden or concealed files using forensic techniques."
  };
  return objectives[moduleId] || "Complete the challenge to capture the flag.";
};

const getSolutionSteps = (moduleId) => {
  const steps = {
    sql_injection: [
      "Identify input fields that interact with database queries",
      "Test for SQL injection using payloads like ' OR 1=1 --",
      "Bypass authentication or extract data using UNION SELECT statements",
      "Locate the flag in database tables or application responses"
    ],
    xss: [
      "Identify input fields that reflect user input without sanitization",
      "Test basic XSS payloads like <script>alert('XSS')</script>",
      "Try alternative payloads if basic ones are filtered: <img src=x onerror=alert(1)>",
      "Capture the flag from the response or hidden page elements"
    ],
    csrf: [
      "Analyze the application's request patterns for state-changing operations",
      "Check if requests lack CSRF tokens or use predictable tokens",
      "Craft a malicious HTML page that triggers the vulnerable request",
      "Submit the crafted request to capture the flag"
    ],
    file_upload: [
      "Test file upload functionality with various file types",
      "Attempt to upload executable files (.php, .jsp, .aspx)",
      "Bypass filters using double extensions or null bytes",
      "Access the uploaded file to execute code and retrieve the flag"
    ],
    auth_bypass: [
      "Enumerate authentication endpoints and parameters",
      "Test for logic flaws like SQL injection in login forms",
      "Try default credentials or weak password patterns",
      "Access restricted areas to find the flag"
    ],
    weak_ssh: [
      "Scan for SSH service on standard or non-standard ports",
      "Use tools like hydra to brute force common credentials",
      "Try default username/password combinations",
      "Access the system and locate the flag file"
    ],
    exposed_services: [
      "Perform network reconnaissance using nmap or similar tools",
      "Identify services running with default configurations",
      "Exploit known vulnerabilities or misconfigurations",
      "Gain access and retrieve the flag"
    ],
    privesc: [
      "Enumerate the system for privilege escalation vectors",
      "Check for SUID binaries, sudo misconfigurations, or kernel exploits",
      "Exploit identified vulnerabilities to gain root access",
      "Read the flag from protected directories"
    ],
    cron_jobs: [
      "List running cron jobs using crontab -l or /etc/crontab",
      "Identify jobs with writable scripts or insecure permissions",
      "Modify the cron job to execute malicious code",
      "Wait for execution or trigger manually to capture the flag"
    ],
    log_analysis: [
      "Review provided log files for suspicious patterns",
      "Identify failed login attempts, unusual network connections, or malware signatures",
      "Correlate events across multiple log sources",
      "Extract the flag from discovered attack indicators"
    ],
    malware_detection: [
      "Analyze suspicious files using static and dynamic analysis",
      "Check file hashes against malware databases",
      "Examine network connections and file modifications",
      "Extract the flag from malware artifacts or behavior"
    ],
    siem_alert: [
      "Review SIEM alert details and context",
      "Investigate related logs and events",
      "Determine if the alert is a true positive or false positive",
      "Document findings and extract the flag from investigation"
    ],
    public_bucket: [
      "Enumerate cloud storage buckets using common naming patterns",
      "Test bucket permissions for public read access",
      "List bucket contents and download files",
      "Find the flag in exposed files"
    ],
    iam_policy: [
      "Review IAM policies and role assignments",
      "Identify overly permissive policies or wildcards",
      "Assume roles with excessive permissions",
      "Access restricted resources to retrieve the flag"
    ],
    env_vars: [
      "Inspect application configuration files and environment",
      "Check for exposed .env files or debug endpoints",
      "Extract credentials from environment variables",
      "Use credentials to access protected resources and find the flag"
    ],
    memory_dump: [
      "Load memory dump in forensic tools like Volatility",
      "Extract process information and network connections",
      "Dump process memory to find passwords or keys",
      "Locate and extract the flag from memory artifacts"
    ],
    disk_image: [
      "Mount disk image using forensic tools",
      "Recover deleted files using file carving techniques",
      "Analyze file system metadata and timestamps",
      "Find the flag in recovered or hidden files"
    ],
    hidden_files: [
      "Use ls -la to show hidden files starting with .",
      "Check alternate data streams on NTFS systems",
      "Examine file system slack space",
      "Extract the flag from concealed locations"
    ]
  };
  return steps[moduleId] || ["Analyze the challenge", "Identify vulnerabilities", "Exploit the weakness", "Capture the flag"];
};

const getSolutionConcepts = (moduleId) => {
  const concepts = {
    sql_injection: ["SQL syntax and query structure", "Input validation bypass", "Database enumeration", "Union-based injection"],
    xss: ["HTML/JavaScript injection", "DOM manipulation", "Content-Security-Policy bypass", "Same-Origin Policy"],
    csrf: ["Session management", "Token validation", "HTTP request methods", "Cross-origin requests"],
    file_upload: ["File type validation", "Magic number verification", "Path traversal", "Code execution"],
    auth_bypass: ["Authentication logic flaws", "Session management", "Credential stuffing", "Broken access control"],
    weak_ssh: ["Brute force attacks", "Password complexity", "Authentication mechanisms", "Network enumeration"],
    exposed_services: ["Service fingerprinting", "Default configurations", "Port scanning", "Vulnerability assessment"],
    privesc: ["Linux/Windows privilege model", "SUID/SGID bits", "Sudo misconfigurations", "Kernel exploits"],
    cron_jobs: ["Scheduled task management", "File permissions", "Path hijacking", "Race conditions"],
    log_analysis: ["Log formats and parsing", "Attack pattern recognition", "Timeline analysis", "Indicator correlation"],
    malware_detection: ["Static/dynamic analysis", "Behavioral indicators", "File signatures", "Network IOCs"],
    siem_alert: ["Security event correlation", "Alert triage", "Incident response", "False positive analysis"],
    public_bucket: ["Cloud storage security", "Access control lists", "Bucket enumeration", "Data exposure"],
    iam_policy: ["Cloud IAM concepts", "Least privilege principle", "Role assumption", "Policy evaluation"],
    env_vars: ["Configuration management", "Secret storage", "Environment isolation", "Information disclosure"],
    memory_dump: ["Memory forensics", "Process analysis", "Credential extraction", "Volatility framework"],
    disk_image: ["File system forensics", "Data carving", "Deleted file recovery", "Timeline analysis"],
    hidden_files: ["File system structures", "Hidden attributes", "Steganography", "Alternate data streams"]
  };
  return concepts[moduleId] || ["Security fundamentals", "Attack methodology", "Defense mechanisms"];
};

const MachineSolver = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('browser');
  const [flagInputs, setFlagInputs] = useState({});  // Per-vulnerability flag inputs
  const [flagResults, setFlagResults] = useState({});  // Per-vulnerability results
  const [submittingFlags, setSubmittingFlags] = useState({});  // Per-vulnerability submission state
  const [uploadingReport, setUploadingReport] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [solvedVulns, setSolvedVulns] = useState([]);
  const [activeVulnerability, setActiveVulnerability] = useState(null);
  const [showSolutions, setShowSolutions] = useState(false);
  const [machineSolutions, setMachineSolutions] = useState(null);  // Machine-specific solutions
  const [allUserMachines, setAllUserMachines] = useState([]);  // All user machines for navigation

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchMachine();
    fetchUserStats();
    fetchMachineSolutions();
    fetchAllMachines();  // Fetch all machines for navigation
    
    const interval = setInterval(() => {
      if (machine?.status === 'building') {
        fetchMachine();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, isAuthenticated]);

  const fetchMachine = async () => {
    try {
      const response = await fetch(`/api/machines/${id}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setMachine(data.machine);
        // Set default tab based on machine type
        if (data.machine.domain === 'web' || data.machine.domain === 'cloud') {
          setActiveTab('browser');
        } else if (data.machine.domain === 'forensics' || data.machine.domain === 'blue_team') {
          setActiveTab('files');
        } else {
          setActiveTab('terminal');
        }
        // Set first vulnerability as active
        if (data.machine.vulnerabilities && data.machine.vulnerabilities.length > 0) {
          setActiveVulnerability(data.machine.vulnerabilities[0]);
        }
        setError('');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error loading machine');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/flags/stats', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setUserStats(data.stats);
        // Get solved vulns for this machine using vulnerabilityInstanceId
        const machineSolved = data.stats.solvedMachines?.includes(id);
        setSolvedVulns(data.stats.solvedVulnerabilities?.filter(v => v.machineId === id) || []);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  // Fetch machine-specific solutions
  const fetchMachineSolutions = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/flags/solutions/${id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setMachineSolutions(data.solutions);
      }
    } catch (err) {
      console.error('Error fetching solutions:', err);
    }
  };

  // Fetch all user machines for navigation
  const fetchAllMachines = async () => {
    try {
      const response = await fetch('/api/machines/my-machines', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        // Filter only running machines
        const runningMachines = data.machines.filter(m => m.status === 'running');
        setAllUserMachines(runningMachines);
      }
    } catch (err) {
      console.error('Error fetching all machines:', err);
    }
  };

  // Check if machine is fully solved and navigate to next
  const checkAndNavigateToNextMachine = () => {
    if (!machine || !allUserMachines.length) return;

    const totalVulns = machine.vulnerabilities?.length || 0;
    const solvedCount = solvedVulns.length;

    if (solvedCount === totalVulns && totalVulns > 0) {
      // Machine fully solved - find next unsolved machine
      const currentIndex = allUserMachines.findIndex(m => m._id === machine._id);
      
      if (currentIndex !== -1 && currentIndex < allUserMachines.length - 1) {
        // Navigate to next machine
        const nextMachine = allUserMachines[currentIndex + 1];
        setTimeout(() => {
          navigate(`/solve/${nextMachine._id}`);
        }, 2000); // 2 second delay to show completion message
      }
    }
  };

  // Handle flag submission for specific vulnerability instance
  const handleFlagSubmit = async (e, vulnerabilityInstanceId) => {
    e.preventDefault();
    const flagValue = flagInputs[vulnerabilityInstanceId];
    
    console.log('🚀 Submitting flag:');
    console.log('   Machine ID:', machine?._id);
    console.log('   Vulnerability Instance ID:', vulnerabilityInstanceId);
    console.log('   Flag:', flagValue?.trim());
    console.log('   Machine vulnerabilities:', machine?.vulnerabilities);
    
    if (!flagValue?.trim() || !machine) {
      console.log('❌ Missing flag value or machine data');
      return;
    }

    setSubmittingFlags(prev => ({ ...prev, [vulnerabilityInstanceId]: true }));
    setFlagResults(prev => ({ ...prev, [vulnerabilityInstanceId]: null }));

    try {
      const requestBody = {
        machineId: machine._id,
        vulnerabilityInstanceId: vulnerabilityInstanceId,
        flag: flagValue.trim()
      };
      console.log('📤 Request body:', requestBody);

      const response = await fetch('/api/flags/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('📥 Response status:', response.status);
      console.log('📥 Response data:', data);
      
      setFlagResults(prev => ({ ...prev, [vulnerabilityInstanceId]: data }));

      if (data.correct) {
        console.log('✅ Flag accepted! Points earned:', data.points);
        // Clear the input for this vulnerability
        setFlagInputs(prev => ({ ...prev, [vulnerabilityInstanceId]: '' }));
        fetchUserStats();
        fetchMachine();
        fetchMachineSolutions();
        
        // Check if all vulnerabilities are solved and navigate
        setTimeout(() => {
          checkAndNavigateToNextMachine();
        }, 100);
      } else {
        console.log('❌ Flag rejected:', data.message || data.error);
      }
    } catch (err) {
      console.error('❌ Error submitting flag:', err);
      setFlagResults(prev => ({ 
        ...prev, 
        [vulnerabilityInstanceId]: {
          correct: false,
          message: 'Error submitting flag'
        }
      }));
    } finally {
      setSubmittingFlags(prev => ({ ...prev, [vulnerabilityInstanceId]: false }));
    }
  };

  const handleReportUpload = async (e) => {
    e.preventDefault();
    if (!reportFile || !machine) return;

    const formData = new FormData();
    formData.append('report', reportFile);

    setUploadingReport(true);

    try {
      const response = await fetch(`/api/reports/${machine._id}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Lab report uploaded successfully!');
        setReportFile(null);
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (err) {
      alert('❌ Error uploading report');
      console.error(err);
    } finally {
      setUploadingReport(false);
    }
  };

  const renderLabHeader = () => {
    if (!machine) return null;

    // Debug logging
    console.log('Machine data:', {
      machineId: machine._id,
      vulnerabilities: machine.vulnerabilities,
      modules: machine.modules,
      vulnerabilitiesLength: machine.vulnerabilities?.length,
      modulesLength: machine.modules?.length
    });

    const totalVulns = machine.vulnerabilities?.length || machine.modules?.length || 0;
    const solvedCount = solvedVulns.length;
    const isFullySolved = solvedCount === totalVulns && totalVulns > 0;

    return (
      <div className="lab-header">
        <div className="lab-header-top">
          <div>
            <h1 className="lab-title">{machine.name}</h1>
            <span className={`domain-badge domain-${machine.domain}`}>
              {machine.domain.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="lab-points-header">
            <span className="label">Machine Points</span>
            <span className="value">{machine.totalPoints || 0}</span>
          </div>
        </div>
        
        <div className="lab-header-info">
          <div className="vuln-progress">
            <span className="progress-label">Vulnerabilities</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${totalVulns > 0 ? (solvedCount / totalVulns) * 100 : 0}%` }}
              />
            </div>
            <span className="progress-text">{solvedCount}/{totalVulns} Captured</span>
          </div>
          
          {machine.vulnerabilities && machine.vulnerabilities.length > 0 && (
            <div className="vuln-list">
              <span className="vuln-list-label">Included Vulnerabilities:</span>
              <div className="vuln-chips">
                {machine.vulnerabilities.map((vuln, idx) => {
                  const isSolved = solvedVulns.some(v => v.vulnerabilityInstanceId === vuln.vulnerabilityInstanceId);
                  return (
                    <div key={idx} className={`vuln-chip ${isSolved ? 'solved' : ''}`}>
                      {isSolved && '✓ '}
                      {vuln.moduleId.replace(/_/g, ' ')} ({vuln.points}pts)
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {isFullySolved && (
          <div className="lab-complete-banner">
            🎉 Lab Completed! All vulnerabilities captured. You can now upload your lab report.
          </div>
        )}

        {/* Vulnerability Selector - only show if multiple vulnerabilities */}
        {machine.vulnerabilities && machine.vulnerabilities.length > 1 && (
          <div className="vulnerability-selector">
            <h4 className="selector-title">Select Vulnerability to Solve:</h4>
            <div className="vulnerability-tabs">
              {machine.vulnerabilities.map((vuln, idx) => {
                const isSolved = solvedVulns.some(v => v.vulnerabilityInstanceId === vuln.vulnerabilityInstanceId);
                const isActive = activeVulnerability?.vulnerabilityInstanceId === vuln.vulnerabilityInstanceId;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveVulnerability(vuln)}
                    className={`vulnerability-tab ${isActive ? 'active' : ''} ${isSolved ? 'solved' : ''}`}
                  >
                    {isSolved && <span className="check-icon">✓</span>}
                    <span className="vuln-name">{vuln.moduleId.replace(/_/g, ' ')}</span>
                    <span className="vuln-points">{vuln.points}pts</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTabBar = () => {
    const tabs = [];
    
    if (machine.domain === 'web' || machine.domain === 'cloud') {
      tabs.push({ id: 'browser', label: '🌐 Browser', icon: '🌐' });
    }
    
    if (machine.domain === 'red_team' || machine.domain === 'cloud' || machine.domain === 'forensics' || machine.terminalEnabled) {
      tabs.push({ id: 'terminal', label: '💻 Terminal', icon: '💻' });
    }
    
    if (machine.domain === 'blue_team' || machine.domain === 'forensics') {
      tabs.push({ id: 'files', label: '📁 Files', icon: '📁' });
    }
    
    tabs.push({ id: 'flags', label: '🚩 Flags', icon: '🚩' });

    return (
      <div className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderBrowserTab = () => {
    return (
      <div className="tab-content">
        <div className="tab-header">
          <h3>🌐 Browser Interface</h3>
          <a 
            href={machine.access?.url || machine.accessUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-open-new"
          >
            Open in New Tab →
          </a>
        </div>
        <div className="iframe-container">
          <iframe
            src={machine.access?.url || machine.accessUrl}
            title={machine.name}
            className="lab-iframe"
          />
        </div>
      </div>
    );
  };

  const renderTerminalTab = () => {
    const sshCommand = machine.access?.terminal || `ssh user@localhost -p ${machine.port || '8022'}`;
    
    return (
      <div className="tab-content">
        <div className="tab-header">
          <h3>💻 Terminal Access</h3>
        </div>
        
        <div className="terminal-instructions">
          <h4>🔐 SSH Connection Command:</h4>
          <div className="code-block">
            <code>{sshCommand}</code>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(sshCommand);
                alert('Command copied to clipboard!');
              }}
              className="copy-btn"
            >
              📋 Copy
            </button>
          </div>
          
          <div className="credentials-info">
            <p><strong>Default Credentials:</strong></p>
            <ul>
              <li>Username: <code>ctfuser</code></li>
              <li>Password: <code>password123</code></li>
            </ul>
          </div>

          <div className="objectives-list">
            <h4>📋 Objectives:</h4>
            <ul>
              <li>Connect to the SSH server using provided credentials</li>
              <li>Explore the system and identify vulnerabilities</li>
              <li>Find and capture all flags</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderFilesTab = () => {
    return (
      <div className="tab-content">
        <div className="tab-header">
          <h3>📁 File Analysis</h3>
          <a 
            href={machine.access?.url || machine.accessUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-open-new"
          >
            Open in New Tab →
          </a>
        </div>
        
        <p className="hint">💡 Download and analyze files locally to find hidden vulnerabilities</p>
        
        <div className="iframe-container">
          <iframe
            src={machine.access?.url || machine.accessUrl}
            title={machine.name}
            className="lab-iframe"
          />
        </div>
      </div>
    );
  };

  const renderFlagsTab = () => {
    const totalVulns = machine.vulnerabilities?.length || 0;
    const solvedCount = solvedVulns.length;
    const allSolved = solvedCount === totalVulns && totalVulns > 0;

    // Get current machine index for display
    const currentMachineIndex = allUserMachines.findIndex(m => m._id === machine._id);
    const machineNumber = currentMachineIndex !== -1 ? currentMachineIndex + 1 : 1;
    const totalMachines = allUserMachines.length;

    return (
      <div className="tab-content flags-tab">
        <div className="tab-header">
          <h3>🚩 Flag Submission</h3>
          <div className="flags-count-group">
            <span className="flags-count">{solvedCount}/{totalVulns} Captured</span>
            {totalMachines > 1 && (
              <span className="machine-counter">Machine {machineNumber} of {totalMachines}</span>
            )}
          </div>
        </div>

        {allSolved && (
          <div className="all-flags-captured-banner">
            🎉 All flags captured for this machine!
            {currentMachineIndex < totalMachines - 1 && (
              <span className="next-machine-hint">Loading next machine...</span>
            )}
          </div>
        )}

        {/* Render ONE flag input per vulnerability instance */}
        <div className="flag-submissions-list">
          {machine.vulnerabilities && machine.vulnerabilities.map((vuln, idx) => {
            const isSolved = solvedVulns.some(
              v => v.vulnerabilityInstanceId === vuln.vulnerabilityInstanceId
            );
            const flagValue = flagInputs[vuln.vulnerabilityInstanceId] || '';
            const isSubmitting = submittingFlags[vuln.vulnerabilityInstanceId];
            const result = flagResults[vuln.vulnerabilityInstanceId];

            return (
              <div 
                key={vuln.vulnerabilityInstanceId} 
                className={`flag-submission-item ${isSolved ? 'solved' : ''}`}
              >
                <div className="flag-item-header">
                  <div className="flag-item-title">
                    <span className="vuln-number">#{idx + 1}</span>
                    <span className="vuln-name">{vuln.moduleId.replace(/_/g, ' ')}</span>
                    <span className="vuln-points">{vuln.points} pts</span>
                  </div>
                  {isSolved && (
                    <span className="solved-badge-inline">✓ SOLVED</span>
                  )}
                </div>

                {!isSolved ? (
                  <form onSubmit={(e) => handleFlagSubmit(e, vuln.vulnerabilityInstanceId)}>
                    <div className="flag-input-group">
                      <input
                        type="text"
                        value={flagValue}
                        onChange={(e) => setFlagInputs(prev => ({
                          ...prev,
                          [vuln.vulnerabilityInstanceId]: e.target.value
                        }))}
                        placeholder={`FLAG{...} for ${vuln.moduleId.replace(/_/g, ' ')}`}
                        className="flag-input"
                        disabled={isSubmitting}
                      />
                      <button 
                        type="submit" 
                        className="btn-submit-flag"
                        disabled={isSubmitting || !flagValue.trim()}
                      >
                        {isSubmitting ? '⏳ Checking...' : '✓ Submit'}
                      </button>
                    </div>
                    
                    {result && (
                      <div className={`flag-result ${result.correct ? 'correct' : 'incorrect'}`}>
                        {result.correct ? (
                          <>
                            <p className="result-message">✅ {result.message}</p>
                            <p className="points-earned">+{result.points} points!</p>
                          </>
                        ) : (
                          <p className="result-message">❌ {result.message}</p>
                        )}
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="flag-solved-display">
                    <div className="solved-checkmark">✓</div>
                    <div className="solved-details">
                      <p className="solved-message">Flag captured successfully!</p>
                      <p className="solved-points">+{vuln.points} points earned</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {solvedVulns.length > 0 && (
          <div className="solved-flags-summary">
            <h4>Completion Progress:</h4>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${(solvedCount / totalVulns) * 100}%` }}
              />
            </div>
            <p className="progress-text">
              {solvedCount} of {totalVulns} vulnerabilities exploited
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderReportUpload = () => {
    const totalVulns = machine.vulnerabilities?.length || machine.modules?.length || 0;
    const solvedCount = solvedVulns.length;
    const isFullySolved = solvedCount === totalVulns && totalVulns > 0;

    if (!isFullySolved) {
      return (
        <div className="report-upload-locked">
          <div className="lock-icon">🔒</div>
          <p>Lab report upload will be unlocked after capturing all {totalVulns} flags</p>
          <p className="lock-progress">{solvedCount}/{totalVulns} flags captured</p>
        </div>
      );
    }

    return (
      <div className="report-upload">
        <h3>📄 Upload Lab Report</h3>
        <p className="hint">Upload your detailed lab report (PDF, Markdown, or Text file)</p>
        <form onSubmit={handleReportUpload}>
          <input
            type="file"
            accept=".pdf,.md,.txt"
            onChange={(e) => setReportFile(e.target.files[0])}
            className="file-input"
            disabled={uploadingReport}
          />
          <button 
            type="submit" 
            className="btn-upload-report"
            disabled={uploadingReport || !reportFile}
          >
            {uploadingReport ? '⏳ Uploading...' : '📤 Upload Report'}
          </button>
        </form>
        {reportFile && (
          <p className="file-info">Selected: {reportFile.name} ({(reportFile.size / 1024).toFixed(2)} KB)</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading machine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/my-machines')} className="btn-back">
          ← Back to My Machines
        </button>
      </div>
    );
  }

  if (!machine || machine.status === 'building') {
    return (
      <div className="building-status">
        <div className="spinner"></div>
        <h2>Machine is being prepared...</h2>
        <p>Your machine is starting up. This usually takes a few moments.</p>
      </div>
    );
  }

  return (
    <div className="machine-solver">
      {renderLabHeader()}

      {/* Solutions View - show when toggled (either after solving or when seeking help) */}
      {showSolutions && (
        <div className="solutions-section">
          <h2 className="solutions-title">📚 Solutions & Walkthrough</h2>
          <p className="solutions-subtitle">Machine-specific step-by-step guides with actual flags</p>
          {machine.vulnerabilities && machine.vulnerabilities.map((vuln, idx) => {
            // Find if this specific instance is solved using vulnerabilityInstanceId
            const isSolved = solvedVulns.some(v => v.vulnerabilityInstanceId === vuln.vulnerabilityInstanceId);
            
            // Get machine-specific solution from backend (array-based response)
            const solution = machineSolutions?.find(s => s.vulnerabilityInstanceId === vuln.vulnerabilityInstanceId) || {};
            
            // Fallback to generic solution if machine-specific not available
            const objective = solution.explanation || getSolutionObjective(vuln.moduleId);
            const steps = solution.steps || getSolutionSteps(vuln.moduleId);
            const concepts = solution.hints || getSolutionConcepts(vuln.moduleId);
            const actualFlag = solution.flag;  // Real flag from THIS instance

            return (
              <div key={vuln.vulnerabilityInstanceId} className={`solution-card ${isSolved ? 'solved' : 'unsolved'}`}>
                <div className="solution-header">
                  <h3>{isSolved ? '✓' : '🔓'} {vuln.moduleId.replace(/_/g, ' ')}</h3>
                  <span className="solution-points">{vuln.points} points</span>
                  {isSolved && <span className="solved-badge">COMPLETED</span>}
                </div>
                <div className="solution-content">
                  <div className="solution-section">
                    <h4>🎯 Objective</h4>
                    <p>{objective}</p>
                  </div>
                  <div className="solution-section">
                    <h4>🔍 Steps to Solve</h4>
                    <ol>
                      {steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  {solution.payload && (
                    <div className="solution-section">
                      <h4>💻 Payload Example</h4>
                      <code className="flag-display">{solution.payload}</code>
                    </div>
                  )}
                  <div className="solution-section">
                    <h4>💡 Key Concepts & Hints</h4>
                    <ul>
                      {concepts.map((concept, i) => (
                        <li key={i}>{concept}</li>
                      ))}
                    </ul>
                  </div>
                  {isSolved && actualFlag && (
                    <div className="solution-section">
                      <h4>🚩 Flag (Captured)</h4>
                      <code className="flag-display">{actualFlag}</code>
                    </div>
                  )}
                  {!isSolved && (
                    <div className="solution-section hint-section">
                      <h4>💡 Hint</h4>
                      <p>Use the steps above to find and capture the flag. The actual flag for THIS vulnerability instance will be revealed here once you solve it.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Help Section - View Solutions Button (Always Available) */}
      <div className="help-section">
        <button 
          onClick={() => {
            setShowSolutions(!showSolutions);
            if (!showSolutions && !machineSolutions) {
              fetchMachineSolutions();  // Fetch when first opened
            }
          }}
          className="btn-view-solutions"
          title="Get help with solving this lab"
        >
          {showSolutions ? '🔼 Hide Walkthrough' : '💡 Need Help? View Solution Walkthrough'}
        </button>
        <p className="help-text">
          {showSolutions 
            ? 'Machine-specific solutions displayed above. These are the ACTUAL steps and flags for THIS lab!'
            : 'Stuck? Click above to view detailed solutions, payloads, and hints specific to THIS machine.'}
        </p>
      </div>
      
      <div className="lab-workspace">
        {renderTabBar()}
        
        <div className="tab-content-area">
          {activeTab === 'browser' && renderBrowserTab()}
          {activeTab === 'terminal' && renderTerminalTab()}
          {activeTab === 'files' && renderFilesTab()}
          {activeTab === 'flags' && renderFlagsTab()}
        </div>
      </div>

      {renderReportUpload()}

      <div className="lab-footer">
        <button onClick={() => navigate('/my-machines')} className="btn-back">
          ← Back to My Machines
        </button>
      </div>
    </div>
  );
};

export default MachineSolver;
