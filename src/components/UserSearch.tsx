import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, UserPlus, Check, X } from 'lucide-react';

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

  const searchUsers = async () => {
    if (!searchTerm.trim() || !user) return;

    const normalizedSearch = `%${searchTerm.trim().toLowerCase()}%`;
    setLoading(true);

    try {
      // Search by username
      const { data: usernameMatches, error: usernameError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .ilike('username', normalizedSearch)
        .neq('id', user.id);

      if (usernameError) throw usernameError;

      // Search by full_name
      const { data: fullNameMatches, error: fullNameError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .ilike('full_name', normalizedSearch)
        .neq('id', user.id);

      if (fullNameError) throw fullNameError;

      // Merge and deduplicate results
      const combined = [...(usernameMatches || []), ...(fullNameMatches || [])];
      const uniqueUsers = Array.from(
        new Map(combined.map((u) => [u.id, u])).values()
      );

      console.log('Search results:', uniqueUsers);
      setSearchResults(uniqueUsers);

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
      // Check existing friendships
      const { data: friends } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', user.id)
        .in('friend_id', userIds);

      // Check sent requests
      const { data: sentRequests } = await supabase
        .from('friend_requests')
        .select('receiver_id')
        .eq('sender_id', user.id)
        .eq('status', 'pending')
        .in('receiver_id', userIds);

      // Check received requests
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
          <Button variant="outline" disabled className="text-green-600">
            <Check className="h-4 w-4 mr-2" />
            Friends
          </Button>
        );
      case 'sent':
        return (
          <Button variant="outline" disabled>
            Request Sent
          </Button>
        );
      case 'received':
        return (
          <Button variant="outline" disabled>
            Request Received
          </Button>
        );
      default:
        return (
          <Button 
            onClick={() => sendFriendRequest(searchedUser.id)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
        );
    }
  };

  const getDisplayName = (searchedUser: SearchedUser) => {
    // Prefer username, fallback to full_name
    return searchedUser.username || searchedUser.full_name || 'Unknown';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
            placeholder="Search by username or full name..."
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <Button 
          onClick={searchUsers} 
          disabled={loading || !searchTerm.trim()}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {searchResults.map((searchedUser) => (
          <Card key={searchedUser.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={searchedUser.avatar_url || ''} />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {getInitials(getDisplayName(searchedUser))}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">
                      @{getDisplayName(searchedUser)}
                    </p>
                  </div>
                </div>
                {renderActionButton(searchedUser)}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {searchResults.length === 0 && searchTerm && !loading && (
          <p className="text-center text-gray-400 py-4">No users found</p>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
