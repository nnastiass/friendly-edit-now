import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Users, UserMinus } from 'lucide-react';
import './FriendsList.css';

interface Friend {
  id: string;
  friend_id: string;
  created_at: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  streak: number | null;
}

const FriendsList: React.FC = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user]);

  const fetchFriends = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const friendsData = await apiClient.getFriends(user.id);
      setFriends(friendsData || []);
    } catch (error) {
      toast.error("Failed to load friends list.");
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendshipId: string, friendId: string) => {
    if (!user) return;
    try {
      await apiClient.removeFriend(user.id, friendId);
      setFriends(prev => prev.filter(friend => friend.id !== friendshipId));
      toast.success('Friend removed');
    } catch (error) {
      toast.error("Failed to remove friend.");
    }
  };

  // ... (getInitials and JSX remains the same)

  return (
    <Card className="bg-black friends-list-card">
        {/* ... JSX remains the same ... */}
    </Card>
  );
};

export default FriendsList;
