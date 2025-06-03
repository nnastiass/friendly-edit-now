
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Users } from 'lucide-react';
import './Leaderboard.css';

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

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1: return 'leaderboard-rank-gold';
      case 2: return 'leaderboard-rank-silver';
      case 3: return 'leaderboard-rank-bronze';
      default: return 'leaderboard-rank-default';
    }
  };

  return (
    <Card className="leaderboard-card">
      <CardHeader className="leaderboard-header">
        <CardTitle className="leaderboard-title">
          <Users className="h-5 w-5" />
          <span>Friend Leaderboard</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="leaderboard-content">
        {friends.map((friend, index) => (
          <div 
            key={friend.id} 
            className={`leaderboard-item ${friend.name === 'You' ? 'leaderboard-item-you' : ''}`}
          >
            <div className="leaderboard-item-content">
              <div className="leaderboard-item-left">
                <div className={`leaderboard-rank-badge ${getRankBadgeClass(friend.rank)}`}>
                  {friend.rank <= 3 ? (
                    getRankIcon(friend.rank)
                  ) : (
                    <span className="text-white text-sm font-bold">#{friend.rank}</span>
                  )}
                </div>
                
                <div className="leaderboard-avatar">
                  {friend.avatar}
                </div>
                
                <div className="leaderboard-user-info">
                  <p className={`leaderboard-username ${friend.name === 'You' ? 'leaderboard-username-you' : ''}`}>
                    {friend.name}
                  </p>
                  <div className="leaderboard-stats">
                    <span>🔥 {friend.streak} days</span>
                    <span>•</span>
                    <span>{friend.points} pts</span>
                  </div>
                </div>
              </div>

              {friend.name === 'You' && (
                <Badge className="leaderboard-you-badge">
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
