// src/lib/api-client.ts

// *** IMPORTANT: REPLACE WITH YOUR ACTUAL API BASE URL ***
export const API_BASE_URL = 'http://192.168.0.230:3000';

export interface Post {
  id: string;
  user_id: string;
  caption: string;
  media_type: 'image' | 'video';
  media_url: string;
  challenge_id: number | null;
  challenge_set: 'main' | 'conference' | null;
  verified: boolean;         // ⬅️ important
  created_at: string;
}

// Generic API fetch helper
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const text = await response.text();

  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data
        ? (data as any).message
        : data) || `HTTP error ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

// Helper for file uploads
async function uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type, browser handles multipart boundaries
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

// API client with all methods
export const apiClient = {
  // --- AUTH ---
  signIn: (email: string, password: string) =>
    apiFetch<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signUp: (
    email: string,
    password: string,
    username: string,
    agreedToTerms: boolean,
    isConferenceParticipant: boolean,
    termsVersion: string
  ) =>
    apiFetch<any>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, agreedToTerms, isConferenceParticipant, termsVersion }),
    }),

  verifyEmail: (token: string) => apiFetch<any>(`/api/auth/verify?token=${token}`),

  getLatestTerms: () =>
    apiFetch<{ version: string; content: string }>('/api/terms/latest'),

  forgotPassword: (email: string, devReturnToken?: boolean) =>
    apiFetch<any>('/api/auth/forgot-password', {
      method: 'POST',
      headers: devReturnToken ? { 'x-dev-return-token': '1' } : undefined,
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string, confirmPassword: string) =>
    apiFetch<any>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    }),

  // --- PROFILES & SETTINGS ---
  getProfile: (userId: string) => apiFetch<any>(`/api/profiles/${userId}`),

  updateProfile: (
    userId: string,
    data: { full_name?: string; username?: string; streak?: number; daily_challenge_index?: number }
  ) => apiFetch<any>(`/api/profiles/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteProfile: (userId: string) => apiFetch<void>(`/api/profiles/${userId}`, { method: 'DELETE' }),

  changePassword: (
    userId: string,
    a:
      | { currentPassword: string; newPassword: string; confirmPassword: string }
      | string,
    b?: string,
    c?: string
  ) => {
    const payload =
      typeof a === 'string'
        ? { currentPassword: a, newPassword: b as string, confirmPassword: c as string }
        : a;

    return apiFetch<any>(`/api/profiles/${userId}/change-password`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  requestEmailChange: (userId: string, newEmail: string, currentPassword: string) =>
    apiFetch<any>(`/api/profiles/${userId}/change-email`, {
      method: 'POST',
      body: JSON.stringify({ newEmail, currentPassword }),
    }),

  confirmEmailChange: (token: string) =>
    apiFetch<any>(`/api/profiles/confirm-email-change?token=${token}`),

  searchUsers: () => apiFetch<any[]>('/api/profiles'),

  // --- CONFERENCE ---
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

  // --- FRIENDS & FRIEND REQUESTS ---
  getFriends: (userId: string) => apiFetch<any[]>(`/api/friends/${userId}`),

  deleteFriend: (userId: string, friendId: string) =>
    apiFetch<void>(`/api/friends/${userId}/${friendId}`, { method: 'DELETE' }),

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

  getSentFriendRequests: (userId: string) =>
    apiFetch<any[]>(`/api/friend-requests/sent/${userId}`),

  // --- LEADERBOARD ---
  getLeaderboard: (userId: string) => apiFetch<any[]>(`/api/leaderboard/${userId}`),

  // --- CHALLENGES ---
  getChallenges: (set: 'main' | 'conf') =>
    apiFetch<any[]>(`/api/challenges?set=${set}`),

  // --- POSTS ---
  createPost: (postData: {
    user_id: string;
    caption: string;
    media_type: 'image' | 'video';
    media_url: string;
    challenge_id?: number | null;
    challenge_set?: 'main' | 'conference' | null;
  }) => apiFetch<Post>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  }),

  getUserPosts: (userId: string) => apiFetch<Post[]>(`/api/users/${userId}/posts`),

  getFeed: (userId: string, page: number) =>
    apiFetch<Post[]>(`/api/feed/${userId}?page=${page}`),

  deletePost: (postId: string, who: { user_id?: string; username?: string }) => {
    const endpoint = `/api/posts/${postId}`;
    return apiFetch<void>(endpoint, {
      method: 'DELETE',
      headers: {
        'x-user-id': who.user_id ?? '',
        'x-username': who.username ?? '',
      },
    });
  },

  // --- COMMENTS ---
  addComment: (postId: string, userId: string, content: string) =>
    apiFetch<any>('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId, user_id: userId, content }),
    }),

  getComments: (postId: string) => apiFetch<any[]>(`/api/posts/${postId}/comments`),

  deleteComment: async (commentId: string, userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `Failed to delete comment with status ${response.status}.`);
    }

    return response.status === 204 ? {} : response.json();
  },

  // --- NOTIFICATIONS ---
  getNotifications: (userId: string) =>
    apiFetch<any[]>(`/api/notifications/${userId}`),

  markNotificationsRead: (userId: string) =>
    apiFetch<void>('/api/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  deleteAllNotifications: (userId: string) =>
    apiFetch<void>(`/api/notifications/${userId}`, {
      method: 'DELETE',
    }),

  deleteNotification: (notificationId: number) =>
    apiFetch<void>(`/api/notifications/single/${notificationId}`, {
      method: 'DELETE',
    }),

  // --- APPROVALS ---
  addApproval: (postId: string, userId: string, status: string) =>
    apiFetch<any>('/api/approvals', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId, user_id: userId, status }),
    }),

  getApprovals: (postId: string) => apiFetch<any>(`/api/posts/${postId}/approvals`),

  // --- MEDIA UPLOAD ---
  uploadMedia: (userId: string, file: File, challengeTitle: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('challengeTitle', challengeTitle);
    formData.append('mediaType', file.type.startsWith('image/') ? 'image' : 'video');

    return uploadFile<any>('/api/media/upload', formData);
  },
};
