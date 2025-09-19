// src/pages/ResetPassword.tsx
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import './Index.css';

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const token = useMemo(() => sp.get('token') || '', [sp]);
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);

    if (!token) {
      setError('Reset link is missing or invalid.');
      return;
    }
    if (newPassword !== confirm) {
      setError('New passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      await apiClient.resetPassword(token, newPassword, confirm);
      setOk('Password reset successfully. You can now sign in.');
      setTimeout(() => navigate('/auth'), 900);
    } catch (e: any) {
      setError(e?.message || 'Unable to reset password. The link may be invalid or expired.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="profile-container edit-mode">
      <div className="profile-subpage-header">
        <button className="profile-subpage-back-button" onClick={() => navigate('/auth')}>←</button>
        <h1 className="profile-subpage-title">Set New Password</h1>
      </div>

      <div className="profile-edit-section">
        <form onSubmit={submit} className="settings-form" noValidate>
          <div className="edit-form-group">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              className="profile-edit-input"
            />
          </div>



          <div className="edit-form-group">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat the new password"
              required
              className="profile-edit-input"
            />
          </div>
<p className="auth-hint">At least 8 characters, include uppercase, lowercase, and a number.</p>
          <Button type="submit" disabled={busy} className="profile-save-button">
            {busy ? 'Saving...' : 'Save New Password'}
          </Button>

          {error && <p className="auth-hint" style={{ color: 'tomato', marginTop: 12 }}>{error}</p>}
          {ok && <p className="auth-hint" style={{ color: 'lightgreen', marginTop: 12 }}>{ok}</p>}
        </form>
      </div>
    </div>
  );
}
