const API_BASE_URL = 'http://192.168.0.102:3000';

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });

  if (!response.ok) {
    let errorData: any = {};
    try { errorData = await response.json(); }
    catch { errorData.message = await response.text(); }
    throw new Error(errorData.message || `HTTP error ${response.status}`);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

export const apiClient = {
  // Profiles
  getProfile: (userId: string) => apiFetch<any>(`/api/profiles/${userId}`),
  updateProfile: (userId: string, data: { full_name?: string; username?: string; streak?: number }) =>
    apiFetch<any>(`/api/profiles/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProfile: (userId: string) => apiFetch<void>(`/api/profiles/${userId}`, { method: 'DELETE' }),
  requestEmailChange: (userId: string, newEmail: string, currentPassword?: string) =>
    apiFetch<any>(`/api/profiles/${userId}/change-email`, { method: 'POST', body: JSON.stringify({ newEmail, currentPassword }) }),

  // Passwords
  changePassword: (userId: string, passwords: { currentPassword?: string; newPassword?: string; confirmPassword?: string }) =>
    apiFetch<any>(`/api/profiles/${userId}/change-password`, { method: 'POST', body: JSON.stringify(passwords) }),
  requestPasswordReset: (email: string) =>
    apiFetch<any>('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, newPassword: string, confirmPassword: string) =>
    apiFetch<any>('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword, confirmPassword }) }),

  // Auth
  signIn: (email: string, password: string) =>
    apiFetch<any>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signUp: (email: string, password: string, username: string, agreedToTerms: boolean, isConferenceParticipant: boolean) =>
    apiFetch<any>('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, username, agreedToTerms, isConferenceParticipant }) }),

  // Conference
  verifyConferenceCode: (code: string) =>
    apiFetch<any>('/api/auth/verify-conference-code', { method: 'POST', body: JSON.stringify({ code }) }),
  setConferenceParticipation: (userId: string, enable: boolean, code?: string) =>
    apiFetch<any>('/api/conference/participation', { method: 'POST', body: JSON.stringify({ userId, enable, code }) }),

  // Friends & Requests
  searchUsers: () => apiFetch<any[]>('/api/profiles'),
  getFriends: (userId: string) => apiFetch<any[]>(`/api/friends/${userId}`),
  deleteFriend: (userId: string, friendId: string) =>
    apiFetch<void>(`/api/friends/${userId}/${friendId}`, { method: 'DELETE' }),
  getFriendRequests: (userId: string) => apiFetch<any[]>(`/api/friend-requests/${userId}`),
  sendFriendRequest: (senderId: string, receiverId: string) =>
    apiFetch<any>('/api/friend-requests/send', { method: 'POST', body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId }) }),
  respondToFriendRequest: (requestId: string, action: 'accepted' | 'rejected') =>
    apiFetch<any>('/api/friend-requests/respond', { method: 'POST', body: JSON.stringify({ requestId, action }) }),
  getSentFriendRequests: (userId: string) => apiFetch<any[]>(`/api/friend-requests/sent/${userId}`),

  // Leaderboard
  getLeaderboard: (userId: string) => apiFetch<any[]>(`/api/leaderboard/${userId}`),
};
