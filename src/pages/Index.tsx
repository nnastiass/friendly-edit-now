import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Home, User, Plus, RotateCcw, X } from 'lucide-react';
import DailyChallenge from '@/components/DailyChallenge';
import MediaUpload from '@/components/MediaUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import './Index.css';
import {
  type Challenge,
  storageKeys,
  todayKey,
} from '@/lib/challengeSets';

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
  // --- ADD THIS STATE ---


  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 1000);
    const hideTimer = setTimeout(() => setVisible(false), duration + 1000);

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
          if (!visible && onClose) onClose();
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
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/conference'))
    return 'conf';
  return 'main';
}

const Index: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [showTUChoice, setShowTUChoice] = useState(false);
  const [variantKey, setVariantKey] = useState<'main' | 'conf'>(detectInitialVariant());
  const [challengeList, setChallengeList] = useState<Challenge[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(true);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [hasUploadedToday, setHasUploadedToday] = useState(false);
  const [banner, setBanner] = useState<{ message: string; type?: 'info' | 'error' } | null>(null);
    const [pendingRequests, setPendingRequests] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
  const tuChoiceKey = useMemo(
    () => `tuChoiceShown::${String(user?.id ?? 'anon')}`,
    [user?.id]
  );

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Fetch challenges
  useEffect(() => {
    if (!user) return;
    setChallengesLoading(true);
    apiClient
      .getChallenges(variantKey)
      .then((data) => setChallengeList(data))
      .catch((err) => {
        console.error(`Failed to fetch ${variantKey} challenges:`, err);
        setChallengeList([]);
      })
      .finally(() => setChallengesLoading(false));
  }, [variantKey, user]);

  // Pick today's challenge
  useEffect(() => {
    if (!challengeList.length || !user?.id) return;

    const today = todayKey();
    const keys = storageKeys(variantKey);
    const savedId = localStorage.getItem(`${user.id}_${keys.current(today)}`);
    let initialChallenge: Challenge;

    if (savedId) {
      const found = challengeList.find((c) => c.id === Number(savedId));
      initialChallenge = found || challengeList[new Date().getDate() % challengeList.length];
    } else {
      initialChallenge = challengeList[new Date().getDate() % challengeList.length];
    }

    localStorage.setItem(`${user.id}_${keys.current(today)}`, String(initialChallenge.id));
    setChallenge(initialChallenge);
    setHasUploadedToday(!!localStorage.getItem(`${user.id}_${keys.completed(today)}`));
  }, [challengeList, variantKey, user?.id]);

  // TU choice overlay
  useEffect(() => {
    if (authLoading || !user) return;
    const isParticipant = !!(user as any)?.isConferenceParticipant || !!(user as any)?.is_conference_participant;
    if (isParticipant && !sessionStorage.getItem(tuChoiceKey)) {
      setShowTUChoice(true);
    }
  }, [authLoading, user, tuChoiceKey]);

  // Force conference variant for participants
  useEffect(() => {
    if (!user) return;
    const isParticipant = !!(user as any)?.isConferenceParticipant || !!(user as any)?.is_conference_participant;
    if (isParticipant && variantKey !== 'conf') setVariantKey('conf');
  }, [user, variantKey]);

  // Load streak
 useEffect(() => {
     if (!user?.id) return;

     // Fetch streak
     apiClient
       .getProfile(user.id)
       .then((data) => setCurrentStreak(data?.streak || 0))
       .catch((err) => console.error('Error fetching streak:', err));

     // Fetch friend requests
     apiClient
       .getFriendRequests(user.id)
       .then((reqs) => setPendingRequests(Array.isArray(reqs) ? reqs.length : 0))
       .catch((e) => console.error('Index: Failed to fetch pending requests', e));

     // --- ADD THIS FETCH ---
     // Fetch notifications
     apiClient
       .getNotifications(user.id)
       .then((notifs) => {
         const unreadCount = Array.isArray(notifs) ? notifs.filter((n) => !n.is_read).length : 0;
         setUnreadNotifications(unreadCount);
       })
       .catch((e) => console.error('Index: Failed to fetch notifications', e));
  }, [user?.id]);

  // Advance to next day
  const advanceToNextDay = useCallback(() => {
    if (!challenge || !challengeList.length) return;

    const today = todayKey();
    const keys = storageKeys(variantKey);
    const currentIndex = Math.max(0, challengeList.findIndex((c) => c.id === challenge.id));
    const next = challengeList[(currentIndex + 1) % challengeList.length];

    if (user?.id) {
      localStorage.setItem(`${user.id}_${keys.current(today)}`, String(next.id));
      localStorage.removeItem(`${user.id}_${keys.completed(today)}`);
    }

    setChallenge(next);
    setHasUploadedToday(false);
  }, [challenge, challengeList, user?.id, variantKey]);

  // Midnight rollover
  useEffect(() => {
    const msUntilNextMidnight = () => {
      const now = new Date();
      const next = new Date(now);
      next.setDate(now.getDate() + 1);
      next.setHours(0, 0, 0, 0);
      return next.getTime() - now.getTime();
    };

    const params = new URLSearchParams(window.location.search);
    const fast = Number(params.get('fastMidnight'));
    const ms = !Number.isNaN(fast) && fast > 0 ? fast * 1000 : msUntilNextMidnight();

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

  // Upload
  const openUpload = () => setIsUploadOpen(true);

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

      const post = await apiClient.createPost({
        user_id: user.id,
        caption: title,
        media_type: mediaType,
        media_url: result.mediaUrl,
        challenge_id: challenge.id,
        challenge_set: challenge.challenge_set === 'conf' ? 'conference' : variantKey,
      });

      if (!post.verified) {
        setBanner({
          message: 'Upload received and sent for manual review. It will not count until verified.',
          type: 'info',
        });
        return;
      }

      localStorage.setItem(`${user.id}_${keys.completed(today)}`, '1');
      setHasUploadedToday(true);

      const newStreak = currentStreak + 1;
      await apiClient.updateProfile(user.id, { streak: newStreak });
      setCurrentStreak(newStreak);

      setBanner({ message: 'Proof accepted! 🎉', type: 'info' });
    } catch (err: any) {
      console.error('Upload failed:', err);
      setBanner({
        message: 'Upload received and sent for manual review. It will not count until verified.',
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

  // Show loader until auth & challenges are ready
  if (authLoading || !user || challengesLoading || !challenge) {
    return (
      <div className="index-loading">
        <div className="index-loading-spinner"></div>
      </div>
    );
  }

  const isParticipant = !!(user as any)?.isConferenceParticipant || !!(user as any)?.is_conference_participant;

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
                              {/* Update this condition: */}
                              {(pendingRequests > 0 || unreadNotifications > 0) && (
                                <span className="index-nav-badge"></span>
                              )}
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
