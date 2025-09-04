import React, { useEffect, useState } from 'react';
import { Home, User, Plus, Info, RotateCcw } from 'lucide-react';
import DailyChallenge, { CHALLENGES, type Challenge } from '@/components/DailyChallenge';
import MediaUpload from '@/components/MediaUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import './Index.css';

const todayKey = () => new Date().toDateString();
const LS_CURRENT_CHALLENGE = (d: string) => `current-challenge-${d}`;
const LS_COMPLETED_TODAY = (d: string) => `challenge-completed-${d}`;

function pickInitialChallenge(): Challenge {
  const today = todayKey();
  const savedId = localStorage.getItem(LS_CURRENT_CHALLENGE(today));
  if (savedId) {
    const found = CHALLENGES.find(c => c.id === Number(savedId));
    if (found) return found;
  }
  // default: deterministic "rotate by day" (or change to random if you prefer)
  const idx = new Date().getDate() % CHALLENGES.length;
  const chosen = CHALLENGES[idx];
  localStorage.setItem(LS_CURRENT_CHALLENGE(today), String(chosen.id));
  return chosen;
}

function pickNextChallenge(prevId: number): Challenge {
  const idx = CHALLENGES.findIndex(c => c.id === prevId);
  const next = CHALLENGES[(idx + 1) % CHALLENGES.length];
  return next;
}

const Index: React.FC = () => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [challenge, setChallenge] = useState<Challenge>(() => pickInitialChallenge());
  const [hasUploadedToday, setHasUploadedToday] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user?.id) {
      apiClient
        .getProfile(user.id)
        .then((data) => setCurrentStreak(data?.streak || 0))
        .catch((err) => {
          console.error('Error fetching streak:', err);
          toast.error('Failed to load streak.');
        });
    }

    const today = todayKey();
    setHasUploadedToday(!!localStorage.getItem(LS_COMPLETED_TODAY(today)));
  }, [user, authLoading, navigate]);

  const openUpload = () => setIsUploadOpen(true);

  const handleUploadComplete = async (_mediaUrl: string) => {
    // Only after successful upload we:
    // 1) mark completed today
    // 2) increment streak
    // 3) rotate to the next challenge (but keep the button disabled today)
    if (!user?.id) return;

    const today = todayKey();
    localStorage.setItem(LS_COMPLETED_TODAY(today), '1');
    setHasUploadedToday(true);

    try {
      const newStreak = currentStreak + 1;
      await apiClient.updateProfile(user.id, { streak: newStreak });
      setCurrentStreak(newStreak);
      toast.success(`Streak updated: ${newStreak} days`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update streak.');
    }

    // Rotate to the next challenge right away (UI shows next, but still locked today)
    const next = pickNextChallenge(challenge.id);
    setChallenge(next);
    localStorage.setItem(LS_CURRENT_CHALLENGE(today), String(next.id));

    setIsUploadOpen(false);
  };

  // Dev button to reset today’s upload lock
  const handleDevResetUpload = () => {
    const today = todayKey();
    localStorage.removeItem(LS_COMPLETED_TODAY(today));
    setHasUploadedToday(false);
    toast.success('Dev: You can upload again today!');
  };

  if (authLoading || !user) return <div>Loading...</div>;

  const isParticipant =
    !!(user as any)?.isConferenceParticipant || !!(user as any)?.is_conference_participant;

  return (
    <div className="index-container">
      <div className="index-mobile-frame">
        <div className="index-layout">
          <div className="index-main-content">
            <DailyChallenge
              challenge={challenge}
              currentStreak={currentStreak}
              hasUploadedToday={hasUploadedToday}
              onStartUpload={openUpload}
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

      <MediaUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        challengeTitle={challenge.title}      // pass the current challenge title
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};

export default Index;
