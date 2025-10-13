import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Check, X, Users } from 'lucide-react';
import './FriendRequests.css';

const pastelColors = [
  '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'
];

const generatePastelColor = (id: string) => {
  if (!id) return pastelColors[0];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return pastelColors[hash % pastelColors.length];
};

interface FriendRequest {
  id: string;
  sender_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
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
  const [activeTab, setActiveTab] = useState<'incoming' | 'pending'>('incoming');

  const [banner, setBanner] = useState<{ message: string; type: BannerType } | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const bannerTimer = useRef<number | null>(null);

  const showBanner = (message: string, type: BannerType = 'info', duration = 3500) => {
    if (bannerTimer.current) window.clearTimeout(bannerTimer.current);
    setBanner({ message, type });
    requestAnimationFrame(() => setBannerVisible(true));
    bannerTimer.current = window.setTimeout(() => {
      setBannerVisible(false);
      bannerTimer.current = null;
    }, duration);
  };

  const closeBanner = () => {
    if (bannerTimer.current) window.clearTimeout(bannerTimer.current);
    setBannerVisible(false);
    bannerTimer.current = null;
  };

  useEffect(() => {
    return () => {
      if (bannerTimer.current) window.clearTimeout(bannerTimer.current);
    };
  }, []);

  useEffect(() => {
    if (user) fetchFriendRequests();
  }, [user]);

  const fetchFriendRequests = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const requestsData: FriendRequest[] = await apiClient.getFriendRequests(user.id);
      console.log('Friend Requests API Response:', requestsData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Failed to load friend requests:', error);
      showBanner('Failed to load friend requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async (requestId: string, senderId: string, action: 'accepted' | 'rejected') => {
    if (!user?.id) return;

    // Optimistic UI update
    setRequests(prev => prev.filter(req => req.id !== requestId));

    try {
      await apiClient.respondToFriendRequest(requestId, action);
    } catch (error) {
      console.error('Failed to process request:', error);
      showBanner('Failed to process request.', 'error');
      fetchFriendRequests(); // revert UI
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  // --- Filter requests by tab ---
  const incomingRequests = requests.filter(r => r.recipient_id === user?.id && r.status === 'pending');
  const pendingRequests = requests.filter(r => r.sender_id === user?.id && r.status === 'pending');

  return (
    <div className="friend-requests-page-container">
      {/* Banner */}
      <div className="notify-root" aria-live="assertive" aria-atomic="true">
        <div className={`notify-banner ${bannerVisible ? 'visible' : ''} ${banner?.type ? `notify-${banner.type}` : ''}`} role="alert">
          <span className="notify-text">{banner?.message}</span>
          <button type="button" className="notify-close" aria-label="Close notification" onClick={closeBanner}>
            ×
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="friend-requests-page-header">
        <Button onClick={() => navigate(-1)} variant="ghost" size="icon">
          <ArrowLeft />
        </Button>
        <h1 className="friend-requests-page-title">Friend Requests</h1>
      </div>

      {/* Tabs */}
      <div className="friend-requests-tabs">
        <button className={`tab-button ${activeTab === 'incoming' ? 'active' : ''}`} onClick={() => setActiveTab('incoming')}>Incoming</button>
        <button className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending</button>
      </div>

      {/* Requests List */}
      <div className="friend-requests-page-content">
        {loading ? (
          <p className="loading-text">Loading requests...</p>
        ) : (activeTab === 'incoming' ? incomingRequests : pendingRequests).length > 0 ? (
          (activeTab === 'incoming' ? incomingRequests : pendingRequests).map(request => (
            <div key={request.id} className="request-card">
              <div className="request-info">
                <Avatar className="request-avatar">
                  <AvatarImage src={request.avatar_url || ''} />
                  <AvatarFallback className="avatar-fallback" style={{ backgroundColor: generatePastelColor(request.sender_id) }}>
                    {getInitials(request.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="request-name">{request.full_name || 'Unknown'}</p>
                  <p className="request-username">@{request.username || '...'}</p>
                </div>
              </div>
              {activeTab === 'incoming' && (
                <div className="request-actions">
                  <Button size="icon" className="decline-button" onClick={() => handleFriendRequest(request.id, request.sender_id, 'rejected')}>
                    <X />
                  </Button>
                  <Button size="icon" className="accept-button" onClick={() => handleFriendRequest(request.id, request.sender_id, 'accepted')}>
                    <Check />
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-requests-card">
            <Users className="h-12 w-12 mx-auto mb-2" />
            <p>{activeTab === 'incoming' ? 'No incoming requests' : 'No pending requests'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequestsPage;
