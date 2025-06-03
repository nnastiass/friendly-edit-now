
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const challenges = [
  {
    id: 1,
    title: "Ask someone out",
    description: "Start a conversation with someone new",
    points: 50,
  },
  {
    id: 2,
    title: "Join a group activity",
    description: "Participate in a social event",
    points: 75,
  },
  {
    id: 3,
    title: "Call a friend",
    description: "Reach out to someone you haven't spoken to",
    points: 60,
  },
  {
    id: 4,
    title: "Help a neighbor",
    description: "Offer assistance to someone nearby",
    points: 100,
  },
  {
    id: 5,
    title: "Compliment a stranger",
    description: "Give someone a genuine compliment",
    points: 40,
  },
  {
    id: 6,
    title: "Share a meal",
    description: "Invite someone to eat together",
    points: 80,
  },
  {
    id: 7,
    title: "Send a thank you message",
    description: "Express gratitude to someone important",
    points: 45,
  }
];

interface DailyChallengeProps {
  onComplete: (points: number) => void;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({ onComplete }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [todaysChallenge, setTodaysChallenge] = useState(() => {
    // Get challenge based on today's date for consistency
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('challengeDate');
    const savedChallenge = localStorage.getItem('todaysChallenge');
    
    if (savedDate === today && savedChallenge) {
      return JSON.parse(savedChallenge);
    } else {
      // Generate new challenge for today
      const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
      const challenge = challenges[daysSinceEpoch % challenges.length];
      localStorage.setItem('challengeDate', today);
      localStorage.setItem('todaysChallenge', JSON.stringify(challenge));
      return challenge;
    }
  });
  
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const calculateTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Next midnight
    
    const diff = midnight.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  useEffect(() => {
    // Check if challenge was completed today
    const today = new Date().toDateString();
    const completedDate = localStorage.getItem('challengeCompletedDate');
    if (completedDate === today) {
      setIsCompleted(true);
    }

    // Set initial time
    setTimeLeft(calculateTimeUntilMidnight());

    // Update timer every second
    const timer = setInterval(() => {
      const newTime = calculateTimeUntilMidnight();
      setTimeLeft(newTime);
      
      // Check if it's a new day (timer reached 0)
      if (newTime.hours === 23 && newTime.minutes === 59 && newTime.seconds === 59) {
        // Reset for new day
        resetChallenge();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const resetChallenge = () => {
    const today = new Date().toDateString();
    const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const newChallenge = challenges[daysSinceEpoch % challenges.length];
    
    setTodaysChallenge(newChallenge);
    setIsCompleted(false);
    
    localStorage.setItem('challengeDate', today);
    localStorage.setItem('todaysChallenge', JSON.stringify(newChallenge));
    localStorage.removeItem('challengeCompletedDate');
    
    toast.success('New challenge available!');
  };

  const handleComplete = () => {
    const today = new Date().toDateString();
    setIsCompleted(true);
    onComplete(todaysChallenge.points);
    localStorage.setItem('challengeCompletedDate', today);
    toast.success(`🎉 Challenge completed! +${todaysChallenge.points} points`);
  };

  const handleDevReset = () => {
    // Generate a random new challenge instead of using date-based
    const randomIndex = Math.floor(Math.random() * challenges.length);
    const newChallenge = challenges[randomIndex];
    const today = new Date().toDateString();
    
    setTodaysChallenge(newChallenge);
    setIsCompleted(false);
    
    localStorage.setItem('challengeDate', today);
    localStorage.setItem('todaysChallenge', JSON.stringify(newChallenge));
    localStorage.removeItem('challengeCompletedDate');
    
    toast.success('New challenge generated for development!');
  };

  return (
    <div className="flex flex-col items-center text-center space-y-8">
      {/* Challenge Title */}
      <h2 className="text-3xl font-semibold text-white">
        {todaysChallenge.title}
      </h2>

      {/* Countdown Timer */}
      <div className="flex space-x-4">
        <div className="bg-gray-700 rounded-xl px-6 py-4 min-w-[80px]">
          <div className="text-2xl font-bold text-white">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className="text-sm text-gray-300">Hours</div>
        </div>
        <div className="bg-gray-700 rounded-xl px-6 py-4 min-w-[80px]">
          <div className="text-2xl font-bold text-white">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className="text-sm text-gray-300">Minutes</div>
        </div>
        <div className="bg-gray-700 rounded-xl px-6 py-4 min-w-[80px]">
          <div className="text-2xl font-bold text-white">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className="text-sm text-gray-300">Seconds</div>
        </div>
      </div>

      {/* Complete Button */}
      <Button 
        onClick={handleComplete}
        disabled={isCompleted}
        className="w-full max-w-sm bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-full text-lg disabled:bg-green-600 disabled:opacity-80"
      >
        {isCompleted ? 'Completed!' : 'Mark as Complete'}
      </Button>

      {/* Dev Reset Button */}
      <Button 
        onClick={handleDevReset}
        variant="outline"
        className="w-full max-w-sm border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
      >
        🔧 Dev: New Challenge
      </Button>
    </div>
  );
};

export default DailyChallenge;
