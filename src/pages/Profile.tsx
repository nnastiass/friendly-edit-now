import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { Home, User, Settings, Plus, Edit, ArrowLeft, UserPlus, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import './Index.css';

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

type BannerType = 'error' | 'success' | 'info';

const Profile = () => {
  const authAny = useAuth() as any;
  const { user, signOut } = authAny;

  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendCount, setFriendCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  const [view, setView] = useState<
    'profile' | 'edit' | 'settings' | 'account' | 'changeEmail' | 'changePassword' | 'conference'
  >('profile');

  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', username: '' });

  // Email change state (single source of truth)
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  // Password change state (single source of truth)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- Local UI state for conference toggle ---
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [disableConfirmOpen, setDisableConfirmOpen] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [toggleBusy, setToggleBusy] = useState(false);
  const [showTUSettings, setShowTUSettings] = useState(false);

  const isFormView = ['edit', 'changeEmail', 'changePassword'].includes(view);
  const isSettingsView = ['settings', 'account'].includes(view);

  const isParticipant =
    !!(user as any)?.isConferenceParticipant || !!(user as any)?.is_conference_participant;

  // --- Top pop-out banner (black bg, 20px radius, top: 50px) ---
  const [banner, setBanner] = useState<{ message: string; type: BannerType } | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const bannerTimer = useRef<number | null>(null);

  const showBanner = (message: string, type: BannerType = 'error', duration = 3500) => {
    if (bannerTimer.current) {
      window.clearTimeout(bannerTimer.current);
      bannerTimer.current = null;
    }
    setBanner({ message, type });
    requestAnimationFrame(() => setBannerVisible(true));
    bannerTimer.current = window.setTimeout(() => {
      setBannerVisible(false);
      bannerTimer.current = null;
    }, duration);
  };

  const closeBanner = () => {
    if (bannerTimer.current) {
      window.clearTimeout(bannerTimer.current);
      bannerTimer.current = null;
    }
    setBannerVisible(false);
  };

  useEffect(() => {
    return () => {
      if (bannerTimer.current) window.clearTimeout(bannerTimer.current);
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchFriends();
      fetchPendingRequestsCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const data: ProfileData = await apiClient.getProfile(user.id);
      setProfile(data);
      if (data) {
        setEditForm({
          full_name: data.full_name || '',
          username: data.username || '',
        });
      }
    } catch (error) {
      console.error('Profile: Error fetching profile:', error);
      showBanner('Failed to load profile', 'error');
    }
  };

  const fetchFriends = async () => {
    if (!user?.id) return;
    try {
      const friendsData: Friend[] = await apiClient.getFriends(user.id);
      setFriends(friendsData);
      setFriendCount(friendsData.length);
    } catch (error) {
      console.error('Profile: Error fetching friends:', error);
    }
  };

  const fetchPendingRequestsCount = async () => {
    if (!user?.id) return;
    try {
      const reqs = await apiClient.getFriendRequests(user.id);
      setPendingRequests(Array.isArray(reqs) ? reqs.length : 0);
    } catch (e) {
      console.error('Profile: Failed to fetch pending requests count', e);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await apiClient.updateProfile(user.id, {
        full_name: editForm.full_name,
        username: editForm.username,
      });
      // success toast removed
      setView('profile');
      fetchProfile();
    } catch (error: any) {
      showBanner(error?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    // success toast removed
  };

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      'Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.'
    );
    if (!isConfirmed || !user?.id) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteProfile(user.id);
      // success toast removed
      await signOut();
      navigate('/auth');
    } catch (error: any) {
      showBanner(error?.message || 'Could not delete your account. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Email change
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !currentPasswordForEmail || !user?.id) return;

    setIsChangingEmail(true);
    try {
      await apiClient.requestEmailChange(user.id, newEmail, currentPasswordForEmail);
      // success toast removed
      setNewEmail('');
      setCurrentPasswordForEmail('');
      setView('account');
    } catch (error: any) {
      console.error('Error changing email:', error);
      showBanner(error?.message || 'Failed to request email change.', 'error');
    } finally {
      setIsChangingEmail(false);
    }
  };

  // Password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showBanner('New passwords do not match.', 'error');
      return;
    }
    if (!user?.id) return;

    setIsChangingPassword(true);
    try {
      await apiClient.changePassword(user.id, passwordForm);
      // success toast removed
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setView('account');
    } catch (error: any) {
      showBanner(error?.message || 'Failed to change password.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // helper to merge updated user from API and keep camelCase flag available
  function mergeUserFromServer(patch: any) {
    if (!user) return;
    const normalized = {
      ...user,
      ...patch,
      isConferenceParticipant:
        patch?.isConferenceParticipant ??
        patch?.is_conference_participant ??
        user.isConferenceParticipant ??
        user.is_conference_participant ??
        false,
      is_conference_participant:
        patch?.is_conference_participant ??
        (patch?.isConferenceParticipant ??
          user.isConferenceParticipant ??
          user.is_conference_participant ??
          false),
    };
    localStorage.setItem('user', JSON.stringify(normalized));
    authAny.setUser?.(normalized);
  }

  const handleEnableConference = async () => {
    if (!user?.id) return;
    if (!codeInput.trim()) {
      showBanner('Please enter a code.', 'error');
      return;
    }
    try {
      setToggleBusy(true);
      await apiClient.verifyConferenceCode(codeInput.trim());
      const updated = await apiClient.setConferenceParticipation(user.id, true, codeInput.trim());
      mergeUserFromServer(updated);
      // success toast removed
      setEnableDialogOpen(false);
      setCodeInput('');
    } catch (e: any) {
      showBanner(e?.message || 'Invalid code', 'error');
    } finally {
      setToggleBusy(false);
    }
  };

  const handleDisableConference = async () => {
    if (!user?.id) return;
    const ok = window.confirm(
      'IF you switch to normal version, you will need to enter the code again next time. Are you sure?'
    );
    if (!ok) return;

    try {
      setToggleBusy(true);
      const updated = await apiClient.setConferenceParticipation(user.id, false);
      mergeUserFromServer(updated);
      // success toast removed
      setDisableConfirmOpen(false);
    } catch (e: any) {
      showBanner(e?.message || 'Failed to switch', 'error');
    } finally {
      setToggleBusy(false);
    }
  };

  const getTitleForView = () => {
    switch (view) {
      case 'edit': return 'Edit Profile';
      case 'settings': return 'Settings';
      case 'account': return 'Account';
      case 'changeEmail': return 'Change Email';
      case 'changePassword': return 'Change Password';
      case 'conference': return 'Testing United';
      default: return '';
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  if (!user) return null;

  return (
    <div
      className={`profile-container ${isSettingsView ? 'settings-view' : ''} ${
        isFormView || isSettingsView ? 'edit-mode' : ''
      }`}
    >
      {/* Top Pop-out Banner */}
      <div className="notify-root" aria-live="assertive" aria-atomic="true">
        <div
          className={`notify-banner ${bannerVisible ? 'visible' : ''} ${
            banner?.type ? `notify-${banner.type}` : ''
          }`}
          role="alert"
        >
          <span className="notify-text">{banner?.message}</span>
          <button
            type="button"
            className="notify-close"
            aria-label="Close notification"
            onClick={closeBanner}
          >
            ×
          </button>
        </div>
      </div>

      <div className="profile-main-content">
        <div className="profile-header-gradient">
          {view === 'profile' && (
            <>
              <Button variant="ghost" size="icon" className="profile-edit-button" onClick={() => setView('edit')}>
                <Edit className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="profile-settings-button" onClick={() => setView('settings')}>
                <Settings className="h-6 w-6" />
              </Button>
            </>
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
        </div>

        {/* Subpage header (back + title) */}
        {view !== 'profile' && (
          <div className="profile-subpage-header">
            <Button
              onClick={() => {
                if (view === 'edit' || view === 'settings') setView('profile');
                else if (view === 'account') setView('settings');
                else if (view === 'changeEmail' || view === 'changePassword') setView('account');
              }}
              variant="ghost"
              size="icon"
              className="profile-subpage-back-button"
            >
              <ArrowLeft />
            </Button>
            <h1 className="profile-subpage-title">{getTitleForView()}</h1>
          </div>
        )}

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
          <div className="profile-settings-section">
            <div className="settings-list">
              <Button onClick={() => setView('account')} className="settings-button">Account</Button>
              <Button onClick={() => setShowTUSettings((v) => !v)} className="settings-button">Testing United</Button>
            </div>

            {showTUSettings && (
              <div className="settings-card" style={{ marginTop: 16, textAlign: 'center' }}>
                {isParticipant ? (
                  <>
                    <p className="text-sm opacity-80 mb-2">
                      You are currently in the Testing United conference version.
                    </p>
                    <Button onClick={handleDisableConference} disabled={toggleBusy} className="settings-button">
                      {toggleBusy ? 'Switching...' : 'Switch to normal version'}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm opacity-80 mb-2">
                      Enable conference features with your Testing United code.
                    </p>

                    {!enableDialogOpen ? (
                      <Button onClick={() => setEnableDialogOpen(true)} disabled={toggleBusy} className="settings-button">
                        Switch to Testing United version
                      </Button>
                    ) : (
                      <div
                        className="auth-field-code"
                        style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center' }}
                      >
                        <Input
                          type="text"
                          value={codeInput}
                          onChange={(e) => setCodeInput(e.target.value)}
                          placeholder="Enter conference code"
                          className="profile-edit-input"
                          disabled={toggleBusy}
                          style={{ maxWidth: 260 }}
                        />
                        <Button type="button" onClick={handleEnableConference} disabled={toggleBusy} className="settings-button">
                          {toggleBusy ? 'Enabling...' : 'Enable'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => { setEnableDialogOpen(false); setCodeInput(''); }}
                          disabled={toggleBusy}
                          className="settings-button"
                          style={{ maxWidth: 180 }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Account view */}
        {view === 'account' && (
          <div className="profile-settings-section">
            <div className="settings-card">
              <Button onClick={() => setView('changeEmail')} className="settings-button">Change Email Address</Button>
              <Button onClick={() => setView('changePassword')} className="settings-button">Change Password</Button>
              <Button onClick={handleSignOut} className="profile-signout-button">Sign Out</Button>
            </div>

            <div className="profile-danger-zone">
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="profile-delete-button"
              >
                {isDeleting ? 'Deleting...' : 'Delete My Account'}
              </Button>
            </div>
          </div>
        )}

        {view === 'changeEmail' && (
          <div className="profile-edit-section">
            <form onSubmit={handleChangeEmail} className="settings-form">
              <div className="edit-form-group">
                <Label htmlFor="newEmail">New Email Address</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter your new email"
                  required
                  className="profile-edit-input"
                />
              </div>
              <div className="edit-form-group">
                <Label htmlFor="currentPasswordForEmail">Current Password</Label>
                <Input
                  id="currentPasswordForEmail"
                  type="password"
                  value={currentPasswordForEmail}
                  onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                  placeholder="Enter password to confirm"
                  required
                  className="profile-edit-input"
                />
              </div>
              <Button type="submit" disabled={isChangingEmail} className="profile-save-button">
                {isChangingEmail ? 'Sending...' : 'Request Change'}
              </Button>
            </form>
          </div>
        )}

        {view === 'changePassword' && (
          <div className="profile-edit-section">
            <form onSubmit={handleChangePassword} className="settings-form" noValidate>
              <div className="edit-form-group">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter your current password"
                  required
                  className="profile-edit-input"
                />
              </div>

              <div className="edit-form-group">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter your new password"
                  required
                  className="profile-edit-input"
                />
              </div>

              {/* ⬇️ Add this helper text */}
              <p className="auth-hint">At least 8 characters, include uppercase, lowercase, and a number.</p>

              <div className="edit-form-group">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Repeat the new password"
                  required
                  className="profile-edit-input"
                />
              </div>

              <Button type="submit" disabled={isChangingPassword} className="profile-save-button">
                {isChangingPassword ? 'Saving...' : 'Change Password'}
              </Button>
            </form>

            <button className="forgot-password-button" onClick={() => navigate('/forgot-password')}>
              I forgot my password
            </button>
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

              <Button
                variant="ghost"
                size="icon"
                className="profile-requests-button"
                onClick={() => navigate('/friend-requests')}
              >
                <UserPlus className="h-6 w-6" />
                {pendingRequests > 0 && (
                  <span className="profile-requests-badge">
                    {pendingRequests > 99 ? '99+' : pendingRequests}
                  </span>
                )}
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

      {/* Bottom Navigation — shared structure */}
      <div className="index-bottom-nav">
        <div className="index-nav-container">
          <button
            className="index-nav-button index-nav-button-inactive"
            onClick={() => navigate('/feed')}
          >
            <Home className="index-nav-icon" />
          </button>

          {/* Info only for Testing United participants */}
          {isParticipant && (
            <button
              className="index-nav-button index-nav-button-inactive"
              onClick={() => navigate('/info')}
            >
              <Info className="index-nav-icon" />
            </button>
          )}

          <button
            className="index-nav-button index-nav-button-inactive"
            onClick={() => navigate('/')}
          >
            <Plus className="index-nav-icon" />
          </button>

          <button className="index-nav-button index-nav-button-active">
            <User className="index-nav-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
