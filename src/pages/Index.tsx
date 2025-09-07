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

// Detect variant
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

  const [showTUChoice, setShowTUChoice] = useState(false);
  const tuChoiceKey = useMemo(
    () => `tuChoiceShown::${String(user?.id ?? 'anon')}`,
    [user?.id]
  );

  // Which flavor?
  const [variantKey, setVariantKey] = useState<'main' | 'conf'>(detectInitialVariant());

  // Pick list for current variant
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

  // Rehydrate when variant changes
  useEffect(() => {
    const today = todayKey();
    const keys = storageKeys(variantKey);

    setHasUploadedToday(!!localStorage.getItem(`${user?.id}_${keys.completed(today)}`));
    setChallenge(pickInitialChallenge(challengeList, variantKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantKey]);

  // Show TU choice if participant
  useEffect(() => {
    if (authLoading || !user) return;
    const isParticipant =
      !!(user as any)?.isConferenceParticipant || !!(user as any)?.is_conference_participant;
    if (isParticipant && !sessionStorage.getItem(tuChoiceKey)) {
      setShowTUChoice(true);
    }
  }, [authLoading, user, tuChoiceKey]);

  // Force conf variant if participant
  useEffect(() => {
    if (user) {
      const isParticipant =
        !!(user as any)?.isConferenceParticipant || !!(user as any)?.is_conference_participant;
      if (isParticipant && variantKey !== 'conf') {
        setVariantKey('conf');
      }
    }
  }, [user, variantKey]);

  // Load streak
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

  // Advance to next day (called at midnight or via Dev button)
  const advanceToNextDay = React.useCallback(() => {
    const today = todayKey();                  // now it's the NEW day
    const keys = storageKeys(variantKey);

    // choose next challenge based on the one currently shown
    const next = pickNextChallenge(challengeList, challenge.id);

    // pin today's challenge id and clear today's completion
    if (user?.id) {
      localStorage.setItem(`${user.id}_${keys.current(today)}`, String(next.id));
      localStorage.removeItem(`${user.id}_${keys.completed(today)}`);
    }

    setChallenge(next);
    setHasUploadedToday(false);

    console.log('[Midnight] advanced to challenge', next.id, 'and reset completion for', today);
  }, [challenge.id, challengeList, user?.id, variantKey]);

  const msUntilNextMidnight = () => {
    const now = new Date();
    const next = new Date(now);
    next.setDate(now.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    return next.getTime() - now.getTime();
  };

  // Single midnight scheduler (with fast test + poll fallback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fast = Number(params.get('fastMidnight'));
    const ms = (!Number.isNaN(fast) && fast > 0) ? fast * 1000 : msUntilNextMidnight();

    console.log('[Index] scheduling midnight in', ms, 'ms');

    let fired = false;
    const timeoutId = window.setTimeout(() => {
      if (fired) return;
      fired = true;
      console.log('[Index] midnight fired (timeout)');
      advanceToNextDay();
    }, ms + 50);

    // Poll fallback to detect date change (handles tab sleep)
    let lastDay = new Date().toDateString();
    const pollId = window.setInterval(() => {
      const nowDay = new Date().toDateString();
      if (nowDay !== lastDay && !fired) {
        fired = true;
        lastDay = nowDay;
        console.log('[Index] midnight detected by poll');
        advanceToNextDay();
        clearInterval(pollId);
        clearTimeout(timeoutId);
      }
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(pollId);
    };
  }, [advanceToNextDay]);

  const openUpload = () => setIsUploadOpen(true);

  const handleUploadComplete = async (_mediaUrl: string) => {
    if (!user?.id) return;

    const today = todayKey();
    const keys = storageKeys(variantKey);

    // mark completed for *today* (challenge stays the same until midnight)
    localStorage.setItem(`${user.id}_${keys.completed(today)}`, '1');
    setHasUploadedToday(true);

    // increment streak
    try {
      const newStreak = currentStreak + 1;
      await apiClient.updateProfile(user.id, { streak: newStreak });
      setCurrentStreak(newStreak);
      toast.success(`Streak updated: ${newStreak} days`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update streak.');
    }

    setIsUploadOpen(false);
  };

  const handleDevResetUpload = () => {
    const today = todayKey();
    const keys = storageKeys(variantKey);
    if (!user?.id) return;
    localStorage.removeItem(`${user.id}_${keys.completed(today)}`);
    setHasUploadedToday(false);
    toast.success('Dev: You can upload again today!');
  };

  const handleChooseChallenges = () => {
    sessionStorage.setItem(tuChoiceKey, '1');
    setShowTUChoice(false);
    navigate('/');
  };

  const handleChooseInfo = () => {
    sessionStorage.setItem(tuChoiceKey, '1');
    setShowTUChoice(false);
    navigate('/info');
  };

  if (authLoading || !user) return <div>Loading...</div>;

  // for console testing: window.__triggerMidnight()
  if (import.meta.env.DEV) {
    (window as any).__triggerMidnight = advanceToNextDay;
  }

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

            <div className="flex justify-center mt-4">
              <button
                onClick={handleDevResetUpload}
                className="flex items-center gap-2 px-4 py-2 border rounded text-sm text-gray-200 border-gray-500 hover:bg-gray-800"
              >
                <RotateCcw className="h-4 w-4" />
                Dev: Reset Upload
              </button>
            </div>

            <div className="flex justify-center mt-2">
              <button
                onClick={advanceToNextDay}
                className="flex items-center gap-2 px-4 py-2 border rounded text-sm text-gray-200 border-gray-500 hover:bg-gray-800"
              >
                Dev: Trigger Midnight
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

      {showTUChoice && (
        <div className="tu-overlay">
          <div className="tu-card">
            <h3 className="text-lg font-semibold mb-2">Testing United</h3>
            <p className="text-sm opacity-80 mb-5">
              Do you want to try challenges or view Testing United Conference info?
            </p>
            <div className="tu-row">
              <button onClick={handleChooseChallenges} className="tu-btn">Challenges</button>
              <button onClick={handleChooseInfo} className="tu-btn tu-btn--ghost">Info</button>
            </div>
          </div>
        </div>
      )}

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
