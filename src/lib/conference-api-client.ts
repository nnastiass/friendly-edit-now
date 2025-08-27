// src/lib/conference-api-client.ts

// *** IMPORTANT: REPLACE WITH YOUR ACTUAL API BASE URL ***
// This should be your development machine's IP address and the port your Docker API exposes.
// For the new conference API, we're using host port 3001.
// Example: 'http://192.168.1.8:3001' or 'http://localhost:3001' if running on a local web browser.
// Remember to change this when building for productions!
const API_BASE_URL = 'http://192.168.5.81:3001';

// A generic helper function for making API requests.
// This handles fetching, error checking, and JSON parsing in one place.
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
      // const token = localStorage.getItem('authToken');
      // ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      // Try to parse JSON error response from the API
      errorData = await response.json();
    } catch (e) {
      // If not JSON, use response text or a default message
      errorData.message = await response.text();
    }
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  // Handle cases where the API might return no content (e.g., DELETE requests typically return 204 No Content)
  if (response.status === 204) {
    return {} as T; // Return an empty object for no-content responses
  }

  return response.json();
}

// Define specific API client methods for the Conference application
export const conferenceApiClient = {
  // === Conference Endpoints ===
  createConference: (data: { name: string; year: number; theme?: string }) =>
    apiFetch<any>('/api/conferences', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAllConferences: () => apiFetch<any[]>('/api/conferences'),
  getConferenceById: (id: string) => apiFetch<any>(`/api/conferences/${id}`),
  updateConference: (id: string, data: { name?: string; year?: number; theme?: string }) =>
    apiFetch<any>(`/api/conferences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteConference: (id: string) =>
    apiFetch<void>(`/api/conferences/${id}`, {
      method: 'DELETE',
    }),

  // === AboutPage Endpoints ===
  createAboutPage: (data: { title: string; content: string; conference_id: number }) =>
    apiFetch<any>('/api/aboutpages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAboutPagesByConferenceId: (conferenceId: string) =>
    apiFetch<any[]>(`/api/aboutpages/${conferenceId}`),
  getAboutPageById: (id: string) =>
    apiFetch<any>(`/api/aboutpages/detail/${id}`), // Assuming a 'detail' route for single item
  updateAboutPage: (id: string, data: { title?: string; content?: string; conference_id?: number }) =>
    apiFetch<any>(`/api/aboutpages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAboutPage: (id: string) =>
    apiFetch<void>(`/api/aboutpages/${id}`, {
      method: 'DELETE',
    }),

  // === Speakers Endpoints ===
  createSpeaker: (data: { name: string; country?: string; bio?: string; photo_url?: string; linkedin_url?: string; twitter_url?: string; conference_id: number }) =>
    apiFetch<any>('/api/speakers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSpeakersByConferenceId: (conferenceId: string) =>
    apiFetch<any[]>(`/api/speakers/${conferenceId}`),
  getSpeakerById: (id: string) =>
    apiFetch<any>(`/api/speakers/detail/${id}`), // Assuming a 'detail' route for single item
  updateSpeaker: (id: string, data: { name?: string; country?: string; bio?: string; photo_url?: string; linkedin_url?: string; twitter_url?: string; conference_id?: number }) =>
    apiFetch<any>(`/api/speakers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSpeaker: (id: string) =>
    apiFetch<void>(`/api/speakers/${id}`, {
      method: 'DELETE',
    }),

  // === Schedule Endpoints ===
  createScheduleEntry: (data: { day: number; start_time: string; end_time: string; title: string; description?: string; session_type: string; speaker_id: number; conference_id: number }) =>
    apiFetch<any>('/api/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getScheduleByConferenceId: (conferenceId: string) =>
    apiFetch<any[]>(`/api/schedule/${conferenceId}`),
  getScheduleEntryById: (id: string) =>
    apiFetch<any>(`/api/schedule/detail/${id}`), // Assuming a 'detail' route for single item
  updateScheduleEntry: (id: string, data: { day?: number; start_time?: string; end_time?: string; title?: string; description?: string; session_type?: string; speaker_id?: number; conference_id?: number }) =>
    apiFetch<any>(`/api/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteScheduleEntry: (id: string) =>
    apiFetch<void>(`/api/schedule/${id}`, {
      method: 'DELETE',
    }),
};
