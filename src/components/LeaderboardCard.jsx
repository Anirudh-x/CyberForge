export default function LeaderboardCard({ rank, username, solved, score, machines }) {
  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className={`bg-black border-2 shadow-lg p-6 rounded-lg text-green-400 font-mono grid grid-cols-1 md:grid-cols-5 gap-4 items-center transition-all hover:scale-[1.02] ${
      rank <= 3 ? 'border-yellow-400 bg-yellow-400 bg-opacity-5' : 'border-green-600'
    }`}>
      <span className={`text-2xl font-bold ${rank <= 3 ? 'text-yellow-400' : 'text-green-300'}`}>
        {getRankEmoji(rank)}
      </span>
      <span className="text-green-400 font-bold truncate">{username}</span>
      <div className="text-center">
        <div className="text-green-500 text-xl font-bold">{solved}</div>
        <div className="text-green-600 text-xs">vulnerabilities</div>
      </div>
      <div className="text-center">
        <div className="text-green-300 text-2xl font-bold">{score}</div>
        <div className="text-green-600 text-xs">points</div>
      </div>
      <div className="text-center">
        <div className="text-green-400 text-xl font-bold">{machines || 0}</div>
        <div className="text-green-600 text-xs">machines</div>
      </div>
    </div>
  );
}
