import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client'; // Import the centralized API client
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
  id: string; // This is the friendship ID from your API
  friend_id: string; // The ID of the friend
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  streak: number | null;
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

  const fetchFriends = async () => {
    if (!user || !user.id) {
      console.warn("FriendsList: User or user ID not available for fetching friends.");
      return;
    }
    setLoading(true);
    try {
      // Use apiClient to fetch friends
      const friendsData: Friend[] = await apiClient.getFriends(user.id);
      setFriends(friendsData);
    } catch (error) {
      console.error('FriendsList: Error fetching friends:', error);
      toast.error('Failed to load friends list.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFriend = async (friendId: string) => {
    if (!user || !user.id) {
      console.warn("FriendsList: User or user ID not available for deleting friend.");
      return;
    }

    const originalFriends = friends;
    setFriends(friends.filter(f => f.friend_id !== friendId)); // Optimistic UI update

    try {
      // Use apiClient to delete friend
      await apiClient.deleteFriend(user.id, friendId);
      toast.success('Friend removed.');
    } catch (error) {
      console.error('FriendsList: Error deleting friend:', error);
      toast.error('Failed to remove friend.');
      setFriends(originalFriends); // Revert UI if API call fails
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
          friends.map((friend) => friend && ( // friend_profile is now flattened into friend
            <div key={friend.id} className="friend-card">
              <div className="friend-info">
                <Avatar className="friend-avatar">
                  <AvatarImage src={friend.avatar_url || ''} />
                  <AvatarFallback
                    className="avatar-fallback"
                    style={{ backgroundColor: generatePastelColor(friend.id) }}
                  >
                    {getInitials(friend.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="friend-name">{friend.full_name || 'Unknown'}</p>
                  <p className="friend-username">@{friend.username || '...'}</p>
                </div>
              </div>
              <Button
                className="delete-button"
                onClick={() => handleDeleteFriend(friend.friend_id)} // Use friend_id for deletion
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

    </div>
  );
};

export default FriendsList;
