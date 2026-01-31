import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Challenges from './pages/Challenges';
import Leaderboard from './pages/Leaderboard';
import MachineBuilder from './pages/MachineBuilder';
import MyMachines from './pages/MyMachines';
import MachineSolver from './pages/MachineSolver';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/machine-builder" element={<MachineBuilder />} />
          <Route path="/my-machines" element={<MyMachines />} />
          <Route path="/solve/:id" element={<MachineSolver />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:teamName" element={<Profile />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
