import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../context/AuthContext'

vi.mock('../../api/apiClient', () => ({
  initApiClient: vi.fn(),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

const user = { id: 1, email: 'a@b.com', role: 'creator' as const }

beforeEach(() => localStorage.clear())
afterEach(() => localStorage.clear())

describe('AuthContext', () => {
  describe('начальное состояние', () => {
    it('isAuthenticated = false когда localStorage пустой', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.token).toBeNull()
      expect(result.current.user).toBeNull()
    })

    it('восстанавливает состояние из localStorage', () => {
      localStorage.setItem('token', 'saved-tok')
      localStorage.setItem('user', JSON.stringify(user))
      const { result } = renderHook(() => useAuth(), { wrapper })
      expect(result.current.token).toBe('saved-tok')
      expect(result.current.user?.email).toBe('a@b.com')
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('login', () => {
    it('устанавливает token, refreshToken, user', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      act(() => result.current.login('access', 'refresh', user))
      expect(result.current.token).toBe('access')
      expect(result.current.refreshToken).toBe('refresh')
      expect(result.current.user?.email).toBe('a@b.com')
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('сохраняет token и user в localStorage', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      act(() => result.current.login('acc', 'ref', user))
      expect(localStorage.getItem('token')).toBe('acc')
      expect(localStorage.getItem('refreshToken')).toBe('ref')
      expect(JSON.parse(localStorage.getItem('user')!).email).toBe('a@b.com')
    })
  })

  describe('logout', () => {
    it('сбрасывает token, refreshToken, user', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      act(() => result.current.login('tok', 'ref', user))
      act(() => result.current.logout())
      expect(result.current.token).toBeNull()
      expect(result.current.refreshToken).toBeNull()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('удаляет данные из localStorage', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      act(() => result.current.login('tok', 'ref', user))
      act(() => result.current.logout())
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('refreshToken')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('updateToken', () => {
    it('обновляет только token без сброса user', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      act(() => result.current.login('old', 'ref', user))
      act(() => result.current.updateToken('new-tok'))
      expect(result.current.token).toBe('new-tok')
      expect(result.current.user?.email).toBe('a@b.com')
      expect(localStorage.getItem('token')).toBe('new-tok')
    })
  })

  describe('updateUser', () => {
    it('мержит частичные данные пользователя', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      act(() => result.current.login('tok', 'ref', user))
      act(() => result.current.updateUser({ name: 'Иван' }))
      expect(result.current.user?.name).toBe('Иван')
      expect(result.current.user?.email).toBe('a@b.com')
    })

    it('обновляет user в localStorage', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      act(() => result.current.login('tok', 'ref', user))
      act(() => result.current.updateUser({ name: 'Новое имя' }))
      const saved = JSON.parse(localStorage.getItem('user')!)
      expect(saved.name).toBe('Новое имя')
    })

    it('не делает ничего если user === null', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      act(() => result.current.updateUser({ name: 'X' }))
      expect(result.current.user).toBeNull()
    })
  })

  describe('useAuth', () => {
    it('бросает ошибку вне AuthProvider', () => {
      expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within AuthProvider')
    })
  })
})
