
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import './StreakCounter.css';

interface StreakCounterProps {
  streak: number;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ streak }) => {


  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return 'Legendary streak!';
    if (streak >= 14) return 'Amazing progress!';
    if (streak >= 7) return 'Great job!';
    if (streak >= 3) return 'Building momentum!';
    return 'Getting started!';
  };

  return (
    <Card className="streak-counter-card">
      <CardContent className="streak-counter-content">
        <div className="streak-counter-main">

          <div>
            <div className="streak-counter-stats">
              <Flame className="h-5 w-5" />
              <span className="streak-counter-number">{streak}</span>
            </div>
            <p className="streak-counter-label">Day Streak</p>
          </div>
        </div>
        
        <p className="streak-counter-message">
          {getStreakMessage(streak)}
        </p>
      </CardContent>
    </Card>
  );
};

export default StreakCounter;
