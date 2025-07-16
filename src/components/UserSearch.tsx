import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Search, UserPlus, Check, Clock } from 'lucide-react';

interface UserSearchProps {
  onClose?: () => void;
}

interface SearchedUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

type RequestStatus = 'none' | 'sent' | 'friends';

const UserSearch: React.FC<UserSearchProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestStatuses, setRequestStatuses] = useState<Record<string, RequestStatus>>({});
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (searchResults.length > 0 && user) {
      checkFriendStatuses(searchResults.map(u => u.id));
    }
  }, [searchResults, user]);

  const searchUsers = async () => {
    if (!searchTerm.trim() || !user) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const users = await apiClient.searchUsers(searchTerm, user.id);
      setSearchResults(users || []);
    } catch (error) {
      toast.error('Failed to search for users.');
    } finally {
      setLoading(false);
    }
  };

  const checkFriendStatuses = async (userIds: string[]) => {
    if (!user) return;
    try {
      const [friendsData] = await Promise.all([
        apiClient.getFriends(user.id),
      ]);
      const friends = friendsData || [];
      const newStatuses: Record<string, RequestStatus> = {};
      userIds.forEach(userId => {
        if (friends.some(f => f.friend_id === userId)) {
          newStatuses[userId] = 'friends';
        } else {
          newStatuses[userId] = 'none';
        }
      });
      setRequestStatuses(prev => ({ ...prev, ...newStatuses }));
    } catch (error) {
      console.error("Failed to check friend statuses", error);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return;
    try {
      await apiClient.sendFriendRequest(user.id, receiverId);
      toast.success('Friend request sent!');
      setRequestStatuses(prev => ({ ...prev, [receiverId]: 'sent' }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to send friend request');
    }
  };

  // ... (getInitials, renderActionButton, getDisplayName, and JSX remains the same)

  return (
    <div className="space-y-4">
      {/* ... JSX remains the same ... */}
    </div>
  );
};

export default UserSearch;
