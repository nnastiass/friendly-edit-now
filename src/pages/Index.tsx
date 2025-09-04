import React, { useState, useEffect } from 'react';
import { Home, User, Plus, Info, RotateCcw } from 'lucide-react';
import DailyChallenge from '@/components/DailyChallenge';
import MediaUpload from '@/components/MediaUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import './Index.css';

const Index = () => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState('');
  const [hasUploadedToday, setHasUploadedToday] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user?.id) {
      apiClient.getProfile(user.id)
        .then(data => setCurrentStreak(data?.streak || 0))
        .catch(err => {
          console.error('Error fetching streak:', err);
          toast.error('Failed to load streak.');
        });
    }

    const today = new Date().toDateString();
    setHasUploadedToday(!!localStorage.getItem(`challenge-${today}`));
  }, [user, authLoading, navigate]);

  const handleUploadComplete = async (mediaUrl: string) => {
    if (!user?.id || !currentChallenge) return;

    const today = new Date().toDateString();
    localStorage.setItem(`challenge-${today}`, 'completed');
    setHasUploadedToday(true);

    try {
      const newStreak = currentStreak + 1;
      await apiClient.updateProfile(user.id, { streak: newStreak });
      setCurrentStreak(newStreak);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update streak.');
    }

    setIsUploadOpen(false);
  };

  // Dev button to reset today’s upload
  const handleDevResetUpload = () => {
    const today = new Date().toDateString();
    localStorage.removeItem(`challenge-${today}`);
    setHasUploadedToday(false);
    toast.success('Dev: You can upload again today!');
  };

  if (authLoading || !user) return <div>Loading...</div>;

  const isParticipant = !!(user as any)?.isConferenceParticipant || !!(user as any)?.is_conference_participant;

  return (
    <div className="index-container">
      <div className="index-mobile-frame">
        <div className="index-layout">
          <div className="index-main-content">
            <DailyChallenge
              deferCompletion={true}
              currentStreak={currentStreak}
              hasUploadedToday={hasUploadedToday}
              onCompleteRequested={() => setIsUploadOpen(true)}
              onChallengeLoaded={setCurrentChallenge}
            />

            {/* Dev button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={handleDevResetUpload}
                className="flex items-center gap-2 px-4 py-2 border rounded text-sm text-gray-200 border-gray-500 hover:bg-gray-800"
              >
                <RotateCcw className="h-4 w-4" />
                Dev: Reset Upload
              </button>
            </div>
          </div>

          <div className="index-bottom-nav">
            <div className="index-nav-container">
              <button className="index-nav-button index-nav-button-inactive" onClick={() => navigate('/feed')}><Home className="index-nav-icon" /></button>
              {isParticipant && <button className="index-nav-button index-nav-button-inactive" onClick={() => navigate('/info')}><Info className="index-nav-icon" /></button>}
              <button className="index-nav-button index-nav-button-active"><Plus className="index-nav-icon" /></button>
              <button className="index-nav-button index-nav-button-inactive" onClick={() => navigate('/profile')}><User className="index-nav-icon" /></button>
            </div>
          </div>
        </div>
      </div>

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
