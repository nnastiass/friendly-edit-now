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
    streak: number | null;
  } | null;
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
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (friendsError) throw friendsError;

      const friendsWithProfiles = await Promise.all(
        (friendsData || []).map(async (friendship) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, streak')
            .eq('id', friendship.friend_id)
            .single();

          return {
            ...friendship,
            friend_profile: profileData
          };
        })
      );

      const sortedFriends = friendsWithProfiles.sort((a, b) => {
        const streakA = a.friend_profile?.streak || 0;
        const streakB = b.friend_profile?.streak || 0;
        return streakB - streakA;
      });

      setFriends(sortedFriends);
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
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

      if (error) throw error;

      setFriends(prev => prev.filter(friend => friend.id !== friendshipId));
      toast.success('Friend removed');
    } catch (error) {
      console.error('Failed to remove friend:', error);
      toast.error('Could not remove friend');
    }
  };

  const getInitials = (username: string | null, fullName: string | null) => {
    const name = username || fullName;
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
    <Card className="bg-black friends-list-card">


      <CardHeader className="friends-list-header">
        <CardTitle className="friends-list-title">
          <Users className="h-5 w-5" />
          <span>Friends ({friends.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="friends-list-content">
        {friends.map((friend) => (
          <div
            key={friend.id}
              className="friends-list-item bg-black border-[4px] border-[#2f1930] rounded-[20px] p-4 flex items-center justify-between"
            >


            <div className="friends-list-item-info">
              <Avatar className="friends-list-avatar">
                <AvatarImage src={friend.friend_profile?.avatar_url || ''} />
                <AvatarFallback className="bg-[#2f1930] text-white">
                  {getInitials(friend.friend_profile?.username, friend.friend_profile?.full_name)}
                </AvatarFallback>

              </Avatar>
              <div className="friends-list-user-details">
                <p className="friends-list-name">
                  @{friend.friend_profile?.username || friend.friend_profile?.full_name || 'Unknown'}
                </p>
                <p className="friends-list-streak text-white">
                  🔥 {friend.friend_profile?.streak || 0} day streak
                </p>

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
