import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, UserPlus, Check } from 'lucide-react';

// --- NEW HELPER FUNCTION ---
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

    const normalizedSearch = `%${searchTerm.trim().toLowerCase()}%`;
    setLoading(true);

    try {
      const { data: usernameMatches, error: usernameError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .ilike('username', normalizedSearch)
        .neq('id', user.id);

      if (usernameError) throw usernameError;

      const { data: fullNameMatches, error: fullNameError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .ilike('full_name', normalizedSearch)
        .neq('id', user.id);

      if (fullNameError) throw fullNameError;

      const combined = [...(usernameMatches || []), ...(fullNameMatches || [])];
      const uniqueUsers = Array.from(
        new Map(combined.map((u) => [u.id, u])).values()
      );

      setSearchResults(uniqueUsers);
      setHasSearched(true);

      if (uniqueUsers.length) {
        await checkFriendStatuses(uniqueUsers.map((u) => u.id));
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const checkFriendStatuses = async (userIds: string[]) => {
    if (!user) return;

    try {
      const { data: friends } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', user.id)
        .in('friend_id', userIds);

      const { data: sentRequests } = await supabase
        .from('friend_requests')
        .select('receiver_id')
        .eq('sender_id', user.id)
        .eq('status', 'pending')
        .in('receiver_id', userIds);

      const { data: receivedRequests } = await supabase
        .from('friend_requests')
        .select('sender_id')
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .in('sender_id', userIds);

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
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;

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
