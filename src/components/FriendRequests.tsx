import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Check, X, Users } from 'lucide-react';

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
      const requestsData = await apiClient.getFriendRequests(user.id);
      setRequests(requestsData || []);
    } catch (error) {
      toast.error("Failed to load friend requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accepted' | 'rejected') => {
    if (!user) return;
    try {
      await apiClient.respondToFriendRequest(requestId, action);
      toast.success(`Friend request ${action}`);
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      toast.error("Failed to respond to request.");
    }
  };

  // ... (getInitials and JSX remains the same)

  return (
    <Card className="bg-black border-gray-700">
        {/* ... JSX remains the same ... */}
    </Card>
  );
};

export default FriendRequests;
