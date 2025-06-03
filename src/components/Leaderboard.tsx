
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Users } from 'lucide-react';

const friends = [
  { id: 1, name: 'Alex Chen', streak: 15, points: 1250, avatar: '👨‍💻', rank: 1 },
  { id: 2, name: 'Sarah Kim', streak: 12, points: 980, avatar: '👩‍🎨', rank: 2 },
  { id: 3, name: 'You', streak: 7, points: 650, avatar: '🧑‍🚀', rank: 3 },
  { id: 4, name: 'Mike Johnson', streak: 5, points: 420, avatar: '👨‍🎓', rank: 4 },
  { id: 5, name: 'Emma Davis', streak: 3, points: 310, avatar: '👩‍💼', rank: 5 },
];

const Leaderboard = () => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-gray-500 font-bold">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default: return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Friend Leaderboard</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {friends.map((friend, index) => (
          <div 
            key={friend.id} 
            className={`p-4 border-b border-gray-100 last:border-b-0 ${
              friend.name === 'You' ? 'bg-blue-50' : 'hover:bg-gray-50'
            } transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full ${getRankBadge(friend.rank)} flex items-center justify-center`}>
                  {friend.rank <= 3 ? (
                    getRankIcon(friend.rank)
                  ) : (
                    <span className="text-white text-sm font-bold">#{friend.rank}</span>
                  )}
                </div>
                
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-lg">
                  {friend.avatar}
                </div>
                
                <div>
                  <p className={`font-semibold ${friend.name === 'You' ? 'text-blue-600' : 'text-gray-900'}`}>
                    {friend.name}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>🔥 {friend.streak} days</span>
                    <span>•</span>
                    <span>{friend.points} pts</span>
                  </div>
                </div>
              </div>

              {friend.name === 'You' && (
                <Badge className="bg-blue-500 hover:bg-blue-500">
                  You
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
