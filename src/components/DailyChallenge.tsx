import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StreakCounter from './StreakCounter';
import './DailyChallenge.css';

export type Challenge = {
  id: number;
  title: string;
  description: string;
  points: number;
  emoji?: string;
};

// Export the list so the parent can pick/rotate challenges.
export const CHALLENGES: Challenge[] = [
  { id: 1, title: 'Say hi to a stranger', description: 'Greet someone you don’t know with a smile and a friendly hello', points: 10, emoji: '👋' },
  { id: 2, title: 'Compliment someone', description: 'Give someone a genuine compliment today', points: 10, emoji: '😊' },
  { id: 3, title: 'Start a conversation', description: 'Initiate a conversation with someone new', points: 15, emoji: '💬' },
  // ... add the rest of your challenges here ...
];

interface DailyChallengeProps {
  challenge: Challenge;
  onStartUpload: () => void;       // open upload modal
  currentStreak: number;
  hasUploadedToday: boolean;       // lock button if already uploaded today
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({
  challenge,
  onStartUpload,
  currentStreak,
  hasUploadedToday,
}) => {
  const [timeLeft, setTimeLeft] = React.useState({ hours: '00', minutes: '00', seconds: '00' });

  // Just the countdown. No localStorage / picking here anymore.
  React.useEffect(() => {
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
  }, []);

  return (
    <div className="daily-challenge-container">
      <Card className="daily-challenge-card">
        <CardContent className="daily-challenge-content">
          {challenge.emoji && (
            <div className="daily-challenge-emoji" style={{ fontSize: '3em' }}>
              {challenge.emoji}
            </div>
          )}
          <h3 className="daily-challenge-text">{challenge.title}</h3>
          <p className="daily-challenge-description">{challenge.description}</p>

          <Button
            onClick={onStartUpload}
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
              <div
                className="bg-black text-white rounded-xl px-6 py-4 text-2xl font-bold border-white border-solid"
                style={{ borderWidth: '3px' }}
              >
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
