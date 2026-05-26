'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { User } from '@/types'
import { storage } from '@/lib/utils'
import { authApi } from '@/lib/api'

// ── Shape of the context ──────────────────────────────────────────────────
interface AuthContextType {
  user:        User | null
  token:       string | null
  isLoggedIn:  boolean
  isLoading:   boolean        // true while checking token on page load
  login:       (token: string, user: User) => void
  logout:      () => void
}

// ── Create context with safe defaults ────────────────────────────────────
const AuthContext = createContext<AuthContextType>({
  user:       null,
  token:      null,
  isLoggedIn: false,
  isLoading:  true,
  login:      () => {},
  logout:     () => {},
})

// ── Provider component ────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null)
  const [token,     setToken]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On first load – restore session from localStorage
  useEffect(() => {
    const savedToken = storage.get('token')
    const savedUser  = storage.get('user')

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
        // Silently verify token is still valid with backend
        authApi.me().catch(() => {
          // Token expired – clear session
          storage.remove('token')
          storage.remove('user')
          setToken(null)
          setUser(null)
        })
      } catch {
        // Corrupted localStorage data – clear it
        storage.remove('token')
        storage.remove('user')
      }
    }
    setIsLoading(false)
  }, [])

  /**
   * Call this after a successful login API response.
   * Saves token + user to state and localStorage.
   */
  const login = (newToken: string, newUser: User) => {
    storage.set('token', newToken)
    storage.set('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  /**
   * Call this when the user clicks Logout.
   * Clears state and localStorage. No backend call needed —
   * without the token, no protected action is possible.
   */
  const logout = () => {
    storage.remove('token')
    storage.remove('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook for easy use in any component ───────────────────────────────────
export function useAuth() {
  return useContext(AuthContext)
}
