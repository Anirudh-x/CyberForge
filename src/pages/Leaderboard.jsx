import { useEffect, useState } from 'react';
import LeaderboardCard from '../components/LeaderboardCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('overall');

  const categories = [
    { id: 'overall', label: '🏆 Overall', endpoint: '/api/leaderboard/overall' },
    { id: 'web', label: '🌐 Web Security', endpoint: '/api/leaderboard/web' },
    { id: 'red_team', label: '🔴 Red Team', endpoint: '/api/leaderboard/red-team' },
    { id: 'blue_team', label: '🔵 Blue Team', endpoint: '/api/leaderboard/blue-team' },
    { id: 'cloud', label: '☁️ Cloud Security', endpoint: '/api/leaderboard/cloud' },
    { id: 'forensics', label: '🔍 Forensics', endpoint: '/api/leaderboard/forensics' }
  ];

  useEffect(() => {
    fetchLeaderboard();
  }, [category]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const selectedCategory = categories.find(c => c.id === category);
      const response = await fetch(selectedCategory.endpoint, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success && data.leaderboard) {
        setLeaderboardData(data.leaderboard);
      } else {
        setError("Failed to load leaderboard data");
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setError("Failed to load leaderboard data");
      setLeaderboardData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-green-400 flex flex-col items-center py-10">
        <h1 className="text-4xl font-bold text-green-300 mb-2">🏆 Leaderboard 🏆</h1>
        <p className="text-lg text-green-500 mb-6">Where hackers compete for glory!</p>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 border-2 rounded font-mono font-bold transition-all ${
                category === cat.id
                  ? 'bg-green-400 text-black border-green-400'
                  : 'bg-transparent text-green-400 border-green-400 hover:bg-green-400 hover:bg-opacity-20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        {isLoading ? (
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-green-400 text-xl">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-400 text-xl mb-4">{error}</p>
            <button 
              onClick={fetchLeaderboard}
              className="px-6 py-2 border-2 border-green-400 text-green-400 bg-transparent hover:bg-green-400 hover:text-black rounded font-mono font-bold"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-4 mb-10 px-4">
            {leaderboardData.length === 0 ? (
              <div className="text-center p-10 border-2 border-green-400 rounded-lg bg-green-400 bg-opacity-5">
                <p className="text-green-400 text-xl">No players on this leaderboard yet.</p>
                <p className="text-green-500 mt-2">Be the first to solve challenges in this category!</p>
              </div>
            ) : (
              leaderboardData.map((player) => (
                <LeaderboardCard 
                  key={player.rank}
                  rank={player.rank}
                  username={player.team_name}
                  solved={player.solvedCount}
                  score={player.points}
                  machines={player.machinesSolved}
                />
              ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
