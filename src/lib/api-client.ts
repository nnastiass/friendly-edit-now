// src/lib/api-client.ts

// *** IMPORTANT: REPLACE WITH YOUR ACTUAL API BASE URL ***
const API_BASE_URL = 'http://192.168.0.102:3000';

// A generic helper function for making API requests
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch (e) {
      errorData.message = await response.text();
    }
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Define specific API client methods
export const apiClient = {
  // Profiles
  getProfile: (userId: string) => apiFetch<any>(`/api/profiles/${userId}`),
  updateProfile: (userId: string, data: { full_name?: string; username?: string; streak?: number }) =>
    apiFetch<any>(`/api/profiles/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProfile: (userId: string) =>
    apiFetch<void>(`/api/profiles/${userId}`, {
      method: 'DELETE',
    }),

  // --- FIX 1: Corrected the requestEmailChange function ---
  // It now sends the correct JSON body that the backend expects.
  requestEmailChange: (userId: string, newEmail: string) =>
    apiFetch<any>(`/api/profiles/${userId}/change-email`, {
      method: 'POST',
      body: JSON.stringify({ newEmail: newEmail }), // The backend expects a field named "newEmail"
    }),

  // Authentication
  signIn: (email: string, password: string) =>
    apiFetch<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // --- FIX 2: Updated the signUp function ---
  // It now accepts the 'agreedToTerms' boolean and includes it in the request body.
  signUp: (email: string, password: string, username: string, agreedToTerms: boolean) =>
    apiFetch<any>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, agreedToTerms }),
    }),

  // Friends & Friend Requests
  searchUsers: () => apiFetch<any[]>('/api/profiles'),
  getFriends: (userId: string) => apiFetch<any[]>(`/api/friends/${userId}`),
  deleteFriend: (userId: string, friendId: string) =>
    apiFetch<void>(`/api/friends/${userId}/${friendId}`, {
      method: 'DELETE',
    }),
  getFriendRequests: (userId: string) => apiFetch<any[]>(`/api/friend-requests/${userId}`),
  sendFriendRequest: (senderId: string, receiverId: string) =>
    apiFetch<any>('/api/friend-requests/send', {
      method: 'POST',
      body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId }),
    }),
  respondToFriendRequest: (requestId: string, action: 'accepted' | 'rejected') =>
    apiFetch<any>('/api/friend-requests/respond', {
      method: 'POST',
      body: JSON.stringify({ requestId, action }),
    }),
  getSentFriendRequests: (userId: string) => apiFetch<any[]>(`/api/friend-requests/sent/${userId}`),

  // Leaderboard
  getLeaderboard: (userId: string) => apiFetch<any[]>(`/api/leaderboard/${userId}`),
};
