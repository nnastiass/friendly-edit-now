
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StreakCounter from './StreakCounter';
import './DailyChallenge.css';

interface DailyChallengeProps {
  onComplete?: (points: number) => void;
}

const challenges = [
  {
    id: 1,
    emoji: '📱',
    title: 'Share your breakfast',
    description: 'Post a photo of what you had for breakfast today',
    points: 10,
  },
  {
    id: 2,
    emoji: '🌅',
    title: 'Morning walk',
    description: 'Take a 10-minute walk and share your route',
    points: 15,
  },
  {
    id: 3,
    emoji: '📚',
    title: 'Read for 15 minutes',
    description: 'Read something interesting and share a quote',
    points: 12,
  },
  {
    id: 4,
    emoji: '💧',
    title: 'Drink 8 glasses of water',
    description: 'Stay hydrated throughout the day',
    points: 8,
  },
  {
    id: 5,
    emoji: '🎨',
    title: 'Create something',
    description: 'Draw, write, or make something creative',
    points: 20,
  },
];

const DailyChallenge: React.FC<DailyChallengeProps> = ({ onComplete }) => {
  const [todaysChallenge, setTodaysChallenge] = useState(challenges[0]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [currentStreak, setCurrentStreak] = useState(7);

  useEffect(() => {
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
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${hours}h ${minutes}m until next challenge`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleCompleteChallenge = () => {
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

    if (onComplete) {
      onComplete(todaysChallenge.points);
    }
  };

  return (
    <div className="daily-challenge-container">
      <StreakCounter streak={currentStreak} />
      
      <div className="daily-challenge-header">
        <h2 className="daily-challenge-title">Today's Challenge</h2>
        <p className="daily-challenge-subtitle">Complete to maintain your streak!</p>
      </div>

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

      <div className="daily-challenge-timer">
        {timeLeft}
      </div>
    </div>
  );
};

export default DailyChallenge;
