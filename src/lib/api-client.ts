// src/lib/api-client.ts

import { toast } from 'sonner';

// ====================================================================
// IMPORTANT: Replace this with your computer's local IP address!
const API_BASE_URL = '192.168.0.138:3000';
// ====================================================================


async function fetchApi(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API call to ${endpoint} failed:`, error);
    // The component will handle toasting the error message
    throw error;
  }
}


// --- API Client Methods ---

export const apiClient = {
  // === Auth ===
  signUp: (email: string, password: string, username: string) =>
    fetchApi('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    }),
  signIn: (email: string, password: string) =>
    fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // === Profiles ===
  getProfile: (userId: string) => fetchApi(`/api/profiles/${userId}`),
  updateProfile: (userId: string, updates: { full_name?: string; username?: string; streak?: number }) =>
    fetchApi(`/api/profiles/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // === Friends & Requests ===
  getFriends: (userId: string) => fetchApi(`/api/friends/${userId}`),
  removeFriend: (userId: string, friendId: string) =>
    fetchApi(`/api/friends/${userId}/${friendId}`, {
      method: 'DELETE',
    }),
  getFriendRequests: (userId:string) => fetchApi(`/api/friend-requests/${userId}`),
  respondToFriendRequest: (requestId: string, action: 'accepted' | 'rejected') =>
    fetchApi('/api/friend-requests/respond', {
      method: 'POST',
      body: JSON.stringify({ requestId, action }),
    }),

  // === Leaderboard ===
  getLeaderboard: (userId: string) => fetchApi(`/api/leaderboard/${userId}`),
};
