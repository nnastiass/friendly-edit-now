import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { Home, User, Plus, ArrowLeft, Check, X, Users } from 'lucide-react';
import './FriendRequests.css';

// Helper function to generate pastel colors for avatars
const pastelColors = [
  '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'
];
const generatePastelColor = (id: string) => {
  if (!id) return pastelColors[0];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return pastelColors[hash % pastelColors.length];
};

// UPDATED INTERFACE to match API's flat response structure
interface FriendRequest {
  id: string; // request ID
  sender_id: string;
  created_at: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

type BannerType = 'error' | 'success' | 'info';

const FriendRequestsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
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
      fetchFriendRequests();
    }
  }, [user]);

  const fetchFriendRequests = async () => {
    if (!user || !user.id) {
      console.warn("FriendRequests: User or user ID not available for fetching requests.");
      return;
    }
    setLoading(true);
    console.log("FriendRequests: Attempting to fetch requests for user ID:", user.id);
    try {
      const requestsData: FriendRequest[] = await apiClient.getFriendRequests(user.id);
      console.log("FriendRequests: API response for requests:", requestsData);
      setRequests(requestsData);
      console.log("FriendRequests: Requests state updated. Number of requests:", requestsData.length);
    } catch (error) {
      console.error('FriendRequests: Error fetching friend requests:', error);
      // REMADE as top banner (was toast.error('Failed to load friend requests.'))
      showBanner('Failed to load friend requests.', 'error');
    } finally {
      setLoading(false);
      console.log("FriendRequests: Loading finished.");
    }
  };

  // action is 'accepted' | 'rejected'
  const handleFriendRequest = async (requestId: string, senderId: string, action: 'accepted' | 'rejected') => {
    if (!user || !user.id) {
      console.warn("FriendRequests: User or user ID not available for handling request.");
      return;
    }

    // Optimistic UI update
    setRequests(prev => prev.filter(req => req.id !== requestId));
    console.log(`FriendRequests: Attempting to ${action} request ID: ${requestId} from sender: ${senderId}`);

    try {
      await apiClient.respondToFriendRequest(requestId, action);

      // Deleted:
      //  - toast.success('Friend request accepted!')
      //  - toast.info('Friend request rejected.')
      // Silent success; UI already updated optimistically.
    } catch (error) {
      console.error('FriendRequests: Error handling friend request:', error);
      // REMADE as top banner (was toast.error('Failed to process request.'))
      showBanner('Failed to process request.', 'error');
      // Revert UI by re-fetching
      fetchFriendRequests();
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  return (
    <div className="friend-requests-page-container">
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
      <div className="friend-requests-page-header">
        <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="friend-requests-page-back-button">
          <ArrowLeft />
        </Button>
        <h1 className="friend-requests-page-title">Friend Requests</h1>
      </div>

      {/* Main Content */}
      <div className="friend-requests-page-content">
        {loading ? (
          <p className="loading-text">Loading requests...</p>
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-info">
                <Avatar className="request-avatar">
                  <AvatarImage src={request.avatar_url || ''} />
                  <AvatarFallback
                    className="avatar-fallback"
                    style={{ backgroundColor: generatePastelColor(request.sender_id) }}
                  >
                    {getInitials(request.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="request-name">{request.full_name || 'Unknown'}</p>
                  <p className="request-username">@{request.username || '...'}</p>
                </div>
              </div>
              <div className="request-actions">
                <Button
                  className="decline-button"
                  size="icon"
                  onClick={() => handleFriendRequest(request.id, request.sender_id, 'rejected')}
                >
                  <X />
                </Button>
                <Button
                  className="accept-button"
                  size="icon"
                  onClick={() => handleFriendRequest(request.id, request.sender_id, 'accepted')}
                >
                  <Check />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-requests-card">
            <Users className="h-12 w-12 mx-auto mb-2" />
            <p>No pending friend requests</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation (if any) */}
    </div>
  );
};

export default FriendRequestsPage;
