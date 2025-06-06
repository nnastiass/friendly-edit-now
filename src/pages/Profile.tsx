import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Edit, Home, User, Settings, UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserSearch from '@/components/UserSearch';
import FriendRequests from '@/components/FriendRequests';
import FriendsList from '@/components/FriendsList';

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  streak: number | null;
}

interface Friend {
  id: string;
  friend_id: string;
  friend_profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    streak: number | null;
  } | null;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchFriends();
    }
  }, [user]);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } else {
      setProfile(data);
      if (data) {
        setEditForm({
          username: data.full_name || '',
        });
      }
    }
  };

const fetchFriends = async () => {
  if (!user) return;

  try {
    // Fetch friends
    const { data: friendsData, error: friendsError } = await supabase
      .from('friends')
      .select('*')
      .eq('user_id', user.id)
      .limit(6);

    if (friendsError) throw friendsError;

    // Fetch friend profiles separately
    const friendsWithProfiles = await Promise.all(
      (friendsData || []).map(async (friendship) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, streak')
          .eq('id', friendship.friend_id)
          .single();

        return {
          ...friendship,
          friend_profile: profileData
        };
      })
    );

    // Sort by streak (null streaks treated as 0)
    const sortedFriends = friendsWithProfiles.sort((a, b) => {
      const streakA = a.friend_profile?.streak ?? 0;
      const streakB = b.friend_profile?.streak ?? 0;
      return streakB - streakA;
    });

    setFriends(sortedFriends);
  } catch (error) {
    console.error('Error fetching friends:', error);
  }
};


  const handleUpdateProfile = async () => {
    if (!user || !profile) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editForm.username || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } else {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    }
    setLoading(false);
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
    return null;
  }

  return (
    <div className="w-screen h-[100dvh] bg-black text-white flex flex-col overflow-hidden">

      <div className="flex-1 flex flex-col overflow-hidden">

        <div className="h-full flex flex-col">
          <Carousel setApi={setApi} className="flex-1">
            <CarouselContent className="h-full">
              {/* Profile Content */}
              <CarouselItem className="h-full">
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h1 className="text-xl font-semibold text-white">Profile</h1>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-hidden">
                    {showSettings ? (
                      <div className="p-6 space-y-6 h-full">
                        <h2 className="text-xl font-semibold text-white mb-6">Settings</h2>

                        <div className="space-y-4">
                          <div className="p-4 bg-gray-800 rounded-lg">
                            <h3 className="text-white font-medium mb-2">Account</h3>
                            <p className="text-gray-400 text-sm mb-4">Manage your account settings</p>
                            <Button
                              onClick={handleSignOut}
                              variant="outline"
                              className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            >
                              Sign Out
                            </Button>
                          </div>

                          <div className="p-4 bg-gray-800 rounded-lg">
                            <h3 className="text-white font-medium mb-2">App Information</h3>
                            <p className="text-gray-400 text-sm">Version 1.0.0</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 space-y-6 h-full overflow-y-auto">
                        {/* Avatar and basic info */}
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={profile?.avatar_url || ''} />
                            <AvatarFallback className="bg-[#2f1930] text-white text-lg">
                              {getInitials(profile?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {profile?.full_name || 'username'}
                            </h3>
                            <p className="text-[#d97f59]">🔥 {profile?.streak || 0} day streak</p>
                          </div>
                        </div>

                        {/* Edit Profile Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-medium text-white">Profile Information</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditing(!isEditing)}
                              className="bg-[#2f1930] text-white hover: bg-[#2f1930] text-white"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {isEditing ? 'Cancel' : 'Edit'}
                            </Button>
                          </div>

                          {isEditing ? (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="username" className="text-white">Username</Label>
                                <Input
                                  id="username"
                                  value={editForm.username}
                                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                  className="bg-black border-[4px] border-[#2f1930] text-white"
                                  placeholder="Choose a username"
                                />
                              </div>
                              <Button
                                onClick={handleUpdateProfile}
                                disabled={loading}
                                className="w-full bg-[#2f1930] hover:bg-[#2f1930]"
                              >
                                {loading ? 'Updating...' : 'Save Changes'}
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div>
                                <Label className="text-gray-400">Username</Label>
                                <p className="text-white">@{profile?.full_name || 'Not set'}</p>
                              </div>
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
                                    <AvatarImage src={friend.friend_profile?.avatar_url || ''} />
                                    <AvatarFallback className="bg-[#2f1930] text-white text-lg">
                                      {getInitials(friend.friend_profile?.full_name)}
                                    </AvatarFallback>
                                  </Avatar>

                                  <p className="text-base text-white truncate">
                                    @{friend.friend_profile?.full_name || 'Unknown'}
                                  </p>
                                  <p className="text-base text-[#d97f59]">
                                    🔥 {friend.friend_profile?.streak || 0}
                                  </p>
                                </div>

                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>

              {/* Add Friends */}
              <CarouselItem className="h-full">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h1 className="text-xl font-semibold text-white flex items-center space-x-2">
                      <UserPlus className="h-5 w-5" />
                      <span>Add Friends</span>
                    </h1>
                  </div>
                  <div className="flex-1 overflow-hidden p-6">
                    <UserSearch />
                  </div>
                </div>
              </CarouselItem>

              {/* Friend Requests */}
              <CarouselItem className="h-full">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h1 className="text-xl font-semibold text-white flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Friend Requests</span>
                    </h1>
                  </div>
                  <div className="flex-1 overflow-hidden p-6">
                    <FriendRequests />
                  </div>
                </div>
              </CarouselItem>

              {/* Friends List */}
              <CarouselItem className="h-full">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h1 className="text-xl font-semibold text-white flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>My Friends</span>
                    </h1>
                  </div>
                  <div className="flex-1 overflow-hidden p-6">
                    <FriendsList />
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>

          <div className="w-full max-w-sm mx-auto bg-black text-white h-[100dvh] flex flex-col">
            {/* Main content that scrolls */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Carousel setApi={setApi} className="flex-1">
                {/* CarouselContent + Items */}
              </Carousel>
            </div>

            {/* Bottom Navigation */}
            <div className="bg-black border-t border-gray-800 px-6 py-4">
              <div className="flex justify-center space-x-16">
                <button
                  className="flex flex-col items-center text-gray-500 hover:text-white transition-colors"
                  onClick={() => handleNavigationClick(0)}
                >
                  <Home className="h-6 w-6 mb-1" />
                </button>
                <button className="flex flex-col items-center text-white">
                  <User className="h-6 w-6 mb-1" />
                </button>
              </div>
            </div>

            {/* Carousel Navigation Dots */}
            <div className="flex justify-center space-x-2 py-2">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    current === index ? 'bg-[#2f1930]' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
