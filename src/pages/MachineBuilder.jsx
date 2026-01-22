import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DomainSelector from '../components/MachineBuilder/DomainSelector';
import ModuleList from '../components/MachineBuilder/ModuleList';
import MachineCanvas from '../components/MachineBuilder/MachineCanvas';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { domains, modulesByDomain } from '../utils/machineData';

export default function MachineBuilder() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedModules, setSelectedModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [machineName, setMachineName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    navigate('/login');
    return null;
  }

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
      alert('Please enter a machine name');
      return;
    }

    if (selectedModules.length === 0) {
      alert('Please add at least one module to your machine');
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
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(machineConfig),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Machine "${machineName}" created successfully!`);
        // Reset form
        setMachineName('');
        setSelectedModules([]);
        setSelectedDomain(null);
      } else {
        alert(data.message || 'Failed to create machine');
      }
    } catch (error) {
      console.error('Error creating machine:', error);
      alert('An error occurred while creating the machine');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-green-400 text-xl">Loading...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-black min-h-screen text-green-400 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-mono text-center mb-2">
              MACHINE<span className="text-white"> BUILDER</span>
              <span className="text-green-500 blinking">_</span>
            </h1>
            <p className="text-center text-green-300 font-mono">
              Build your own vulnerable cybersecurity machine
            </p>
          </div>

          {/* Machine Name Input */}
          <div className="mb-6 max-w-2xl mx-auto">
            <div className="bg-gray-900 border border-green-500 p-4 rounded">
              <label className="block text-green-300 font-mono mb-2">Machine Name</label>
              <input
                type="text"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                placeholder="Enter machine name..."
                className="w-full bg-black text-green-400 border border-green-500 px-4 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Step 1: Domain Selection */}
          <DomainSelector
            domains={domains}
            selectedDomain={selectedDomain}
            onSelectDomain={setSelectedDomain}
          />

          {/* Step 2 & 3: Module Selection and Canvas */}
          {selectedDomain && (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Module List */}
                <ModuleList
                  modules={modulesByDomain[selectedDomain] || []}
                  domainName={domains.find(d => d.id === selectedDomain)?.name}
                />

                {/* Machine Canvas */}
                <MachineCanvas
                  selectedModules={selectedModules}
                  onRemoveModule={handleRemoveModule}
                  machineName={machineName}
                  onCreateMachine={handleCreateMachine}
                  isCreating={isCreating}
                />
              </div>

              {/* Drag Overlay */}
              <DragOverlay>
                {activeModule ? (
                  <div className="bg-gray-800 border-2 border-green-500 p-4 rounded shadow-lg opacity-80">
                    <h4 className="font-mono font-bold text-green-400">{activeModule.name}</h4>
                    <p className="text-sm text-green-300 font-mono">{activeModule.description}</p>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}

          {!selectedDomain && (
            <div className="text-center mt-12 text-green-300 font-mono">
              <p>👆 Select a domain to start building your machine</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
