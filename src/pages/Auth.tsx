import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import './Auth.css';

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

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // --- NEW FUNCTION TO VERIFY THE CONFERENCE CODE ---
  const handleVerifyCode = async () => {
    if (!conferenceCode) {
      toast.error("Please enter a code.");
      return;
    }
    setVerifyingCode(true);
    try {
      await apiClient.verifyConferenceCode(conferenceCode);
      toast.success("Conference code verified!");
      setIsCodeVerified(true);
    } catch (error: any) {
      toast.error(error.message || "Invalid conference code.");
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
          toast.error(error.message || 'Invalid email or password');
        } else {
          toast.success('Successfully signed in!');
          navigate('/');
        }
      } else {
        // Confirm password validation
        if (password !== confirmPassword) {
          toast.error("Passwords don't match.");
          setLoading(false);
          return;
        }

        // Password strength validation
        const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
        if (!passwordPattern.test(password)) {
          toast.error(
            'Password must be at least 8 characters long and include uppercase, lowercase, and a number.'
          );
          setLoading(false);
          return;
        }

        // If the user claims participant, verify code here before signUp
        if (isParticipant) {
          if (!conferenceCode.trim()) {
            toast.error('Please enter your conference code.');
            setLoading(false);
            return;
          }
          try {
            await apiClient.verifyConferenceCode(conferenceCode.trim());
            // ok, continue to signUp
          } catch (err: any) {
            toast.error(err?.message || 'Invalid conference code.');
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
          toast.error(error.message || 'An unexpected error occurred during signup.');
        } else {
          toast.success('Account created! Please check your email to verify your account.');
          setIsLogin(true);
        }
      }
    } catch (error) {
      console.error('Auth handleSubmit error:', error);
      toast.error('An unexpected error occurred');
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
              />
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
