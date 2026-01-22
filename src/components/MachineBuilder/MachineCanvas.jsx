import { useDroppable } from '@dnd-kit/core';
import { getDifficultyColor } from '../../utils/machineData';

export default function MachineCanvas({ selectedModules, onRemoveModule, machineName, onCreateMachine, isCreating }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'machine-canvas',
  });

  // Calculate total machine points
  const totalPoints = selectedModules.reduce((sum, module) => sum + (module.points || 0), 0);

  return (
    <div className="bg-gray-900 border border-green-600 rounded p-4 min-h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold font-mono text-green-400">
          STEP 3: MACHINE CANVAS
        </h2>
        {selectedModules.length > 0 && (
          <div className="bg-green-900 border-2 border-green-400 px-4 py-2 rounded">
            <span className="text-sm font-mono text-gray-400">Total Points:</span>
            <span className="text-2xl font-bold font-mono text-green-300 ml-2">{totalPoints}</span>
          </div>
        )}
      </div>
      
      <div
        ref={setNodeRef}
        className={`
          flex-1 border-2 border-dashed rounded p-4 transition-all
          ${isOver 
            ? 'border-green-400 bg-green-900/20' 
            : 'border-gray-700 bg-black/50'
          }
        `}
      >
        {selectedModules.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div className="text-gray-500 font-mono">
              <div className="text-4xl mb-4">📦</div>
              <p>Drag modules here to build your machine</p>
              <p className="text-xs mt-2">Drop zone {isOver && '(Drop now!)'}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-green-300 font-mono mb-2 flex justify-between items-center">
              <span>Selected Modules ({selectedModules.length}):</span>
              <span className="text-green-400 font-bold">{totalPoints} total points</span>
            </div>
            {selectedModules.map((module, index) => {
              const difficultyColor = getDifficultyColor(module.difficulty);
              return (
                <div
                  key={`${module.id}-${index}`}
                  className={`
                    bg-gray-800 border-2 ${difficultyColor} p-3 rounded
                    flex justify-between items-center
                  `}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-mono font-bold text-green-400 text-sm">
                        {module.name}
                      </h4>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-green-900 text-green-300 border border-green-500">
                        {module.points} PTS
                      </span>
                    </div>
                    <p className="text-xs text-green-300 font-mono">
                      {module.description}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveModule(module.id)}
                    className="ml-4 text-red-400 hover:text-red-300 font-mono text-sm px-2 py-1 border border-red-500 rounded hover:bg-red-900/20 transition"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Machine Button */}
      <div className="mt-4 pt-4 border-t border-green-600">
        <button
          onClick={onCreateMachine}
          disabled={isCreating || selectedModules.length === 0 || !machineName.trim()}
          className={`
            w-full py-3 font-mono font-bold rounded transition-all
            ${isCreating || selectedModules.length === 0 || !machineName.trim()
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-black hover:bg-green-500 shadow-lg shadow-green-500/50'
            }
          `}
        >
          {isCreating ? '⏳ Creating Machine...' : '🚀 CREATE MACHINE'}
        </button>
        
        {selectedModules.length === 0 && (
          <p className="text-xs text-red-400 font-mono mt-2 text-center">
            Add at least one module to create a machine
          </p>
        )}
        {!machineName.trim() && selectedModules.length > 0 && (
          <p className="text-xs text-red-400 font-mono mt-2 text-center">
            Enter a machine name first
          </p>
        )}
      </div>
    </div>
  );
}
