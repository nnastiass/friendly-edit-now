// src/lib/api-client.ts

// *** IMPORTANT: REPLACE WITH YOUR ACTUAL API BASE URL ***
// This should be your development machine's IP address and the port your Docker API exposes
// For example: 'http://192.168.0.138:3000' or 'http://localhost:3000' if running on web browser dev server
// Remember to change this when building for production!
export const API_BASE_URL = 'http://10.2.13.186:3000';

// --- MODERATION ---
export const moderationClient = {
  getPending: async (moderatorId: string, page = 1) => {
    const res = await fetch(`${API_BASE_URL}/api/moderation/posts/pending?page=${page}`, {
      headers: { "x-user-id": moderatorId },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  approvePost: async (moderatorId: string, postId: string) => {
    const res = await fetch(`${API_BASE_URL}/api/moderation/posts/${postId}/approve`, {
      method: "POST",
      headers: { "x-user-id": moderatorId, "Content-Type": "application/json" },
      body: "{}",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  rejectPost: async (moderatorId: string, postId: string, reason?: string) => {
    const res = await fetch(`${API_BASE_URL}/api/moderation/posts/${postId}/reject`, {
      method: "POST",
      headers: { "x-user-id": moderatorId, "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

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
    throw new Error(errorData.message || `HTTP error ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Helper function for file uploads
// Generic helper for multipart/form-data uploads
async function uploadForm<T>(endpoint: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData, // DO NOT set Content-Type; browser sets boundary
  });

  if (!res.ok) {
    let err: any = {};
    try {
      err = await res.json();
    } catch {
      err.message = await res.text();
    }
    throw new Error(err?.message || `HTTP error ${res.status}`);
  }

  return res.json();
}



// Define specific API client methods
export const apiClient = {
  // Authentication
  signIn: (email: string, password: string) =>
    apiFetch<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signUp: (email: string, password: string, username: string, agreedToTerms: boolean, isConferenceParticipant: boolean) =>
    apiFetch<any>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, agreedToTerms, isConferenceParticipant }),
    }),
  verifyEmail: (token: string) =>
    apiFetch<any>(`/api/auth/verify?token=${token}`),
  forgotPassword: (email: string) =>
    apiFetch<any>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, newPassword: string, confirmPassword: string) =>
    apiFetch<any>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    }),

  // Profiles & Settings
  getProfile: (userId: string) => apiFetch<any>(`/api/profiles/${userId}`),
  updateProfile: (userId: string, data: { full_name?: string; username?: string; streak?: number; daily_challenge_index?: number }) =>
    apiFetch<any>(`/api/profiles/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProfile: (userId: string) =>
    apiFetch<void>(`/api/profiles/${userId}`, {
      method: 'DELETE',
    }),
 changePassword: (userId: string, currentPassword: string, newPassword: string, confirmPassword: string) =>
   apiFetch<any>(`/api/profiles/${userId}/change-password`, {
     method: 'POST',
     body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
   }),

  requestEmailChange: (userId: string, newEmail: string, currentPassword: string) =>
    apiFetch<any>(`/api/profiles/${userId}/change-email`, {
      method: 'POST',
      body: JSON.stringify({ newEmail, currentPassword }),
    }),
  confirmEmailChange: (token: string) =>
    apiFetch<any>(`/api/profiles/confirm-email-change?token=${token}`),
  searchUsers: () => apiFetch<any[]>('/api/profiles'),

  // Conference
  verifyConferenceCode: (code: string) =>
    apiFetch<any>('/api/auth/verify-conference-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
  setConferenceParticipation: (userId: string, enable: boolean, code?: string) =>
    apiFetch<any>('/api/conference/participation', {
      method: 'POST',
      body: JSON.stringify({ userId, enable, code }),
    }),

  // Friends & Friend Requests
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

  // Posts
  createPost: (postData: { user_id: string; caption: string; media_type: 'image' | 'video'; media_url: string }) =>
    apiFetch<any>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    }),
  getUserPosts: (userId: string) => apiFetch<any[]>(`/api/posts/${userId}`),
  deletePost: (postId: string) =>
    apiFetch<void>(`/api/posts/${postId}`, {
      method: 'DELETE',
    }),
  getFeed: (userId: string, page: number) => apiFetch<any[]>(`/api/feed/${userId}?page=${page}`),

  // Comments
  addComment: (postId: string, userId: string, content: string) =>
    apiFetch<any>('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId, user_id: userId, content }),
    }),
  getComments: (postId: string) => apiFetch<any[]>(`/api/posts/${postId}/comments`),

  // Approvals
  addApproval: (postId: string, userId: string, status: string) =>
    apiFetch<any>('/api/approvals', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId, user_id: userId, status }),
    }),
  getApprovals: (postId: string) => apiFetch<any>(`/api/posts/${postId}/approvals`),

  // Media Upload
// Media Upload
uploadMedia: (userId: string, file: File, challengeTitle: string) => {
  const title = (challengeTitle ?? '').trim() || 'daily-challenge';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  formData.append('challengeTitle', title);
  formData.append('mediaType', file.type.startsWith('image/') ? 'image' : 'video'); // optional

  return uploadForm<any>('/api/media/upload', formData);
},


};
