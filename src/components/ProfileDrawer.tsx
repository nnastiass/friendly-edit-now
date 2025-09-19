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
import { apiClient } from '@/lib/api-client';
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
    try {
      const data = await apiClient.getProfile(user.id);
      setProfile(data);
      if (data) {
        setEditForm({
          username: data.username || '',
          full_name: data.full_name || '',
        });
      }
    } catch (error) {
      toast.error("Failed to load profile.");
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      await apiClient.updateProfile(user.id, {
        username: editForm.username || null,
        full_name: editForm.full_name || null,
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
       toast.error("Failed to update profile.");
    } finally {
        setLoading(false);
    }
  };

  // ... (handleSignOut, getInitials, and JSX remains the same)

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
        {/* ... JSX remains the same ... */}
    </Drawer>
  );
};

export default ProfileDrawer;
