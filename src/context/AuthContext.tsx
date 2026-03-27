import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { initApiClient } from '../api/apiClient'

export interface User {
  id: number
  email: string
  role: string
  avatar_id?: number
  avatar?: { id: number; file_path: string }
  name?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  refreshToken: string | null
  login: (accessToken: string, refreshToken: string, user: User) => void
  logout: () => void
  updateToken: (accessToken: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('refreshToken'))
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const isAuthenticated = !!token && !!user

  useEffect(() => {
    initApiClient(
      () => ({
        token: localStorage.getItem('token'),
        refreshToken: localStorage.getItem('refreshToken'),
      }),
      (newToken) => {
        setToken(newToken)
        localStorage.setItem('token', newToken)
      },
      () => {
        setToken(null)
        setRefreshToken(null)
        setUser(null)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      },
    )
  }, [])

  const handleLogin = useCallback((accessToken: string, newRefreshToken: string, newUser: User) => {
    setToken(accessToken)
    setRefreshToken(newRefreshToken)
    setUser(newUser)
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refreshToken', newRefreshToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }, [])

  const handleLogout = useCallback(() => {
    setToken(null)
    setRefreshToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }, [])

  const updateToken = useCallback((accessToken: string) => {
    setToken(accessToken)
    localStorage.setItem('token', accessToken)
  }, [])

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      token,
      refreshToken,
      login: handleLogin,
      logout: handleLogout,
      updateToken,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
