// src/lib/api-client.ts

// *** IMPORTANT: REPLACE WITH YOUR ACTUAL API BASE URL ***
// This should be your development machine's IP address and the port your Docker API exposes
// For example: 'http://192.168.0.138:3000' or 'http://localhost:3000' if running on web browser dev server
// Remember to change this when building for production!
const API_BASE_URL = 'http://192.168.1.8:3000';

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
      // Add Authorization header here if your API requires it (e.g., Bearer Token)
      // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      // Try to parse JSON error response
      errorData = await response.json();
    } catch (e) {
      // If not JSON, use response text or default message
      errorData.message = await response.text();
    }
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  // Handle cases where the API might return no content (e.g., DELETE requests)
  if (response.status === 204) {
    return {} as T; // Return an empty object for no-content responses
  }

  return response.json();
}

// Helper function for file uploads
async function uploadFile<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type for FormData, let the browser set it with boundary
    headers: {
      // Add Authorization header here if your API requires it (e.g., Bearer Token)
      // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
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

  // Authentication
  signIn: (email: string, password: string) =>
    apiFetch<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signUp: (email: string, password: string, username: string) =>
    apiFetch<any>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    }),

  // Friends & Friend Requests
  searchUsers: () => apiFetch<any[]>('/api/profiles'), // Assumes /api/profiles returns all users for client-side filtering
  getFriends: (userId: string) => apiFetch<any[]>(`/api/friends/${userId}`),
  deleteFriend: (userId: string, friendId: string) =>
    apiFetch<void>(`/api/friends/${userId}/${friendId}`, {
      method: 'DELETE',
    }),
  getFriendRequests: (userId: string) => apiFetch<any[]>(`/api/friend-requests/${userId}`),
  sendFriendRequest: (senderId: string, receiverId: string) =>
    apiFetch<any>('/api/friend-requests/send', { // Assuming this endpoint exists
      method: 'POST',
      body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId }),
    }),
  respondToFriendRequest: (requestId: string, action: 'accepted' | 'rejected') =>
    apiFetch<any>('/api/friend-requests/respond', {
      method: 'POST',
      body: JSON.stringify({ requestId, action }),
    }),
  getSentFriendRequests: (userId: string) => apiFetch<any[]>(`/api/friend-requests/sent/${userId}`), // Assuming this endpoint exists

  // Leaderboard
  getLeaderboard: (userId: string) => apiFetch<any[]>(`/api/leaderboard/${userId}`),

  // Media Upload & Feed
  uploadMedia: (userId: string, file: File, challengeTitle: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('challengeTitle', challengeTitle);
    formData.append('mediaType', file.type.startsWith('image/') ? 'image' : 'video');
    
    return uploadFile<any>('/api/media/upload', formData);
  },
  
  getFeed: (userId: string) => apiFetch<any[]>(`/api/feed/${userId}`),
  
  getUserPosts: (userId: string) => apiFetch<any[]>(`/api/posts/user/${userId}`),
  
  deletePost: (postId: string) => apiFetch<void>(`/api/posts/${postId}`, {
    method: 'DELETE',
  }),
};
