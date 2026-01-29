import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal as TerminalIcon,
  Globe,
  FileSearch,
  Flag,
  ShieldAlert,
  ChevronRight,
  Copy,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  Lightbulb,
  X,
  Cpu,
  Zap,
  Box,
  Radar,
  ChevronLeft,
  Activity,
  Layers,
  Power,
  TrendingUp,
  MailCheck,
  Info,
  User,
  Users,
  CalendarCheck,
  ArrowRightCircle
} from 'lucide-react';

// FULL LOGIC HELPERS (Restored to ensure the app actually runs)
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
    sql_injection: ["Identify input fields that interact with database queries", "Test for SQL injection using payloads like ' OR 1=1 --", "Bypass authentication or extract data using UNION SELECT statements", "Locate the flag in database tables or application responses"],
    xss: ["Identify input fields that reflect user input without sanitization", "Test basic XSS payloads like <script>alert('XSS')</script>", "Try alternative payloads if basic ones are filtered: <img src=x onerror=alert(1)>", "Capture the flag from the response or hidden page elements"],
    csrf: ["Analyze the application's request patterns for state-changing operations", "Check if requests lack CSRF tokens or use predictable tokens", "Craft a malicious HTML page that triggers the vulnerable request", "Submit the crafted request to capture the flag"],
    file_upload: ["Test file upload functionality with various file types", "Attempt to upload executable files (.php, .jsp, .aspx)", "Bypass filters using double extensions or null bytes", "Access the uploaded file to execute code and retrieve the flag"],
    auth_bypass: ["Enumerate authentication endpoints and parameters", "Test for logic flaws like SQL injection in login forms", "Try default credentials or weak password patterns", "Access restricted areas to find the flag"],
    weak_ssh: ["Scan for SSH service on standard or non-standard ports", "Use tools like hydra to brute force common credentials", "Try default username/password combinations", "Access the system and locate the flag file"],
    exposed_services: ["Perform network reconnaissance using nmap or similar tools", "Identify services running with default configurations", "Exploit known vulnerabilities or misconfigurations", "Gain access and retrieve the flag"],
    privesc: ["Enumerate the system for privilege escalation vectors", "Check for SUID binaries, sudo misconfigurations, or kernel exploits", "Exploit identified vulnerabilities to gain root access", "Read the flag from protected directories"],
    cron_jobs: ["List running cron jobs using crontab -l or /etc/crontab", "Identify jobs with writable scripts or insecure permissions", "Modify the cron job to execute malicious code", "Wait for execution or trigger manually to capture the flag"],
    log_analysis: ["Review provided log files for suspicious patterns", "Identify failed login attempts, unusual network connections, or malware signatures", "Correlate events across multiple log sources", "Extract the flag from discovered attack indicators"],
    malware_detection: ["Analyze suspicious files using static and dynamic analysis", "Check file hashes against malware databases", "Examine network connections and file modifications", "Extract the flag from malware artifacts or behavior"],
    siem_alert: ["Review SIEM alert details and context", "Investigate related logs and events", "Determine if the alert is a true positive or false positive", "Document findings and extract the flag from investigation"],
    public_bucket: ["Enumerate cloud storage buckets using common naming patterns", "Test bucket permissions for public read access", "List bucket contents and download files", "Find the flag in exposed files"],
    iam_policy: ["Review IAM policies and role assignments", "Identify overly permissive policies or wildcards", "Assume roles with excessive permissions", "Access restricted resources to retrieve the flag"],
    env_vars: ["Inspect application configuration files and environment", "Check for exposed .env files or debug endpoints", "Extract credentials from environment variables", "Use credentials to access protected resources and find the flag"],
    memory_dump: ["Load memory dump in forensic tools like Volatility", "Extract process information and network connections", "Dump process memory to find passwords or keys", "Locate and extract the flag from memory artifacts"],
    disk_image: ["Mount disk image using forensic tools", "Recover deleted files using file carving techniques", "Analyze file system metadata and timestamps", "Find the flag in recovered or hidden files"],
    hidden_files: ["Use ls -la to show hidden files starting with .", "Check alternate data streams on NTFS systems", "Examine file system slack space", "Extract the flag from concealed locations"]
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
  // Default to INTERFACE for web, cloud, social_engineering; else fallback to flags
  const [activeTab, setActiveTab] = useState(() => {
    return ['web', 'cloud', 'social_engineering'].includes(machine?.domain) ? 'browser' : 'flags';
  });
  const [flagInputs, setFlagInputs] = useState({});
  const [flagResults, setFlagResults] = useState({});
  const [submittingFlags, setSubmittingFlags] = useState({});
  const [uploadingReport, setUploadingReport] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [solvedVulns, setSolvedVulns] = useState([]);
  const [activeVulnerability, setActiveVulnerability] = useState(null);
  const [showSolutions, setShowSolutions] = useState(false);
  const [machineSolutions, setMachineSolutions] = useState(null);
  const [allUserMachines, setAllUserMachines] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchMachine();
    fetchUserStats();
    fetchMachineSolutions();
    fetchAllMachines();
    const interval = setInterval(() => { if (machine?.status === 'building') fetchMachine(); }, 3000);
    return () => clearInterval(interval);
  }, [id, isAuthenticated]);

  const fetchMachine = async () => {
    try {
      const response = await fetch(`/api/machines/${id}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setMachine(data.machine);
        if (data.machine.vulnerabilities && !activeVulnerability) setActiveVulnerability(data.machine.vulnerabilities[0]);
        setError('');
      } else setError(data.message);
    } catch (err) { setError('Error loading machine'); } finally { setLoading(false); }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/flags/stats', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setUserStats(data.stats);
        setSolvedVulns(data.stats.solvedVulnerabilities?.filter(v => v.machineId === id) || []);
      }
    } catch (err) { console.error(err); }
  };

  const fetchMachineSolutions = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/flags/solutions/${id}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) setMachineSolutions(data.solutions);
    } catch (err) { console.error(err); }
  };

  const fetchAllMachines = async () => {
    try {
      const response = await fetch('/api/machines/my-machines', { credentials: 'include' });
      const data = await response.json();
      if (data.success) setAllUserMachines(data.machines.filter(m => m.status === 'running'));
    } catch (err) { console.error(err); }
  };

  const checkAndNavigateToNextMachine = () => {
    if (!machine || !allUserMachines.length) return;
    const totalVulns = machine.vulnerabilities?.length || 0;
    if (solvedVulns.length === totalVulns && totalVulns > 0) {
      const currentIndex = allUserMachines.findIndex(m => m._id === machine._id);
      if (currentIndex !== -1 && currentIndex < allUserMachines.length - 1) {
        const nextMachine = allUserMachines[currentIndex + 1];
        setTimeout(() => { navigate(`/solve/${nextMachine._id}`); }, 2000);
      }
    }
  };

  const handleFlagSubmit = async (e, vulnerabilityInstanceId) => {
    e.preventDefault();
    const flagValue = flagInputs[vulnerabilityInstanceId];
    if (!flagValue?.trim() || !machine) return;
    setSubmittingFlags(prev => ({ ...prev, [vulnerabilityInstanceId]: true }));
    setFlagResults(prev => ({ ...prev, [vulnerabilityInstanceId]: null }));
    try {
      const requestBody = { machineId: machine._id, vulnerabilityInstanceId, flag: flagValue.trim() };
      const response = await fetch('/api/flags/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(requestBody) });
      const data = await response.json();
      setFlagResults(prev => ({ ...prev, [vulnerabilityInstanceId]: data }));
      if (data.correct) {
        setFlagInputs(prev => ({ ...prev, [vulnerabilityInstanceId]: '' }));
        // SYNC ALL DATA IMMEDIATELY
        await Promise.all([fetchUserStats(), fetchMachine(), fetchMachineSolutions()]);
        setTimeout(() => checkAndNavigateToNextMachine(), 100);
      }
    } catch (err) {
      setFlagResults(prev => ({ ...prev, [vulnerabilityInstanceId]: { correct: false, message: 'Error submitting flag' } }));
    } finally { setSubmittingFlags(prev => ({ ...prev, [vulnerabilityInstanceId]: false })); }
  };

  const handleReportUpload = async (e) => {
    e.preventDefault();
    if (!reportFile || !machine) return;
    const formData = new FormData();
    formData.append('report', reportFile);
    setUploadingReport(true);
    try {
      const response = await fetch(`/api/reports/${machine._id}/upload`, { method: 'POST', credentials: 'include', body: formData });
      const data = await response.json();
      if (data.success) { alert('✅ Lab report uploaded successfully!'); setReportFile(null); }
      else alert(`❌ ${data.message}`);
    } catch (err) { alert('❌ Error uploading report'); } finally { setUploadingReport(false); }
  };

  const renderLabHeader = () => {
    if (!machine) return null;
    const totalVulns = machine.vulnerabilities?.length || machine.modules?.length || 0;
    const solvedCount = solvedVulns.length;
    const currentPoints = solvedVulns.reduce((acc, curr) => acc + curr.points, 0);

    return (
      <div className="space-y-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-emerald-500/20 rounded blur group-hover:opacity-100 transition duration-500"></div>
          <div className="relative bg-black border-2 border-emerald-500/30 p-6 rounded-sm shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] text-emerald-500 font-black tracking-[0.4em] uppercase glow-text italic">Active_Node_Linked</span>
              <span className="text-[9px] font-mono text-emerald-900">ID: {machine._id.slice(-6).toUpperCase()}</span>
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4 glow-text underline decoration-emerald-900 decoration-4 underline-offset-8">
              {machine.name}
            </h1>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 bg-emerald-900/20 border border-emerald-500/40 text-[9px] font-black text-emerald-400 uppercase tracking-widest">Sctr: {machine.domain}</span>
              <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-[9px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                <TrendingUp size={10} /> XP: {currentPoints} / {machine.totalPoints}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#050505] p-5 border border-white/5 rounded-sm relative group overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          <div className="flex justify-between items-end mb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-emerald-900 tracking-widest uppercase block italic">Neural_Breach_Status</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white italic tracking-tighter glow-text">{Math.round((solvedCount / totalVulns) * 100)}%</span>
                <span className="text-[10px] font-mono text-emerald-800 uppercase animate-pulse">Infiltrating...</span>
              </div>
            </div>
            <div className="text-right flex flex-col">
              <span className="text-xs font-mono font-bold text-emerald-400 drop-shadow-[0_0_5px_#10b981]">{solvedCount} / {totalVulns}</span>
              <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">Captured</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
            <motion.div initial={{ width: 0 }} animate={{ width: `${totalVulns > 0 ? (solvedCount / totalVulns) * 100 : 0}%` }} className="h-full bg-emerald-500 shadow-[0_0_20px_#10b981]" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <Radar size={14} className="text-emerald-500 animate-spin-slow" />
            <span className="text-[11px] font-black text-emerald-500 tracking-[0.4em] uppercase glow-text">Selectable_Vectors</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {machine.vulnerabilities?.map((vuln, idx) => {
              const isSolved = solvedVulns.some(v => v.vulnerabilityInstanceId === vuln.vulnerabilityInstanceId);
              const isActive = activeVulnerability?.vulnerabilityInstanceId === vuln.vulnerabilityInstanceId;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveVulnerability(vuln)}
                  className={`w-full group relative flex items-center justify-between p-4 border transition-all duration-500
                    ${isActive ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-white/5 bg-[#0a0a0a] hover:border-emerald-500/40'}
                    ${isSolved ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`${isActive ? 'text-emerald-400 drop-shadow-[0_0_10px_#10b981]' : (isSolved ? 'text-emerald-800' : 'text-zinc-800')}`}>
                      {isSolved ? <Unlock size={18} /> : <Lock size={18} />}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className={`text-[8px] font-black tracking-[0.2em] ${isActive ? 'text-emerald-400' : 'text-zinc-700'}`}>VECTOR_0{idx + 1}</span>
                      <span className={`text-[12px] font-bold uppercase tracking-tighter ${isActive ? 'text-white' : 'text-zinc-500'}`}>{vuln.moduleId.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <div className={`font-mono text-[10px] font-black transition-colors relative z-10 ${isActive ? 'text-emerald-400' : 'text-emerald-900'}`}>
                    {vuln.points} XP
                  </div>
                  {isActive && <motion.div layoutId="active-marker" className="absolute left-0 top-0 w-[3px] h-full bg-emerald-400 shadow-[5px_0_15px_#10b981]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderTabBar = () => {
    const tabs = [];
    // Add INTERFACE tab for web, cloud, and social_engineering domains
    if (['web', 'cloud', 'social_engineering'].includes(machine.domain)) {
      tabs.push({ id: 'browser', label: 'INTERFACE', icon: <Globe size={20} /> });
    }
    if (machine.domain === 'red_team' || machine.domain === 'cloud' || machine.domain === 'forensics' || machine.terminalEnabled) tabs.push({ id: 'terminal', label: 'SHELL', icon: <TerminalIcon size={20} /> });
    if (machine.domain === 'blue_team' || machine.domain === 'forensics') tabs.push({ id: 'files', label: 'BINARY', icon: <FileSearch size={20} /> });
    tabs.push({ id: 'flags', label: 'INFILTRATE', icon: <Flag size={20} /> });

    return (
      <nav className="flex bg-[#050505] border border-white/10 p-1 gap-1 rounded-t-sm">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-3 py-4 text-[11px] font-black tracking-[0.25em] transition-all duration-300 relative group
              ${activeTab === tab.id ? 'text-emerald-400 bg-emerald-500/10 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'}`}
          >
            {tab.icon} {tab.label}
            {activeTab === tab.id && <motion.div layoutId="tab-glow" className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 shadow-[0_0_15px_#10b981]" />}
          </button>
        ))}
      </nav>
    );
  };

  const renderBrowserTab = () => (
    <div className="bg-[#020202] border-x border-b border-white/10 flex flex-col h-[750px] shadow-2xl overflow-hidden">
      <div className="flex justify-between items-center px-8 py-4 border-b border-white/5 bg-[#080808]">
        <div className="flex items-center gap-3 text-emerald-500/80">
          <MailCheck size={18} className="text-emerald-400" />
          <span className="text-[11px] font-black tracking-[0.4em] uppercase glow-text italic">Phishing Email</span>
        </div>
        <a href={machine.access?.url || machine.accessUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-emerald-500/20 rounded text-[10px] font-black text-emerald-600 hover:text-emerald-400 transition-all uppercase italic flex items-center gap-1">
          Open in New Tab <ArrowRightCircle size={14} className="inline ml-1" />
        </a>
      </div>
      <div className="flex-1 bg-black relative">
        <iframe src={machine.access?.url || machine.accessUrl} title={machine.name} className="w-full h-full border-none opacity-80" />
      </div>
    </div>
  );

  const renderTerminalTab = () => {
    const sshCommand = machine.access?.terminal || `ssh user@localhost -p ${machine.port || '8022'}`;
    return (
      <div className="bg-[#020202] border-x border-b border-white/10 p-16 h-[750px] flex flex-col justify-center">
        <div className="max-w-3xl mx-auto w-full space-y-10">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-emerald-900 tracking-[0.5em] uppercase block pl-2 italic">Access_Protocol</label>
            <div className="bg-black border-2 border-emerald-900/30 p-8 rounded flex justify-between items-center group shadow-[inset_0_0_40px_rgba(0,0,0,1)]">
              <code className="text-2xl font-black text-emerald-400 tracking-tighter glow-text">{sshCommand}</code>
              <button onClick={() => { navigator.clipboard.writeText(sshCommand); alert('COPIED!'); }} className="p-4 bg-emerald-500/5 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_30px_#10b981] transition-all rounded-sm">
                <Copy size={22} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-3 bg-[#080808] p-6 border border-white/5 rounded-sm">
              <label className="text-[10px] font-black text-zinc-700 tracking-[0.3em] uppercase block italic">Token</label>
              <code className="text-white text-xl font-bold glow-text">ctfuser</code>
            </div>
            <div className="space-y-3 bg-[#080808] p-6 border border-white/5 rounded-sm">
              <label className="text-[10px] font-black text-zinc-700 tracking-[0.3em] uppercase block italic">Secret</label>
              <code className="text-white text-xl font-bold glow-text">password123</code>
            </div>
          </div>
          <div className="p-8 bg-red-950/10 border-2 border-red-500/20 rounded-sm">
            <h4 className="flex items-center gap-3 text-red-500 text-[11px] font-black uppercase mb-6 tracking-[0.4em] glow-text italic underline">MISSION_GUIDELINES</h4>
            <ul className="text-xs text-red-100/30 space-y-4 font-bold italic">
              <li>[!] SECURE RSA-4096 BIT TUNNEL ENCRYPTION</li>
              <li>[!] DATA BLOCKS LOCATED WITHIN /ROOT/FS</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderFilesTab = () => (
    <div className="bg-[#020202] border-x border-b border-white/10 rounded-sm overflow-hidden flex flex-col h-[750px]">
      <div className="px-10 py-8 border-b border-white/5 bg-[#080808] flex items-center gap-6">
        <div className="p-4 bg-emerald-500 text-black rounded shadow-[0_0_30px_#10b981] animate-pulse"><FileSearch size={24} /></div>
        <div>
          <h3 className="text-sm font-black text-white tracking-[0.4em] uppercase italic">ENCRYPTED_VOLUMES_SCAN</h3>
          <p className="text-[10px] text-emerald-800 font-bold tracking-widest mt-1 uppercase">Decoding file metadata...</p>
        </div>
      </div>
      <div className="flex-1 bg-black">
        <iframe src={machine.access?.url || machine.accessUrl} title={machine.name} className="w-full h-full border-none opacity-40 grayscale" />
      </div>
    </div>
  );

  const renderFlagsTab = () => (
    <div className="space-y-8 h-[750px] overflow-y-auto custom-scrollbar pr-6">
      {machine.vulnerabilities?.map((vuln, idx) => {
        const isSolved = solvedVulns.some(v => v.vulnerabilityInstanceId === vuln.vulnerabilityInstanceId);
        const flagValue = flagInputs[vuln.vulnerabilityInstanceId] || '';
        const isSubmitting = submittingFlags[vuln.vulnerabilityInstanceId];
        const result = flagResults[vuln.vulnerabilityInstanceId];
        return (
          <div key={vuln.vulnerabilityInstanceId} className={`p-10 border shadow-2xl transition-all duration-700 relative overflow-hidden group
              ${isSolved ? 'border-emerald-500/20 bg-emerald-950/5 opacity-50' : 'border-white/10 bg-[#080808]'}`}>
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-10">
                <span className="text-6xl font-black text-emerald-950/20 italic font-mono">0{idx + 1}</span>
                <div className="space-y-2">
                  <span className="text-[11px] font-black tracking-[0.5em] text-emerald-900 uppercase block pl-1 italic">SUB_PROCESS</span>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter glow-text underline decoration-emerald-900 decoration-4 underline-offset-8">{vuln.moduleId.replace(/_/g, ' ')}</h3>
                </div>
              </div>
              <div className="text-right bg-emerald-500/5 p-4 border border-emerald-500/10 rounded-sm">
                <span className="text-[10px] font-black text-emerald-500/60 tracking-[0.4em] uppercase block mb-1">XP_ALLOCATION</span>
                <span className="text-2xl font-black font-mono text-white glow-text">{vuln.points}</span>
              </div>
            </div>
            {!isSolved ? (
              <form onSubmit={(e) => handleFlagSubmit(e, vuln.vulnerabilityInstanceId)} className="space-y-6 relative z-10">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={flagValue}
                    onChange={(e) => setFlagInputs(prev => ({ ...prev, [vuln.vulnerabilityInstanceId]: e.target.value }))}
                    placeholder="FLAG{ACCESS_KEY}"
                    className="flex-1 bg-black border-2 border-emerald-900/30 p-5 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-950 shadow-[inset_0_0_30px_rgba(0,0,0,1)] uppercase tracking-[0.2em]"
                    disabled={isSubmitting}
                  />
                  <button type="submit" className="px-12 bg-emerald-600 text-black font-black uppercase text-xs tracking-[0.25em] hover:bg-white hover:shadow-[0_0_30px_#fff] transition-all disabled:opacity-20 rounded-sm" disabled={isSubmitting || !flagValue.trim()}>
                    {isSubmitting ? 'VERIFYING...' : 'EXTRACT'}
                  </button>
                </div>
                {result && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 text-[11px] font-black uppercase tracking-[0.3em] border flex items-center gap-3 ${result.correct ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
                    {result.correct ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    &gt; {result.correct ? `CREDITS_ESTABLISHED: +${result.points} XP` : `ERROR: ${result.message}`}
                  </motion.div>
                )}
              </form>
            ) : (
              <div className="flex items-center gap-4 text-emerald-500 font-black text-sm uppercase tracking-[0.4em] bg-emerald-500/10 p-6 rounded border border-emerald-500/30">
                <Unlock size={20} className="animate-pulse" /> DATA_NODE_EXTRACTED
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderReportUpload = () => {
    const totalVulns = machine.vulnerabilities?.length || machine.modules?.length || 0;
    const isFullySolved = solvedVulns.length === totalVulns && totalVulns > 0;
    return (
      <footer className={`mt-10 p-10 border rounded-sm relative overflow-hidden ${!isFullySolved ? 'bg-black/40 border-white/5 opacity-50' : 'bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)]'}`}>
        {!isFullySolved ? (
          <div className="flex items-center justify-center gap-4 text-zinc-700 font-black uppercase text-[11px] tracking-[0.5em] italic">
            <Lock size={18} className="opacity-20" /> ACCESS_DENIED // CAPTURE_REQUIRED ({solvedVulns.length}/{totalVulns})
          </div>
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter glow-text flex items-center gap-3">DEBRIEF_PROTOCOL</h3>
              <p className="text-[11px] text-emerald-800 font-black uppercase tracking-widest pl-1 italic">SUBMIT_FINDINGS_FOR_VALIDATION</p>
            </div>
            <form onSubmit={handleReportUpload} className="flex gap-4">
              <input type="file" accept=".pdf,.md,.txt" onChange={(e) => setReportFile(e.target.files[0])} className="hidden" id="report-file" />
              <label htmlFor="report-file" className="px-8 py-4 border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 transition-all cursor-pointer font-black uppercase text-[11px] tracking-[0.2em] rounded-sm bg-black italic">
                {reportFile ? reportFile.name : 'UPLOAD_FILES...'}
              </label>
              <button type="submit" disabled={uploadingReport || !reportFile} className="px-10 bg-emerald-500 text-black font-black uppercase text-[11px] tracking-[0.2em] hover:bg-white hover:shadow-[0_0_30px_#fff] transition-all disabled:opacity-20 rounded-sm">
                {uploadingReport ? 'SENDING...' : 'PUSH_REPORTS'}
              </button>
            </form>
          </div>
        )}
      </footer>
    );
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-emerald-500 font-mono relative overflow-hidden">
      <div className="w-80 h-1 bg-white/5 mb-8 rounded-full overflow-hidden border border-white/10 relative z-10">
        <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} className="w-1/2 h-full bg-emerald-500 shadow-[0_0_20px_#10b981]" />
      </div>
      <p className="text-[11px] font-black tracking-[0.8em] animate-pulse relative z-10 uppercase glow-text">Establishing_Neural_Sync</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-emerald-500 selection:text-black relative">
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] [background:linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] [background-size:100%_2px,3px_100%]"></div>
      <div className="flex flex-col xl:flex-row h-screen overflow-hidden relative">

        <aside className="w-full xl:w-[480px] bg-[#020202] border-r border-emerald-500/20 p-12 overflow-y-auto custom-scrollbar flex flex-col relative z-30 shadow-[40px_0_100px_rgba(0,0,0,1)]">
          <div className="absolute left-0 top-0 h-full w-[1px] bg-emerald-500/20 shadow-[0_0_15px_#10b981]" />

          {renderLabHeader()}

          <div className="mt-12 space-y-6">
            <button
              onClick={() => { setShowSolutions(!showSolutions); if (!showSolutions) fetchMachineSolutions(); }}
              className={`w-full group relative flex items-center justify-center gap-4 p-5 font-black uppercase text-[11px] tracking-[0.3em] transition-all border-2 overflow-hidden
                ${showSolutions ? 'bg-emerald-500 text-black border-white shadow-[0_0_40px_#10b981]' : 'bg-[#080808] text-emerald-500 border-emerald-500/20 hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'}`}
            >
              <Lightbulb size={20} className={showSolutions ? '' : 'animate-pulse'} />
              {showSolutions ? 'DISCONNECT_INTEL' : 'NEURAL_HINT_LINK'}
              <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </div>

          <div className="mt-auto pt-10 border-t border-white/5 flex flex-col gap-6">
            <button onClick={() => navigate('/my-machines')} className="group flex items-center gap-6 text-emerald-950 hover:text-emerald-400 font-black transition-all text-[11px] tracking-[0.4em] uppercase italic">
              <div className="p-4 bg-black border border-zinc-900 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all rounded-sm">
                <Power size={20} />
              </div>
              TERMINATE_SESSION
            </button>
            <div className="flex items-center gap-3 pl-1">
              <div className="flex gap-1">
                {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-emerald-900 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />)}
              </div>
              <span className="text-[9px] text-emerald-950 font-black tracking-[0.3em] uppercase">Status: Core_Operational</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-black relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none [background-image:linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] [background-size:80px_80px]"></div>

          <AnimatePresence>
            {showSolutions && (
              <motion.div initial={{ opacity: 0, x: 200 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 200 }} transition={{ type: "spring", damping: 25 }} className="absolute inset-0 z-50 bg-[#020202]/98 backdrop-blur-3xl p-20 overflow-y-auto custom-scrollbar border-l border-emerald-500/20">
                <div className="flex justify-between items-center mb-20 border-b border-emerald-500/10 pb-12">
                  <div className="space-y-4">
                    <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase glow-text decoration-emerald-500 decoration-8 underline-offset-[16px] underline">INTEL_RECOVERY</h2>
                    <div className="flex gap-4 items-center">
                      <Activity size={16} className="text-emerald-500" />
                      <p className="text-[11px] font-black text-emerald-800 tracking-[0.6em] uppercase italic">Decrypting Central Intelligence Bank Assets...</p>
                    </div>
                  </div>
                  <button onClick={() => setShowSolutions(false)} className="p-5 bg-white/5 hover:bg-red-500/20 transition-all text-emerald-500 hover:text-red-500 border border-white/5 rounded-sm shadow-2xl"><X size={40} /></button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {machine.vulnerabilities?.map((vuln, idx) => {
                    const isSolved = solvedVulns.some(v => v.vulnerabilityInstanceId === vuln.vulnerabilityInstanceId);
                    const solution = machineSolutions?.find(s => s.vulnerabilityInstanceId === vuln.vulnerabilityInstanceId) || {};
                    return (
                      <div key={idx} className={`p-12 border-2 transition-all duration-700 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                        ${isSolved ? 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_40px_rgba(16,185,129,0.05)]' : 'border-white/5 bg-zinc-950/40'}`}>
                        <div className="flex items-center justify-between mb-10">
                          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter glow-text underline decoration-emerald-900 decoration-2 underline-offset-4">{vuln.moduleId.replace(/_/g, ' ')}</h3>
                          <span className={`text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded border-2
                                ${isSolved ? 'bg-emerald-500 text-black border-white shadow-[0_0_25px_#10b981]' : 'text-zinc-800 border-zinc-900'}`}>{isSolved ? 'CAPTURED' : 'LOCKED'}</span>
                        </div>
                        <div className="space-y-10">
                          <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-emerald-900 uppercase tracking-[0.5em] flex items-center gap-2 italic">0x01 // INFILTRATION_STRATEGY</h4>
                            <ol className="text-[13px] text-zinc-400 space-y-5 list-decimal list-inside leading-relaxed border-l-2 border-emerald-900/20 ml-2 italic">{(solution.steps || getSolutionSteps(vuln.moduleId)).map((s, i) => <li key={i} className="pl-6">{s}</li>)}</ol>
                          </div>
                          {isSolved && solution.flag && (
                            <div className="p-8 bg-black border-2 border-emerald-500/20 space-y-4 shadow-[inset_0_0_30px_rgba(0,0,0,1)] relative">
                              <div className="absolute top-2 right-4 opacity-5 rotate-12"><Flag size={50} /></div>
                              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] block">RECOVERED_SECRET_BLOCK</label>
                              <code className="text-lg font-black text-white block break-all font-mono glow-text p-4 bg-emerald-500/5 border border-emerald-500/10 tracking-widest">{solution.flag}</code>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <section className="flex-1 flex flex-col overflow-hidden relative z-10 p-12">
            <div className="max-w-[1500px] mx-auto w-full h-full flex flex-col">
              {renderTabBar()}
              <div className="flex-1 overflow-y-auto custom-scrollbar pt-12">
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.99, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.99, y: -10 }} transition={{ duration: 0.3 }} className="h-full">
                    {activeTab === 'browser' && renderBrowserTab()}
                    {activeTab === 'terminal' && renderTerminalTab()}
                    {activeTab === 'files' && renderFilesTab()}
                    {activeTab === 'flags' && renderFlagsTab()}
                  </motion.div>
                </AnimatePresence>
                {renderReportUpload()}
              </div>
            </div>
          </section>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #080808; border-radius: 20px; border: 1px solid #111; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; box-shadow: 0 0 15px #10b981; }
        .glow-text { text-shadow: 0 0 12px rgba(16, 185, 129, 0.7), 0 0 24px rgba(16, 185, 129, 0.3); }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MachineSolver;
