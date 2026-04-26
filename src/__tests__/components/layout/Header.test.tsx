import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { User } from '../../../context/AuthContext'

vi.mock('../../../api/auth', () => ({
  fetchImageUrl: vi.fn().mockResolvedValue('blob:avatar'),
  apiLogout: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../api/applications', () => ({
  fetchApplications: vi.fn().mockResolvedValue([]),
}))

const mockUseAuth = vi.fn()
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

import { Header } from '../../../components/layout/Header'

function authState(overrides: Partial<{
  isAuthenticated: boolean
  user: User | null
  token: string | null
  refreshToken: string | null
}> = {}) {
  return {
    isAuthenticated: false,
    user: null as User | null,
    token: null as string | null,
    refreshToken: null as string | null,
    login: vi.fn(),
    logout: vi.fn(),
    updateToken: vi.fn(),
    updateUser: vi.fn(),
    ...overrides,
  }
}

function renderHeader(auth = authState()) {
  mockUseAuth.mockReturnValue(auth)
  return render(<MemoryRouter><Header /></MemoryRouter>)
}

beforeEach(() => vi.clearAllMocks())

describe('Header', () => {
  describe('неавторизованный пользователь', () => {
    it('показывает логотип СОВМЕСТНО', () => {
      renderHeader()
      expect(screen.getByText('СОВМЕСТНО')).toBeInTheDocument()
    })

    it('показывает ссылку ВОЙТИ', () => {
      renderHeader()
      expect(screen.getByRole('link', { name: /ВОЙТИ/i })).toBeInTheDocument()
    })

    it('не показывает Мои мероприятия', () => {
      renderHeader()
      expect(screen.queryByText(/Мои мероприятия/i)).not.toBeInTheDocument()
    })
  })

  describe('авторизованный создатель', () => {
    const creator = authState({
      isAuthenticated: true,
      token: 'tok',
      user: { id: 1, email: 'c@c.com', role: 'creator' },
    })

    it('показывает Мои мероприятия', () => {
      renderHeader(creator)
      expect(screen.getByText(/Мои мероприятия/i)).toBeInTheDocument()
    })

    it('показывает Создать мероприятие', () => {
      renderHeader(creator)
      expect(screen.getByText(/Создать мероприятие/i)).toBeInTheDocument()
    })

    it('не показывает ссылку ВОЙТИ', () => {
      renderHeader(creator)
      expect(screen.queryByRole('link', { name: /ВОЙТИ/i })).not.toBeInTheDocument()
    })
  })

  describe('авторизованная площадка', () => {
    const venue = authState({
      isAuthenticated: true,
      token: 'tok',
      user: { id: 2, email: 'v@v.com', role: 'venue' },
    })

    it('показывает Мои мероприятия', () => {
      renderHeader(venue)
      expect(screen.getByText(/Мои мероприятия/i)).toBeInTheDocument()
    })

    it('не показывает Создать мероприятие', () => {
      renderHeader(venue)
      expect(screen.queryByText(/Создать мероприятие/i)).not.toBeInTheDocument()
    })
  })

  describe('навигация', () => {
    it('показывает ссылку на Мероприятия', () => {
      renderHeader()
      expect(screen.getAllByRole('link', { name: /Мероприятия/i }).length).toBeGreaterThan(0)
    })

    it('показывает ссылку на Пространства', () => {
      renderHeader()
      expect(screen.getAllByRole('link', { name: /Пространства/i }).length).toBeGreaterThan(0)
    })
  })

  describe('мобильное меню', () => {
    it('кнопка-бургер присутствует в DOM', () => {
      renderHeader()
      expect(screen.getByRole('button', { name: /Открыть меню/i })).toBeInTheDocument()
    })

    it('клик на бургер открывает мобильное меню', async () => {
      renderHeader()
      await userEvent.click(screen.getByRole('button', { name: /Открыть меню/i }))
      await waitFor(() =>
        expect(screen.getAllByRole('link', { name: /Мероприятия/i }).length).toBeGreaterThan(1),
      )
    })
  })
})
