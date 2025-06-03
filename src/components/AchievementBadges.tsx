
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Award, Target, Users, Flame, Trophy } from 'lucide-react';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  unlocked: boolean;
  requirement: number;
  progress: number;
  category: 'streak' | 'challenges' | 'social';
}

interface AchievementBadgesProps {
  totalChallenges: number;
  streak: number;
}

const AchievementBadges: React.FC<AchievementBadgesProps> = ({ totalChallenges, streak }) => {
  const achievements: Achievement[] = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Complete your first challenge',
      icon: Star,
      unlocked: totalChallenges >= 1,
      requirement: 1,
      progress: Math.min(totalChallenges, 1),
      category: 'challenges'
    },
    {
      id: 2,
      title: 'Hot Streak',
      description: 'Maintain a 7-day streak',
      icon: Flame,
      unlocked: streak >= 7,
      requirement: 7,
      progress: Math.min(streak, 7),
      category: 'streak'
    },
    {
      id: 3,
      title: 'Challenge Master',
      description: 'Complete 10 challenges',
      icon: Target,
      unlocked: totalChallenges >= 10,
      requirement: 10,
      progress: Math.min(totalChallenges, 10),
      category: 'challenges'
    },
    {
      id: 4,
      title: 'Social Butterfly',
      description: 'Complete 25 challenges',
      icon: Users,
      unlocked: totalChallenges >= 25,
      requirement: 25,
      progress: Math.min(totalChallenges, 25),
      category: 'social'
    },
    {
      id: 5,
      title: 'Dedication',
      description: 'Maintain a 30-day streak',
      icon: Trophy,
      unlocked: streak >= 30,
      requirement: 30,
      progress: Math.min(streak, 30),
      category: 'streak'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'streak': return 'from-orange-400 to-red-500';
      case 'challenges': return 'from-blue-400 to-indigo-500';
      case 'social': return 'from-green-400 to-emerald-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Achievements</span>
          </div>
          <Badge className="bg-white/20 border-0">
            {unlockedCount}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => {
            const IconComponent = achievement.icon;
            const progressPercentage = (achievement.progress / achievement.requirement) * 100;
            
            return (
              <div 
                key={achievement.id}
                className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                  achievement.unlocked 
                    ? `bg-gradient-to-br ${getCategoryColor(achievement.category)} text-white border-transparent shadow-lg` 
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    achievement.unlocked ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    <IconComponent className={`h-6 w-6 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  
                  <h4 className={`font-semibold text-sm mb-1 ${achievement.unlocked ? 'text-white' : 'text-gray-600'}`}>
                    {achievement.title}
                  </h4>
                  
                  <p className={`text-xs mb-2 ${achievement.unlocked ? 'text-white/80' : 'text-gray-500'}`}>
                    {achievement.description}
                  </p>

                  {!achievement.unlocked && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {achievement.progress}/{achievement.requirement}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementBadges;
