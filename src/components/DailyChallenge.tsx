import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StreakCounter from './StreakCounter';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import './DailyChallenge.css';

interface DailyChallengeProps {
  onComplete?: (points: number) => void;
}

const challenges = [
  {
    id: 1,
    title: 'Share your breakfast',
    description: 'Post a photo of what you had for breakfast today',
    points: 10,
  },
  {
    id: 2,
    title: 'Morning walk',
    description: 'Take a 10-minute walk and share your route',
    points: 15,
  },
  {
    id: 3,
    title: 'Read for 15 minutes',
    description: 'Read something interesting and share a quote',
    points: 12,
  },
  {
    id: 4,
    title: 'Drink 8 glasses of water',
    description: 'Stay hydrated throughout the day',
    points: 8,
  },
  {
    id: 5,
    title: 'Create something',
    description: 'Draw, write, or make something creative',
    points: 20,
  },
];

const DailyChallenge: React.FC<DailyChallengeProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [todaysChallenge, setTodaysChallenge] = useState(challenges[0]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
    
    // Get today's challenge based on date
    const today = new Date();
    const challengeIndex = today.getDate() % challenges.length;
    setTodaysChallenge(challenges[challengeIndex]);

    // Check if challenge was already completed today
    const completedToday = localStorage.getItem(`challenge-${today.toDateString()}`);
    if (completedToday) {
      setIsCompleted(true);
      setProgress(100);
    }

    // Calculate time left until midnight
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
    const interval = setInterval(updateTimeLeft, 1000); // update every second


    return () => clearInterval(interval);
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('streak')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setCurrentStreak(data?.streak || 0);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const updateStreak = async (newStreak: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ streak: newStreak })
        .eq('id', user.id);

      if (error) throw error;

      setCurrentStreak(newStreak);
    } catch (error) {
      console.error('Error updating streak:', error);
      toast.error('Failed to update streak');
    }
  };

  const handleCompleteChallenge = async () => {
    if (isCompleted) return;

    setIsCompleted(true);
    
    // Animate progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 50);

    // Store completion in localStorage
    const today = new Date();
    localStorage.setItem(`challenge-${today.toDateString()}`, 'completed');

    // Update streak in database
    const newStreak = currentStreak + 1;
    await updateStreak(newStreak);

    toast.success(`Challenge completed! Streak: ${newStreak} days`);

    if (onComplete) {
      onComplete(todaysChallenge.points);
    }
  };

  const handleDevReset = () => {
    // Get a new random challenge
    const randomIndex = Math.floor(Math.random() * challenges.length);
    setTodaysChallenge(challenges[randomIndex]);
    
    // Reset completion state
    setIsCompleted(false);
    setProgress(0);
    
    // Clear localStorage for today
    const today = new Date();
    localStorage.removeItem(`challenge-${today.toDateString()}`);
    
    toast.success('New challenge generated!');
  };

  return (
    <div className="daily-challenge-container">

      {/* 1. Daily Challenge Card */}

      <Card className="daily-challenge-card">
        <CardContent className="daily-challenge-content">
          <div className="daily-challenge-emoji">{todaysChallenge.emoji}</div>

          <h3 className="daily-challenge-text">{todaysChallenge.title}</h3>
          <p className="daily-challenge-description">{todaysChallenge.description}</p>

          <Button
            onClick={handleCompleteChallenge}
            disabled={isCompleted}
            className={`daily-challenge-button ${isCompleted ? 'daily-challenge-complete' : ''}`}
          >
            {isCompleted ? `Completed! +${todaysChallenge.points} points` : 'Complete Challenge'}
          </Button>

          {isCompleted && (
            <div className="daily-challenge-progress">
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Timer */}
      <div className="daily-challenge-timer-boxes flex justify-center gap-4 mt-6">
        {['Hours', 'Minutes', 'Seconds'].map((label, i) => {
          const value = i === 0 ? timeLeft.hours : i === 1 ? timeLeft.minutes : timeLeft.seconds;
          return (
            <div key={label} className="flex flex-col items-center">
              <div className="bg-[#2f2f2f] text-white rounded-xl px-6 py-4 text-2xl font-bold">
                {value}
              </div>
              <span className="text-sm text-gray-400 mt-1">{label}</span>
            </div>
          );
        })}
      </div>

      {/* 3. Streak */}
      <StreakCounter streak={currentStreak} />

      {/* Dev Button */}
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
