import { toast } from 'sonner';

// ====================================================================
// IMPORTANT: Replace this with your computer's local IP address!
// On Windows, open Command Prompt and type `ipconfig`.
// On Mac/Linux, open Terminal and type `ifconfig` or `ip addr`.
const API_BASE_URL = 'http://192.168.0.140:3000'; // USE YOUR ACTUAL IP
// ====================================================================


/**
 * A helper function to handle fetch requests and basic error handling.
 * @param endpoint The API endpoint to call (e.g., '/api/profiles/123').
 * @param options The options for the fetch request (method, headers, body).
 * @returns The JSON response from the API.
 */
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
      const errorData = await response.json().catch(() => ({ message: `The server responded with a ${response.status} error.` }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // For DELETE requests which might not have a body
    if (response.status === 204) {
        return null;
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API call to ${endpoint} failed:`, error);
    // Let the component that called this function handle the toast message.
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

  // === User Search & Profiles ===
  searchUsers: (term: string, currentUserId: string) =>
    fetchApi(`/api/users/search?term=${encodeURIComponent(term)}&currentUserId=${encodeURIComponent(currentUserId)}`),
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
  getFriendRequests: (userId: string) => fetchApi(`/api/friend-requests/${userId}`),
  sendFriendRequest: (senderId: string, receiverId: string) =>
    fetchApi('/api/friend-requests', {
        method: 'POST',
        body: JSON.stringify({ senderId, receiverId })
    }),
  respondToFriendRequest: (requestId: string, action: 'accepted' | 'rejected') =>
    fetchApi('/api/friend-requests/respond', {
      method: 'POST',
      body: JSON.stringify({ requestId, action }),
    }),

  // === Leaderboard ===
  getLeaderboard: (userId: string) => fetchApi(`/api/leaderboard/${userId}`),
};
