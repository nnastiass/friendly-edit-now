import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // UPDATED
import { apiClient } from '@/lib/api-client'; // UPDATED
import './Leaderboard.css';

// UPDATED: Interface matches the API response
interface LeaderboardEntry {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null; // You might want to add this to your API/DB
  streak: number | null;
}

const Leaderboard = () => {
  const { user } = useAuth(); // UPDATED
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]); // UPDATED
  const [loading, setLoading] = useState(true); // UPDATED

  useEffect(() => {
    if (user) {
      fetchLeaderboard();
    }
  }, [user]);

  const fetchLeaderboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await apiClient.getLeaderboard(user.id); // UPDATED
      setLeaderboard(data || []);
    } catch (error) {
      // Error handled by client
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 2: return <Medal className="h-5 w-5 text-gray-300" />;
      case 3: return <Award className="h-5 w-5 text-yellow-600" />;
      default: return null;
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

  if (loading) {
    return <div>Loading leaderboard...</div>;
  }

  return (
    <Card className="leaderboard-card">
      <CardHeader className="leaderboard-header">
        <CardTitle className="leaderboard-title">
          <Users className="h-5 w-5" />
          <span>Friend Leaderboard</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="leaderboard-content">
        {leaderboard.map((entry, index) => {
          const rank = index + 1;
          const isCurrentUser = entry.id === user?.id;
          return (
            <div
              key={entry.id}
              className={`leaderboard-item ${isCurrentUser ? 'leaderboard-item-you' : ''}`}
            >
              <div className="leaderboard-item-content">
                <div className="leaderboard-item-left">
                  <div className={`leaderboard-rank-badge ${getRankBadgeClass(rank)}`}>
                    {rank <= 3 ? getRankIcon(rank) : <span className="text-white text-sm font-bold">#{rank}</span>}
                  </div>

                  <div className="leaderboard-avatar">
                    {/* You can use an Avatar component here if you add avatar_url */}
                    {(entry.username || entry.full_name || 'U').charAt(0)}
                  </div>

                  <div className="leaderboard-user-info">
                    <p className={`leaderboard-username ${isCurrentUser ? 'leaderboard-username-you' : ''}`}>
                      {entry.username || entry.full_name}
                    </p>
                    <div className="leaderboard-stats">
                      <span>🔥 {entry.streak || 0} days</span>
                    </div>
                  </div>
                </div>

                {isCurrentUser && (
                  <Badge className="leaderboard-you-badge">
                    You
                  </Badge>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
