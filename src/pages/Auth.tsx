import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false); // 1. New state for the checkbox
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Successfully signed in!');
          navigate('/');
        }
      } else {
        // 2. Pass the 'agreedToTerms' state to the signUp function
        const { error } = await signUp(email, password, username, agreedToTerms);
        if (error) {
          if (error.message.includes('A user with this email or username already exists')) {
            toast.error('An account with this email or username already exists');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created! Please check your email to verify your account.');
          setIsLogin(true);
        }
      }
    } catch (error) {
      console.error("Auth handleSubmit error:", error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // 3. Determine if the signup button should be disabled
  const isSignUpDisabled = loading || (!isLogin && !agreedToTerms);

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
              {isLogin ? 'Sign in to continue your streak' : 'Join the community and start your journey'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="auth-field">
                <Label htmlFor="username" className="auth-label">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                  className="auth-input"
                  placeholder="Choose a username"
                />
              </div>
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

            {/* 4. Add the checkbox and link to the form, only shows on signup */}
            {!isLogin && (
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
                        <a href="/Terms-and-Conditions.pdf" target="_blank" rel="noopener noreferrer" className="auth-link">
                            Terms and Conditions
                        </a>
                    </Label>
                </div>
            )}


            <Button
              type="submit"
              disabled={isLogin ? loading : isSignUpDisabled}
              className="auth-submit-button"
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="auth-toggle-container">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="auth-toggle-button"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
