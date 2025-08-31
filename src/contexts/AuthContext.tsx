import React, { createContext, useContext, useState, useEffect } from 'react';

// *** IMPORTANT: REPLACE WITH YOUR ACTUAL API BASE URL ***
const API_BASE_URL = 'http://192.168.0.102:3000';

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

  // signIn stays the same
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;

  // signUp now accepts the 5th param used by your Auth.tsx
  signUp: (
    email: string,
    password: string,
    username: string,
    agreedToTerms: boolean,
    isConferenceParticipant?: boolean
  ) => Promise<{ error?: Error }>;

  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Normalizer: make sure we always have camelCase available on the frontend
function normalizeUser(u: any): User | null {
  if (!u) return null;
  const isConferenceParticipant =
    u.isConferenceParticipant ?? u.is_conference_participant ?? false;

  // return a user object that contains BOTH keys (harmless) and a stable camelCase
  return {
    ...u,
    is_conference_participant: u.is_conference_participant ?? isConferenceParticipant,
    isConferenceParticipant,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial load (and normalize)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const raw = JSON.parse(storedUser);
        const normalized = normalizeUser(raw);
        setUser(normalized);
        if (normalized) {
          localStorage.setItem('user', JSON.stringify(normalized));
        }
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

      const normalized = normalizeUser(data);
      setUser(normalized);
      localStorage.setItem('user', JSON.stringify(normalized));
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
        // send BOTH keys so your backend can read either style
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

      // Most flows send users to login after signup. If you ever decide to store the
      // returned user here, normalize first:
      // const normalized = normalizeUser(data.user);
      // setUser(normalized);
      // localStorage.setItem('user', JSON.stringify(normalized));

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
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
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
