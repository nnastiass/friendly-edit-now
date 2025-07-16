import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  // ... add more challenges with emojis
];

interface DailyChallengeProps {
  onComplete?: (points: number) => void;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [todaysChallenge, setTodaysChallenge] = useState(challenges[0]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
    // ... (rest of the useEffect logic remains the same)
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const data = await apiClient.getProfile(user.id);
      setCurrentStreak(data?.streak || 0);
    } catch (error) {
      toast.error("Failed to load user streak.");
    }
  };

  const updateStreak = async (newStreak: number) => {
    if (!user) return;
    try {
      await apiClient.updateProfile(user.id, { streak: newStreak });
      setCurrentStreak(newStreak);
    } catch (error) {
       toast.error("Failed to update streak.");
    }
  };

  const handleCompleteChallenge = async () => {
    if (isCompleted) return;
    setIsCompleted(true);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      if (currentProgress >= 100) clearInterval(interval);
    }, 50);

    localStorage.setItem(`challenge-${new Date().toDateString()}`, 'completed');

    const newStreak = currentStreak + 1;
    await updateStreak(newStreak);
    toast.success(`Challenge completed! Streak: ${newStreak} days`);

    if (onComplete) {
      onComplete(todaysChallenge.points);
    }
  };

  // ... (handleDevReset and other logic remains the same)

  return (
    <div className="daily-challenge-container">
      {/* ... JSX remains the same ... */}
    </div>
  );
};

export default DailyChallenge;
