import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StreakCounter from './StreakCounter';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import './DailyChallenge.css';

const challenges = [
  { id: 1, title: 'Say hi to a stranger', description: 'Greet someone you don’t know with a smile and a friendly hello', points: 10, emoji: '👋' },
  { id: 2, title: 'Compliment someone', description: 'Give someone a genuine compliment today', points: 10, emoji: '😊' },
  { id: 3, title: 'Start a conversation', description: 'Initiate a conversation with someone new', points: 15, emoji: '💬' },
  // ... keep the rest of your challenges ...
];

interface DailyChallengeProps {
  onCompleteRequested?: () => void;
  onChallengeLoaded?: (challengeTitle: string) => void;
  deferCompletion?: boolean;
  currentStreak: number;
  hasUploadedToday: boolean;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({
  onCompleteRequested,
  onChallengeLoaded,
  deferCompletion = false,
  currentStreak,
  hasUploadedToday,
}) => {
  const { user } = useAuth();
  const [todaysChallenge, setTodaysChallenge] = useState(challenges[0]);
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    const today = new Date().toDateString();
    const storedChallengeId = localStorage.getItem(`daily-challenge-${today}`);
    if (storedChallengeId) {
      const found = challenges.find(c => c.id === Number(storedChallengeId));
      if (found) onChallengeLoaded?.(found.title);
      setTodaysChallenge(found || challenges[0]);
    } else {
      const selected = challenges[new Date().getDate() % challenges.length];
      setTodaysChallenge(selected);
      onChallengeLoaded?.(selected.title);
      localStorage.setItem(`daily-challenge-${today}`, selected.id.toString());
    }

    const updateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [onChallengeLoaded]);

  const handleClick = async () => {
    if (!user?.id) return;
    if (hasUploadedToday) return; // prevent multiple uploads

    onCompleteRequested?.();

    try {
      const newStreak = currentStreak + 1;
      await apiClient.updateProfile(user.id, { streak: newStreak });
      toast.success(`Streak updated: ${newStreak} days`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update streak.');
    }
  };

  return (
    <div className="daily-challenge-container">
      <Card className="daily-challenge-card">
        <CardContent className="daily-challenge-content">
          {todaysChallenge.emoji && <div className="daily-challenge-emoji" style={{ fontSize: '3em' }}>{todaysChallenge.emoji}</div>}
          <h3 className="daily-challenge-text">{todaysChallenge.title}</h3>
          <p className="daily-challenge-description">{todaysChallenge.description}</p>
          <Button
            onClick={handleClick}
            disabled={hasUploadedToday}
            className={`daily-challenge-button px-10 py-7 ${hasUploadedToday ? 'daily-challenge-complete' : ''}`}
          >
            {hasUploadedToday ? 'Completed Today' : 'Complete Challenge'}
          </Button>
        </CardContent>
      </Card>

      <div className="daily-challenge-timer-boxes flex justify-center gap-1 mt-6">
        {['Hours', 'Minutes', 'Seconds'].map((label, i) => {
          const value = i === 0 ? timeLeft.hours : i === 1 ? timeLeft.minutes : timeLeft.seconds;
          return (
            <div key={label} className="flex flex-col items-center">
              <div className="bg-black text-white rounded-xl px-6 py-4 text-2xl font-bold border-white border-solid" style={{ borderWidth: '3px' }}>
                {value}
              </div>
              <span className="text-sm text-gray-400 mt-1">{label}</span>
            </div>
          );
        })}
      </div>

      <StreakCounter streak={currentStreak} />
    </div>
  );
};

export default DailyChallenge;
