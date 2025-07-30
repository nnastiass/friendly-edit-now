import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Home, User, Settings, Plus, Edit, ArrowLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

// *** IMPORTANT: REPLACE WITH YOUR ACTUAL API BASE URL ***
const API_BASE_URL = 'http://192.168.0.138:3000';

// --- NEW HELPER FUNCTION FOR API CALLS ---
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
      // Add Authorization header here if your API requires it (e.g., Bearer Token)
      // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

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
  id: string; // This is the friendship ID from your API
  friend_id: string; // The ID of the friend
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
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchFriends();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user || !user.id) return;
    try {
      // Your API endpoint: GET /api/profiles/:id
      const data: ProfileData = await apiFetch(`/api/profiles/${user.id}`);
      setProfile(data);
      if (data) {
        setEditForm({
          full_name: data.full_name || '',
          username: data.username || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const fetchFriends = async () => {
    if (!user || !user.id) return;
    try {
      // Your API endpoint: GET /api/friends/:userId
      const friendsData: Friend[] = await apiFetch(`/api/friends/${user.id}`);
      setFriends(friendsData);
      setFriendCount(friendsData.length);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !user.id) return;
    setLoading(true);
    try {
      // Your API endpoint: PUT /api/profiles/:id
      await apiFetch(`/api/profiles/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          full_name: editForm.full_name,
          username: editForm.username
        }),
      });

      toast.success('Profile updated!');
      setView('profile'); // Return to profile view
      fetchProfile(); // Re-fetch profile to update UI
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(); // AuthContext handles clearing user state and localStorage
    navigate('/auth');
    toast.success('Signed out successfully');
  };

  const getInitials = (name: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  if (!user) return null; // Or show a loading spinner/redirect

  return (
    <div className={`profile-container ${view !== 'profile' ? 'edit-mode' : ''}`}>
      {/* Main Content */}
      <div className="profile-main-content">
        {/* Top section with gradient */}
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

          {view !== 'profile' && (
             <h1 className="view-title">
              {view === 'edit' ? 'Edit Profile' : 'Settings'}
            </h1>
          )}
        </div>

        {/* Conditional Rendering for Main Content Area */}
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

        {view === 'settings' && (
            <div className="profile-edit-section">
                 <Button onClick={handleSignOut} className="profile-signout-button">
                    Sign Out
                </Button>
            </div>
        )}

        {view === 'profile' && (
          <>
            {/* Friends and Add Friends Section */}
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

            {/* Streak Section */}
            <div className="profile-streak-section">
              <span className="streak-number">{profile?.streak || 0}</span>
              <p className="streak-label">Day Streak</p>
              <div className="streak-line"></div>
            </div>

            {/* Friends List Section */}
            <div className="friends-list-section">
              <h2 className="friends-list-title">Check how your friends are doing!</h2>
              <div className="friends-list-container">
                {friends.slice(0, 4).map((friend) => (
                  <div key={friend.id} className="friend-item">
                    <Avatar className="friend-avatar">
                      <AvatarImage src={friend.avatar_url || ''} />
                      <AvatarFallback
                        className="friend-avatar-fallback"
                        style={{ backgroundColor: generatePastelColor(friend.id) }}
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

      {/* Bottom Navigation */}
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
