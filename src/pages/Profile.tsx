import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client'; // UPDATED: Using our API client
import { toast } from 'sonner';
import { Edit, Home, User, Settings, UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserSearch from '@/components/UserSearch';
import FriendRequests from '@/components/FriendRequests';
import FriendsList from '@/components/FriendsList';

// Interfaces now match API responses
interface ProfileData {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  streak: number | null;
}

interface FriendData {
  id: string; // friendship id
  friend_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  streak: number | null;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchFriends();
    } else {
      // If there's no user, redirect to the auth page
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const data = await apiClient.getProfile(user.id);
      setProfile(data);
      if (data) {
        setEditForm({
          full_name: data.full_name || '',
        });
      }
    } catch (error) {
      toast.error("Failed to load profile.");
    }
  };

  const fetchFriends = async () => {
    if (!user) return;
    try {
      const data = await apiClient.getFriends(user.id);
      // Limit to 6 friends for the carousel display
      setFriends((data || []).slice(0, 6));
    } catch (error) {
      toast.error("Failed to load friends.");
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await apiClient.updateProfile(user.id, {
        full_name: editForm.full_name || null,
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile(); // Refresh data
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    toast.success('Signed out successfully');
  };

  const getInitials = (name: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  const handleNavigationClick = (index: number) => {
    if (index === 0) {
      navigate('/');
    } else if (api) {
      api.scrollTo(index - 1);
    }
  };

  if (!user) {
    return null; // Render nothing while redirecting
  }

  return (
    <div className="w-screen h-[100dvh] bg-black text-white flex justify-center">
      <div className="w-full max-w-md h-full flex flex-col overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Carousel setApi={setApi} className="flex-1">
            <CarouselContent className="h-full">
              {/* Profile View */}
              <CarouselItem className="h-full overflow-y-auto">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h1 className="text-xl font-semibold text-white">Profile</h1>
                    <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)} className="text-gray-400 hover:text-white">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-6 space-y-6">
                    {showSettings ? (
                       <div className="space-y-4">
                         <div className="p-4 bg-gray-800 rounded-lg">
                           <h3 className="text-white font-medium mb-2">Account</h3>
                           <p className="text-gray-400 text-sm mb-4">Manage your account settings</p>
                           <Button onClick={handleSignOut} variant="outline" className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
                             Sign Out
                           </Button>
                         </div>
                       </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={profile?.avatar_url || ''} />
                            <AvatarFallback className="bg-[#2f1930] text-white text-lg">{getInitials(profile?.full_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{profile?.full_name || 'username'}</h3>
                            <p className="text-[#d97f59]">🔥 {profile?.streak || 0} day streak</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-medium text-white">Profile Information</h4>
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="bg-[#2f1930] text-white hover:bg-[#451f3d]">
                              <Edit className="h-4 w-4 mr-2" />
                              {isEditing ? 'Cancel' : 'Edit'}
                            </Button>
                          </div>
                          {isEditing ? (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="full_name" className="text-white">Full Name</Label>
                                <Input id="full_name" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} className="bg-black border-[4px] border-[#2f1930] text-white" placeholder="Enter your full name"/>
                              </div>
                              <Button onClick={handleUpdateProfile} disabled={loading} className="w-full bg-[#2f1930] hover:bg-[#451f3d]">
                                {loading ? 'Updating...' : 'Save Changes'}
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <Label className="text-gray-400">Full Name</Label>
                              <p className="text-white">{profile?.full_name || 'Not set'}</p>
                            </div>
                          )}
                        </div>
                        {/* Friends Section */}
                        {friends.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="text-lg font-medium text-white">Friends</h4>
                            <div className="grid grid-cols-3 gap-4">
                              {friends.map((friend) => (
                                <div key={friend.id} className="text-center">
                                  <Avatar className="h-16 w-16 mx-auto mb-2">
                                    <AvatarImage src={friend.avatar_url || ''} />
                                    <AvatarFallback className="bg-[#2f1930] text-white text-lg">{getInitials(friend.full_name)}</AvatarFallback>
                                  </Avatar>
                                  <p className="text-base text-white truncate">@{friend.username || friend.full_name || 'Unknown'}</p>
                                  <p className="text-base text-[#d97f59]">🔥 {friend.streak || 0}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CarouselItem>

              {/* Add Friends View */}
              <CarouselItem className="h-full overflow-y-auto p-6"><UserSearch /></CarouselItem>
              {/* Friend Requests View */}
              <CarouselItem className="h-full overflow-y-auto p-6"><FriendRequests /></CarouselItem>
              {/* Friends List View */}
              <CarouselItem className="h-full overflow-y-auto p-6"><FriendsList /></CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>

        {/* Bottom Navigation */}
        <div className="flex-shrink-0">
          <div className="flex justify-center space-x-2 py-2">
            {[0, 1, 2, 3].map((index) => (
              <button key={index} onClick={() => api?.scrollTo(index)} className={`w-2 h-2 rounded-full transition-colors ${current === index ? 'bg-white' : 'bg-gray-600'}`} />
            ))}
          </div>
          <div className="bg-black border-t border-gray-800 px-6 py-4">
            <div className="flex justify-around">
              <button className="flex flex-col items-center text-gray-500 hover:text-white transition-colors" onClick={() => navigate('/')}>
                <Home className="h-6 w-6 mb-1" />
              </button>
              <button className="flex flex-col items-center text-white">
                <User className="h-6 w-6 mb-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
