import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StreakCounter from './StreakCounter';
import { Challenge } from '@/lib/challengeSets';
import './DailyChallenge.css';

interface DailyChallengeProps {
  challenge: Challenge;
  onStartUpload: () => void;
  currentStreak: number;
  hasUploadedToday: boolean;
  onMidnight?: () => void;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({
  challenge,
  onStartUpload,
  currentStreak,
  hasUploadedToday,
  onMidnight,
}) => {
  const [timeLeft, setTimeLeft] = React.useState({ hours: '00', minutes: '00', seconds: '00' });

  // Countdown + optional midnight callback
  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
      setTimeLeft({ hours, minutes, seconds });

      // fire parent callback if it's exactly midnight
      if (diff < 1000) {
        onMidnight?.();
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [onMidnight]);

  return (
    <div className="daily-challenge-container">
      <Card className="daily-challenge-card">
        <CardContent className="daily-challenge-content">
          {challenge.emoji && <div className="daily-challenge-emoji" style={{ fontSize: '3em' }}>{challenge.emoji}</div>}
          <h3 className="daily-challenge-text">{challenge.title ?? 'Offline Challenge'}</h3>
          <p className="daily-challenge-description">{challenge.description ?? ''}</p>

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
