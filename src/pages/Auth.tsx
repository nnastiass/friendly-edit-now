import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import './Auth.css';

type BannerType = 'error' | 'success' | 'info';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- NEW STATE FOR CONFERENCE FEATURE ---
  const [isParticipant, setIsParticipant] = useState(false);
  const [conferenceCode, setConferenceCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  // --- NEW STATE: Top pop-out banner ---
  const [banner, setBanner] = useState<{ message: string; type: BannerType } | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const bannerTimer = useRef<number | null>(null);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // --- Banner helpers ---
  const showBanner = (message: string, type: BannerType = 'info', duration = 3500) => {
    if (bannerTimer.current) {
      window.clearTimeout(bannerTimer.current);
      bannerTimer.current = null;
    }
    setBanner({ message, type });
    // allow layout to paint before sliding in
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
      if (bannerTimer.current) {
        window.clearTimeout(bannerTimer.current);
      }
    };
  }, []);

  // --- Verify the conference code (no success notification per request) ---
  const handleVerifyCode = async () => {
    if (!conferenceCode) {
      showBanner('Please enter a code.', 'error');
      return;
    }
    setVerifyingCode(true);
    try {
      await apiClient.verifyConferenceCode(conferenceCode);
      // Deleted: "Conference code verified!" (no notification shown)
      setIsCodeVerified(true);
    } catch (error: any) {
      showBanner(error?.message || 'Invalid conference code.', 'error');
      setIsCodeVerified(false);
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          showBanner(error.message || 'Invalid email or password', 'error');
        } else {
          // Deleted: "Successfully signed in!" (no notification shown)
          navigate('/');
        }
      } else {
        // Confirm password validation
        if (password !== confirmPassword) {
          showBanner("Passwords don't match.", 'error');
          setLoading(false);
          return;
        }

        // Password strength validation
        const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
        if (!passwordPattern.test(password)) {
          showBanner(
            'Password must be at least 8 characters long and include uppercase, lowercase, and a number.',
            'error'
          );
          setLoading(false);
          return;
        }

        // If the user claims participant, verify code here before signUp
        if (isParticipant) {
          if (!conferenceCode.trim()) {
            showBanner('Please enter your conference code.', 'error');
            setLoading(false);
            return;
          }
          try {
            await apiClient.verifyConferenceCode(conferenceCode.trim());
            // ok, continue to signUp (no "verified" banner)
          } catch (err: any) {
            showBanner(err?.message || 'Invalid conference code.', 'error');
            setLoading(false);
            return; // stop submission
          }
        }

        const { error } = await signUp(
          email,
          password,
          username,
          agreedToTerms,
          isParticipant // true only if they ticked and it passed verification above
        );

        if (error) {
          showBanner(error.message || 'An unexpected error occurred during signup.', 'error');
        } else {
          showBanner('Account created! Please check your email to verify your account.', 'success');
          setIsLogin(true);
        }
      }
    } catch (error) {
      console.error('Auth handleSubmit error:', error);
      showBanner('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isSignUpDisabled = loading || !agreedToTerms;

  return (
    <div
      className="auth-container"
      style={{ background: 'radial-gradient(circle 25% at 50% 20%, #FF0046, #000000)' }}
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

      <div className="auth-mobile-frame">
        <div className="auth-layout">
          <div className="auth-header">
            <h1 className="auth-app-title">GETOUT</h1>
            <h2 className="auth-page-title">
              {isLogin ? 'Welcome back!' : 'Create account'}
            </h2>
            <p className="auth-description">
              {isLogin
                ? 'Sign in to continue your streak'
                : 'Join the community and start your journey'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <>
                <div className="auth-field">
                  <Label htmlFor="username" className="auth-label">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="auth-input"
                    placeholder="Choose a username"
                  />
                </div>
              </>
            )}

            <div className="auth-field">
              <Label htmlFor="email" className="auth-label">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                placeholder="Enter your email"
              />
            </div>

            <div className="auth-field">
              <Label htmlFor="password" className="auth-label">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
                placeholder="Enter your password"
                aria-describedby={!isLogin ? 'password-requirements' : undefined}
              />
              {!isLogin && (
                <p id="password-requirements" className="auth-hint">
                  Must be at least 8 characters and include uppercase, lowercase, and a number.
                </p>
              )}
            </div>


            {!isLogin && (
              <div className="auth-field">
                <Label htmlFor="confirmPassword" className="auth-label">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="auth-input"
                  placeholder="Re-enter your password"
                />
              </div>
            )}

            {!isLogin && (
              <>
                <div className="auth-field-terms">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="auth-checkbox"
                  />
                  <Label htmlFor="terms" className="auth-label-terms">
                    I agree to the{' '}
                    <a
                      href="/Terms-and-Conditions.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="auth-link"
                    >
                      Terms and Conditions
                    </a>
                  </Label>
                </div>

                <div className="auth-field-terms">
                  <input
                    type="checkbox"
                    id="participant"
                    checked={isParticipant}
                    onChange={(e) => {
                      setIsParticipant(e.target.checked);
                      if (!e.target.checked) {
                        setIsCodeVerified(false);
                        setConferenceCode('');
                      }
                    }}
                    className="auth-checkbox"
                  />
                  <Label htmlFor="participant" className="auth-label-terms">
                    I am a Testing United Conference participant
                  </Label>
                </div>

                {isParticipant && (
                  <div className="auth-field-code">
                    <Input
                      type="text"
                      value={conferenceCode}
                      onChange={(e) => setConferenceCode(e.target.value)}
                      placeholder="Enter conference code"
                      className="auth-input auth-code-input"
                    />
                  </div>
                )}
              </>
            )}

            <Button
              type="submit"
              disabled={isLogin ? loading : isSignUpDisabled}
              className="auth-submit-button"
            >
              {loading
                ? 'Loading...'
                : isLogin
                ? 'Sign In'
                : 'Create Account'}
            </Button>
          </form>

          <div className="auth-toggle-container">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="auth-toggle-button"
              type="button"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
