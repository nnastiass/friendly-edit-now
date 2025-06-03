
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ streak }) => {
  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '🚀';
    if (streak >= 7) return '⭐';
    if (streak >= 3) return '💪';
    return '🌱';
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return 'Legendary streak!';
    if (streak >= 14) return 'Amazing progress!';
    if (streak >= 7) return 'Great job!';
    if (streak >= 3) return 'Building momentum!';
    return 'Getting started!';
  };

  return (
    <Card className="bg-gradient-to-r from-orange-400 to-pink-500 text-white border-0">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <div className="text-3xl">{getStreakEmoji(streak)}</div>
          <div>
            <div className="flex items-center space-x-2">
              <Flame className="h-5 w-5" />
              <span className="text-2xl font-bold">{streak}</span>
            </div>
            <p className="text-sm opacity-90">Day Streak</p>
          </div>
        </div>
        
        <p className="text-orange-100 text-sm">
          {getStreakMessage(streak)}
        </p>
      </CardContent>
    </Card>
  );
};

export default StreakCounter;
