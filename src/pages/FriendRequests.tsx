import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client'; // Using the centralized API client
import { toast } from 'sonner';
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
  id: string; // This is the request ID
  sender_id: string;
  created_at: string; // Add created_at from API
  username: string | null; // Directly from API join
  full_name: string | null; // Directly from API join
  avatar_url: string | null; // Directly from API join
}

const FriendRequestsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

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
      // Use apiClient to fetch requests
      const requestsData: FriendRequest[] = await apiClient.getFriendRequests(user.id);
      console.log("FriendRequests: API response for requests:", requestsData); // Log the raw API response
      setRequests(requestsData);
      console.log("FriendRequests: Requests state updated. Number of requests:", requestsData.length);
    } catch (error) {
      console.error('FriendRequests: Error fetching friend requests:', error);
      toast.error('Failed to load friend requests.');
    } finally {
      setLoading(false);
      console.log("FriendRequests: Loading finished.");
    }
  };

  // Changed 'action' parameter type to match API's expected values
  const handleFriendRequest = async (requestId: string, senderId: string, action: 'accepted' | 'rejected') => {
    if (!user || !user.id) {
      console.warn("FriendRequests: User or user ID not available for handling request.");
      return;
    }

    // Optimistic UI update
    setRequests(prev => prev.filter(req => req.id !== requestId));
    console.log(`FriendRequests: Attempting to ${action} request ID: ${requestId} from sender: ${senderId}`);

    try {
      // Your API endpoint: POST /api/friend-requests/respond
      await apiClient.respondToFriendRequest(requestId, action); // 'action' now directly matches 'accepted'/'rejected'

      if (action === 'accepted') { // Check against 'accepted'
        toast.success('Friend request accepted!');
      } else { // Implicitly 'rejected'
        toast.info('Friend request rejected.');
      }
    } catch (error) {
      console.error('FriendRequests: Error handling friend request:', error);
      toast.error('Failed to process request.');
      // Revert UI if API call fails
      fetchFriendRequests(); // Re-fetch to get accurate state
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  return (
    <div className="friend-requests-page-container">
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
          requests.map((request) => ( // Iterate directly over 'request'
            <div key={request.id} className="request-card">
              <div className="request-info">
                <Avatar className="request-avatar">
                  <AvatarImage src={request.avatar_url || ''} />
                  <AvatarFallback
                    className="avatar-fallback"
                    // Manually re-typed this line to remove any hidden characters
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
                  // Pass 'rejected' instead of 'reject'
                  onClick={() => handleFriendRequest(request.id, request.sender_id, 'rejected')}
                >
                  <X />
                </Button>
                <Button
                  className="accept-button"
                  size="icon"
                  // Pass 'accepted' instead of 'accept'
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

      {/* Bottom Navigation */}
      <div className="friend-requests-page-bottom-nav">
        <div className="friend-requests-page-nav-container">
          <button className="friend-requests-page-nav-button friend-requests-page-nav-button-inactive" onClick={() => navigate('/')}>
            <Home className="friend-requests-page-nav-icon" />
          </button>
          <button className="friend-requests-page-nav-button friend-requests-page-nav-button-inactive" onClick={() => navigate('/add-friends')}>
            <Plus className="friend-requests-page-nav-icon" />
          </button>
          <button className="friend-requests-page-nav-button friend-requests-page-nav-button-active" onClick={() => navigate('/profile')}>
            <User className="friend-requests-page-nav-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestsPage;
