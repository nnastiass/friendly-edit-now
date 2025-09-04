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
  // ... keep rest of your challenges ...
];

interface DailyChallengeProps {
  onComplete?: (points: number) => void;
  onChallengeLoaded?: (challengeTitle: string) => void;
  deferCompletion?: boolean;
  onCompleteRequested?: () => void;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({
  onComplete,
  onChallengeLoaded,
  deferCompletion = false,
  onCompleteRequested,
}) => {
  const { user } = useAuth();
  const [todaysChallenge, setTodaysChallenge] = useState(challenges[0]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }

    const today = new Date().toDateString();
    const storedChallengeId = localStorage.getItem(`daily-challenge-${today}`);
    if (storedChallengeId) {
      const found = challenges.find(c => c.id === Number(storedChallengeId));
      if (found) {
        setTodaysChallenge(found);
        onChallengeLoaded?.(found.title);
      }
    } else {
      const challengeIndex = new Date().getDate() % challenges.length;
      const selected = challenges[challengeIndex];
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
  }, [user, onChallengeLoaded]);

  const fetchUserProfile = async () => {
    if (!user?.id) return;
    try {
      const data = await apiClient.getProfile(user.id);
      setCurrentStreak(data?.streak || 0);
    } catch (error) {
      console.error('DailyChallenge: Error fetching user profile:', error);
      toast.error("Failed to load user streak.");
    }
  };

  const handleCompleteChallenge = async () => {
    if (deferCompletion) {
      onCompleteRequested?.();
      return;
    }

    if (isCompleted) return;

    setIsCompleted(true);
    const today = new Date();
    localStorage.setItem(`challenge-${today.toDateString()}`, 'completed');

    const newStreak = currentStreak + 1;
    try {
      await apiClient.updateProfile(user.id, { streak: newStreak });
      setCurrentStreak(newStreak);
      toast.success(`Challenge completed! Streak: ${newStreak} days`);
      onComplete?.(todaysChallenge.points);
    } catch (error) {
      console.error('DailyChallenge: Error updating streak:', error);
      toast.error("Failed to update streak.");
    }
  };

  const handleDevReset = () => {
    const randomIndex = Math.floor(Math.random() * challenges.length);
    const newChallenge = challenges[randomIndex];
    setTodaysChallenge(newChallenge);
    const today = new Date().toDateString();
    localStorage.setItem(`daily-challenge-${today}`, newChallenge.id.toString());
    localStorage.removeItem(`challenge-${today}`);
    setIsCompleted(false);
    toast.success('New challenge generated!');
  };

  return (
    <div className="daily-challenge-container">
      <Card className="daily-challenge-card">
        <CardContent className="daily-challenge-content">
          {todaysChallenge.emoji && (
            <div className="daily-challenge-emoji" style={{ fontSize: '3em' }}>
              {todaysChallenge.emoji}
            </div>
          )}

          <h3 className="daily-challenge-text">{todaysChallenge.title}</h3>
          <p className="daily-challenge-description">{todaysChallenge.description}</p>

          <Button
            onClick={handleCompleteChallenge}
            disabled={!deferCompletion && isCompleted}
            className={`daily-challenge-button px-10 py-7 ${(!deferCompletion && isCompleted) ? 'daily-challenge-complete' : ''}`}
          >
            {(!deferCompletion && isCompleted) ? 'Completed!' : 'Complete Challenge'}
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

      <div className="flex justify-center mt-4">
        <Button
          onClick={handleDevReset}
          variant="outline"
          size="sm"
          className="text-gray-400 border-gray-600 hover:bg-gray-800"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Dev: New Challenge
        </Button>
      </div>
    </div>
  );
};

export default DailyChallenge;
