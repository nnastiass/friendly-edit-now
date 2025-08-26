import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Home, User, Settings, Plus, Edit, ArrowLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

// --- HELPER FUNCTION ---
const pastelColors = [
  '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'
];

const generatePastelColor = (id: string) => {
  if (!id) return pastelColors[0];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return pastelColors[hash % pastelColors.length];
};

interface ProfileData {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  streak: number | null;
}

interface Friend {
  id: string;
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
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendCount, setFriendCount] = useState(0);
  const [view, setView] = useState<'profile' | 'edit' | 'settings'>('profile');
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
  });

  // --- STATE FOR EMAIL CHANGE ---
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState(''); // <-- ADDED
  const [isChangingEmail, setIsChangingEmail] = useState(false);


  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchFriends();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user || !user.id) return;
    try {
      const data: ProfileData = await apiClient.getProfile(user.id);
      setProfile(data);
      if (data) {
        setEditForm({
          full_name: data.full_name || '',
          username: data.username || ''
        });
      }
    } catch (error) {
      console.error('Profile: Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const fetchFriends = async () => {
    if (!user || !user.id) return;
    try {
      const friendsData: Friend[] = await apiClient.getFriends(user.id);
      setFriends(friendsData);
      setFriendCount(friendsData.length);
    } catch (error) {
      console.error('Profile: Error fetching friends:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !user.id) return;
    setLoading(true);
    try {
      await apiClient.updateProfile(user.id, {
        full_name: editForm.full_name,
        username: editForm.username
      });
      toast.success('Profile updated!');
      setView('profile');
      fetchProfile();
    } catch (error) {
      console.error('Profile: Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    toast.success('Signed out successfully');
  };

  const handleDeleteAccount = async () => {
    // Switched to a custom modal/toast confirmation in a real app
    const isConfirmed = window.confirm(
      'Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.'
    );

    if (!isConfirmed || !user || !user.id) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiClient.deleteProfile(user.id);

      toast.success('Your account has been successfully deleted.');
      await signOut();
      navigate('/auth');

    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Could not delete your account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // --- UPDATED FUNCTION TO HANDLE EMAIL CHANGE ---
  const handleChangeEmail = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newEmail || !currentPassword || !user) {
        toast.error("Please fill in all fields.");
        return;
      }

      setIsChangingEmail(true);
      try {
          // Pass the current password to the API client
          await apiClient.requestEmailChange(user.id, newEmail, currentPassword);

          toast.success('Your email has been successfully updated.');
          setNewEmail('');
          setCurrentPassword('');
          // Optionally, you might want to refresh the user context or log them out
          // For now, we just clear the fields.

      } catch (error: any) {
          console.error('Error changing email:', error);
          toast.error(error.message || 'Failed to change email.');
      } finally {
          setIsChangingEmail(false);
      }
  };


  const getInitials = (name: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  if (!user) return null;

  return (
    <div className={`profile-container ${view !== 'profile' ? 'edit-mode' : ''}`}>
      <div className="profile-main-content">
        <div className="profile-header-gradient">
          {view === 'profile' ? (
            <>
              <Button variant="ghost" size="icon" className="profile-edit-button" onClick={() => setView('edit')}>
                <Edit className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="profile-settings-button" onClick={() => setView('settings')}>
                <Settings className="h-6 w-6" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="icon" className="profile-back-button" onClick={() => setView('profile')}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
          )}

          {view === 'profile' && (
            <>
              <Avatar className="profile-avatar">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback
                  className="profile-avatar-fallback"
                  style={{ backgroundColor: generatePastelColor(profile?.id || '') }}
                >
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <h1 className="profile-name">{profile?.full_name || 'Your Name'}</h1>
              <p className="profile-username">@{profile?.username || 'username'}</p>
            </>
          )}

          {view !== 'profile' && (
             <h1 className="view-title">
              {view === 'edit' ? 'Edit Profile' : 'Settings'}
            </h1>
          )}
        </div>

        {view === 'edit' && (
          <div className="profile-edit-section">
            <div className="edit-form-group">
              <Label htmlFor="full_name">Name</Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="profile-edit-input"
                placeholder="Enter your display name"
              />
            </div>
            <div className="edit-form-group">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="profile-edit-input"
                placeholder="Enter your @username"
              />
            </div>
            <Button onClick={handleUpdateProfile} disabled={loading} className="profile-save-button">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}

        {/* --- UPDATED SETTINGS VIEW --- */}
        {view === 'settings' && (
            <div className="profile-settings-section">
                {/* --- EMAIL CHANGE FORM --- */}
                <div className="settings-card">
                    <h3 className="settings-card-title">Change Email Address</h3>
                    <p className="settings-card-description">
                        Your current email is: <strong>{user.email}</strong>. Enter your new email and current password to make the change.
                    </p>
                    <form onSubmit={handleChangeEmail} className="settings-form">
                        <Input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Enter new email address"
                            required
                            className="settings-input"
                        />
                        {/* --- ADDED PASSWORD INPUT --- */}
                        <Input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            required
                            className="settings-input"
                        />
                        <Button type="submit" disabled={isChangingEmail} className="settings-button">
                            {isChangingEmail ? 'Saving...' : 'Save New Email'}
                        </Button>
                    </form>
                </div>

                 <Button onClick={handleSignOut} className="profile-signout-button">
                    Sign Out
                </Button>

                <div className="profile-danger-zone">
                    <h3 className="danger-zone-title">Danger Zone</h3>
                    <p className="danger-zone-description">
                        Deleting your account is a permanent action and cannot be undone. All of your data will be removed forever.
                    </p>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="profile-delete-button"
                    >
                        {isDeleting ? 'Deleting Account...' : 'Delete My Account'}
                    </Button>
                </div>
            </div>
        )}

        {view === 'profile' && (
          <>
            <div className="profile-actions-section">
              <button className="profile-friends-count" onClick={() => navigate('/friends')}>
                <span className="count-number">{friendCount}</span>
                <span className="count-label">Friends</span>
              </button>
              <Button className="profile-add-friends-btn" onClick={() => navigate('/add-friends')}>
                Add friends
              </Button>
              <Button variant="ghost" size="icon" className="profile-requests-button" onClick={() => navigate('/friend-requests')}>
                <UserPlus className="h-6 w-6" />
              </Button>
            </div>

            <div className="profile-streak-section">
              <span className="streak-number">{profile?.streak || 0}</span>
              <p className="streak-label">Day Streak</p>
              <div className="streak-line"></div>
            </div>

            <div className="friends-list-section">
              <h2 className="friends-list-title">Check how your friends are doing!</h2>
              <div className="friends-list-container-profile">
                {friends.slice(0, 4).map((friend) => (
                  <div key={friend.id} className="friend-item">
                    <Avatar className="friend-avatar">
                      <AvatarImage src={friend.avatar_url || ''} />
                      <AvatarFallback
                        className="friend-avatar-fallback"
                        style={{ backgroundColor: generatePastelColor(friend.friend_id) }}
                      >
                        {getInitials(friend.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="friend-name">@{friend.full_name || '...'}</p>
                    <p className="friend-streak">{friend.streak || 0}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="profile-bottom-nav">
        <div className="profile-nav-container">
          <button className="profile-nav-button profile-nav-button-inactive" onClick={() => { /* TODO */ }}>
            <Home className="profile-nav-icon" />
          </button>
          <button className="profile-nav-button profile-nav-button-inactive" onClick={() => navigate('/')}>
            <Plus className="profile-nav-icon" />
          </button>
          <button className="profile-nav-button profile-nav-button-active">
            <User className="profile-nav-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
