
import React, { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { X, Edit } from 'lucide-react';

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    full_name: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      fetchProfile();
    }
  }, [user, isOpen]);

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
          username: data.username || '',
          full_name: data.full_name || '',
        });
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !profile) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        username: editForm.username || null,
        full_name: editForm.full_name || null,
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
    onClose();
    toast.success('Signed out successfully');
  };

  const getInitials = (name: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-gray-900 text-white border-gray-800">
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle className="text-xl font-semibold text-white">Profile</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="p-6 space-y-6">
          {/* Avatar and basic info */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-purple-600 text-white text-lg">
                {getInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {profile?.full_name || 'No name set'}
              </h3>
              <p className="text-gray-400">{user?.email}</p>
              {profile?.username && (
                <p className="text-purple-400">@{profile.username}</p>
              )}
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
                className="text-purple-400 hover:text-purple-300"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-white">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input
                    id="username"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Choose a username"
                  />
                </div>
                <Button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? 'Updating...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label className="text-gray-400">Full Name</Label>
                  <p className="text-white">{profile?.full_name || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Username</Label>
                  <p className="text-white">{profile?.username || 'Not set'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <div className="pt-4 border-t border-gray-800">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ProfileDrawer;
