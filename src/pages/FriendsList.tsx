import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Home, User, Plus, ArrowLeft } from 'lucide-react';
import './FriendsList.css';

// Helper function to generate pastel colors for avatars
const pastelColors = [
  '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'
];
const generatePastelColor = (id: string) => {
  if (!id) return pastelColors[0];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return pastelColors[hash % pastelColors.length];
};

interface Friend {
  id: string; // This is the friendship ID
  friend_profile: {
    id: string; // This is the friend's user ID
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

const FriendsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user]);

  // --- REWRITTEN, MORE ROBUST DATA FETCHING LOGIC ---
  const fetchFriends = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Step 1: Get the list of friend relationships
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('id, friend_id')
        .eq('user_id', user.id);

      if (friendsError) throw friendsError;

      const friendsWithProfiles = [];
      if (friendsData) {
        // Step 2: Loop through each friendship and get the profile
        for (const friendship of friendsData) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .eq('id', friendship.friend_id)
            .single();

          if (profileError) {
            console.warn(`Could not fetch profile for friend ID: ${friendship.friend_id}`, profileError);
            continue; // Skip this friend if their profile can't be found
          }

          if (profileData) {
            friendsWithProfiles.push({
              id: friendship.id,
              friend_profile: profileData
            });
          }
        }
      }
      setFriends(friendsWithProfiles);

    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends list.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFriend = async (friendId: string) => {
    if (!user) return;

    const originalFriends = friends;
    setFriends(friends.filter(f => f.friend_profile?.id !== friendId));

    try {
      const { error: deleteError1 } = await supabase
        .from('friends')
        .delete()
        .eq('user_id', user.id)
        .eq('friend_id', friendId);

      if (deleteError1) throw deleteError1;

      const { error: deleteError2 } = await supabase
        .from('friends')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', user.id);

      if (deleteError2) throw deleteError2;

      toast.success('Friend removed.');
    } catch (error) {
      console.error('Error deleting friend:', error);
      toast.error('Failed to remove friend.');
      setFriends(originalFriends);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  return (
    <div className="friends-list-container">
      {/* Header */}
      <div className="friends-list-header">
        <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="friends-list-back-button">
          <ArrowLeft />
        </Button>
        <h1 className="friend-list-title">My friends</h1>
      </div>

      {/* Main Content */}
      <div className="friends-list-content">
        {loading ? (
          <p className="loading-text">Loading friends...</p>
        ) : friends.length > 0 ? (
          friends.map(({ id, friend_profile }) => friend_profile && (
            <div key={id} className="friend-card">
              <div className="friend-info">
                <Avatar className="friend-avatar">
                  <AvatarImage src={friend_profile.avatar_url || ''} />
                  <AvatarFallback
                    className="avatar-fallback"
                    style={{ backgroundColor: generatePastelColor(friend_profile.id) }}
                  >
                    {getInitials(friend_profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="friend-name">{friend_profile.full_name || 'Unknown'}</p>
                  <p className="friend-username">@{friend_profile.username || '...'}</p>
                </div>
              </div>
              <Button
                className="delete-button"
                onClick={() => handleDeleteFriend(friend_profile.id)}
              >
                Delete
              </Button>
            </div>
          ))
        ) : (
          <p className="no-friends-text">You haven't added any friends yet.</p>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="friends-list-bottom-nav">
        <div className="friends-list-nav-container">
          <button className="friends-list-nav-button friends-list-nav-button-inactive" onClick={() => { /* TODO */ }}>
            <Home className="friends-list-nav-icon" />
          </button>
          <button className="friends-list-nav-button friends-list-nav-button-inactive" onClick={() => navigate('/')}>
            <Plus className="friends-list-nav-icon" />
          </button>
          <button className="friends-list-nav-button friends-list-nav-button-active" onClick={() => navigate('/profile')}>
            <User className="friends-list-nav-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendsList;
