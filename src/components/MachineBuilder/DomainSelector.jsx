export default function DomainSelector({ domains, selectedDomain, onSelectDomain }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold font-mono text-green-400 mb-4">
        STEP 1: SELECT DOMAIN
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {domains.map((domain) => (
          <button
            key={domain.id}
            onClick={() => onSelectDomain(domain.id)}
            className={`
              p-6 rounded border-2 transition-all font-mono
              ${selectedDomain === domain.id
                ? 'bg-green-900 border-green-500 text-green-300 shadow-lg shadow-green-500/50'
                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-green-500 hover:text-green-400'
              }
            `}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">
                {domain.id === 'web' && '🌐'}
                {domain.id === 'red_team' && '⚔️'}
                {domain.id === 'blue_team' && '🛡️'}
                {domain.id === 'cloud' && '☁️'}
                {domain.id === 'forensics' && '🔍'}
              </div>
              <div className="font-bold">{domain.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
