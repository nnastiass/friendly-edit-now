import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import './Auth.css';
import './Modal.css';

type BannerType = 'error' | 'success' | 'info';

// --- TermsModal Component ---
// This is now correctly defined as a separate component before Auth.
const TermsModal = ({ content, onClose }: { content: string; onClose: () => void }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Terms and Conditions</h2>
        <div className="modal-body" dangerouslySetInnerHTML={{ __html: content }} />
        <Button onClick={onClose} className="auth-submit-button modal-close-button">Close</Button>
      </div>
    </div>
  );
};


const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [conferenceCode, setConferenceCode] = useState('');

  const [banner, setBanner] = useState<{ message: string; type: BannerType } | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const bannerTimer = useRef<number | null>(null);

  // --- NEW: State for Modal and Terms Data ---
  const [termsContent, setTermsContent] = useState('');
  const [termsVersion, setTermsVersion] = useState('');
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // --- NEW: useEffect to fetch terms from the database ---
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const data = await apiClient.getLatestTerms();
        setTermsContent(data.content);
        setTermsVersion(data.version);
      } catch (error) {
        console.error("Could not fetch Terms and Conditions:", error);
        setTermsContent('<p>Could not load Terms and Conditions. Please try again later.</p>');
        showBanner('Could not load Terms & Conditions.', 'error');
      }
    };

    fetchTerms();
  }, []); // Empty array ensures this runs only once on mount.

  // --- Banner helpers ---
  const showBanner = (message: string, type: BannerType = 'info', duration = 3500) => {
    if (bannerTimer.current) {
      window.clearTimeout(bannerTimer.current);
    }
    setBanner({ message, type });
    requestAnimationFrame(() => setBannerVisible(true));
    bannerTimer.current = window.setTimeout(() => {
      setBannerVisible(false);
    }, duration);
  };

  const closeBanner = () => {
    if (bannerTimer.current) {
      window.clearTimeout(bannerTimer.current);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          throw error;
        }
        navigate('/');
      } else {
        // Signup Logic
        if (password !== confirmPassword) {
          throw new Error("Passwords don't match.");
        }
        const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
        if (!passwordPattern.test(password)) {
          throw new Error('Password must be at least 8 characters long and include uppercase, lowercase, and a number.');
        }
        if (isParticipant) {
          if (!conferenceCode.trim()) {
            throw new Error('Please enter your conference code.');
          }
          await apiClient.verifyConferenceCode(conferenceCode.trim());
        }

        // --- MODIFIED: Pass termsVersion to signUp ---
        const { error } = await signUp(
          email,
          password,
          username,
          agreedToTerms,
          isParticipant,
          termsVersion // Pass the version of terms they agreed to
        );

        if (error) {
          throw error;
        } else {
          showBanner('Account created! Please check your email to verify your account.', 'success');
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error('Auth handleSubmit error:', error);
      showBanner(error.message || 'An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isSignUpDisabled = loading || !agreedToTerms || !termsContent;

  return (
    <div
      className="auth-container"
      style={{ background: 'radial-gradient(circle 25% at 50% 20%, #FF0046, #000000)' }}
    >
      {/* --- NEW: Conditionally render the modal --- */}
      {isTermsModalOpen && <TermsModal content={termsContent} onClose={() => setIsTermsModalOpen(false)} />}

      <div className="notify-root" aria-live="assertive" aria-atomic="true">
        <div
          className={`notify-banner ${bannerVisible ? 'visible' : ''} ${
            banner?.type ? `notify-${banner.type}` : ''
          }`}
          role="alert"
        >
          <span className="notify-text">{banner?.message}</span>
          <button type="button" className="notify-close" aria-label="Close notification" onClick={closeBanner}>
            ×
          </button>
        </div>
      </div>

      <div className="auth-mobile-frame">
        <div className="auth-layout">
          <div className="auth-header">
            <h1 className="auth-app-title">GETOUT</h1>
            <h2 className="auth-page-title">{isLogin ? 'Welcome back!' : 'Create account'}</h2>
            <p className="auth-description">{isLogin ? 'Sign in to continue your streak' : 'Join the community and start your journey'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
                <div className="auth-field">
                  <Label htmlFor="username" className="auth-label">Username</Label>
                  <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="auth-input" placeholder="Choose a username" />
                </div>
            )}
            <div className="auth-field">
              <Label htmlFor="email" className="auth-label">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="auth-input" placeholder="Enter your email" />
            </div>
            <div className="auth-field">
              <Label htmlFor="password" className="auth-label">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="auth-input" placeholder="Enter your password" aria-describedby={!isLogin ? 'password-requirements' : undefined} />
            </div>
            {!isLogin && (
              <>
                <div className="auth-field">
                  <Label htmlFor="confirmPassword" className="auth-label">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="auth-input" placeholder="Re-enter your password" />
                  <p id="password-requirements" className="auth-hint">Must be at least 8 characters and include uppercase, lowercase, and a number.</p>
                </div>
                <div className="auth-field-terms">
                  <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="auth-checkbox" />
                  <Label htmlFor="terms" className="auth-label-terms">
                    I agree to the{' '}
                    {/* --- MODIFIED: Link is now a button to open the modal --- */}
                    <button type="button" onClick={() => setIsTermsModalOpen(true)} disabled={!termsContent} className="auth-link">
                      Terms and Conditions
                    </button>
                  </Label>
                </div>
                <div className="auth-field-terms">
                  <input type="checkbox" id="participant" checked={isParticipant} onChange={(e) => setIsParticipant(e.target.checked)} className="auth-checkbox" />
                  <Label htmlFor="participant" className="auth-label-terms">I am a Testing United Conference participant</Label>
                </div>
                {isParticipant && (
                  <div className="auth-field">
                    <Input type="text" value={conferenceCode} onChange={(e) => setConferenceCode(e.target.value)} placeholder="Enter conference code" className="auth-input" />
                  </div>
                )}
              </>
            )}
            <Button type="submit" disabled={isLogin ? loading : isSignUpDisabled} className="auth-submit-button">
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="auth-toggle-container">
            <button onClick={() => setIsLogin(!isLogin)} className="auth-toggle-button" type="button">
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;