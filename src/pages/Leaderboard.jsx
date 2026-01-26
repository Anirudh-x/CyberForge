import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion'; 
import { Trophy, Shield, Cpu, Activity, Globe, Cloud, Search, Zap, Target, BarChart3, Award } from 'lucide-react';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('overall');

  const categories = [
    { id: 'overall', label: 'OVERALL', icon: <Trophy size={16}/>, endpoint: '/api/leaderboard/overall' },
    { id: 'web', label: 'WEB_APPS', icon: <Globe size={16}/>, endpoint: '/api/leaderboard/web' },
    { id: 'red_team', label: 'RED_TEAM', icon: <Zap size={16}/>, endpoint: '/api/leaderboard/red-team' },
    { id: 'blue_team', label: 'BLUE_TEAM', icon: <Shield size={16}/>, endpoint: '/api/leaderboard/blue-team' },
    { id: 'cloud', label: 'CLOUD_NET', icon: <Cloud size={16}/>, endpoint: '/api/leaderboard/cloud' },
    { id: 'forensics', label: 'FORENSICS', icon: <Search size={16}/>, endpoint: '/api/leaderboard/forensics' }
  ];

  useEffect(() => {
    fetchLeaderboard();
  }, [category]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError('');
    try {
      const selectedCategory = categories.find(c => c.id === category);
      const response = await fetch(selectedCategory.endpoint, { credentials: 'include' });
      const data = await response.json();
      if (data.success && data.leaderboard) {
        setLeaderboardData(data.leaderboard);
      } else {
        setError("SYNC_ERR: Protocol Handshake Failed");
      }
    } catch (error) {
      setError("SIGNAL_LOST: Uplink Interrupted");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#020202] min-h-screen text-green-400 font-mono selection:bg-green-500 selection:text-black">
      {/* HUD Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,#10b981_3px)]"></div>
      
      <Navbar />

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        {/* SECTION HEADER */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12 border-l-4 border-green-500 pl-6"
        >
          <div className="flex items-center gap-2 text-green-900 text-[10px] font-black tracking-[0.4em] uppercase mb-1">
            <Activity size={12} className="animate-pulse" /> Live_Telemetry_Active
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white leading-none">
            GLOBAL<span className="text-green-500 glow-text">_LEADERBOARD</span>
          </h1>
        </motion.div>
        
        {/* TACTICAL SELECTOR */}
        <div className="flex flex-wrap gap-2 mb-12 bg-zinc-950/50 p-2 border border-green-900/20 backdrop-blur-sm rounded-sm">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button" // Explicitly prevent form submission reloads
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2 text-[10px] font-black tracking-widest transition-all duration-500 border
                ${category === cat.id
                  ? 'bg-green-500 text-black border-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-transparent text-green-900 border-transparent hover:border-green-900 hover:text-green-400'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-96"
            >
              <div className="w-24 h-[2px] bg-green-900 relative overflow-hidden mb-4">
                <motion.div 
                  animate={{ x: [-100, 100] }} 
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="absolute inset-0 bg-green-400 shadow-[0_0_15px_#10b981]"
                />
              </div>
              <p className="text-[10px] tracking-[0.5em] animate-pulse">DECRYPTING_RANKS...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              className="text-center p-20 border border-red-900/50 bg-red-950/5 rounded-sm"
            >
              <ShieldAlert className="text-red-500 mx-auto mb-4 animate-bounce" size={48} />
              <h2 className="text-red-500 font-black uppercase tracking-widest">{error}</h2>
              <button type="button" onClick={fetchLeaderboard} className="mt-6 px-6 py-2 bg-red-500 text-black text-xs font-bold uppercase tracking-tighter hover:bg-white transition-all">Reconnect</button>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* PODIUM TOP 3 */}
              {leaderboardData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-20">
                  <PodiumCard player={leaderboardData[1]} rank={2} />
                  <PodiumCard player={leaderboardData[0]} rank={1} />
                  <PodiumCard player={leaderboardData[2]} rank={3} />
                </div>
              )}

              {/* TERMINAL LIST (Rank 4+) */}
              <div className="border border-green-900/20 bg-zinc-950/30 rounded-sm overflow-hidden backdrop-blur-md shadow-2xl">
                <div className="grid grid-cols-12 px-8 py-4 text-[9px] font-black text-green-900 tracking-[0.3em] border-b border-green-900/20 uppercase bg-black">
                  <div className="col-span-1">RNK</div>
                  <div className="col-span-6">OPERATOR_IDENTITY</div>
                  <div className="col-span-2 text-center">SOLVES</div>
                  <div className="col-span-3 text-right">XP_CREDITS</div>
                </div>

                <div className="divide-y divide-green-900/10">
                  {leaderboardData.slice(3).map((player, index) => (
                    <motion.div 
                      key={player.rank}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      className="grid grid-cols-12 items-center px-8 py-4 hover:bg-green-500/5 transition-colors group"
                    >
                      <div className="col-span-1 text-green-800 font-bold group-hover:text-green-400">#{player.rank}</div>
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-950 group-hover:bg-green-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] transition-all" />
                        <span className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-green-400">{player.team_name}</span>
                      </div>
                      <div className="col-span-2 text-center text-xs text-green-700 font-mono">{player.solvedCount}</div>
                      <div className="col-span-3 text-right text-lg font-black text-green-500 group-hover:glow-text transition-all">
                        {player.points.toLocaleString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />

      <style>{`
        .glow-text { text-shadow: 0 0 10px rgba(16, 185, 129, 0.6); }
        .custom-shadow { box-shadow: inset 0 0 20px rgba(16, 185, 129, 0.05); }
      `}</style>
    </div>
  );
}

function PodiumCard({ player, rank }) {
  if (!player) return <div className="h-40 bg-zinc-900/10 border border-zinc-900 border-dashed rounded-sm" />;
  
  const config = {
    1: { color: 'text-yellow-500', bg: 'bg-yellow-500/5', border: 'border-yellow-500/40', size: 'h-64' },
    2: { color: 'text-zinc-300', bg: 'bg-zinc-300/5', border: 'border-zinc-300/30', size: 'h-52' },
    3: { color: 'text-orange-600', bg: 'bg-orange-600/5', border: 'border-orange-600/20', size: 'h-48' }
  };

  const { color, bg, border, size } = config[rank];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`relative flex flex-col justify-end ${size} ${bg} ${border} border-2 rounded-sm p-6 group overflow-hidden`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
        <Trophy size={80} className={color} />
      </div>
      
      <div className={`text-4xl font-black italic mb-2 ${color} opacity-20 group-hover:opacity-100 transition-opacity`}>0{rank}</div>
      <div className="relative z-10">
        <h3 className="text-white text-xl font-black uppercase tracking-tighter mb-1 truncate">{player.team_name}</h3>
        <div className="flex justify-between items-end">
           <div className="text-[10px] font-bold text-green-900 tracking-widest uppercase">Credits_XP</div>
           <div className={`text-2xl font-black italic ${color}`}>{player.points.toLocaleString()}</div>
        </div>
      </div>
      
      {/* Decorative Progress bar under top names */}
      <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 w-full" />
    </motion.div>
  );
}