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

  // --- NEW NOTIFICATION STATES ---
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, machineId: null });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

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
      const response = await fetch('/api/machines/my-machines', { credentials: 'include' });
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

  // --- IMPROVED DELETE LOGIC ---
  const handleDeleteMachine = async (machineId) => {
    try {
      const response = await fetch(`/api/machines/${machineId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setMachines(machines.filter(m => m._id !== machineId));
        showToast('SYSTEM: Machine deallocated successfully', 'success');
      } else {
        showToast(`ERROR: ${data.message}`, 'error');
      }
    } catch (error) {
      showToast('CRITICAL: An error occurred during deletion', 'error');
    } finally {
      setConfirmDelete({ show: false, machineId: null });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-400 border-green-500';
      case 'stopped': return 'text-gray-400 border-gray-500';
      case 'building': return 'text-yellow-400 border-yellow-500';
      case 'error': return 'text-red-400 border-red-500';
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
      <>
        <Navbar />
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-green-400 text-xl font-mono">INITIALIZING SYSTEM...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-black min-h-screen text-green-400 py-8 relative overflow-hidden">
        
        {/* --- CUSTOM TOAST NOTIFICATION --- */}
        {toast.show && (
          <div className={`fixed top-5 right-5 z-50 px-6 py-4 border-2 font-mono shadow-[0_0_15px_rgba(0,0,0,0.5)] animate-bounce-in ${
            toast.type === 'success' ? 'bg-black border-green-500 text-green-400' : 'bg-black border-red-500 text-red-400'
          }`}>
            <span className="mr-2">{toast.type === 'success' ? '✓' : '⚠'}</span>
            {toast.message}
          </div>
        )}

        {/* --- CUSTOM CONFIRM MODAL --- */}
        {confirmDelete.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border-2 border-red-500 p-8 max-w-sm w-full font-mono shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <h2 className="text-red-500 text-xl font-bold mb-4">CRITICAL ACTION</h2>
              <p className="text-gray-300 mb-6">Are you sure you want to permanently delete this machine? This cannot be undone.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => handleDeleteMachine(confirmDelete.machineId)}
                  className="flex-1 bg-red-600 text-black font-bold py-2 hover:bg-red-500 transition"
                >
                  DELETE
                </button>
                <button 
                  onClick={() => setConfirmDelete({ show: false, machineId: null })}
                  className="flex-1 border border-gray-500 text-gray-400 py-2 hover:bg-gray-800 transition"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold font-mono">
                MY MACHINES<span className="text-green-500 blinking">_</span>
              </h1>
              <p className="text-green-300 font-mono mt-2">Manage your created cybersecurity machines</p>
            </div>
            <Link to="/machine-builder" className="bg-green-600 text-black px-6 py-3 font-mono font-bold rounded hover:bg-green-500 transition shadow-lg">+ CREATE NEW MACHINE</Link>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded font-mono mb-6">
              {error}
            </div>
          )}

          {machines.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-gray-500 font-mono text-lg mb-4">No machines created yet</p>
              <Link to="/machine-builder" className="inline-block bg-green-600 text-black px-6 py-3 font-mono font-bold rounded hover:bg-green-500 transition">Create Your First Machine</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {machines.map((machine) => (
                <div key={machine._id} className="bg-gray-900 border border-green-600 rounded p-6 hover:shadow-lg hover:shadow-green-500/30 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getDomainIcon(machine.domain)}</span>
                        <h3 className="font-mono font-bold text-xl text-green-400 truncate">{machine.name}</h3>
                      </div>
                      <span className={`text-xs font-mono px-2 py-1 rounded border ${getStatusColor(machine.status)}`}>
                        {machine.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm font-mono mb-4">
                    <div><span className="text-gray-500">Domain:</span><span className="text-green-300 ml-2">{machine.domain.replace('_', ' ')}</span></div>
                    <div><span className="text-gray-500">Modules:</span><span className="text-green-300 ml-2">{machine.modules.length}</span></div>
                    <div><span className="text-gray-500">Created:</span><span className="text-green-300 ml-2">{new Date(machine.createdAt).toLocaleDateString()}</span></div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-gray-500 font-mono mb-2">Installed Modules:</div>
                    <div className="flex flex-wrap gap-2">
                      {machine.modules.slice(0, 3).map((module, idx) => (
                        <span key={idx} className="text-xs bg-gray-800 border border-green-700 text-green-300 px-2 py-1 rounded font-mono">{module}</span>
                      ))}
                      {machine.modules.length > 3 && <span className="text-xs text-gray-500 font-mono">+{machine.modules.length - 3} more</span>}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-700">
                    {machine.status === 'running' ? (
                      <Link to={`/solve/${machine._id}`} className="flex-1 bg-green-600 text-black text-center px-4 py-2 font-mono text-sm rounded hover:bg-green-500 transition font-bold">🚀 SOLVE LAB</Link>
                    ) : machine.status === 'building' ? (
                      <button disabled className="flex-1 bg-yellow-900/30 border border-yellow-500 text-yellow-400 px-4 py-2 font-mono text-sm rounded cursor-wait">⏳ Building...</button>
                    ) : machine.status === 'error' ? (
                      <button disabled className="flex-1 bg-red-900/30 border border-red-500 text-red-400 px-4 py-2 font-mono text-sm rounded cursor-not-allowed">❌ Build Failed</button>
                    ) : (
                      <button disabled className="flex-1 bg-gray-800 border border-gray-600 text-gray-500 px-4 py-2 font-mono text-sm rounded cursor-not-allowed">⏸️ Stopped</button>
                    )}
                    <button
                      onClick={() => setConfirmDelete({ show: true, machineId: machine._id })}
                      className="bg-red-900/30 border border-red-500 text-red-400 px-4 py-2 font-mono text-sm rounded hover:bg-red-900/50 transition"
                      title="Delete machine"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}