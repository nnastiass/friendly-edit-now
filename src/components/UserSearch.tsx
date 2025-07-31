import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client'; // Import the centralized API client
import { toast } from 'sonner';
import { Search, UserPlus, Check } from 'lucide-react';

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
    if (!searchTerm.trim() || !user || !user.id) {
      console.log("UserSearch: Search term is empty or user not available.");
      return;
    }

    setLoading(true);
    console.log("UserSearch: Starting user search for term:", searchTerm);

    try {
      // Your API's /api/profiles endpoint returns all profiles.
      // We will filter client-side for simplicity, or you can enhance your API
      // to support search queries.
      const allProfiles: SearchedUser[] = await apiClient.searchUsers();
      console.log("UserSearch: All profiles fetched:", allProfiles);

      const filteredUsers = allProfiles.filter(profile =>
        (profile.username?.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
         profile.full_name?.toLowerCase().includes(searchTerm.trim().toLowerCase())) &&
        profile.id !== user.id // Exclude current user
      );

      setSearchResults(filteredUsers);
      setHasSearched(true);
      console.log("UserSearch: Filtered search results:", filteredUsers);

      if (filteredUsers.length) {
        await checkFriendStatuses(filteredUsers.map((u) => u.id));
      } else {
        setRequestStatuses({}); // Clear statuses if no users found
      }
    } catch (error) {
      console.error('UserSearch: Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
      console.log("UserSearch: Search finished.");
    }
  };

  const checkFriendStatuses = async (userIds: string[]) => {
    if (!user || !user.id || userIds.length === 0) {
      console.warn("UserSearch: checkFriendStatuses called without user, user ID, or user IDs to check.");
      return;
    }
    console.log("UserSearch: Checking friend statuses for user IDs:", userIds);

    try {
      // Fetch current user's friends
      const friends: { friend_id: string }[] = await apiClient.getFriends(user.id);
      console.log("UserSearch: Friends fetched:", friends);

      // Fetch sent requests by current user
      const sentRequests: { receiver_id: string }[] = await apiClient.getSentFriendRequests(user.id); // Assuming this API endpoint exists
      console.log("UserSearch: Sent requests fetched:", sentRequests);

      // Fetch received requests for current user
      const receivedRequests: { sender_id: string }[] = await apiClient.getFriendRequests(user.id); // This is for incoming requests
      console.log("UserSearch: Received requests fetched:", receivedRequests);

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
      console.log("UserSearch: Final request statuses:", statuses);

    } catch (error) {
      console.error('UserSearch: Error checking friend statuses:', error);
      toast.error('Failed to check friend statuses.');
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!user || !user.id) {
      console.warn("UserSearch: sendFriendRequest called without user or user ID.");
      return;
    }
    console.log("UserSearch: Sending friend request to receiver ID:", receiverId);

    try {
      await apiClient.sendFriendRequest(user.id, receiverId); // Using apiClient for sending request

      toast.success('Friend request sent!');
      setRequestStatuses(prev => ({
        ...prev,
        [receiverId]: { userId: receiverId, status: 'sent' }
      }));
      console.log("UserSearch: Friend request sent successfully, status updated.");
    } catch (error) {
      console.error('UserSearch: Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  const renderActionButton = (searchedUser: SearchedUser) => {
    const status = requestStatuses[searchedUser.id]?.status || 'none';
    console.log(`UserSearch: Rendering button for ${searchedUser.username}, status: ${status}`);

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
