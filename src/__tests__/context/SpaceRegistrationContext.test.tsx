import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  SpaceRegistrationProvider,
  useSpaceRegistration,
} from '../../context/SpaceRegistrationContext'

function wrapper({ children }: { children: React.ReactNode }) {
  return <SpaceRegistrationProvider>{children}</SpaceRegistrationProvider>
}

describe('SpaceRegistrationContext', () => {
  describe('начальные значения', () => {
    it('пустые строки для текстовых полей', () => {
      const { result } = renderHook(() => useSpaceRegistration(), { wrapper })
      expect(result.current.data.name).toBe('')
      expect(result.current.data.email).toBe('')
      expect(result.current.data.password).toBe('')
      expect(result.current.data.description).toBe('')
      expect(result.current.data.street).toBe('')
    })

    it('city по умолчанию — Москва', () => {
      const { result } = renderHook(() => useSpaceRegistration(), { wrapper })
      expect(result.current.data.city).toBe('Москва')
    })

    it('null для файловых и идентификационных полей', () => {
      const { result } = renderHook(() => useSpaceRegistration(), { wrapper })
      expect(result.current.data.logoFile).toBeNull()
      expect(result.current.data.logoPreview).toBeNull()
      expect(result.current.data.logoId).toBeNull()
      expect(result.current.data.coverFile).toBeNull()
      expect(result.current.data.coverPreview).toBeNull()
      expect(result.current.data.coverId).toBeNull()
      expect(result.current.data.token).toBeNull()
      expect(result.current.data.userId).toBeNull()
      expect(result.current.data.venueId).toBeNull()
    })
  })

  describe('updateData', () => {
    it('обновляет только указанные поля', () => {
      const { result } = renderHook(() => useSpaceRegistration(), { wrapper })
      act(() => result.current.updateData({ name: 'Лофт', street: 'ул. Пушкина' }))
      expect(result.current.data.name).toBe('Лофт')
      expect(result.current.data.street).toBe('ул. Пушкина')
      expect(result.current.data.city).toBe('Москва')
    })

    it('накапливает несколько вызовов', () => {
      const { result } = renderHook(() => useSpaceRegistration(), { wrapper })
      act(() => result.current.updateData({ name: 'Студия' }))
      act(() => result.current.updateData({ venueId: 15 }))
      expect(result.current.data.name).toBe('Студия')
      expect(result.current.data.venueId).toBe(15)
    })

    it('обновляет логотип и обложку', () => {
      const { result } = renderHook(() => useSpaceRegistration(), { wrapper })
      act(() => result.current.updateData({ logoId: 'logo-1', coverId: 'cover-2' }))
      expect(result.current.data.logoId).toBe('logo-1')
      expect(result.current.data.coverId).toBe('cover-2')
    })
  })

  describe('resetData', () => {
    it('возвращает все поля к начальным значениям', () => {
      const { result } = renderHook(() => useSpaceRegistration(), { wrapper })
      act(() => result.current.updateData({ name: 'Зал', venueId: 5, logoId: 'abc' }))
      act(() => result.current.resetData())
      expect(result.current.data.name).toBe('')
      expect(result.current.data.venueId).toBeNull()
      expect(result.current.data.logoId).toBeNull()
      expect(result.current.data.city).toBe('Москва')
    })
  })

  describe('useSpaceRegistration', () => {
    it('бросает ошибку вне провайдера', () => {
      expect(() => renderHook(() => useSpaceRegistration())).toThrow(
        'useSpaceRegistration must be used within SpaceRegistrationProvider',
      )
    })
  })
})
