import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="bg-black text-green-400 border-b border-green-600 shadow-lg">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="font-mono font-bold">
            <Link to="/" className="text-xl">
              CYBER<span className="text-white">FORGE</span>
              <span className="text-green-500">_</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 font-mono tracking-wide">
            <Link to="/" className="hover:text-green-300 transition duration-200">
              [ HOME ]
            </Link>
            <Link to="/leaderboard" className="hover:text-green-300 transition duration-200">
              [ LEADERBOARD ]
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/challenges" className="hover:text-green-300 transition duration-200">
                  [ CHALLENGES ]
                </Link>
                <Link to="/machine-builder" className="hover:text-green-300 transition duration-200">
                  [ BUILD MACHINE ]
                </Link>
                <Link to="/my-machines" className="hover:text-green-300 transition duration-200">
                  [ MY MACHINES ]
                </Link>
                <Link to="/profile" className="text-green-300 font-bold ml-2 hover:text-green-200 transition duration-200">
                  TEAM: {user?.teamName}
                </Link>
                <div className="text-green-300 font-bold ml-2">User: {user?.teamName}</div>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 text-black bg-green-600 hover:bg-green-500 transition font-mono shadow-md"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-black bg-green-600 hover:bg-green-500 transition font-mono shadow-md">
                  LOGIN
                </Link>
                <Link to="/register" className="border border-green-500 text-green-500 hover:bg-green-900 px-4 py-2 font-mono">
                  REGISTER
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-green-400 focus:outline-none" onClick={() => setIsOpen(!isOpen)}>
            <div className="w-6 h-0.5 bg-green-400 mb-1"></div>
            <div className="w-6 h-0.5 bg-green-400 mb-1"></div>
            <div className="w-6 h-0.5 bg-green-400"></div>
          </button>
        </nav>

        {/* Mobile Navigation */}
        <div className={`md:hidden ${isOpen ? "block" : "hidden"} flex flex-col items-center py-4 space-y-4 font-mono text-lg bg-black border-t border-green-600`}>
          <Link to="/" className="hover:text-green-300 transition duration-200" onClick={() => setIsOpen(false)}>
            [ HOME ]
          </Link>
          <Link to="/leaderboard" className="hover:text-green-300 transition duration-200" onClick={() => setIsOpen(false)}>
            [ LEADERBOARD ]
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/challenges" className="hover:text-green-300 transition duration-200" onClick={() => setIsOpen(false)}>
                [ CHALLENGES ]
              </Link>
              <Link to="/machine-builder" className="hover:text-green-300 transition duration-200" onClick={() => setIsOpen(false)}>
                [ BUILD MACHINE ]
              </Link>
              <Link to="/my-machines" className="hover:text-green-300 transition duration-200" onClick={() => setIsOpen(false)}>
                [ MY MACHINES ]
              </Link>
              <Link to="/profile" className="text-green-300 font-bold hover:text-green-200 transition duration-200" onClick={() => setIsOpen(false)}>
                TEAM: {user?.teamName}
              </Link>
              <div className="text-green-300 font-bold">User: {user?.teamName}</div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="px-4 py-2 text-black bg-green-600 hover:bg-green-500 transition font-mono shadow-md"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-black bg-green-600 hover:bg-green-500 transition font-mono shadow-md" onClick={() => setIsOpen(false)}>
                LOGIN
              </Link>
              <Link to="/register" className="border border-green-500 text-green-500 hover:bg-green-900 px-4 py-2 font-mono" onClick={() => setIsOpen(false)}>
                REGISTER
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
