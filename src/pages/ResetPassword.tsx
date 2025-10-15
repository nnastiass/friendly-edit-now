// Create a new file, e.g., src/pages/ResetPassword.tsx

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import './Auth.css'; // Reuse your auth styles

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('No reset token found. The link may be invalid.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred.');
      }

      setMessage('Password reset successfully! You can now log in.');
      setTimeout(() => navigate('/auth'), 3000); // Redirect to login after 3 seconds

    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The token might be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ background: 'radial-gradient(circle 25% at 50% 20%, #FF0046, #000000)' }}>
      <div className="auth-mobile-frame">
        <div className="auth-layout">
          <div className="auth-header">
            <h1 className="auth-app-title">GETOUT</h1>
            <h2 className="auth-page-title">Set a New Password</h2>
          </div>

          {message && <p className="auth-success-message">{message}</p>}
          {error && <p className="auth-error-message">{error}</p>}

          {!message && ( // Hide form on success
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>
              <div className="auth-field">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>
              <Button type="submit" disabled={!token || loading} className="auth-submit-button">
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;