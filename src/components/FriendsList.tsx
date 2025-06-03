
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, UserMinus } from 'lucide-react';

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
    return <div className="text-center text-gray-400">Loading friends...</div>;
  }

  if (friends.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400">No friends yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Friends ({friends.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {friends.map((friend) => (
          <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={friend.friend_profile?.avatar_url || ''} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {getInitials(friend.friend_profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">
                  {friend.friend_profile?.full_name || 'No name set'}
                </p>
                {friend.friend_profile?.username && (
                  <p className="text-sm text-purple-400">@{friend.friend_profile.username}</p>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => removeFriend(friend.id, friend.friend_id)}
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
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
