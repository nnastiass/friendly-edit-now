import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client'; // UPDATED
import { toast } from 'sonner';
import { Check, X, Users } from 'lucide-react';

// UPDATED: Interface matches the new API response
interface FriendRequest {
  id: string;
  sender_id: string;
  created_at: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

const FriendRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFriendRequests();
    }
  }, [user]);

  const fetchFriendRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const requestsData = await apiClient.getFriendRequests(user.id); // UPDATED
      setRequests(requestsData || []);
    } catch (error) {
      // Error handled by client
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accepted' | 'rejected') => {
    if (!user) return;
    try {
      await apiClient.respondToFriendRequest(requestId, action); // UPDATED
      toast.success(`Friend request ${action}`);
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      // Error handled by client
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading friend requests...</div>;
  }

  if (requests.length === 0) {
    return (
      <Card className="bg-black border-[4px] border-[#2f1930] rounded-[20px] text-white">
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-white mx-auto mb-2" />
          <p className="text-white">No pending friend requests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Pending Requests ({requests.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="flex items-center justify-between p-3 bg-black border-[4px] border-[#2f1930] rounded-[20px] text-white">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.avatar_url || ''} />
                <AvatarFallback className="bg-[#2f1930] text-white">
                  {getInitials(request.username || request.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">
                  @{request.username || request.full_name || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleFriendRequest(request.id, 'accepted')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFriendRequest(request.id, 'rejected')}
                className=" text-red-400 hover:bg-red-600 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default FriendRequests;
