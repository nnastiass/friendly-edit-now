import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StreakCounter from './StreakCounter';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client'; // UPDATED: Import API client
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import './DailyChallenge.css';

// ... (challenges array remains the same)
const challenges = [
  { id: 1, title: 'Say hi to a stranger', description: 'Greet someone you don’t know with a smile and a friendly hello', points: 10, emoji: '👋' },
  { id: 2, title: 'Compliment someone', description: 'Give someone a genuine compliment today', points: 10, emoji: '😊' },
  { id: 3, title: 'Start a conversation', description: 'Initiate a conversation with someone new', points: 15, emoji: '💬' },
  // ... add emojis to all your challenges
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

    const today = new Date().toDateString();
    const storedChallengeId = localStorage.getItem(`daily-challenge-${today}`);

    if (storedChallengeId) {
      const found = challenges.find(c => c.id === Number(storedChallengeId));
      if (found) setTodaysChallenge(found);
    } else {
      const challengeIndex = new Date().getDate() % challenges.length;
      const selected = challenges[challengeIndex];
      setTodaysChallenge(selected);
      localStorage.setItem(`daily-challenge-${today}`, selected.id.toString());
    }

    const completedToday = localStorage.getItem(`challenge-${today}`);
    if (completedToday) {
      setIsCompleted(true);
      setProgress(100);
    }

    const updateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
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
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const data = await apiClient.getProfile(user.id); // UPDATED
      setCurrentStreak(data?.streak || 0);
    } catch (error) {
      // Error handled by client
    }
  };

  const updateStreak = async (newStreak: number) => {
    if (!user) return;
    try {
      await apiClient.updateProfile(user.id, { streak: newStreak }); // UPDATED
      setCurrentStreak(newStreak);
    } catch (error) {
       // Error handled by client
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

  // ... (handleDevReset remains the same)
  const handleDevReset = () => {
    const randomIndex = Math.floor(Math.random() * challenges.length);
    const newChallenge = challenges[randomIndex];
    setTodaysChallenge(newChallenge);

    const today = new Date().toDateString();
    localStorage.setItem(`daily-challenge-${today}`, newChallenge.id.toString());
    localStorage.removeItem(`challenge-${today}`);

    setIsCompleted(false);
    setProgress(0);

    toast.success('New challenge generated!');
  };

  return (
    <div className="daily-challenge-container">
      <Card className="daily-challenge-card">
        <CardContent className="daily-challenge-content">
          <div className="daily-challenge-emoji">{todaysChallenge.emoji}</div>
          <h3 className="daily-challenge-text">{todaysChallenge.title}</h3>
          <p className="daily-challenge-description">{todaysChallenge.description}</p>
          <Button
            onClick={handleCompleteChallenge}
            disabled={isCompleted}
            className={`daily-challenge-button px-10 py-7 ${isCompleted ? 'daily-challenge-complete' : ''}`}
          >
            {isCompleted ? `Completed!` : 'Complete Challenge'}
          </Button>
          {isCompleted && (
            <div className="daily-challenge-progress">
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>
      <div className="daily-challenge-timer-boxes flex justify-center gap-4 mt-6">
        {['Hours', 'Minutes', 'Seconds'].map((label, i) => {
          const value = i === 0 ? timeLeft.hours : i === 1 ? timeLeft.minutes : timeLeft.seconds;
          return (
            <div key={label} className="flex flex-col items-center">
              <div
                style={{ borderWidth: '3px' }}
                className="bg-black text-white rounded-xl px-6 py-4 text-2xl font-bold border-white border-solid"
              >
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
