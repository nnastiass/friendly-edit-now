
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, User } from 'lucide-react';
import DailyChallenge from '@/components/DailyChallenge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [currentStreak, setCurrentStreak] = useState(7);
  const [totalChallenges, setTotalChallenges] = useState(23);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else {
        // Simulate loading for the main content
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-sm mx-auto" style={{ aspectRatio: '9/16' }}>
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">SocialStreak</h2>
              <p className="text-gray-400">Loading your daily challenge...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto bg-black text-white" style={{ aspectRatio: '9/16' }}>
        <div className="h-full flex flex-col">
          {/* Main Content */}
          <div className="flex-1 px-6 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-xl font-semibold text-white mb-2">Daily Challenge</h1>
            </div>

            {/* Daily Challenge */}
            <DailyChallenge 
              onComplete={(points) => {
                setCurrentStreak(prev => prev + 1);
                setTotalChallenges(prev => prev + 1);
              }}
            />
          </div>

          {/* Bottom Navigation */}
          <div className="bg-black border-t border-gray-800 px-6 py-4">
            <div className="flex justify-center space-x-16">
              <button className="flex flex-col items-center text-white">
                <Home className="h-6 w-6 mb-1" />
              </button>
              <button 
                className="flex flex-col items-center text-gray-500 hover:text-white transition-colors"
                onClick={() => navigate('/profile')}
              >
                <User className="h-6 w-6 mb-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
