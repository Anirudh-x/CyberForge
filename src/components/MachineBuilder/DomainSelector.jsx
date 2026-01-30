import { Globe, Shield, Cloud, Search, Sword, Network } from 'lucide-react';

export default function DomainSelector({ domains, selectedDomain, onSelectDomain }) {
  // Responsive grid: 1 col on mobile, 2 on sm, 3 on md, 4 on lg, 5 on xl
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold font-mono text-green-400 mb-4">
        STEP 1: SELECT DOMAIN
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {domains.map((domain) => (
          <button
            key={domain.id}
            onClick={() => onSelectDomain(domain.id)}
            className={`
              min-w-[220px] max-w-full w-full p-7 rounded-xl border-2 transition-all font-mono flex flex-col items-center
              ${selectedDomain === domain.id
                ? 'bg-green-900 border-green-500 text-green-300 shadow-lg shadow-green-500/50'
                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-green-500 hover:text-green-400'
              }
            `}
            style={{ wordBreak: 'break-word' }}
          >
            <div className="mb-2">
              {domain.id === 'web' && <Globe size={36} className="text-green-400" />}
              {domain.id === 'red_team' && <Sword size={36} className="text-red-400" />}
              {domain.id === 'blue_team' && <Shield size={36} className="text-blue-400" />}
              {domain.id === 'cloud' && <Cloud size={36} className="text-cyan-400" />}
              {domain.id === 'forensics' && <Search size={36} className="text-yellow-400" />}
              {domain.id === 'social_engineering' && <Network size={36} className="text-pink-400" />}
            </div>
            <div className="font-bold text-base text-center leading-tight">{domain.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
