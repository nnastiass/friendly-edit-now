// src/pages/Index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Home, User, Plus, Info, RotateCcw } from 'lucide-react';
import DailyChallenge from '@/components/DailyChallenge';
import MediaUpload from '@/components/MediaUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import './Index.css';

import {
  type Challenge,
  MAIN_CHALLENGES,
  CONF_CHALLENGES,
  pickInitialChallenge,
  pickNextChallenge,
  storageKeys,
  todayKey,
} from '@/lib/challengeSets';

// Detect variant:
// 1) Build-time env (Vite: VITE_APP_VARIANT=conference | CRA: REACT_APP_VARIANT=conference)
// 2) URL path starts with /conference
// 3) Fallback to user flag (isConferenceParticipant)
function detectInitialVariant(): 'main' | 'conf' {
  const envVariant =
    (import.meta as any)?.env?.VITE_APP_VARIANT ??
    (typeof process !== 'undefined' ? (process as any)?.env?.REACT_APP_VARIANT : '');

  if (String(envVariant).toLowerCase() === 'conference') return 'conf';
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/conference')) return 'conf';
  return 'main';
}

const Index: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Which flavor of the app are we in?
  const [variantKey, setVariantKey] = useState<'main' | 'conf'>(detectInitialVariant());

  // Choose the correct list for the current variant
  const challengeList = useMemo(
    () => (variantKey === 'conf' ? CONF_CHALLENGES : MAIN_CHALLENGES),
    [variantKey]
  );

  // Challenge + state
  const [challenge, setChallenge] = useState<Challenge>(() =>
    pickInitialChallenge(challengeList, variantKey)
  );
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [hasUploadedToday, setHasUploadedToday] = useState(false);

  // If the logged-in user is a conference participant, force conference list
  useEffect(() => {
    if (user) {
      const isParticipant =
        !!(user as any)?.isConferenceParticipant || !!(user as any)?.is_conference_participant;
      if (isParticipant && variantKey !== 'conf') {
        setVariantKey('conf');
      }
    }
  }, [user, variantKey]);

  // When variant changes (or on first mount), (re)hydrate challenge + today's completion
  useEffect(() => {
    const today = todayKey();
    const keys = storageKeys(variantKey);

    setHasUploadedToday(!!localStorage.getItem(`${user?.id}_${keys.completed(today)}`));

    setChallenge(pickInitialChallenge(challengeList, variantKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantKey]);

  // Load streak from backend
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
  }, [user, authLoading, navigate]);

  const openUpload = () => setIsUploadOpen(true);

  const handleUploadComplete = async (_mediaUrl: string) => {
    if (!user?.id) return;

    const today = todayKey();
    const keys = storageKeys(variantKey);

    // mark completed today for this variant
    localStorage.setItem(`${user.id}_${keys.completed(today)}`, '1');
    setHasUploadedToday(true);

    // increment streak on server + UI
    try {
      const newStreak = currentStreak + 1;
      await apiClient.updateProfile(user.id, { streak: newStreak });
      setCurrentStreak(newStreak);
      toast.success(`Streak updated: ${newStreak} days`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update streak.');
    }

    // rotate to next challenge within the same list, but keep today locked
    const next = pickNextChallenge(challengeList, challenge.id);
    setChallenge(next);
    localStorage.setItem(`${user.id}_${keys.current(today)}`, String(next.id));

    setIsUploadOpen(false);
  };

  // Dev reset for today (per variant)
  const handleDevResetUpload = () => {
    const today = todayKey();
    const keys = storageKeys(variantKey);
    localStorage.removeItem(`${user.id}_${keys.completed(today)}`);

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
              <button className="index-nav-button index-nav-button-inactive" onClick={() => navigate('/feed')}>
                <Home className="index-nav-icon" />
              </button>
              {isParticipant && (
                <button className="index-nav-button index-nav-button-inactive" onClick={() => navigate('/info')}>
                  <Info className="index-nav-icon" />
                </button>
              )}
              <button className="index-nav-button index-nav-button-active">
                <Plus className="index-nav-icon" />
              </button>
              <button className="index-nav-button index-nav-button-inactive" onClick={() => navigate('/profile')}>
                <User className="index-nav-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <MediaUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        challengeTitle={challenge.title}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};

export default Index;