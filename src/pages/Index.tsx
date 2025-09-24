import React, { useEffect, useMemo, useState } from 'react';
import { Home, User, Plus, Info, RotateCcw } from 'lucide-react';
import DailyChallenge from '@/components/DailyChallenge';
import MediaUpload from '@/components/MediaUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import './Index.css';
import TULogo from '/images/logo/testing united.webp';

// Import helpers
import {
  type Challenge,
  storageKeys,
  todayKey,
} from '@/lib/challengeSets';

// FeedBanner (inline, could be separate file)
import { X } from 'lucide-react';

interface FeedBannerProps {
  message: string;
  type?: 'info' | 'error';
  duration?: number;
  onClose?: () => void;
}

const FeedBanner: React.FC<FeedBannerProps> = ({
  message,
  type = 'info',
  duration = 4000,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay before showing the banner (optional)
    const showTimer = setTimeout(() => setVisible(true), 1000);

    // Hide banner after duration + initial delay
    const hideTimer = setTimeout(() => setVisible(false), (duration || 4000) + 1000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  return (
    <div className="feed-banner-root">
      <div
        className={`feed-banner feed-banner--${type} ${visible ? 'feed-banner--visible' : ''}`}
        onTransitionEnd={() => {
          if (!visible && onClose) onClose(); // Only call onClose after slide-out
        }}
      >
        <span className="feed-banner-text">{message}</span>
        <button className="feed-banner-close" onClick={() => setVisible(false)}>
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

// Detect initial variant
function detectInitialVariant(): 'main' | 'conf' {
  const envVariant =
    (import.meta as any)?.env?.VITE_APP_VARIANT ??
    (typeof process !== 'undefined'
      ? (process as any)?.env?.REACT_APP_VARIANT
      : '');

  if (String(envVariant).toLowerCase() === 'conference') return 'conf';
  if (
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/conference')
  )
    return 'conf';
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

  const [variantKey, setVariantKey] = useState<'main' | 'conf'>(
    detectInitialVariant()
  );

  const [challengeList, setChallengeList] = useState<Challenge[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(true);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [hasUploadedToday, setHasUploadedToday] = useState(false);

  // ✅ NEW: banner state
  const [banner, setBanner] = useState<{
    message: string;
    type?: 'info' | 'error';
  } | null>(null);

  // Fetch challenges
  useEffect(() => {
    setChallengesLoading(true);
    apiClient
      .getChallenges(variantKey)
      .then((data) => {
        setChallengeList(data);
      })
      .catch((err) => {
        console.error(`Failed to fetch ${variantKey} challenges:`, err);
        setChallengeList([]);
      })
      .finally(() => {
        setChallengesLoading(false);
      });
  }, [variantKey]);

  // Pick initial challenge
  useEffect(() => {
    if (!challengeList.length || !user?.id) return;

    const today = todayKey();
    const keys = storageKeys(variantKey);
    const savedId = localStorage.getItem(`${user.id}_${keys.current(today)}`);
    let initialChallenge: Challenge;

    if (savedId) {
      const found = challengeList.find((c) => c.id === Number(savedId));
      if (found) {
        initialChallenge = found;
      } else {
        const idx = new Date().getDate() % challengeList.length;
        initialChallenge = challengeList[idx];
      }
    } else {
      const idx = new Date().getDate() % challengeList.length;
      initialChallenge = challengeList[idx];
    }

    localStorage.setItem(
      `${user.id}_${keys.current(today)}`,
      String(initialChallenge.id)
    );
    setChallenge(initialChallenge);
    setHasUploadedToday(
      !!localStorage.getItem(`${user.id}_${keys.completed(today)}`)
    );
  }, [challengeList, variantKey, user?.id]);

  // TU choice for participants
  useEffect(() => {
    if (authLoading || !user) return;
    const isParticipant =
      !!(user as any)?.isConferenceParticipant ||
      !!(user as any)?.is_conference_participant;
    if (isParticipant && !sessionStorage.getItem(tuChoiceKey)) {
      setShowTUChoice(true);
    }
  }, [authLoading, user, tuChoiceKey]);

  // Force conf variant
  useEffect(() => {
    if (user) {
      const isParticipant =
        !!(user as any)?.isConferenceParticipant ||
        !!(user as any)?.is_conference_participant;
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
        });
    }
  }, [user, authLoading, navigate]);

  // Midnight rollover
  const advanceToNextDay = React.useCallback(() => {
    if (!challenge || !challengeList.length) return;

    const today = todayKey();
    const keys = storageKeys(variantKey);

    const currentIndex = Math.max(
      0,
      challengeList.findIndex((c) => c.id === challenge.id)
    );
    const next = challengeList[(currentIndex + 1) % challengeList.length];

    if (user?.id) {
      localStorage.setItem(`${user.id}_${keys.current(today)}`, String(next.id));
      localStorage.removeItem(`${user.id}_${keys.completed(today)}`);
    }

    setChallenge(next);
    setHasUploadedToday(false);
  }, [challenge, challengeList, user?.id, variantKey]);

  const msUntilNextMidnight = () => {
    const now = new Date();
    const next = new Date(now);
    next.setDate(now.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    return next.getTime() - now.getTime();
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fast = Number(params.get('fastMidnight'));
    const ms =
      !Number.isNaN(fast) && fast > 0 ? fast * 1000 : msUntilNextMidnight();

    let fired = false;
    const timeoutId = window.setTimeout(() => {
      if (fired) return;
      fired = true;
      advanceToNextDay();
    }, ms + 50);

    let lastDay = new Date().toDateString();
    const pollId = window.setInterval(() => {
      const nowDay = new Date().toDateString();
      if (nowDay !== lastDay && !fired) {
        fired = true;
        lastDay = nowDay;
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

  // Upload
  const handleStartUpload = async (file: File) => {
    setIsUploadOpen(false);

    if (!user?.id || !challenge) return;

    const today = todayKey();
    const keys = storageKeys(variantKey);

    if (localStorage.getItem(`${user.id}_${keys.completed(today)}`)) {
      setBanner({ message: 'You have already fulfilled challenge for today!', type: 'error' });
      return;
    }

    const title = (challenge.title ?? '').trim() || 'daily-challenge';

    try {
      const result = await apiClient.uploadMedia(user.id, file, title);
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';

     // Index.tsx — inside handleStartUpload, replace the createPost call with:
     await apiClient.createPost({
       user_id: user.id,
       caption: title,
       media_type: mediaType,
       media_url: result.mediaUrl,

       // NEW: tag the post properly so visibility rules work
       challenge_id: challenge.id,                                // you already have `challenge` in scope
       challenge_set: variantKey === 'conf' ? 'conference' : 'main',
     });


      localStorage.setItem(`${user.id}_${keys.completed(today)}`, '1');
      setHasUploadedToday(true);

      const newStreak = currentStreak + 1;
      await apiClient.updateProfile(user.id, { streak: newStreak });
      setCurrentStreak(newStreak);

    } catch (err: any) {
      console.error('Upload or moderation failed:', err);
      setBanner({
        message: 'Upload received and queued for manual review.',
        type: 'info',
      });
    }
  };

  const handleDevResetUpload = () => {
    const today = todayKey();
    const keys = storageKeys(variantKey);
    if (!user?.id) return;
    localStorage.removeItem(`${user.id}_${keys.completed(today)}`);
    setHasUploadedToday(false);
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

  if (authLoading || challengesLoading || !user || !challenge) {
    return <div className="index-loading"><div className="index-loading-spinner"></div></div>;
  }

  if (import.meta.env.DEV) {
    (window as any).__triggerMidnight = advanceToNextDay;
  }

  const isParticipant =
    !!(user as any)?.isConferenceParticipant ||
    !!(user as any)?.is_conference_participant;

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
    <span className="index-nav-text">TU</span>
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
              <button onClick={handleChooseChallenges} className="tu-btn">
                Challenges
              </button>
              <button onClick={handleChooseInfo} className="tu-btn tu-btn--ghost">
                Info
              </button>
            </div>
          </div>
        </div>
      )}

      <MediaUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        challengeTitle={challenge.title}
        onFileSelectForUpload={handleStartUpload}
      />

      {banner && (
        <FeedBanner
          message={banner.message}
          type={banner.type}
          onClose={() => setBanner(null)}
        />
      )}
    </div>
  );
};

export default Index;
