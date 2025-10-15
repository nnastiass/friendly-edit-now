import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
// --- FIX: Added missing icons UserCheck, UserX, and Clock ---
import { ArrowLeft, Check, X, Users, UserCheck, UserX, Clock } from 'lucide-react';
import './FriendRequests.css';

const pastelColors = [
  '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'
];

const generatePastelColor = (id: string | null) => {
  if (!id) return pastelColors[0];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return pastelColors[hash % pastelColors.length];
};

interface FriendRequest {
  id: string;
  sender_id: string | null; // For incoming: the user who sent the request
  receiver_id: string | null; // For sent: the user who received the request
  status: 'pending' | 'accepted' | 'rejected';
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

type BannerType = 'error' | 'success' | 'info';

const RequestStatusBadge = ({ status }: { status: FriendRequest['status'] }) => {
  const statusInfo = {
    accepted: { text: 'Accepted', icon: <UserCheck className="status-icon" />, className: 'status-accepted' },
    rejected: { text: 'Rejected', icon: <UserX className="status-icon" />, className: 'status-rejected' },
    pending: { text: 'Pending', icon: <Clock className="status-icon" />, className: 'status-pending' },
  };

  const currentStatus = statusInfo[status] || statusInfo.pending;

  return (
    <div className={`request-status-badge ${currentStatus.className}`}>
      {currentStatus.icon}
      <span>{currentStatus.text}</span>
    </div>
  );
};

const FriendRequestsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // --- NEW: Separate state for Incoming and Sent Requests ---
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incoming' | 'pending'>('incoming'); // 'pending' for requests sent by me

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

  // --- MODIFIED: Fetch both incoming and sent requests ---
  const fetchFriendRequests = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // 1. Fetch Incoming Requests (from /api/friend-requests/:userId)
      const incomingData: FriendRequest[] = await apiClient.getFriendRequests(user.id);

      // 2. Fetch Sent/Pending Requests (from /api/friend-requests/sent/:userId)
      const sentData: FriendRequest[] = await apiClient.getSentFriendRequests(user.id);

      console.log('Incoming Requests API Response:', incomingData);
      console.log('Sent Requests API Response:', sentData);

      // The backend API already filters for status = 'pending'
      setIncomingRequests(incomingData);
      setSentRequests(sentData);

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
    setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
    showBanner(`Request ${action}.`, 'info');

    try {
      await apiClient.respondToFriendRequest(requestId, action);
    } catch (error) {
      console.error('Failed to process request:', error);
      showBanner('Failed to process request.', 'error');
      fetchFriendRequests(); // revert UI by re-fetching
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  // --- NEW: Use activeRequests to select list based on tab ---
  const activeRequests = activeTab === 'incoming' ? incomingRequests : sentRequests;

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
               {/* --- FIX: Added className to the Button component --- */}
               <Button
                 onClick={() => navigate(-1)}
                 variant="ghost"
                 size="icon"
                 className="friend-requests-page-back-button"
               >
                 <ArrowLeft />
               </Button>
          <h1 className="friend-requests-page-title">Friend Requests</h1>
        </div>

        {/* Tabs */}
        <div className="friend-requests-tabs">
          <button className={`tab-button ${activeTab === 'incoming' ? 'active' : ''}`} onClick={() => setActiveTab('incoming')}>Incoming</button>
          <button className={`tab-button ${activeTab === 'sent' ? 'active' : ''}`} onClick={() => setActiveTab('sent')}>Sent</button>
        </div>

        {/* Requests List */}
        <div className="friend-requests-page-content">
          {loading ? (
            <p className="loading-text">Loading requests...</p>
          ) : activeRequests.length > 0 ? (
            activeRequests.map(request => {
              const otherUserId = activeTab === 'incoming' ? request.sender_id : request.receiver_id;

              return (
                <div key={request.id} className="request-card">
                  <div className="request-info">
                    <Avatar className="request-avatar">
                      <AvatarImage src={request.avatar_url || ''} />
                      <AvatarFallback className="avatar-fallback" style={{ backgroundColor: generatePastelColor(otherUserId) }}>
                        {getInitials(request.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="request-name">{request.full_name || 'Unknown'}</p>
                      <p className="request-username">@{request.username || '...'}</p>
                    </div>
                  </div>
                  {/* Actions for INCOMING requests */}
                  {activeTab === 'incoming' && (
                    <div className="request-actions">
                      <Button size="icon" className="decline-button" onClick={() => handleFriendRequest(request.id, request.sender_id || '', 'rejected')}>
                        <X />
                      </Button>
                      <Button size="icon" className="accept-button" onClick={() => handleFriendRequest(request.id, request.sender_id || '', 'accepted')}>
                        <Check />
                      </Button>
                    </div>
                  )}
                  {/* Status badge for SENT requests */}
                  {activeTab === 'sent' && (
                      <RequestStatusBadge status={request.status} />
                  )}
                </div>
              );
            })
          ) : (
            <div className="no-requests-card">
              <Users className="h-12 w-12 mx-auto mb-2" />
              <p>{activeTab === 'incoming' ? 'No incoming friend requests.' : 'You haven\'t sent any friend requests.'}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default FriendRequestsPage;