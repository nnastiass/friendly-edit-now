
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, Users } from 'lucide-react';

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender_profile: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
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

    try {
      // Fetch friend requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch sender profiles separately
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
      toast.error('Failed to load friend requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async (requestId: string, senderId: string, action: 'accept' | 'reject') => {
    if (!user) return;

    try {
      if (action === 'accept') {
        // Update request status
        const { error: updateError } = await supabase
          .from('friend_requests')
          .update({ 
            status: 'accepted',
            updated_at: new Date().toISOString()
          })
          .eq('id', requestId);

        if (updateError) throw updateError;

        // Create friendship (both directions)
        const { error: friendError } = await supabase
          .from('friends')
          .insert([
            { user_id: user.id, friend_id: senderId },
            { user_id: senderId, friend_id: user.id }
          ]);

        if (friendError) throw friendError;

        toast.success('Friend request accepted!');
      } else {
        // Reject request
        const { error } = await supabase
          .from('friend_requests')
          .update({ 
            status: 'rejected',
            updated_at: new Date().toISOString()
          })
          .eq('id', requestId);

        if (error) throw error;

        toast.success('Friend request rejected');
      }

      // Remove from list
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast.error('Failed to handle friend request');
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
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400">No pending friend requests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Friend Requests ({requests.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.sender_profile?.avatar_url || ''} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {getInitials(request.sender_profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">
                  @{request.sender_profile?.full_name || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleFriendRequest(request.id, request.sender_id, 'accept')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFriendRequest(request.id, request.sender_id, 'reject')}
                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
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
