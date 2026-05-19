import axios from 'axios'

// Base URL: relative path so requests go to the same-origin Next.js API.
// NEXT_PUBLIC_API_URL can still override this for cross-origin deployments,
// but the fallback is now '/api/v1' (not the old Fastify localhost:4000).
const baseURL = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
  // Ensure cookies are sent on same-origin requests (browser default, explicit here)
  withCredentials: true,
})

// Attach token from localStorage for callers that stored it (OTP legacy flow).
// Google OAuth users rely solely on the HttpOnly agro_access_token cookie —
// no localStorage token is stored, so this header is simply absent for them.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('agroconnect_token')
    if (token) config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Clear stale localStorage tokens on 401 — but never on network errors.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== 'undefined'
    ) {
      localStorage.removeItem('agroconnect_token')
      localStorage.removeItem('agroconnect_profile')
    }
    return Promise.reject(error)
  },
)
