import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, User, Plus, Upload, Info } from 'lucide-react';
import DailyChallenge from '@/components/DailyChallenge';
import MediaUpload from '@/components/MediaUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Index.css';

const Index = () => {
  // These states are now primarily managed by DailyChallenge internally,
  // but kept here if Index needs to display them or pass them down.
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
      console.log("Index: useEffect triggered. authLoading:", authLoading, "user:", user ? user.id : "null");
      if (!authLoading) {
        if (!user) {
          console.log("Index: No user found, navigating to /auth.");
          navigate('/auth');
        } else {
          console.log("Index: User found, starting 1.5s content loading timer.");
          const timer = setTimeout(() => {
            setIsLoading(false);
            console.log("Index: Content loading timer finished. isLoading set to false.");
          }, 1500);
          return () => clearTimeout(timer);
        }
      }
    }, [user, authLoading, navigate]);

    console.log("Index: Rendering. authLoading:", authLoading, "isLoading:", isLoading, "user:", user ? user.id : "null");

  // If authentication is still loading or the page's content is loading, show a spinner
  if (authLoading || isLoading) {
      console.log("Index: Displaying loading spinner.");
    return (
      <div className="index-loading">
        <div className="index-loading-frame">
          <div className="index-loading-content">
            <div className="index-loading-inner">
              <div className="index-loading-spinner"></div>


            </div>
          </div>
        </div>
      </div>
    );
  }

  // If authLoading is false but no user is found, this return null
  // should ideally be caught by the navigate('/auth') above, but as a fallback.
  if (!user) {
      console.log("Index: User is null, returning null (should redirect).");
    return null;
  }

  const handleUploadComplete = (mediaUrl: string, mediaType: 'image' | 'video') => {
    console.log('Upload completed:', { mediaUrl, mediaType });
    // TODO: Navigate to feed or show success message
    // For now, just close the upload dialog
  };

console.log("Index: Displaying main content.");
  return (
    <div className="index-container">
      <div className="index-mobile-frame">
        <div className="index-layout">
          {/* Main Content Area */}
          <div className="index-main-content">
            {/* Daily Challenge Component */}
            <DailyChallenge
              onComplete={(points) => {
                // These callbacks are here if you need to update Index's state
                // based on DailyChallenge completion, e.g., for a global score.
                // DailyChallenge now updates the streak directly in the backend.
                setCurrentStreak(prev => prev + 1);
                setTotalChallenges(prev => prev + 1);
              }}
              onChallengeLoaded={(challengeTitle) => {
                setCurrentChallenge(challengeTitle);
              }}
            />
            
            {/* Pridat dokaz Button */}
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => setIsUploadOpen(true)}
                className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg flex items-center gap-2"
              >
                <Upload className="h-5 w-5" />
                Pridat dokaz
              </Button>
            </div>
          </div>

          {/* Bottom Navigation Bar */}
          <div className="index-bottom-nav">
            <div className="index-nav-container">
              {/* Left Button (Home/Feed Page) */}
              <button
                className="index-nav-button index-nav-button-inactive"
                onClick={() => navigate('/feed')}
              >
                <Home className="index-nav-icon" />
              </button>

              {/* 2. New Info Button */}
                                          <button
                                            className="index-nav-button index-nav-button-inactive"
                                            onClick={() => navigate('/info')}
                                          >
                                            <Info className="index-nav-icon" />
                                          </button>

              {/* Middle Button (Challenge Page - Active) */}
              <button className="index-nav-button index-nav-button-active">
                <Plus className="index-nav-icon" />
              </button>



              {/* Right Button (Profile Page) */}
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

      {/* Media Upload Dialog */}
      <MediaUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        challengeTitle={currentChallenge}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};

export default Index;
