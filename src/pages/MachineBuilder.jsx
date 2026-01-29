import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Terminal, Shield, Cpu, Activity, Zap, Box, Layout, Database, Code, TerminalSquare, Info, Crosshair, CpuIcon, X, AlertCircle, CheckCircle } from 'lucide-react';

// Components & Data
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DomainSelector from '../components/MachineBuilder/DomainSelector';
import ModuleList from '../components/MachineBuilder/ModuleList';
import MachineCanvas from '../components/MachineBuilder/MachineCanvas';
import { domains, modulesByDomain } from '../utils/machineData';

export default function MachineBuilder() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // -- Notification State --
  const [notification, setNotification] = useState(null);

  // -- Logic State (UNTOUCHED) --
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedModules, setSelectedModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [machineName, setMachineName] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  if (!isLoading && !isAuthenticated) {
    navigate('/login');
    return null;
  }

  // -- Custom Alert Trigger --
  const triggerAlert = (title, message, type = 'error') => {
    setNotification({ title, message, type });
    // Auto-dismiss after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  // -- Handlers (UPDATED WITH TACTICAL ALERTS) --
  const handleDragStart = (event) => {
    const moduleId = event.active.id;
    const module = modulesByDomain[selectedDomain]?.find(m => m.id === moduleId);
    setActiveModule(module);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && over.id === 'machine-canvas') {
      const moduleId = active.id;
      const module = modulesByDomain[selectedDomain]?.find(m => m.id === moduleId);
      if (module && !selectedModules.find(m => m.id === module.id)) {
        setSelectedModules([...selectedModules, module]);
      }
    }
    setActiveModule(null);
  };

  const handleRemoveModule = (moduleId) => {
    setSelectedModules(selectedModules.filter(m => m.id !== moduleId));
  };

  const handleCreateMachine = async () => {
    if (!machineName.trim()) {
      triggerAlert('VALIDATION_FAILED', 'Machine identifier tag is required for deployment.');
      return;
    }
    if (selectedModules.length === 0) {
      triggerAlert('VALIDATION_FAILED', 'Architecture requires at least one functional module.');
      return;
    }

    setIsCreating(true);
    try {
      const machineConfig = {
        name: machineName,
        domain: selectedDomain,
        modules: selectedModules.map(m => m.id),
        status: 'created'
      };

      const response = await fetch('/api/machines/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(machineConfig),
      });

      const data = await response.json();

      if (data.success) {
        triggerAlert('DEPLOYMENT_SUCCESS', `Node "${machineName}" is now broadcasting on the grid.`, 'success');
        setMachineName('');
        setSelectedModules([]);
        setSelectedDomain(null);
      } else {
        triggerAlert('COMPILATION_ERROR', data.message || 'System was unable to link the modules.');
      }
    } catch (error) {
      console.error('Error:', error);
      triggerAlert('CRITICAL_SYSTEM_FAILURE', 'The neural link was severed during compilation.');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin shadow-[0_0_15px_#22c55e]" />
            <p className="text-green-500 text-xl animate-pulse tracking-[0.5em] uppercase glow-text">Booting_System</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-green-400 font-mono overflow-x-hidden selection:bg-green-500/30">
      <Navbar />

      {/* 0. TACTICAL ALERT OVERLAY */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className={`fixed top-24 right-6 z-[9999] w-80 p-4 border-l-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-md 
              ${notification.type === 'success' ? 'bg-green-950/80 border-green-500 shadow-green-500/20' : 'bg-red-950/80 border-red-500 shadow-red-500/20'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {notification.type === 'success' ? <CheckCircle size={18} className="text-green-400" /> : <AlertCircle size={18} className="text-red-400" />}
                <span className={`text-xs font-black tracking-tighter ${notification.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  [{notification.title}]
                </span>
              </div>
              <button onClick={() => setNotification(null)} className="text-white/20 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className={`mt-3 text-xs leading-relaxed font-bold ${notification.type === 'success' ? 'text-green-100' : 'text-red-100'}`}>
              &gt; {notification.message}
            </div>
            <div className="mt-4 h-0.5 w-full bg-white/5 overflow-hidden">
               <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className={`h-full ${notification.type === 'success' ? 'bg-green-400' : 'bg-red-400'}`}
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 1. HUD HEADER */}
      <div className="sticky top-0 z-50 bg-black/90 border-b border-green-900/50 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-10">
            <div className="flex flex-col border-l-2 border-green-500 pl-4 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <span className="text-[10px] text-green-700 font-black uppercase tracking-widest leading-none mb-1 italic">Active_Node</span>
              <span className="text-sm font-bold text-green-100 tracking-tight glow-text">{machineName || 'AWAITING_ID'}</span>
            </div>
            <div className="hidden lg:flex gap-8 border-l border-green-900/30 pl-8">
              <ProgressBadge step="01" label="ID" active={!!machineName} />
              <ProgressBadge step="02" label="ENV" active={!!selectedDomain} />
              <ProgressBadge step="03" label="ARCH" active={selectedModules.length > 0} />
            </div>
          </div>
          
          <button
            onClick={handleCreateMachine}
            disabled={isCreating}
            className="group relative bg-green-500 hover:bg-white text-black px-10 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-30 overflow-hidden"
          >
            <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[45deg] -translate-x-full group-hover:animate-shine pointer-events-none" />
            {isCreating ? <Activity className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
            Compile_Node
          </button>
        </div>
      </div>

      <main className="container mx-auto px-6 py-12">
        
        {/* PHASE 1: INITIALIZATION */}
        <section className="grid grid-cols-12 gap-10 mb-20 items-start">
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <div className="flex items-center gap-4 text-green-500">
              <TerminalSquare size={20} className="drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"/>
              <h2 className="text-xs font-black tracking-[0.4em] uppercase underline decoration-green-900 underline-offset-8">01_Identification</h2>
              <div className="flex-1 h-px bg-green-900/40" />
            </div>
            
            <input
              type="text"
              value={machineName}
              onChange={(e) => setMachineName(e.target.value)}
              placeholder="ENTER_NODE_NAME..."
              className="w-full bg-black border-b border-green-900/50 px-2 py-5 text-3xl focus:outline-none focus:border-green-400 transition-all placeholder:text-green-950 font-bold text-green-100 drop-shadow-[0_0_5px_rgba(34,197,94,0.2)]"
            />

            <div className="bg-green-500/5 border border-green-900/30 p-6 rounded-sm shadow-inner glow-card">
               <h3 className="text-[10px] font-black mb-5 tracking-[0.2em] text-green-700 uppercase">System_Telemetry</h3>
               <div className="space-y-5">
                  <StatBar label="Complexity" value={selectedModules.length * 20} color="green" />
                  <StatBar label="Neural_Load" value={machineName.length > 0 ? 100 : 0} color="green" />
               </div>
            </div>
          </div>

          {/* SECTION 2: GLOWING SECTOR SELECTOR */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <div className="flex items-center gap-4 text-green-500">
              <Shield size={20} className="drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"/>
              <h2 className="text-xs font-black tracking-[0.4em] uppercase underline decoration-green-900 underline-offset-8">02_Sector_Select</h2>
              <div className="flex-1 h-px bg-green-900/40" />
            </div>
            <div className="relative p-6 rounded-sm bg-[#030508] border border-green-900/20 shadow-[inset_0_0_50px_rgba(0,0,0,1)] 
                            [&_.domain-card]:border-green-900/40 [&_.domain-card]:bg-black/40 [&_.domain-card]:backdrop-blur-sm [&_.domain-card]:transition-all
                            [&_.domain-card:hover]:shadow-[0_0_20px_rgba(34,197,94,0.3)] [&_.domain-card:hover]:border-green-500
                            [&_.domain-card.selected]:shadow-[0_0_35px_rgba(34,197,94,0.6)] [&_.domain-card.selected]:border-green-400 [&_.domain-card.selected]:bg-green-500/10">
              <DomainSelector
                domains={domains}
                selectedDomain={selectedDomain}
                onSelectDomain={setSelectedDomain}
              />
            </div>
          </div>
        </section>

        {/* PHASE 3: ARCHITECTURE (Locked Heights) */}
        <AnimatePresence>
          {selectedDomain && (
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 text-green-500">
                <Layout size={20} className="drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"/>
                <h2 className="text-xs font-black tracking-[0.4em] uppercase underline decoration-green-900 underline-offset-8">03_Tactical_Workbench</h2>
                <div className="flex-1 h-px bg-green-900/40" />
              </div>
              
              <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex flex-col xl:flex-row gap-8 xl:h-[750px] items-stretch">
                  
                  {/* Inventory Sidebar */}
                  <div className="w-full xl:w-80 flex flex-col border border-green-900/50 bg-black shadow-2xl h-[500px] xl:h-full glow-card">
                    <div className="p-4 border-b border-green-900/50 bg-green-900/10 flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-widest text-green-400 glow-text">Inventory</span>
                      <Box size={16} className="text-green-500 opacity-50" />
                    </div>
                    <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-transparent to-green-950/10">
                      <ModuleList
                        modules={modulesByDomain[selectedDomain] || []}
                        domainName={domains.find(d => d.id === selectedDomain)?.name}
                      />
                    </div>
                  </div>

                  {/* VIRTUAL TERMINAL CANVAS */}
                  <div className="flex-1 relative border-2 border-green-900/30 rounded-lg bg-[#010101] overflow-hidden group shadow-[inset_0_0_100px_rgba(0,0,0,1)] h-[600px] xl:h-full">
                    
                    <div className="absolute inset-0 opacity-10 pointer-events-none font-mono text-[8px] leading-tight p-4 overflow-hidden select-none">
                      <div className="animate-pulse mb-2 text-green-400 tracking-[0.2em] font-bold underline">TERMINAL_DEBUG_STREAM</div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-green-900">
                        {Array.from({length: 400}).map((_, i) => (
                          <span key={i}>0x{Math.floor(Math.random()*0xFFFFFF).toString(16).toUpperCase()}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-[size:32px_32px]" />
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-green-500/30 m-3 rounded-tl-lg pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-green-500/30 m-3 rounded-br-lg pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-green-500/10 animate-scanline pointer-events-none shadow-[0_0_15px_rgba(34,197,94,0.5)] z-20" />

                    <div className="relative z-10 w-full h-full p-6 overflow-y-auto custom-scrollbar">
                      <MachineCanvas
                        selectedModules={selectedModules}
                        onRemoveModule={handleRemoveModule}
                        machineName={machineName}
                        onCreateMachine={handleCreateMachine}
                        isCreating={isCreating}
                      />
                    </div>

                    <div className="absolute bottom-4 left-6 right-6 pointer-events-none flex justify-between items-end opacity-40">
                      <div className="text-[9px] uppercase tracking-tighter italic">
                        <p className="text-green-400 font-bold glow-text">STATE: BUILDING_INTEGRITY_STABLE</p>
                        <p className="text-green-900 mt-1 font-mono tracking-widest">COORD: [42.109 // -71.021]</p>
                      </div>
                      <Database className="text-green-500 animate-pulse" size={18} />
                    </div>
                  </div>
                </div>

                <DragOverlay dropAnimation={null}>
                  {activeModule && (
                    <div className="bg-green-500 text-black px-6 py-4 font-black uppercase text-sm shadow-[0_0_50px_#22c55e] border-2 border-white rotate-2 backdrop-blur-sm flex items-center gap-3">
                      <CpuIcon size={18} />
                      {activeModule.name}
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      
      <Footer />

      <style>{`
        .glow-text { text-shadow: 0 0 10px rgba(34, 197, 94, 0.5); }
        .glow-card { box-shadow: 0 0 20px rgba(34, 197, 94, 0.05); }

        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #064e3b; border-radius: 10px; border: 1px solid #065f46; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
        
        @keyframes scanline {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(800px); opacity: 0; }
        }
        .animate-scanline { animation: scanline 10s linear infinite; }

        @keyframes shine {
          to { transform: skewX(45deg) translate(200%); }
        }
        .animate-shine { animation: shine 1.5s infinite; }
        
        body::after {
          content: ""; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px);
          pointer-events: none; z-index: 999; opacity: 0.4;
        }
      `}</style>
    </div>
  );
}

function ProgressBadge({ step, label, active }) {
  return (
    <div className={`flex items-center gap-2.5 transition-all duration-700 ${active ? 'text-green-400 opacity-100' : 'text-green-900 opacity-30'}`}>
      <span className={`text-[9px] border border-current px-2 font-black leading-none py-1 drop-shadow-[0_0_8px_#22c55e]`}>{step}</span>
      <span className="text-[11px] font-black uppercase tracking-[0.2em] glow-text">{label}</span>
    </div>
  );
}

function StatBar({ label, value, color }) {
  const barColor = color === 'green' ? 'bg-green-500 shadow-[0_0_12px_#22c55e]' : 'bg-red-500 shadow-[0_0_12px_#ef4444]';
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[9px] font-black tracking-widest uppercase opacity-70 italic">
        <span className="flex items-center gap-1.5 glow-text"><Activity size={10}/> {label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1 bg-black border border-green-900/30 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(value, 100)}%` }} className={`h-full ${barColor}`} />
      </div>
    </div>
  );
}