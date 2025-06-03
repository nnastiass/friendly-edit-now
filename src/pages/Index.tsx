
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, User } from 'lucide-react';
import DailyChallenge from '@/components/DailyChallenge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Index.css';

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
      <div className="index-loading">
        <div className="index-loading-frame">
          <div className="index-loading-content">
            <div className="index-loading-inner">
              <div className="index-loading-spinner"></div>
              <h2 className="index-loading-title">SocialStreak</h2>
              <p className="index-loading-text">Loading your daily challenge...</p>
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
    <div className="index-container">
      <div className="index-mobile-frame">
        <div className="index-layout">
          {/* Main Content */}
          <div className="index-main-content">
            {/* Header */}
            <div className="index-header">
              <h1 className="index-title">Daily Challenge</h1>
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
          <div className="index-bottom-nav">
            <div className="index-nav-container">
              <button className="index-nav-button">
                <Home className="index-nav-icon" />
              </button>
              <button 
                className="index-nav-button index-nav-button-inactive"
                onClick={() => navigate('/profile')}
              >
                <User className="index-nav-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
