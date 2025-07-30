import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Search, UserPlus, Check } from 'lucide-react';

// *** IMPORTANT: REPLACE WITH YOUR ACTUAL API BASE URL ***
const API_BASE_URL = 'http://192.168.0.138:3000';

// --- NEW HELPER FUNCTION FOR API CALLS ---
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
      // Add Authorization header here if your API requires it (e.g., Bearer Token)
      // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// --- NEW HELPER FUNCTION ---(existing)
const pastelColors = [
  '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'
];

const generatePastelColor = (id: string) => {
  if (!id) return pastelColors[0];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return pastelColors[hash % pastelColors.length];
};

interface UserSearchProps {
  onClose?: () => void;
}

interface SearchedUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface FriendRequestStatus {
  userId: string;
  status: 'none' | 'sent' | 'received' | 'friends';
}

const UserSearch: React.FC<UserSearchProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestStatuses, setRequestStatuses] = useState<Record<string, FriendRequestStatus>>({});
  const [hasSearched, setHasSearched] = useState(false);

  const searchUsers = async () => {
    if (!searchTerm.trim() || !user) return;

    setLoading(true);

    try {
      // Your API's /api/profiles endpoint returns all profiles.
      // We will filter client-side for simplicity, or you can enhance your API
      // to support search queries.
      const allProfiles: SearchedUser[] = await apiFetch('/api/profiles');

      const filteredUsers = allProfiles.filter(profile =>
        (profile.username?.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
         profile.full_name?.toLowerCase().includes(searchTerm.trim().toLowerCase())) &&
        profile.id !== user.id // Exclude current user
      );

      setSearchResults(filteredUsers);
      setHasSearched(true);

      if (filteredUsers.length) {
        await checkFriendStatuses(filteredUsers.map((u) => u.id));
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const checkFriendStatuses = async (userIds: string[]) => {
    if (!user || !user.id) return;

    try {
      // Fetch current user's friends
      const friends: { friend_id: string }[] = await apiFetch(`/api/friends/${user.id}`);

      // Fetch sent requests by current user
      const sentRequests: { receiver_id: string }[] = await apiFetch(`/api/friend-requests/sent/${user.id}`); // Assuming a new API endpoint for sent requests

      // Fetch received requests for current user
      const receivedRequests: { sender_id: string }[] = await apiFetch(`/api/friend-requests/${user.id}`);

      const statuses: Record<string, FriendRequestStatus> = {};

      userIds.forEach(userId => {
        if (friends?.some(f => f.friend_id === userId)) {
          statuses[userId] = { userId, status: 'friends' };
        } else if (sentRequests?.some(r => r.receiver_id === userId)) {
          statuses[userId] = { userId, status: 'sent' };
        } else if (receivedRequests?.some(r => r.sender_id === userId)) {
          statuses[userId] = { userId, status: 'received' };
        } else {
          statuses[userId] = { userId, status: 'none' };
        }
      });

      setRequestStatuses(statuses);
    } catch (error) {
      console.error('Error checking friend statuses:', error);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!user || !user.id) return;

    try {
      await apiFetch('/api/friend-requests/send', { // Assuming a new API endpoint for sending requests
        method: 'POST',
        body: JSON.stringify({ sender_id: user.id, receiver_id: receiverId }),
      });

      toast.success('Friend request sent!');
      setRequestStatuses(prev => ({
        ...prev,
        [receiverId]: { userId: receiverId, status: 'sent' }
      }));
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  const renderActionButton = (searchedUser: SearchedUser) => {
    const status = requestStatuses[searchedUser.id]?.status || 'none';

    switch (status) {
      case 'friends':
        return (
          <Button variant="outline" disabled className="friends-button">
            <Check className="h-4 w-4 mr-2" />
            Friends
          </Button>
        );
      case 'sent':
        return (
          <Button variant="outline" disabled className="sent-button">
            Request Sent
          </Button>
        );
      case 'received':
        return (
          <Button variant="outline" disabled className="received-button">
            Request Received
          </Button>
        );
      default:
        return (
          <Button
            onClick={() => sendFriendRequest(searchedUser.id)}
            className="add-button"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add
          </Button>
        );
    }
  };

  const getDisplayName = (searchedUser: SearchedUser) => {
    return searchedUser.full_name || searchedUser.username || 'Unknown';
  };

  const getDisplayUsername = (searchedUser: SearchedUser) => {
    return searchedUser.username || '...';
  }

  return (
    <div className="user-search-container">
      <div className="search-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
            placeholder="Search by username"
            className="search-input"
          />
        </div>
        <Button
          onClick={searchUsers}
          disabled={loading || !searchTerm.trim()}
          className="search-button"
        >
          {loading ? '...' : 'Search'}
        </Button>
      </div>

      <div className="search-results">
        {searchResults.map((searchedUser) => (
          <Card key={searchedUser.id} className="user-card">
            <CardContent className="user-card-content">
              <div className="user-info">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={searchedUser.avatar_url || ''} />
                    <AvatarFallback
                      className="avatar-fallback"
                      style={{ backgroundColor: generatePastelColor(searchedUser.id) }}
                    >
                      {getInitials(getDisplayName(searchedUser))}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="user-name">
                      {getDisplayName(searchedUser)}
                    </p>
                    <p className="user-username">
                      @{getDisplayUsername(searchedUser)}
                    </p>
                  </div>
                </div>
                {renderActionButton(searchedUser)}
              </div>
            </CardContent>
          </Card>
        ))}

        {hasSearched && searchResults.length === 0 && !loading && (
          <p className="no-results-text">No users found</p>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
