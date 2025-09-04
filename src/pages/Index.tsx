import React, { useState, useEffect } from 'react';
import { Home, User, Plus, Info } from 'lucide-react';
import DailyChallenge from '@/components/DailyChallenge';
import MediaUpload from '@/components/MediaUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Index.css';

const Index = () => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isParticipant =
    !!(user as any)?.isConferenceParticipant ||
    !!(user as any)?.is_conference_participant;

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else {
        setIsLoading(false);
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // ✅ streak now updates only after upload is done
  const handleUploadComplete = (mediaUrl: string, mediaType: 'image' | 'video') => {
    console.log('Upload completed:', { mediaUrl, mediaType });

    setCurrentStreak(prev => prev + 1);
    setTotalChallenges(prev => prev + 1);

    setIsUploadOpen(false);
  };

  return (
    <div className="index-container">
      <div className="index-mobile-frame">
        <div className="index-layout">
          {/* Main Content */}
          <div className="index-main-content">
            <DailyChallenge
              deferCompletion={true}
              currentStreak={currentStreak}   // pass streak down
              onCompleteRequested={() => {
                setIsUploadOpen(true);
              }}
              onChallengeLoaded={(challengeTitle) => {
                setCurrentChallenge(challengeTitle);
              }}
            />

          </div>

          {/* Bottom Navigation */}
          <div className="index-bottom-nav">
            <div className="index-nav-container">
              <button
                className="index-nav-button index-nav-button-inactive"
                onClick={() => navigate('/feed')}
              >
                <Home className="index-nav-icon" />
              </button>

              {isParticipant && (
                <button
                  className="index-nav-button index-nav-button-inactive"
                  onClick={() => navigate('/info')}
                >
                  <Info className="index-nav-icon" />
                </button>
              )}

              <button className="index-nav-button index-nav-button-active">
                <Plus className="index-nav-icon" />
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

      {/* Media Upload Modal */}
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
