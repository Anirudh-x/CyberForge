import { useDraggable } from '@dnd-kit/core';
import { getDifficultyColor } from '../../utils/machineData';

function DraggableModule({ module }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: module.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  const difficultyColor = getDifficultyColor(module.difficulty);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        bg-gray-800 border-2 ${difficultyColor} p-4 rounded cursor-grab active:cursor-grabbing
        hover:shadow-lg hover:shadow-green-500/30 transition-all
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-mono font-bold text-green-400 text-sm">{module.name}</h4>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-mono px-2 py-1 rounded border ${difficultyColor}`}>
            {module.difficulty.toUpperCase()}
          </span>
          <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-green-900 text-green-300 border border-green-500">
            {module.points} PTS
          </span>
        </div>
      </div>
      <p className="text-xs text-green-300 font-mono">{module.description}</p>
      <div className="mt-2 text-xs text-gray-500 font-mono">
        🖱️ Drag to canvas
      </div>
    </div>
  );
}

export default function ModuleList({ modules, domainName }) {
  return (
    <div className="bg-gray-900 border border-green-600 rounded p-4">
      <h2 className="text-xl font-bold font-mono text-green-400 mb-4">
        STEP 2: SELECT MODULES
      </h2>
      <p className="text-sm text-green-300 font-mono mb-4">
        Available modules for {domainName}
      </p>
      
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {modules.length > 0 ? (
          modules.map((module) => (
            <DraggableModule key={module.id} module={module} />
          ))
        ) : (
          <div className="text-center text-gray-500 font-mono py-8">
            No modules available for this domain
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-green-600">
        <div className="text-xs text-green-300 font-mono space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-green-400">●</span> LOW difficulty
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">●</span> MEDIUM difficulty
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400">●</span> HIGH difficulty
          </div>
        </div>
      </div>
    </div>
  );
}
