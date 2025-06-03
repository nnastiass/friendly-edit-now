import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, UserMinus } from 'lucide-react';
import './FriendsList.css';

interface Friend {
  id: string;
  friend_id: string;
  created_at: string;
  friend_profile: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
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

    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          friend_id,
          created_at,
          friend_profile:profiles!friends_friend_id_fkey(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFriends(data || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendshipId: string, friendId: string) => {
    if (!user) return;

    try {
      // Remove both directions of the friendship
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

      if (error) throw error;

      toast.success('Friend removed');
      setFriends(prev => prev.filter(friend => friend.id !== friendshipId));
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  if (loading) {
    return <div className="friends-list-loading">Loading friends...</div>;
  }

  if (friends.length === 0) {
    return (
      <Card className="friends-list-empty">
        <CardContent className="friends-list-empty-content">
          <Users className="friends-list-empty-icon" />
          <p className="friends-list-empty-text">No friends yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="friends-list-card">
      <CardHeader className="friends-list-header">
        <CardTitle className="friends-list-title">
          <Users className="h-5 w-5" />
          <span>Friends ({friends.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="friends-list-content">
        {friends.map((friend) => (
          <div key={friend.id} className="friends-list-item">
            <div className="friends-list-item-info">
              <Avatar className="friends-list-avatar">
                <AvatarImage src={friend.friend_profile?.avatar_url || ''} />
                <AvatarFallback className="friends-list-avatar-fallback">
                  {getInitials(friend.friend_profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="friends-list-user-details">
                <p className="friends-list-name">
                  {friend.friend_profile?.full_name || 'No name set'}
                </p>
                {friend.friend_profile?.username && (
                  <p className="friends-list-username">@{friend.friend_profile.username}</p>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => removeFriend(friend.id, friend.friend_id)}
              className="friends-list-remove-button"
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default FriendsList;
