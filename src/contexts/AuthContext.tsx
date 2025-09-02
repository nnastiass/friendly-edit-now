// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// *** IMPORTANT: REPLACE WITH YOUR ACTUAL API BASE URL ***
const API_BASE_URL = 'http://10.2.8.191:3000';

interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  // Add other user properties returned by your API's login endpoint
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error?: Error }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Assuming your API sends an error message in the 'message' field
        throw new Error(data.message || 'Login failed');
      }

      // Assuming your API returns the user object directly on successful login
      const loggedInUser: User = data;
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser)); // Store user data
      // If your API returns a token, store it here:
      // localStorage.setItem('authToken', data.token);
      return {}; // No error
    } catch (error: any) {
      console.error('Sign In Error:', error);
      return { error: error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // For signup, your API might not automatically log in the user.
      // If it does, you'd set the user here. Otherwise, the user will need to sign in after.
      return {}; // No error
    } catch (error: any) {
      console.error('Sign Up Error:', error);
      return { error: error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // For a simple token-based API, signing out is just clearing local storage
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken'); // If you use tokens
    // You might also want to hit a /logout endpoint on your API if it manages sessions
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
