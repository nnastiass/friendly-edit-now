import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
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
  id: string; // friendship ID
  friend_id: string; // the friend's user ID
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  streak: number | null;
}

type BannerType = 'error' | 'success' | 'info';

const FriendsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  // Top pop-out banner (black bg, 20px radius, top: 50px)
  const [banner, setBanner] = useState<{ message: string; type: BannerType } | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const bannerTimer = useRef<number | null>(null);

  const showBanner = (message: string, type: BannerType = 'info', duration = 3500) => {
    if (bannerTimer.current) {
      window.clearTimeout(bannerTimer.current);
      bannerTimer.current = null;
    }
    setBanner({ message, type });
    requestAnimationFrame(() => setBannerVisible(true));
    bannerTimer.current = window.setTimeout(() => {
      setBannerVisible(false);
      bannerTimer.current = null;
    }, duration);
  };

  const closeBanner = () => {
    if (bannerTimer.current) {
      window.clearTimeout(bannerTimer.current);
      bannerTimer.current = null;
    }
    setBannerVisible(false);
  };

  useEffect(() => {
    return () => {
      if (bannerTimer.current) window.clearTimeout(bannerTimer.current);
    };
  }, []);

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
      const friendsData: Friend[] = await apiClient.getFriends(user.id);
      setFriends(friendsData);
    } catch (error) {
      console.error('FriendsList: Error fetching friends:', error);
      // REMADE as top banner (was toast.error('Failed to load friends list.'))
      showBanner('Failed to load friends list.', 'error');
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
    setFriends(friends.filter(f => f.friend_id !== friendId)); // optimistic UI

    try {
      await apiClient.deleteFriend(user.id, friendId);
      // Deleted success toast: toast.success('Friend removed.')
      // Silent success — UI already updated.
    } catch (error) {
      console.error('FriendsList: Error deleting friend:', error);
      // REMADE as top banner (was toast.error('Failed to remove friend.'))
      showBanner('Failed to remove friend.', 'error');
      setFriends(originalFriends); // revert on failure
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  return (
    <div className="friends-list-container">
      {/* Top Pop-out Banner */}
      <div className="notify-root" aria-live="assertive" aria-atomic="true">
        <div
          className={`notify-banner ${bannerVisible ? 'visible' : ''} ${
            banner?.type ? `notify-${banner.type}` : ''
          }`}
          role="alert"
        >
          <span className="notify-text">{banner?.message}</span>
          <button
            type="button"
            className="notify-close"
            aria-label="Close notification"
            onClick={closeBanner}
          >
            ×
          </button>
        </div>
      </div>

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
          friends.map((friend) => friend && (
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
                onClick={() => handleDeleteFriend(friend.friend_id)}
              >
                Delete
              </Button>
            </div>
          ))
        ) : (
          <p className="no-friends-text">You haven't added any friends yet.</p>
        )}
      </div>

      {/* Bottom Navigation (if any) */}
    </div>
  );
};

export default FriendsList;
