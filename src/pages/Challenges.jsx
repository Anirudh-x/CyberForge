import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestCard from '../components/QuestCard';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';

const quests = [
  { title: "Challenge 1", points: 50, description: "Pointy pointers.", hint: "Is the source code in C?", id: "c1" },
  { title: "Challenge 2", points: 100, description: "Disk Diving.", hint: "Dive deep to find the best gems.", id: "c2" },
  { title: "Challenge 3", points: 150, description: "Easy search.", hint: "Its not that easy. LOL.", id: "c3" },
  { title: "Challenge 4", points: 50, description: "Secret hunting.", hint: "The file is not as innocent as it looks.", id: "c4" },
  { title: "Challenge 5", points: 100, description: "Reverse Engineering 101.", hint: "Don't overthink it.", id: "c5" },
  { title: "Challenge 6", points: 100, description: "Eye catcher.", hint: "Don't believe your eyes.", id: "c6" },
  { title: "Challenge 7", points: 50, description: "Julius encrypted his password using a simple encryption algorithm. Can you decode it?", hint: "USA!!USA!!USA!!", id: "c7" },
  { title: "Challenge 8", points: 50, description: "A mysterious post was found on reddit. Can you uncover its truth?", hint: "ETUTITSBUS", id: "c8" },
  { title: "Challenge 9", points: 100, description: "Numbers and Deception: Sometimes, the greatest value isn't what it seems.", hint: "Read the code.", id: "c9" },
  { title: "Challenge 10", points: 100, description: "Rainb0lt who?", hint: "Try searching on planet Earth.", id: "c10" },
  { title: "Challenge 11", points: 100, description: "Find the photographer's home location.", hint: "Sometimes, we share more online than we realize.", id:"c11"},
  { title: "Challenge 12", points: 100, description: "Just Copy n Paste", hint: "tired of using chatgpt", id: "c12" ,url:"https://question.axiosiiitl.dev"},
  { title: "Challenge 13", points: 50, description: "Just look inside", hint: "do you really need it?", id: "c13" ,url:"https://c13.axiosiiitl.dev"},
  { title: "Challenge 14", points: 100, description: "I love Marie", hint: "Is Marie really a person or a thing :> ?", id: "c14",url:"https://c14.axiosiiitl.dev" },
  { title: "Challenge 15", points: 100, description: "Authentication Unlock", hint: "", id: "c15",url:"https://c15.axiosiiitl.dev" },
  { title: "Challenge 16", points: 50, description: "Terah", hint: "flag format iiitl{flag}", id: "c16",url:"https://c16.axiosiiitl.dev" }
];

export default function Challenges() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

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
      <div className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-green-400 text-center mb-6">QUEST ZONE!</h2>
        <p className="text-lg font-mono text-green-300 text-center mb-8">
          Are you ready to solve the quests?
        </p>
        
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quests.map((quest, index) => (
            <QuestCard key={index} {...quest} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
