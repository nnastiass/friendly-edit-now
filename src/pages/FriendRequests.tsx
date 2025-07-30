import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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

interface FriendRequest {
  id: string; // This is the request ID
  sender_id: string;
  sender_profile: {
    id: string; // This is the sender's user ID
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
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

  // --- UPDATED: Using the safer, two-step fetch logic ---
  const fetchFriendRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Step 1: Fetch the friend requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      // Step 2: Fetch the profile for each sender
      const requestsWithProfiles = await Promise.all(
        (requestsData || []).map(async (request) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', request.sender_id)
            .single();

          return {
            ...request,
            sender_profile: profileData
          };
        })
      );

      setRequests(requestsWithProfiles);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      toast.error('Failed to load friend requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async (requestId: string, senderId: string, action: 'accept' | 'reject') => {
    if (!user) return;

    setRequests(prev => prev.filter(req => req.id !== requestId));

    try {
      if (action === 'accept') {
        const { error: updateError } = await supabase
          .from('friend_requests')
          .update({ status: 'accepted' })
          .eq('id', requestId);
        if (updateError) throw updateError;

        const { error: friendError } = await supabase
          .from('friends')
          .insert([
            { user_id: user.id, friend_id: senderId },
            { user_id: senderId, friend_id: user.id },
          ]);
        if (friendError) throw friendError;

        toast.success('Friend request accepted!');
      } else {
        const { error } = await supabase
          .from('friend_requests')
          .delete()
          .eq('id', requestId);
        if (error) throw error;

        toast.info('Friend request rejected.');
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast.error('Failed to process request.');
      fetchFriendRequests();
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
          requests.map(({ id, sender_profile }) => sender_profile && (
            <div key={id} className="request-card">
              <div className="request-info">
                <Avatar className="request-avatar">
                  <AvatarImage src={sender_profile.avatar_url || ''} />
                  <AvatarFallback
                    className="avatar-fallback"
                    style={{ backgroundColor: generatePastelColor(sender_profile.id) }}
                  >
                    {getInitials(sender_profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="request-name">{sender_profile.full_name || 'Unknown'}</p>
                  <p className="request-username">@{sender_profile.username || '...'}</p>
                </div>
              </div>
              <div className="request-actions">
                <Button
                  className="decline-button"
                  size="icon"
                  onClick={() => handleFriendRequest(id, sender_profile.id, 'reject')}
                >
                  <X />
                </Button>
                <Button
                  className="accept-button"
                  size="icon"
                  onClick={() => handleFriendRequest(id, sender_profile.id, 'accept')}
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
