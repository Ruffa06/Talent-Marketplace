import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import api from '@/lib/api'

export type Role = 'administrator' | 'recruiter' | 'applicant'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  department: string
  role: Role
  currentSkills: string[]
  skillsToDevelop: string[]
  careerDirection: string
  bio: string
  isOpenToOpportunities: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (u: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const s = localStorage.getItem('user')
    return s ? JSON.parse(s) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  const updateUser = useCallback((u: User) => {
    setUser(u)
    localStorage.setItem('user', JSON.stringify(u))
  }, [])

  return <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
