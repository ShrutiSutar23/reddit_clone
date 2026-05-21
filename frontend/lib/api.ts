import axios from 'axios'

// ── Base client ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor – attach JWT token automatically ─────────────────
// Every outgoing request checks localStorage for a token and adds it.
// This means individual API calls never need to handle auth headers.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// ── Response interceptor – handle 401 globally ───────────────────────────
// If the server returns 401 (token expired / invalid),
// clear the stored token and reload so the app shows the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Only redirect if not already on auth pages
        const path = window.location.pathname
        if (path !== '/login' && path !== '/register') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api


// ── Auth API ──────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/api/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),

  me: () => api.get('/api/auth/me'),

  getProfile: (username: string) =>
    api.get(`/api/auth/users/${username}`),
}


// ── Communities API ───────────────────────────────────────────────────────
export const communityApi = {
  list: (params?: { page?: number; per_page?: number; search?: string }) =>
    api.get('/api/communities/', { params }),

  get: (name: string) =>
    api.get(`/api/communities/${name}`),

  create: (data: { name: string; description?: string }) =>
    api.post('/api/communities/', data),

  delete: (name: string) =>
    api.delete(`/api/communities/${name}`),
}


// ── Posts API ─────────────────────────────────────────────────────────────
export const postApi = {
  list: (params?: { sort?: string; page?: number; per_page?: number }) =>
    api.get('/api/posts/', { params }),

  getByCommunity: (name: string, params?: { sort?: string; page?: number }) =>
    api.get(`/api/posts/community/${name}`, { params }),

  get: (id: number) =>
    api.get(`/api/posts/${id}`),

  create: (data: {
    title: string
    content?: string
    post_type: string
    community_id: number
  }) => api.post('/api/posts/', data),

  delete: (id: number) =>
    api.delete(`/api/posts/${id}`),
}


// ── Votes API ─────────────────────────────────────────────────────────────
export const voteApi = {
  vote: (postId: number, vote_type: 'upvote' | 'downvote') =>
    api.post(`/api/posts/${postId}/vote`, { vote_type }),
}


// ── Comments API ──────────────────────────────────────────────────────────
export const commentApi = {
  list: (postId: number, params?: { page?: number; per_page?: number }) =>
    api.get(`/api/posts/${postId}/comments`, { params }),

  add: (postId: number, content: string) =>
    api.post(`/api/posts/${postId}/comments`, { content }),

  edit: (commentId: number, content: string) =>
    api.put(`/api/comments/${commentId}`, { content }),

  delete: (commentId: number) =>
    api.delete(`/api/comments/${commentId}`),
}
