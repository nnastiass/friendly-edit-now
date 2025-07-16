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
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth(); // We assume these functions in the context are updated to use the API
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let error;
      if (isLogin) {
        // The `signIn` function in your AuthContext should handle the API call
        ({ error } = await signIn(email, password));
        if (error) {
            toast.error(error.message || 'Invalid email or password');
        } else {
            toast.success('Successfully signed in!');
            navigate('/');
        }
      } else {
        // The `signUp` function in your AuthContext should handle the API call
        ({ error } = await signUp(email, password, username));
        if (error) {
            toast.error(error.message || 'Failed to create account');
        } else {
            toast.success('Account created! Please check your email for verification.');
            setIsLogin(true); // Switch to login view after successful signup
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-mobile-frame">
        <div className="auth-layout">
          <div className="auth-header">
            <h1 className="auth-app-title">SocialStreak</h1>
            <h2 className="auth-page-title">
              {isLogin ? 'Welcome back' : 'Create account'}
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

            <Button
              type="submit"
              disabled={loading}
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
