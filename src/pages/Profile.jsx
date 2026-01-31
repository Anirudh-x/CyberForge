import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Profile() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const { teamName } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (teamName) {
      if (isAuthenticated && user && user.teamName === teamName) {
        setIsOwnProfile(true);
      } else {
        setIsOwnProfile(false);
      }
      fetchProfile();
    } else {
      if (!isLoading && !isAuthenticated) {
        navigate('/login');
        return;
      }
      if (isAuthenticated) {
        setIsOwnProfile(true);
        fetchProfile();
      }
    }
  }, [isAuthenticated, isLoading, navigate, teamName, user]);

  const fetchProfile = async () => {
    try {
      const useAuthEndpoint = !teamName || (isAuthenticated && user && user.teamName === teamName);
      const endpoint = useAuthEndpoint ? '/api/auth/profile' : `/api/auth/profile/${teamName}`;
      const response = await fetch(endpoint, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        setFormData({
          github: data.profile.github || '',
          field: data.profile.field || 'Red Teaming',
          callsign: data.profile.callsign || '',
          primaryOS: data.profile.primaryOS || 'Kali Linux',
          bio: data.profile.bio || '',
          yearsOfExperience: data.profile.yearsOfExperience || '',
          certifications: data.profile.certifications || '',
          linkedin: data.profile.linkedin || '',
          favoriteTools: data.profile.favoriteTools || ''
        });
        if (isOwnProfile && !data.profile.callsign && !data.profile.bio) {
          setEditing(true);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setEditing(isOwnProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        await fetchProfile();
        setEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to update profile: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#020202]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] text-green-500 font-mono tracking-[0.5em]">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent animate-spin mb-4"></div>
          SYNCING_PERSONNEL_DATA...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-green-400 font-mono selection:bg-green-500 selection:text-black">
      <style>{`
        @keyframes scanline { 0% { bottom: 100%; } 100% { bottom: 0%; } }
        .hud-bracket { position: absolute; width: 20px; height: 20px; border-color: #22c55e; border-style: solid; }
        .dossier-grid { background-image: radial-gradient(circle, #166534 1px, transparent 1px); background-size: 30px 30px; }
      `}</style>
      
      <Navbar />

      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-10">
        <div className="absolute w-full h-[1px] bg-green-500 animate-[scanline_10s_linear_infinite]"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          
          {saveSuccess && (
            <div className="fixed top-24 right-8 z-[100] bg-black border-2 border-green-500 p-4 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-bounce">
              <p className="text-green-400 font-bold tracking-widest text-xs uppercase">✓ System: Profile Re-Authorised</p>
            </div>
          )}

          {!isOwnProfile && (
            <div className="mb-6 bg-blue-950/30 border-2 border-blue-500 p-4">
              <p className="text-blue-400 font-mono text-center font-bold tracking-wider">
                👁️ VIEWING PUBLIC DOSSIER - READ-ONLY MODE
              </p>
            </div>
          )}

          <div className="relative border-2 border-green-600 bg-black/40 backdrop-blur-md p-8 mb-10 overflow-hidden">
            <div className="hud-bracket top-0 left-0 border-t-4 border-l-4"></div>
            <div className="hud-bracket bottom-0 right-0 border-b-4 border-r-4"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="flex gap-8 items-center">
                <div className="w-24 h-24 bg-green-900/20 border-2 border-green-500 flex items-center justify-center text-4xl grayscale hover:grayscale-0 transition-all">
                  👤
                </div>
                <div>
                  <div className="text-[10px] text-green-700 font-black tracking-[0.4em] mb-1">OPERATOR_ID://{profile?.teamName?.toUpperCase()}</div>
                  <h1 className="text-5xl font-black text-white italic tracking-tighter mb-2">
                    {editing ? "MODIFYING_INTEL" : (profile?.callsign || "UNASSIGNED")}
                  </h1>
                  <div className="flex gap-4">
                    <span className="text-[10px] bg-green-600 text-black px-2 py-0.5 font-black uppercase tracking-widest">Clearance: LVL_01</span>
                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest border border-green-900 px-2 py-0.5">Status: Active</span>
                  </div>
                </div>
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setEditing(!editing)}
                  className={`px-8 py-3 font-black text-sm tracking-widest transition-all ${
                    editing ? 'bg-red-900/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white' 
                      : 'bg-green-600 text-black hover:bg-green-500'
                  }`}
                >
                  {editing ? 'ABORT_EDIT' : 'MODIFY_INTEL'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 border-t border-green-900 pt-8">
              {[
                { label: 'TOTAL_SCORE', val: profile?.totalPoints || 0 },
                { label: 'VULNS_SECURED', val: profile?.solvedVulnerabilities?.length || 0 },
                { label: 'MACHINES_PWNED', val: profile?.solvedMachines?.length || 0 },
                { label: 'UPLINK_DATE', val: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A' }
              ].map((stat, i) => (
                <div key={i} className="bg-green-500/5 border border-green-900/40 p-4 group hover:border-green-500 transition-all">
                  <div className="text-[9px] text-green-800 font-black mb-1 group-hover:text-green-500">{stat.label}</div>
                  <div className="text-3xl font-black text-white italic tracking-tighter">{stat.val}</div>
                </div>
              ))}
            </div>
          </div>

          {!editing || !isOwnProfile ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
              <div className="lg:col-span-2 space-y-8">
                <div className="border border-green-900 bg-black/60 p-8 relative">
                  <div className="text-xs text-green-700 font-bold mb-6 tracking-[0.3em] uppercase underline decoration-green-900 underline-offset-8">Target_Specialization</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#080808] border-l-4 border-green-500 p-5">
                      <div className="text-[9px] text-green-800 uppercase font-black mb-1">Primary_Focus</div>
                      <div className="text-xl font-bold text-white uppercase italic">{profile?.field || 'N/A'}</div>
                    </div>
                    <div className="bg-[#080808] border-l-4 border-green-500 p-5">
                      <div className="text-[9px] text-green-800 uppercase font-black mb-1">Operating_Environment</div>
                      <div className="text-xl font-bold text-white uppercase italic">{profile?.primaryOS || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div className="border border-green-900 bg-black/60 p-8">
                  <div className="text-xs text-green-700 font-bold mb-6 tracking-[0.3em] uppercase underline decoration-green-900 underline-offset-8">Operator_Bio_Signature</div>
                  <p className="text-gray-400 leading-relaxed italic text-lg border-l border-green-900 pl-6">
                    {profile?.bio || "No data signature found in archives."}
                  </p>
                </div>

                {(profile?.yearsOfExperience || profile?.certifications || profile?.favoriteTools) && (
                  <div className="border border-green-900 bg-black/60 p-8">
                    <div className="text-xs text-green-700 font-bold mb-6 tracking-[0.3em] uppercase underline decoration-green-900 underline-offset-8">Additional_Intel</div>
                    <div className="space-y-4">
                      {profile?.yearsOfExperience && (
                        <div className="flex gap-4 items-center">
                          <span className="text-green-800 text-xs font-black uppercase w-32">Experience:</span>
                          <span className="text-white font-bold">{profile.yearsOfExperience}</span>
                        </div>
                      )}
                      {profile?.certifications && (
                        <div className="flex gap-4 items-start">
                          <span className="text-green-800 text-xs font-black uppercase w-32">Certs:</span>
                          <span className="text-white font-bold">{profile.certifications}</span>
                        </div>
                      )}
                      {profile?.favoriteTools && (
                        <div className="flex gap-4 items-start">
                          <span className="text-green-800 text-xs font-black uppercase w-32">Tools:</span>
                          <span className="text-white font-bold">{profile.favoriteTools}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                {/* FIXED LINK BOX */}
                <div className="border border-green-900 bg-[#080808] p-8 flex flex-col items-center justify-center text-center overflow-hidden">
                  <div className="text-[9px] text-green-800 font-black uppercase mb-4 tracking-widest">Remote_Uplink</div>
                  <div className="text-4xl mb-4 opacity-40">🐙</div>
                  {profile?.github ? (
                    <a 
                      href={`https://github.com/${profile.github}`} 
                      target="_blank" rel="noopener noreferrer"
                      className="text-white font-black text-xl hover:text-green-500 transition-colors uppercase italic border-b-2 border-green-900 pb-1 break-all max-w-full block"
                    >
                      @{profile.github}
                    </a>
                  ) : (
                    <span className="text-gray-600 font-black text-xl uppercase italic">NO_LINK</span>
                  )}
                </div>

                {profile?.linkedin && (
                  <div className="border border-green-900 bg-[#080808] p-8 flex flex-col items-center justify-center text-center overflow-hidden">
                    <div className="text-[9px] text-green-800 font-black uppercase mb-4 tracking-widest">Professional_Network</div>
                    <div className="text-4xl mb-4 opacity-40">💼</div>
                    <a 
                      href={`https://linkedin.com/in/${profile.linkedin}`} 
                      target="_blank" rel="noopener noreferrer"
                      className="text-white font-black text-xl hover:text-green-500 transition-colors uppercase italic border-b-2 border-green-900 pb-1 break-all max-w-full block"
                    >
                      {profile.linkedin}
                    </a>
                  </div>
                )}

                <div className="border border-green-900 bg-black/60 p-8">
                  <div className="text-xs text-green-700 font-bold mb-6 tracking-[0.3em] uppercase underline decoration-green-900 underline-offset-8">Expertise_Levels</div>
                  <div className="space-y-4">
                    {[
                      { l: 'RED', v: profile?.redTeamPoints, c: 'bg-red-600' },
                      { l: 'BLUE', v: profile?.blueTeamPoints, c: 'bg-blue-600' },
                      { l: 'WEB', v: profile?.webPoints, c: 'bg-purple-600' },
                      { l: 'CLOUD', v: profile?.cloudPoints, c: 'bg-cyan-600' },
                      { l: 'FORENSICS', v: profile?.forensicsPoints, c: 'bg-yellow-600' },
                    ].map((d, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-16 text-[9px] font-black text-green-900 uppercase">{d.l}</div>
                        <div className="flex-1 h-1 bg-green-900/30">
                          <div className={`h-full ${d.c} shadow-[0_0_10px_currentColor]`} style={{ width: `${Math.min((d.v || 0) / 10, 100)}%` }}></div>
                        </div>
                        <div className="text-xs font-bold text-white min-w-[30px]">{d.v || 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-green-600 bg-[#080808] p-10 animate-[fade-in-up_0.5s] relative shadow-[0_0_50px_rgba(0,0,0,1)]">
              <div className="hud-bracket top-0 left-0 border-t-2 border-l-2"></div>
              <div className="hud-bracket bottom-0 right-0 border-b-2 border-r-2"></div>
              
              <h2 className="text-3xl font-black text-white mb-10 italic uppercase tracking-tighter border-b border-green-900 pb-4">Modify_Intel_Parameters</h2>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="relative">
                  <label className="text-[10px] uppercase text-green-800 font-black mb-3 block tracking-widest">[01] OPERATOR_CALLSIGN</label>
                  <div className="flex items-center border-b border-green-900 focus-within:border-green-400 transition-all pb-2">
                    <span className="text-green-900 font-bold mr-3 opacity-40">~$</span>
                    <input
                      type="text"
                      value={formData.callsign}
                      onChange={(e) => setFormData({ ...formData, callsign: e.target.value })}
                      className="w-full bg-transparent text-green-400 outline-none placeholder:text-green-900 font-bold"
                      placeholder="ENTER_NEW_ALIAS"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[10px] uppercase text-green-800 font-black mb-3 block tracking-widest">[02] GITHUB_UPLINK</label>
                  <div className="flex items-center border-b border-green-900 focus-within:border-green-400 transition-all pb-2">
                    <span className="text-green-900 font-bold mr-3 opacity-40">@</span>
                    <input
                      type="text"
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      className="w-full bg-transparent text-green-400 outline-none placeholder:text-green-900 font-bold"
                      placeholder="GITHUB_HANDLE"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[10px] uppercase text-green-800 font-black mb-3 block tracking-widest">[03] SYSTEM_SPECIALIZATION</label>
                  <select
                    value={formData.field}
                    onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                    className="w-full bg-black border border-green-900 text-green-400 p-4 font-black outline-none focus:border-green-400 appearance-none"
                  >
                    <option value="Red Teaming">RED_TEAMING</option>
                    <option value="Blue Teaming">BLUE_TEAMING</option>
                    <option value="Web Security">WEB_SECURITY</option>
                    <option value="Cloud Security">CLOUD_SECURITY</option>
                    <option value="Forensics">FORENSICS</option>
                    <option value="Social Engineering">SOCIAL_ENGINEERING</option>
                    <option value="General Security">GENERAL_OPS</option>
                  </select>
                </div>

                <div className="relative">
                  <label className="text-[10px] uppercase text-green-800 font-black mb-3 block tracking-widest">[04] PRIMARY_KERNEL</label>
                  <select
                    value={formData.primaryOS}
                    onChange={(e) => setFormData({ ...formData, primaryOS: e.target.value })}
                    className="w-full bg-black border border-green-900 text-green-400 p-4 font-black outline-none focus:border-green-400 appearance-none"
                  >
                    <option value="Kali Linux">KALI_LINUX</option>
                    <option value="Parrot OS">PARROT_OS</option>
                    <option value="Ubuntu">UBUNTU</option>
                    <option value="Windows">WINDOWS_SYSTEM</option>
                    <option value="macOS">MACOS_PLATFORM</option>
                    <option value="Arch Linux">ARCH_LINUX</option>
                  </select>
                </div>

                <div className="md:col-span-2 relative">
                  <label className="text-[10px] uppercase text-green-800 font-black mb-3 block tracking-widest">[05] PERSONAL_MANIFESTO</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows="4"
                    className="w-full bg-transparent border border-green-900 text-green-400 p-5 outline-none focus:border-green-500 font-medium h-32 resize-none"
                    placeholder="Enter operator bio and mission statement..."
                  />
                </div>

                <div className="relative">
                  <label className="text-[10px] uppercase text-green-800 font-black mb-3 block tracking-widest">[06] YEARS_EXPERIENCE</label>
                  <select
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    className="w-full bg-black border border-green-900 text-green-400 p-4 font-black outline-none focus:border-green-400 appearance-none"
                  >
                    <option value="">SELECT_LEVEL</option>
                    <option value="0-1">BEGINNER (0-1 YEARS)</option>
                    <option value="1-3">INTERMEDIATE (1-3 YEARS)</option>
                    <option value="3-5">ADVANCED (3-5 YEARS)</option>
                    <option value="5+">EXPERT (5+ YEARS)</option>
                  </select>
                </div>

                <div className="relative">
                  <label className="text-[10px] uppercase text-green-800 font-black mb-3 block tracking-widest">[07] CERTIFICATIONS</label>
                  <div className="flex items-center border-b border-green-900 focus-within:border-green-400 transition-all pb-2">
                    <span className="text-green-900 font-bold mr-3 opacity-40">🎓</span>
                    <input
                      type="text"
                      value={formData.certifications}
                      onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                      className="w-full bg-transparent text-green-400 outline-none placeholder:text-green-900 font-bold"
                      placeholder="OSCP, CEH, CISSP..."
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[10px] uppercase text-green-800 font-black mb-3 block tracking-widest">[08] LINKEDIN_PROFILE</label>
                  <div className="flex items-center border-b border-green-900 focus-within:border-green-400 transition-all pb-2">
                    <span className="text-green-900 font-bold mr-3 opacity-40">💼</span>
                    <input
                      type="text"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full bg-transparent text-green-400 outline-none placeholder:text-green-900 font-bold"
                      placeholder="LINKEDIN_USERNAME"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[10px] uppercase text-green-800 font-black mb-3 block tracking-widest">[09] FAVORITE_TOOLS</label>
                  <div className="flex items-center border-b border-green-900 focus-within:border-green-400 transition-all pb-2">
                    <span className="text-green-900 font-bold mr-3 opacity-40">🛠️</span>
                    <input
                      type="text"
                      value={formData.favoriteTools}
                      onChange={(e) => setFormData({ ...formData, favoriteTools: e.target.value })}
                      className="w-full bg-transparent text-green-400 outline-none placeholder:text-green-900 font-bold"
                      placeholder="NMAP, BURP, METASPLOIT..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="md:col-span-2 group relative h-16 bg-green-600 overflow-hidden font-black text-black text-xl tracking-[0.5em] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                  COMMIT_CHANGES_
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}