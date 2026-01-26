import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MyMachines() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      fetchMachines();
    }
  }, [isAuthenticated, isLoading, navigate]);

  const fetchMachines = async () => {
    try {
      const response = await fetch('/api/machines/my-machines', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setMachines(data.machines);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      setError('Failed to load machines');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMachine = async (machineId) => {
    if (!window.confirm('Are you sure you want to delete this machine?')) {
      return;
    }
    try {
      const response = await fetch(`/api/machines/${machineId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setMachines(machines.filter(m => m._id !== machineId));
        alert('Machine deleted successfully');
      } else {
        alert(data.message || 'Failed to delete machine');
      }
    } catch (error) {
      console.error('Error deleting machine:', error);
      alert('An error occurred while deleting the machine');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-400 border-green-500 shadow-[0_0_10px_#22c55e]';
      case 'stopped': return 'text-zinc-500 border-zinc-500';
      case 'building': return 'text-yellow-400 border-yellow-500 animate-pulse';
      case 'error': return 'text-red-500 border-red-500 shadow-[0_0_10px_#ef4444]';
      default: return 'text-blue-400 border-blue-500';
    }
  };

  const getDomainIcon = (domain) => {
    switch (domain) {
      case 'web': return '🌐';
      case 'red_team': return '⚔️';
      case 'blue_team': return '🛡️';
      case 'cloud': return '☁️';
      case 'forensics': return '🔍';
      default: return '📦';
    }
  };

  if (isLoading || loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-green-500 font-mono text-2xl animate-pulse">
          &gt; INITIALIZING_SYSTEM_MAPPING...
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-[#050505] min-h-screen text-green-400 font-mono relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none" />

        <div className="container mx-auto px-6 py-12 relative z-10">
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-green-900/50 pb-8">
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic">
                Active_Nodes<span className="text-white">.exe</span>
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-2 text-xs text-green-700 font-bold uppercase">
                   <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                   Uplink: Stable
                </span>
                <span className="text-xs text-zinc-600 font-bold uppercase">
                  Operator: {machines.length} Units Found
                </span>
              </div>
            </div>
            <Link
              to="/machine-builder"
              className="group relative overflow-hidden bg-green-600 text-black px-8 py-4 font-black uppercase transition-all hover:bg-green-400"
            >
              <span className="relative z-10">+ DEPLOY_NEW_UNIT</span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
          </div>

          {/* Machines Grid */}
          {error && (
            <div className="bg-red-950/30 border border-red-500 text-red-400 px-6 py-4 rounded-sm mb-8 flex items-center gap-3">
              <span className="text-xl">⚠️</span> {error}
            </div>
          )}

          {machines.length === 0 ? (
            <div className="text-center py-24 bg-zinc-950/50 border border-zinc-900 rounded-lg backdrop-blur-sm">
              <div className="text-8xl mb-6 opacity-20">📡</div>
              <p className="text-zinc-600 text-xl mb-8 uppercase tracking-widest">
                No active signals found in this sector
              </p>
              <Link
                to="/machine-builder"
                className="inline-block border-2 border-green-600 text-green-500 px-10 py-4 font-bold rounded hover:bg-green-600 hover:text-black transition-all"
              >
                INITIATE_FORGE
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {machines.map((machine) => (
                <div
                  key={machine._id}
                  className="group relative bg-[#0a0a0a] border border-green-900/50 p-1 transition-all hover:border-green-400"
                >
                  {/* Card Corner Decor */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="p-6 bg-zinc-950/40 h-full backdrop-blur-sm">
                    {/* Machine Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">
                            {getDomainIcon(machine.domain)}
                          </span>
                          <h3 className="font-black text-2xl text-white group-hover:text-green-400 transition-colors uppercase tracking-tighter truncate">
                            {machine.name}
                          </h3>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest bg-black ${getStatusColor(machine.status)}`}>
                          {machine.status}
                        </span>
                      </div>
                    </div>

                    {/* Machine Stats HUD */}
                    <div className="grid grid-cols-2 gap-4 mb-6 border-y border-zinc-900 py-4">
                      <div>
                        <div className="text-[10px] text-zinc-600 uppercase font-black">Sector</div>
                        <div className="text-sm text-green-100 italic uppercase">
                          {machine.domain.replace('_', ' ')}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-600 uppercase font-black">Architecture</div>
                        <div className="text-sm text-green-100">{machine.modules.length} Modules</div>
                      </div>
                    </div>

                    {/* Module Manifest */}
                    <div className="mb-8">
                      <div className="text-[10px] text-zinc-600 uppercase font-black mb-3">Module_Manifest</div>
                      <div className="flex flex-wrap gap-2">
                        {machine.modules.slice(0, 3).map((module, idx) => (
                          <span key={idx} className="text-[9px] bg-black border border-green-900 text-green-500 px-2 py-1 uppercase font-bold group-hover:border-green-600">
                            {module}
                          </span>
                        ))}
                        {machine.modules.length > 3 && (
                          <span className="text-[9px] text-zinc-600 font-bold self-center">
                            +{machine.modules.length - 3} OVERFLOW
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex gap-3">
                      {machine.status === 'running' ? (
                        <Link
                          to={`/solve/${machine._id}`}
                          className="flex-1 bg-green-600 text-black text-center py-3 font-black text-xs uppercase tracking-widest hover:bg-green-400 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                        >
                          SOLVE_LAB.exe
                        </Link>
                      ) : (
                        <div className="flex-1 bg-zinc-900 text-zinc-700 text-center py-3 font-black text-xs uppercase tracking-widest border border-zinc-800">
                          {machine.status === 'building' ? 'BUILDING...' : 'OFFLINE'}
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleDeleteMachine(machine._id)}
                        className="px-4 py-3 bg-red-950/20 border border-red-900/50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        title="Purge Node"
                      >
                        PURGE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      
      {/* Global CSS for animations */}
      <style>{`
        .blinking {
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </>
  );
}