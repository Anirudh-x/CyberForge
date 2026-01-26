import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion'; // For the smooth system entry
import { Bot, X, ShieldAlert, Cpu, Network, Zap, Activity, Globe, Layers, Monitor, ShieldCheck, Trophy, Terminal as TerminalIcon, Cpu as Brain, Command, CheckCircle2, AlertCircle } from 'lucide-react'; 
import '../styles/blink.css';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [liveLogs, setLiveLogs] = useState([]);
  const [isForging, setIsForging] = useState(false);
  const [selectedSector, setSelectedSector] = useState('WEB_APPS');

  // --- TACTICAL NOTIFICATION STATE ---
  const [tacticalAlert, setTacticalAlert] = useState(null);

  const triggerTacticalAlert = (message, type = 'SYSTEM') => {
    setTacticalAlert({ message, type });
    // Auto-purge the log after 4 seconds
    setTimeout(() => setTacticalAlert(null), 4000);
  };

  // --- SECTOR CONTENT DATA ---
  const sectorData = {
    WEB_APPS: {
      desc: "OWASP Top 10 coverage, API Fuzzing, and Secure Subnet SSRF bypass modules.",
      vulns: ['SQLi', 'XSS', 'RCE', 'LFI', 'IDOR', 'SSRF'],
      specs: { os: 'HARDENED_V4', ram: '16GB_ECC', net: '10.10.x.x', kern: '5.15.0-x86' }
    },
    RED_TEAM: {
      desc: "Active Directory exploitation, lateral movement, and advanced persistence mechanics.",
      vulns: ['KERBEROAST', 'PTH', 'SMB_RELAY', 'DC_SYNC', 'GOLD_TKT', 'LLMNR'],
      specs: { os: 'KALI_ROLLING', ram: '32GB_NVME', net: '192.168.1.x', kern: '6.1.0-amd64' }
    },
    BLUE_TEAM: {
      desc: "Threat hunting, log analysis, and real-time incident response protocols.",
      vulns: ['IDS_EVASION', 'LOG_DEL', 'TIMESTOMP', 'ROOTKIT', 'MEM_INJECT', 'BEACON'],
      specs: { os: 'SIEM_OS_V2', ram: '64GB_DDR5', net: 'DMZ_INTERNAL', kern: 'HARDENED_LTS' }
    },
    CLOUD_SEC: {
      desc: "S3 bucket exfiltration, IAM misconfigurations, and K8s breakout simulations.",
      vulns: ['S3_LEAK', 'IAM_ESC', 'METADATA_V1', 'K8S_ESCAPE', 'LAMBDA_INJ', 'EC2_TAKEOVER'],
      specs: { os: 'AWS_AL2023', ram: 'SERVERLESS', net: 'VPC_PEERED', kern: 'KERNEL_6.x' }
    }
  };

  // --- LEADERBOARD MOCK DATA ---
  const leaderboard = [
    { rank: "01", team: "Null_Pointers", points: "45,200", flag: "US" },
    { rank: "02", team: "Kernel_Panic", points: "42,850", flag: "IN" },
    { rank: "03", team: "Root_Shadow", points: "39,120", flag: "DE" },
    { rank: "04", team: "Byte_Me", points: "35,400", flag: "UK" },
    { rank: "05", team: "Ghost_Shell", points: "31,000", flag: "JP" },
  ];

  // --- HYPER-SPEED HERO LOGS ---
  const heroPool = ["SYS_CALL", "HEX_DUMP", "NET_FLOW", "ERR_BYPASS", "KERN_LOG", "UDP_FWD", "SYN_ACK"];
  const [fakeLogs, setFakeLogs] = useState(["[CYBERFORGE] Booting...", "[AUTH] Tunnel established...", "[READY] Awaiting operator..."]);

  useEffect(() => {
    const interval = setInterval(() => {
      const type = heroPool[Math.floor(Math.random() * heroPool.length)];
      const hex = Math.random().toString(16).slice(2, 8).toUpperCase();
      setFakeLogs(prev => [...prev.slice(-4), `[${type}] 0x${hex} -> ADDR_VAR_SYNC..OK`]);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // --- MODULE DATA ---
  const modules = [
    { id: 'web', tabName: 'web_exploit.sh', title: 'WEB_PWNER_V2', vectors: ['> XSS Reflected', '> SQLi Blind', '> JWT Bypass'], pool: ["SCAN_PORT_80", "POST_/login_200", "SQL_INJECT_SUCCESS", "TABLE_DUMP_INIT"] },
    { id: 'pwn', tabName: 'pwn_registry.py', title: 'BUFFER_OVERFLOW', vectors: ['> NOP Sled', '> Ret2Libc', '> Canary Leak'], pool: ["FUZZ_512B", "ADDR_0xDEADBEEF", "SHELL_UID_0", "STACK_SMASH_OK"] },
    { id: 'crypto', tabName: 'crypto_vault.rs', title: 'RSA_CRACKER', vectors: ['> Fermat Factoring', '> Coppersmith', '> Bleichenbacher'], pool: ["FACT_PRIME_N", "PHI_CALC_DONE", "KEY_FOUND_D", "DECRYPT_RSA_2k"] }
  ];

  useEffect(() => {
    setLiveLogs([`> INIT_${modules[activeIdx].id.toUpperCase()}`]);
    const interval = setInterval(() => {
      const currentPool = modules[activeIdx].pool;
      const nextLog = currentPool[Math.floor(Math.random() * currentPool.length)];
      setLiveLogs(prev => [...prev.slice(-5), `[${Math.floor(Math.random() * 999)}] ${nextLog}`]);
    }, 400);
    return () => clearInterval(interval);
  }, [activeIdx]);

  const handleForge = () => {
    setIsForging(true);
    triggerTacticalAlert("FORGE_SEQUENCE_INITIALIZED: Compiling Sector Targets...", "SUCCESS");
    setTimeout(() => {
      setIsForging(false);
      triggerTacticalAlert("COMPILATION_COMPLETE: Machine Instances Ready.", "SUCCESS");
    }, 3000); 
  };

  return (
    <div className="relative bg-[#050505] min-h-screen selection:bg-green-500 selection:text-black overflow-x-hidden hacker-font">
      <div className="fixed inset-0 hacker-grid opacity-30 pointer-events-none" />
      
      {/* --- TACTICAL ALERT OVERLAY --- */}
      <AnimatePresence>
        {tacticalAlert && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-6"
          >
            <div className="glass-morphism border-2 border-[#39FF14]/50 p-1 rounded-sm shadow-[0_0_30px_rgba(57,255,20,0.2)] overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-[#39FF14] animate-scanline-fast opacity-30" />
              <div className="bg-zinc-950 p-4 flex items-start gap-4">
                <div className="p-2 bg-[#39FF14]/10 rounded border border-[#39FF14]/20">
                  {tacticalAlert.type === 'SUCCESS' ? <CheckCircle2 className="text-[#39FF14]" size={20} /> : <AlertCircle className="text-red-500" size={20} />}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-[10px] font-black tracking-[0.4em] text-[#39FF14]/60 uppercase mb-1">
                    System_Output // {tacticalAlert.type}
                  </h4>
                  <p className="text-sm font-bold text-white tracking-tight leading-snug">
                    &gt; {tacticalAlert.message}
                  </p>
                </div>
                <button onClick={() => setTacticalAlert(null)} className="text-zinc-600 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="h-0.5 w-full bg-white/5">
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 4, ease: "linear" }}
                  className="h-full bg-[#39FF14] shadow-[0_0_10px_#39FF14]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar />

      <main className="relative z-10">
        {/* --- HERO SECTION --- */}
        <div className="container mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-10 text-left">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 glass-morphism rounded-full border border-green-500/30">
              <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-ping shadow-[0_0_8px_#39FF14]" />
              <span className="text-[10px] tracking-[0.3em] text-[#39FF14] uppercase font-bold">System Status: Optimal</span>
            </div>
            <h1 className="text-8xl font-black font-mono leading-[0.85] tracking-tighter text-white uppercase italic">
              CYBER<span className="text-[#39FF14] typewriter-forge px-2 drop-shadow-[0_0_15px_rgba(57,255,20,0.6)]">FORGE</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-lg leading-relaxed border-l-4 border-[#39FF14]/40 pl-8 text-left italic">
              Digital frontline engaged. Welcome back, <span className="text-[#00F0FF] font-bold drop-shadow-[0_0_10px_#00F0FF] uppercase">Operator_{user?.teamName || "Guest"}</span>.
            </p>
            <div className="flex flex-wrap gap-6 pt-4">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="px-10 py-4 bg-[#39FF14] hover:bg-green-400 text-black font-black text-xl transition-all shadow-[6px_6px_0px_#fff] active:scale-95">LOGIN</Link>
                  <Link to="/register" className="px-10 py-4 glass-morphism text-[#39FF14] border border-[#39FF14] font-bold text-xl hover:bg-green-500/10 transition-all">REGISTER</Link>
                </>
              ) : (
                <Link to="/challenges" className="px-12 py-5 bg-[#39FF14] hover:bg-green-400 text-black font-black text-2xl transition-all shadow-[0_0_30px_rgba(57,255,20,0.4)]">ACCESS_CHALLENGES.exe</Link>
              )}
            </div>
          </div>

          <div className="lg:w-1/2 w-full group">
            <div className="glass-morphism p-1 rounded-2xl border-[#39FF14]/50 shadow-[0_0_30px_rgba(57,255,20,0.2)]">
              <div className="bg-zinc-950/80 rounded-[14px] p-8 h-[350px] relative overflow-hidden">
                <div className="terminal-scanline-fast" />
                <div className="flex justify-between items-center mb-6 opacity-60">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/40" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                    <div className="w-3 h-3 rounded-full bg-green-500/40" />
                  </div>
                  <span className="text-[10px] tracking-widest text-[#39FF14] font-bold underline uppercase">TTY_01_ROOT</span>
                </div>
                <div className="space-y-2 text-left">
                  <div className="text-[#39FF14]/50 flex gap-2 text-xs font-mono">
                    <span>┌──(</span><span className="text-[#00F0FF] font-bold drop-shadow-[0_0_5px_#00F0FF]">{user?.teamName || "root"}@cyberforge</span><span>)-[~]</span>
                  </div>
                  {fakeLogs.map((log, i) => (
                    <p key={i} className={`text-sm leading-tight tracking-wide font-mono transition-all duration-75`}>{log}</p>
                  ))}
                  <div className="blinking text-[#39FF14] mt-2 text-xl drop-shadow-[0_0_10px_#39FF14]">█</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION 01: SYSTEM CORE --- */}
        <div className="container mx-auto px-6 py-32 border-t border-[#39FF14]/20">
          <div className="flex items-center gap-8 mb-16">
            <h2 className="text-5xl font-mono text-white tracking-tighter uppercase italic">
              <span className="text-[#39FF14] drop-shadow-[0_0_10px_#39FF14]">01.</span> SYSTEM_CORE
            </h2>
            <div className="h-px flex-grow bg-gradient-to-r from-[#39FF14]/40 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <StatCard icon={<ShieldAlert className="text-red-500 shadow-red-500"/>} label="THREAT_LEVEL" value="ELEVATED" progress="70%" />
            <StatCard icon={<Activity className="text-blue-500 shadow-blue-500"/>} label="TRAFFIC_LOAD" value="1.2 GB/S" progress="45%" />
            <StatCard icon={<Zap className="text-[#39FF14] shadow-[#39FF14]"/>} label="NODE_POWER" value="OPTIMAL" progress="100%" />
          </div>
        </div>

        {/* --- SECTION 02: TRAINING MODULES --- */}
        <div className="container mx-auto px-6 py-32 border-t border-[#39FF14]/20">
          <div className="flex items-center gap-8 mb-16">
            <h2 className="text-5xl font-mono text-white tracking-tighter uppercase italic">
              <span className="text-[#39FF14] drop-shadow-[0_0_10px_#39FF14]">02.</span> TRAINING_MODULES
            </h2>
            <div className="h-px flex-grow bg-gradient-to-r from-[#39FF14]/40 to-transparent" />
          </div>
          <div className="glass-morphism rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(57,255,20,0.15)] border border-[#39FF14]/20">
            <div className="bg-zinc-900/60 px-8 py-6 flex items-center justify-between border-b border-[#39FF14]/10">
              <div className="flex gap-6">
                {modules.map((m, idx) => (
                  <button key={m.id} onClick={() => setActiveIdx(idx)} className={`px-4 py-2 text-sm tracking-widest transition-all relative ${activeIdx === idx ? 'text-[#39FF14] font-bold drop-shadow-[0_0_8px_#39FF14]' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    {m.tabName.toUpperCase()}
                    {activeIdx === idx && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#39FF14] shadow-[0_0_15px_#39FF14]" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-12 relative bg-black/40 grid md:grid-cols-2 gap-20 z-10 text-left">
                <div className="space-y-10">
                  <h3 className="text-4xl font-black text-white italic tracking-tighter decoration-[#39FF14] underline underline-offset-8">{modules[activeIdx].title}</h3>
                  <div className="space-y-4">
                    <span className="text-[10px] text-[#39FF14] font-bold uppercase tracking-[0.5em] animate-pulse">Live_Telemetry_Stream_Turbo</span>
                    <div className="glass-morphism bg-black/60 p-6 border border-[#39FF14]/30 rounded-2xl h-56 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                      {liveLogs.map((log, i) => <p key={i} className="text-sm mb-1 font-mono text-[#39FF14]/80 tracking-widest">{log}</p>)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <div className="space-y-6">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Attack_Vectors</p>
                    {modules[activeIdx].vectors.map((v, i) => (
                      <div key={i} className="flex items-center gap-5 text-[#39FF14] hover:translate-x-2 transition-transform cursor-pointer group">
                        <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full shadow-[0_0_10px_#39FF14]" />
                        <span className="text-md font-bold italic tracking-tighter">{v}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => triggerTacticalAlert(`EXPLOIT_DEPLOYED::${modules[activeIdx].id}`, "SUCCESS")} className="mt-16 w-full py-6 glass-morphism border-2 border-[#39FF14] text-[#39FF14] font-black uppercase tracking-[0.8em] transition-all hover:bg-[#39FF14] hover:text-black shadow-[0_0_40px_rgba(57,255,20,0.5)] active:scale-95">RUN_INITIALIZER</button>
                </div>
            </div>
          </div>
        </div>

        {/* --- SECTION 03: MACHINE_ARCHITECT --- */}
        <div className="container mx-auto px-6 py-32 border-t border-[#39FF14]/20">
          <div className="flex items-center gap-8 mb-16">
            <h2 className="text-5xl font-mono text-white tracking-tighter uppercase italic text-left">
              <span className="text-[#39FF14] drop-shadow-[0_0_10px_#39FF14]">03.</span> MACHINE_ARCHITECT
            </h2>
            <div className="h-px flex-grow bg-gradient-to-r from-[#39FF14]/40 to-transparent" />
          </div>

          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/3 space-y-8 sticky top-24 text-left">
              <p className="text-zinc-400 font-mono text-lg border-l-4 border-[#00F0FF] pl-6 leading-relaxed italic uppercase">
                Initialize custom target instances. Select attack surfaces and vectors for <span className="text-[#00F0FF] font-bold uppercase">Operator_{user?.teamName || "Guest"}</span> to test.
              </p>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-mono text-[#39FF14]">
                  <span>FORGE_SYNC_PROGRESS</span>
                  <span>{isForging ? '91%' : '0%'}</span>
                </div>
                <div className="w-full h-1 bg-zinc-900 overflow-hidden text-left border border-white/5">
                  <div className={`h-full bg-[#39FF14] transition-all duration-1000 ${isForging ? 'w-[91%]' : 'w-0'}`} style={{ boxShadow: '0 0 10px #39FF14' }} />
                </div>
              </div>
              <button onClick={handleForge} disabled={isForging} className={`w-full py-6 font-black text-xl transition-all uppercase font-mono border-2 border-[#39FF14] ${isForging ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-zinc-700' : 'bg-[#39FF14] text-black shadow-[0_0_40px_rgba(57,255,20,0.4)] hover:scale-105 active:scale-95'}`}>
                {isForging ? 'FORGING_INSTANCE...' : 'INITIATE_FORGE.exe'}
              </button>
            </div>

            <div className="lg:w-2/3 relative h-[700px] w-full mt-12 lg:mt-0">
              {/* SECTOR SELECTOR CARDS - MAINTAINED LOGIC, ADDED DEPTH */}
              <div className="absolute top-0 left-[5%] w-[85%] glass-morphism p-10 rounded-2xl border border-[#00F0FF]/40 z-30 shadow-[0_0_60px_rgba(0,0,0,0.9)] transition-transform hover:translate-y-[-5px]">
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Monitor size={22} className="text-[#00F0FF] animate-pulse" />
                    <span className="text-[10px] text-[#00F0FF] uppercase tracking-[0.4em] font-bold font-mono italic underline text-left">Terminal_01: Sector_Forge</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" /><div className="w-3 h-3 rounded-full bg-yellow-500/50" /><div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 text-sm font-mono text-left">
                  {Object.keys(sectorData).map(sectorKey => (
                    <div key={sectorKey} onClick={() => setSelectedSector(sectorKey)} className={`cursor-pointer p-5 border-2 transition-all ${selectedSector === sectorKey ? 'border-[#00F0FF] bg-[#00F0FF]/15 shadow-[0_0_15px_#00F0FF20]' : 'border-zinc-800 opacity-40 hover:opacity-100 hover:border-zinc-700'}`}>
                      <h4 className={`font-black text-xl italic tracking-tighter uppercase ${selectedSector === sectorKey ? 'text-[#00F0FF]' : 'text-zinc-400'}`}>{sectorKey}</h4>
                      <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed uppercase">{sectorData[sectorKey].desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute top-[320px] left-[20%] w-[85%] glass-morphism p-10 rounded-2xl border border-[#39FF14]/40 z-20 shadow-[0_0_80px_rgba(0,0,0,1)] bg-zinc-950/60 transition-transform hover:translate-y-[-5px]">
                <div className="flex items-center gap-4 border-b border-[#39FF14]/20 pb-4 mb-8 text-left text-zinc-500">
                  <ShieldCheck size={22} className="text-[#39FF14] drop-shadow-[0_0_8px_#39FF14]" />
                  <span className="text-[10px] text-[#39FF14] uppercase tracking-[0.4em] font-bold font-mono underline decoration-green-900">Terminal_02: {selectedSector}_Matrix</span>
                </div>
                <div className="grid grid-cols-2 gap-12 text-left">
                   <div className="space-y-4">
                     <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-black border-b border-zinc-900 pb-2 italic">Instance_Specs</p>
                     <div className="grid grid-cols-1 gap-2 text-[11px] font-mono uppercase text-white tracking-widest">
                       <p><span className="text-[#00F0FF]">&gt;</span> OS: {sectorData[selectedSector].specs.os}</p>
                       <p><span className="text-[#00F0FF]">&gt;</span> RAM: {sectorData[selectedSector].specs.ram}</p>
                       <p><span className="text-[#00F0FF]">&gt;</span> NET: {sectorData[selectedSector].specs.net}</p>
                       <p><span className="text-[#00F0FF]">&gt;</span> KERN: {sectorData[selectedSector].specs.kern}</p>
                     </div>
                   </div>
                   <div className="space-y-4">
                     <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-black border-b border-zinc-900 pb-2 italic">Threat_List</p>
                     <div className="flex flex-wrap gap-2">
                        {sectorData[selectedSector].vulns.map(v => (
                          <span key={v} className="px-2 py-1 bg-[#39FF14]/5 border border-[#39FF14]/30 text-[#39FF14] text-[9px] font-bold tracking-tighter">CVE_{v}</span>
                        ))}
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION 04: NEXUS_OPERATIONS --- */}
        <div className="container mx-auto px-6 py-20 border-t border-[#39FF14]/20 relative">
          <div className="flex items-center gap-8 mb-12">
            <h2 className="text-5xl font-mono text-white tracking-tighter uppercase italic">
              <span className="text-[#39FF14] drop-shadow-[0_0_10px_#39FF14]">04.</span> NEXUS_OPERATIONS
            </h2>
            <div className="h-px flex-grow bg-gradient-to-r from-[#39FF14]/40 to-transparent" />
          </div>

          <div className="flex flex-col xl:flex-row gap-10 items-stretch relative">
            <div className="xl:w-1/2 flex flex-col">
              <div className="text-left mb-2 opacity-50">
                <span className="text-[#39FF14] text-[10px] font-mono tracking-widest italic underline">root@cyberforge:~/rankings# list --top-5</span>
              </div>
              <div className="glass-morphism rounded-2xl overflow-hidden border border-[#39FF14]/20 shadow-xl flex-1 bg-black/40 relative">
                <div className="bg-zinc-900/60 p-4 border-b border-[#39FF14]/10 flex items-center justify-between px-8">
                  <Trophy size={16} className="text-[#39FF14] animate-bounce" />
                  <span className="text-zinc-400 font-mono text-[10px] uppercase tracking-[0.4em] font-black italic">Operator_Rankings</span>
                </div>
                <div className="p-8">
                  <table className="w-full text-left font-mono">
                    <tbody>
                      {leaderboard.map((team, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-[#39FF14]/5 transition-all group">
                          <td className="py-4 text-[#00F0FF] font-black text-sm italic">{team.rank}</td>
                          <td className="py-4 pl-4">
                            <div className="flex items-center gap-4">
                              <span className="text-white text-md font-black tracking-tight uppercase">{team.team}</span>
                              <span className="text-[9px] bg-zinc-900 border border-white/10 px-2 py-0.5 rounded-sm text-zinc-500 font-bold">{team.flag}</span>
                            </div>
                          </td>
                          <td className="py-4 text-right text-[#39FF14] font-black text-md tracking-[0.2em] italic drop-shadow-[0_0_8px_#39FF1440]">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="xl:w-1/2 flex flex-col">
              <div className="text-left mb-2 opacity-50 pl-2">
                <span className="text-[#00F0FF] text-[10px] font-mono tracking-widest italic underline">root@cyberforge:~/ai# status --link</span>
              </div>
              <div className="glass-morphism rounded-2xl overflow-hidden border-2 border-[#00F0FF]/30 shadow-2xl flex-1 bg-black/40 flex flex-col md:flex-row relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Brain size={120} className="text-[#00F0FF]" /></div>
                <div className="p-10 flex-1 text-left space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-[#00F0FF]/10 rounded border border-[#00F0FF]/30"><Command size={18} className="text-[#00F0FF]" /></div>
                    <span className="text-white font-black text-md tracking-[0.3em] uppercase italic">Neural_Link_AI</span>
                  </div>
                  <p className="text-zinc-500 text-xs font-mono leading-relaxed uppercase font-bold italic border-l-2 border-[#00F0FF]/40 pl-6">
                    Link established. Forge AI active for decryption logic and situational exfiltration guidance.
                  </p>
                  <ul className="text-[10px] text-zinc-600 space-y-3 font-black tracking-widest pt-4 border-t border-white/5 uppercase italic">
                    <li className="flex gap-4 items-center"><div className="w-1 h-1 bg-[#39FF14] rounded-full animate-pulse" /> SCANNING_PATTERN_RECOGNITION</li>
                    <li className="flex gap-4 items-center"><div className="w-1 h-1 bg-[#39FF14] rounded-full animate-pulse" /> DYNAMIC_HINT_ENGINE_V4</li>
                  </ul>
                </div>
                <div className="p-10 bg-[#39FF14]/5 flex items-center justify-center border-l border-white/5">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-[#39FF14]/20 rounded-full blur-3xl animate-pulse group-hover:bg-[#39FF14]/40 transition-all duration-1000" />
                    <Bot size={110} className="text-[#39FF14] relative drop-shadow-[0_0_20px_#39FF14] group-hover:scale-110 transition-transform cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 h-px bg-gradient-to-r from-transparent via-[#39FF14]/40 to-transparent" />
          <div className="mt-8 text-center text-zinc-800 font-mono text-[10px] tracking-[1.5em] uppercase opacity-40 pb-10">
            root@cyberforge:~# logout --session_purge --done
          </div>
        </div>
      </main>

      {/* --- FLOATING CHATBOT (STRICTLY PRESERVED) --- */}
      <div className="fixed bottom-12 right-12 z-[100] flex flex-col items-end gap-6 text-left">
        {isChatOpen && (
          <div className="w-[420px] h-[600px] glass-morphism border-2 border-[#39FF14]/40 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,1)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-20 duration-500">
            <div className="bg-zinc-950 p-6 border-b border-green-500/20 flex justify-between items-center backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_#22c55e]" />
                <span className="text-white font-mono font-black text-xs uppercase tracking-[0.2em] italic">FORGE_AI.bin</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-zinc-600 hover:text-red-500 transition-colors p-1"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto bg-black/90 p-4"><Chatbot /></div>
          </div>
        )}
        {!isChatOpen && (
          <button onClick={() => setIsChatOpen(true)} className="p-6 bg-green-600 text-black rounded-full shadow-[0_0_50px_rgba(34,197,94,0.6)] hover:shadow-[0_0_80px_rgba(34,197,94,0.9)] transition-all hover:scale-110 active:scale-95 border-2 border-white/20">
            <Bot size={36} />
          </button>
        )}
      </div>
      <Footer />
    </div>
  );
}

function StatCard({ icon, label, value, progress }) {
  return (
    <div className="glass-morphism border border-white/5 p-10 rounded-3xl group hover:border-[#39FF14]/40 transition-all duration-700 relative overflow-hidden bg-zinc-950/40 shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 blur-[50px] pointer-events-none" />
      <div className="flex justify-between items-start mb-8 text-zinc-500">
        <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-[#39FF14]/15 transition-colors border border-transparent group-hover:border-[#39FF14]/20">{icon}</div>
        <div className="text-[10px] font-mono text-zinc-700 tracking-[0.5em] uppercase font-black italic">{label}</div>
      </div>
      <div className="text-4xl font-mono font-black text-white mb-6 tracking-tighter transition-colors text-left uppercase italic">{value}</div>
      <div className="w-full h-1.5 bg-zinc-900 border border-white/5 rounded-full overflow-hidden text-left shadow-inner">
        <div className="h-full bg-gradient-to-r from-green-950 to-[#39FF14] shadow-[0_0_15px_#39FF14] transition-all duration-1000 ease-out" style={{ width: progress }} />
      </div>
    </div>
  );
}