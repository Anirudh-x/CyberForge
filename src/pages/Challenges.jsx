import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';

export default function Challenges() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [profileData, setProfileData] = useState({ 
    github: '', 
    field: 'Red Teaming',
    callsign: '',
    primaryOS: 'Kali Linux',
    bio: '',
    yearsOfExperience: '',
    certifications: '',
    linkedin: '',
    favoriteTools: ''
  });
  const [activeSolution, setActiveSolution] = useState(null);
  const [deployingLab, setDeployingLab] = useState(null);
  const [deployedMachines, setDeployedMachines] = useState({});

  const starterLabs = [
    { 
      id: "01", 
      title: "ROOT_ACCESS", 
      difficulty: "ENTRY", 
      type: "LINUX_KERN", 
      desc: "Exploit misconfigured SUID bits to gain root privileges.",
      scenario: "In corporate environments, developers often grant 'SuperUser' (SUID) permissions to custom tools for convenience. This 'convenience' is a backdoor for attackers to escalate from a guest account to a System Administrator.",
      realWorld: "Privilege Escalation (CWE-269)",
      solution: "1. Scan for SUID: 'find / -perm -u=s -type f 2>/dev/null'.\n2. Locate a binary like 'vim' or 'find'.\n3. Consult GTFOBins for the specific escape sequence.\n4. Execute: 'vim -c \":!sh\"' for root shell.",
      domain: "red_team",
      moduleId: "privilege_escalation"
    },
    { 
      id: "02", 
      title: "INJECTION_V1", 
      difficulty: "MODERATE", 
      type: "DB_SQL", 
      desc: "Bypass authentication using advanced SQL injection techniques.",
      scenario: "Legacy e-commerce portals often concatenate user input directly into database queries. By injecting SQL commands into the login field, an attacker can trick the server into authorizing access without a valid password.",
      realWorld: "SQL Injection (OWASP A03:2021)",
      solution: "1. Access the login node.\n2. In Username field, input: admin' --\n3. This terminates the query and ignores the password check.\n4. Bypass complete.",
      domain: "web",
      moduleId: "sql_injection"
    },
    { 
      id: "03", 
      title: "CIPHER_CRACK", 
      difficulty: "ENTRY", 
      type: "CRYPT_SEC", 
      desc: "Decrypt the intercepted comms using frequency analysis.",
      scenario: "Ransomware operators frequently use automated, weak encryption for internal communication. By analyzing the frequency of symbols, analysts can reverse-engineer the shift and decrypt the group's private keys.",
      realWorld: "Cryptographic Failure (OWASP A02:2021)",
      solution: "1. Inspect the scrambled string.\n2. Use Frequency Analysis to find the most common letters.\n3. Apply a Caesar Shift (ROT) until plaintext is readable.\n4. Identify the 'iiitl{}' flag format.",
      domain: "forensics",
      moduleId: "memory_dump"
    }
  ];

  const deployMachine = async (lab) => {
    try {
      setDeployingLab(lab.id);
      
      const response = await fetch('/api/machines/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: lab.title,
          domain: lab.domain,
          modules: [lab.moduleId]
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const machineId = data.machine.id || data.machine._id;
        setDeployedMachines(prev => ({
          ...prev,
          [lab.id]: data.machine
        }));
        
        // Navigate to the machine solver
        navigate(`/solve/${machineId}`);
      } else {
        alert('Deployment failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deploying machine:', error);
      alert('Failed to deploy machine: ' + error.message);
    } finally {
      setDeployingLab(null);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Check if user profile is already completed
    if (isAuthenticated) {
      checkProfileCompletion();
    }
  }, [isAuthenticated, isLoading, navigate]);

  const checkProfileCompletion = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.profile) {
        // If user has filled callsign or bio, consider profile as initialized
        if (data.profile.callsign || data.profile.bio) {
          setIsInitialized(true);
        }
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });
      const data = await response.json();
      if (data.success) {
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      // Still proceed to challenges even if save fails
      setIsInitialized(true);
    }
  };

  if (isLoading || checkingProfile) return <div className="bg-black min-h-screen font-mono text-green-500 p-10 tracking-widest animate-pulse">SYNCING_SYSTEM_CORES...</div>;

  return (
    <div className="bg-[#020202] min-h-screen text-green-400 font-mono selection:bg-green-500 selection:text-black">
      <style>{`
        @keyframes scanline { 0% { bottom: 100%; } 100% { bottom: 0%; } }
        @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); filter: blur(5px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
        .z-row:nth-child(even) { flex-direction: row-reverse; }
        .hud-bracket-thick { position: absolute; width: 30px; height: 30px; border-color: #22c55e; border-style: solid; }
        input[type="checkbox"]:checked + div { background-color: #22c55e; }
      `}</style>

      <Navbar />
      
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-10">
        <div className="absolute w-full h-[1px] bg-green-500 animate-[scanline_12s_linear_infinite]"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {!isInitialized ? (
          /* --- DESIGN 1: THE ADVANCED HARDWARE AUTH TERMINAL --- */
          <div className="max-w-2xl mx-auto mt-10 animate-[fade-in-up_0.8s_ease-out]">
            <div className="relative group">
              <div className="absolute -inset-1 bg-green-500/10 blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative border border-green-500 bg-black/90 p-10 md:p-14 shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden">
                <div className="hud-bracket-thick top-0 left-0 border-t-4 border-l-4"></div>
                <div className="hud-bracket-thick top-0 right-0 border-t-4 border-r-4"></div>
                <div className="hud-bracket-thick bottom-0 left-0 border-b-4 border-l-4"></div>
                <div className="hud-bracket-thick bottom-0 right-0 border-b-4 border-r-4"></div>

                <div className="mb-12 text-center">
                  <div className="inline-block px-3 py-1 bg-green-500 text-black text-[9px] font-black uppercase mb-4 tracking-[0.4em]">
                    SECURE_UPLINK_PROTOCOL_v4.2
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter text-white italic uppercase">Initialize_Agent</h2>
                  <div className="h-1 w-24 bg-green-500 mx-auto mt-4"></div>
                </div>

                <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {/* [01] CALLSIGN */}
                  <div className="relative">
                    <label className="text-[10px] uppercase text-green-700 font-black mb-3 block tracking-widest">[01] CALLSIGN_ALIAS</label>
                    <input 
                      type="text" required
                      className="w-full bg-transparent border-b-2 border-green-900 text-green-400 p-2 outline-none focus:border-green-400 font-bold"
                      placeholder="GHOST_PROTOCOL"
                      onChange={(e) => setProfileData({...profileData, callsign: e.target.value})}
                    />
                  </div>

                  {/* [02] GITHUB */}
                  <div className="relative">
                    <label className="text-[10px] uppercase text-green-700 font-black mb-3 block tracking-widest">[02] GITHUB_UPLINK</label>
                    <input 
                      type="text" required
                      className="w-full bg-transparent border-b-2 border-green-900 text-green-400 p-2 outline-none focus:border-green-400 font-bold"
                      placeholder="GITHUB_USERNAME"
                      onChange={(e) => setProfileData({...profileData, github: e.target.value})}
                    />
                  </div>

                  {/* [03] ACCESS LEVEL */}
                  <div className="relative">
                    <label className="text-[10px] uppercase text-green-700 font-black mb-3 block tracking-widest">[03] ACCESS_LEVEL</label>
                    <select 
                      className="w-full bg-[#080808] border border-green-900 p-3 text-green-400 outline-none focus:border-green-400 appearance-none font-bold"
                      onChange={(e) => setProfileData({...profileData, field: e.target.value})}
                    >
                      <option>RED_TEAM</option>
                      <option>BLUE_TEAM</option>
                      <option>FULL_STACK_SEC</option>
                    </select>
                  </div>

                  {/* [04] PRIMARY OS */}
                  <div className="relative">
                    <label className="text-[10px] uppercase text-green-700 font-black mb-3 block tracking-widest">[04] PRIMARY_OS</label>
                    <select 
                      className="w-full bg-[#080808] border border-green-900 p-3 text-green-400 outline-none focus:border-green-400 appearance-none font-bold"
                      onChange={(e) => setProfileData({...profileData, primaryOS: e.target.value})}
                    >
                      <option>KALI_LINUX</option>
                      <option>PARROT_OS</option>
                      <option>ARCH_LINUX</option>
                      <option>WINDOWS_SUBSYSTEM</option>
                    </select>
                  </div>

                  {/* [05] BIO / MANIFESTO */}
                  <div className="relative md:col-span-2">
                    <label className="text-[10px] uppercase text-green-700 font-black mb-3 block tracking-widest">[05] AGENT_BIO_SIGNATURE</label>
                    <textarea 
                      className="w-full bg-transparent border-2 border-green-900 p-4 text-green-400 outline-none focus:border-green-400 font-bold h-24 resize-none"
                      placeholder="ENTER PUBLIC SIGNATURE..."
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    />
                  </div>

                  {/* [06] YEARS OF EXPERIENCE */}
                  <div className="relative">
                    <label className="text-[10px] uppercase text-green-700 font-black mb-3 block tracking-widest">[06] YEARS_EXPERIENCE</label>
                    <select 
                      className="w-full bg-[#080808] border border-green-900 p-3 text-green-400 outline-none focus:border-green-400 appearance-none font-bold"
                      onChange={(e) => setProfileData({...profileData, yearsOfExperience: e.target.value})}
                    >
                      <option value="">SELECT_LEVEL</option>
                      <option value="0-1">BEGINNER (0-1 YEARS)</option>
                      <option value="1-3">INTERMEDIATE (1-3 YEARS)</option>
                      <option value="3-5">ADVANCED (3-5 YEARS)</option>
                      <option value="5+">EXPERT (5+ YEARS)</option>
                    </select>
                  </div>

                  {/* [07] CERTIFICATIONS */}
                  <div className="relative">
                    <label className="text-[10px] uppercase text-green-700 font-black mb-3 block tracking-widest">[07] CERTIFICATIONS</label>
                    <input 
                      type="text"
                      className="w-full bg-transparent border-b-2 border-green-900 text-green-400 p-2 outline-none focus:border-green-400 font-bold"
                      placeholder="OSCP, CEH, CISSP..."
                      onChange={(e) => setProfileData({...profileData, certifications: e.target.value})}
                    />
                  </div>

                  {/* [08] LINKEDIN */}
                  <div className="relative">
                    <label className="text-[10px] uppercase text-green-700 font-black mb-3 block tracking-widest">[08] LINKEDIN_PROFILE</label>
                    <input 
                      type="text"
                      className="w-full bg-transparent border-b-2 border-green-900 text-green-400 p-2 outline-none focus:border-green-400 font-bold"
                      placeholder="LINKEDIN_USERNAME"
                      onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})}
                    />
                  </div>

                  {/* [09] FAVORITE TOOLS */}
                  <div className="relative">
                    <label className="text-[10px] uppercase text-green-700 font-black mb-3 block tracking-widest">[09] FAVORITE_TOOLS</label>
                    <input 
                      type="text"
                      className="w-full bg-transparent border-b-2 border-green-900 text-green-400 p-2 outline-none focus:border-green-400 font-bold"
                      placeholder="NMAP, BURP, METASPLOIT..."
                      onChange={(e) => setProfileData({...profileData, favoriteTools: e.target.value})}
                    />
                  </div>

                  {/* FAKE VPN TOGGLE */}
                  <div className="md:col-span-2 flex items-center gap-4 py-4 border-y border-green-900/30">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-green-900/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-green-500 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                    <span className="text-[10px] font-black uppercase text-green-500 tracking-[0.2em] animate-pulse">
                      Enable Proxy Tunneling (Recommended)
                    </span>
                  </div>

                  <button 
                    type="submit" 
                    className="md:col-span-2 group relative w-full h-16 bg-transparent border-2 border-green-500 overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(34,197,94,0.3)]"
                  >
                    <div className="absolute inset-0 bg-green-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative z-10 text-xl font-black uppercase tracking-[0.6em] text-green-500 group-hover:text-black transition-colors">
                      Authorize_Agent
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* --- DESIGN 2: THE UNIFIED COMMAND CENTER --- */
          <div className="animate-[fade-in-up_1s_ease-out]">
            <header className="mb-24 border-b border-green-900 pb-10 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="text-[10px] text-green-600 mb-2 tracking-[0.5em] animate-pulse italic">
                      CONNECTION://STABLE // CALLSIGN: {profileData.callsign}
                    </div>
                    <h1 className="text-7xl font-black text-white italic tracking-tighter">OPERATIONS_GRID</h1>
                    <div className="flex gap-6 mt-4 items-center">
                        <span className="text-xs bg-green-500 text-black px-3 py-1 font-bold">CLEARANCE: LVL_01</span>
                        <span className="text-xs text-green-800 font-bold tracking-widest italic uppercase">Agent_ID: {profileData.github}</span>
                    </div>
                </div>
            </header>

            

            <div className="space-y-56 mb-32">
              {starterLabs.map((lab, index) => (
                <div key={lab.id} className="z-row flex flex-col lg:flex-row gap-16 lg:gap-32 items-stretch min-h-[450px]">
                  <div className="w-full lg:w-1/2 flex flex-col">
                    <div className="flex-1 border-2 border-green-900 bg-black/40 p-10 relative group hover:border-green-400 transition-all duration-500 shadow-[20px_20px_60px_rgba(0,0,0,0.8)]">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-green-500"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-green-500"></div>
                      <div className="flex justify-between items-start mb-12 text-[10px] font-black tracking-widest uppercase">
                        <div className="px-4 py-1 bg-green-900/30 border border-green-500">Target_MOD: 0{lab.id}</div>
                        <div className="text-green-700">{lab.type}</div>
                      </div>
                      <h3 className="text-5xl font-black text-white mb-6 italic group-hover:text-green-400 transition-colors tracking-tighter">{lab.title}</h3>
                      <p className="text-green-500/60 text-sm font-bold mb-14 border-l-2 border-green-900 pl-6 leading-relaxed">{lab.desc}</p>
                      <div className="mt-auto grid grid-cols-2 gap-6">
                        <button onClick={() => setActiveSolution(lab)} className="border border-green-500/30 py-4 text-[11px] font-black tracking-[0.3em] uppercase hover:bg-green-500/10 hover:border-green-400 transition-all">Review_Intel</button>
                        <button 
                          onClick={() => deployMachine(lab)} 
                          disabled={deployingLab === lab.id || deployedMachines[lab.id]}
                          className={`py-4 text-[11px] font-black tracking-[0.3em] uppercase transition-all ${
                            deployedMachines[lab.id] 
                              ? 'bg-green-900 text-green-400 cursor-not-allowed' 
                              : deployingLab === lab.id
                              ? 'bg-yellow-600 text-black animate-pulse'
                              : 'bg-green-600 text-black hover:bg-green-400'
                          }`}
                        >
                          {deployingLab === lab.id ? 'Deploying...' : deployedMachines[lab.id] ? 'Deployed' : 'Deploy_Payload'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2 flex flex-col justify-center">
                    <div className="relative">
                      <div className="text-[10px] text-green-900 font-black mb-6 tracking-[0.6em] uppercase border-b border-green-900 pb-3">Field_Intelligence_Dossier</div>
                      <h4 className="text-4xl font-black text-white mb-8 italic tracking-tight flex items-center gap-4">THE SCENARIO<span className="h-1 w-12 bg-green-900"></span></h4>
                      <p className="text-gray-400 text-xl leading-relaxed italic mb-10 font-medium">"{lab.scenario}"</p>
                      <div className="bg-green-900/10 border-l-4 border-red-600 p-8">
                        <div className="flex items-center gap-4 mb-3">
                           <div className="w-3 h-3 bg-red-600 animate-pulse rounded-full"></div>
                           <span className="text-[11px] text-green-500 font-black uppercase tracking-[0.2em]">Threat Vector Identified</span>
                        </div>
                        <p className="text-lg font-black text-white tracking-wide uppercase">{lab.realWorld}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-10 bg-black border border-green-900 relative shadow-2xl">
                <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
                <div className="text-[11px] space-y-2 font-bold uppercase tracking-[0.2em]">
                    <p className="text-green-900 opacity-40">&gt; [SYS] Diagnostic complete: CallSign {profileData.callsign} Authorized.</p>
                    <p className="text-green-600">&gt; [INFO] Using {profileData.primaryOS} environment for emulation.</p>
                    <p className="text-green-400 animate-pulse">&gt; [READY] Handshake complete via Proxy Tunneling.</p>
                </div>
            </div>
          </div>
        )}
      </div>

      {activeSolution && (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setActiveSolution(null)}></div>
            <div className="relative w-full max-w-xl bg-[#050505] border-l-4 border-green-500 h-full p-14 animate-[slide-in_0.3s_ease-out]">
                <div className="flex justify-between items-center mb-20">
                    <h3 className="text-3xl font-black italic text-white uppercase underline decoration-green-500 decoration-4">Intel_Bypass</h3>
                    <button onClick={() => setActiveSolution(null)} className="text-red-600 font-black hover:text-white transition-colors">[TERMINATE_X]</button>
                </div>
                <div className="mb-14 border-b border-green-900 pb-8">
                    <label className="text-[10px] text-green-900 uppercase block mb-2 tracking-[0.4em]">Target_Node</label>
                    <div className="text-4xl font-black text-green-400 italic">{activeSolution.title}</div>
                </div>
                <div className="bg-green-500/5 border border-green-900 p-10">
                    <p className="text-[11px] text-green-700 font-bold mb-8 font-mono animate-pulse">&gt; INITIATING_LOCAL_BYPASS...</p>
                    <div className="text-base leading-loose font-mono text-gray-300 whitespace-pre-wrap">{activeSolution.solution}</div>
                </div>
            </div>
        </div>
      )}

      <Footer />
    </div>
  );
}