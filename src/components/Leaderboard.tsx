import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import './Leaderboard.css';

interface LeaderboardEntry {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  streak: number | null;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLeaderboard();
    }
  }, [user]);

  const fetchLeaderboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await apiClient.getLeaderboard(user.id);
      setLeaderboard(data || []);
    } catch (error) {
      // Error handled by client
    } finally {
      setLoading(false);
    }
  };

  // ... (getRankIcon, getRankBadgeClass, and JSX remains the same)

  return (
    <Card className="leaderboard-card">
      {/* ... JSX remains the same ... */}
    </Card>
  );
};

export default Leaderboard;
