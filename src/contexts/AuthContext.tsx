import React, { createContext, useContext, useState, useEffect } from 'react';

// *** IMPORTANT: REPLACE WITH YOUR ACTUAL API BASE URL lol ***
const API_BASE_URL = 'http://10.2.13.186:3000';

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;

  // Backend might return either snake_case or camelCase.
  is_conference_participant?: boolean;
  isConferenceParticipant?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;

  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signUp: (
    email: string,
    password: string,
    username: string,
    agreedToTerms: boolean,
    isConferenceParticipant?: boolean
  ) => Promise<{ error?: Error }>;
  signOut: () => Promise<void>;

  // NEW: expose setter so other pages can update the user immediately (e.g., TU toggle)
  setUser?: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Normalize backend user into a stable camelCase flag (but keep snake_case too)
function normalizeUser(u: any): User | null {
  if (!u) return null;
  const isConferenceParticipant =
    u.isConferenceParticipant ?? u.is_conference_participant ?? false;

  return {
    ...u,
    is_conference_participant:
      u.is_conference_participant ?? isConferenceParticipant,
    isConferenceParticipant,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [_user, _setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // unified setter that also normalizes + persists
  const setUser = (u: User | null) => {
    const normalized = normalizeUser(u);
    _setUser(normalized);
    if (normalized) {
      localStorage.setItem('user', JSON.stringify(normalized));
    } else {
      localStorage.removeItem('user');
    }
  };

  // Load user from localStorage on initial load (and normalize)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
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
        throw new Error(data.message || 'Login failed');
      }

      setUser(data); // will normalize & persist
      return {};
    } catch (error: any) {
      console.error('Sign In Error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    username: string,
    agreedToTerms: boolean,
    isConferenceParticipant: boolean = false
  ) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // send BOTH keys so your backend can read either style if needed
        body: JSON.stringify({
          email,
          password,
          username,
          agreedToTerms,
          isConferenceParticipant,
          is_conference_participant: isConferenceParticipant,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // After signup you verify via email, then log in
      return {};
    } catch (error: any) {
      console.error('Sign Up Error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider
      value={{
        user: _user,
        loading,
        signIn,
        signUp,
        signOut,
        setUser, // expose so Profile (and others) can update immediately
      }}
    >
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
