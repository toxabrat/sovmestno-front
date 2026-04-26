import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  CreatorRegistrationProvider,
  useCreatorRegistration,
} from '../../context/CreatorRegistrationContext'

function wrapper({ children }: { children: React.ReactNode }) {
  return <CreatorRegistrationProvider>{children}</CreatorRegistrationProvider>
}

describe('CreatorRegistrationContext', () => {
  describe('начальные значения', () => {
    it('пустые строки для текстовых полей', () => {
      const { result } = renderHook(() => useCreatorRegistration(), { wrapper })
      expect(result.current.data.name).toBe('')
      expect(result.current.data.email).toBe('')
      expect(result.current.data.password).toBe('')
      expect(result.current.data.description).toBe('')
      expect(result.current.data.phone).toBe('')
    })

    it('city по умолчанию — Москва', () => {
      const { result } = renderHook(() => useCreatorRegistration(), { wrapper })
      expect(result.current.data.city).toBe('Москва')
    })

    it('null для файловых полей', () => {
      const { result } = renderHook(() => useCreatorRegistration(), { wrapper })
      expect(result.current.data.photoFile).toBeNull()
      expect(result.current.data.photoPreview).toBeNull()
      expect(result.current.data.photoId).toBeNull()
      expect(result.current.data.token).toBeNull()
      expect(result.current.data.userId).toBeNull()
    })
  })

  describe('updateData', () => {
    it('обновляет только указанные поля', () => {
      const { result } = renderHook(() => useCreatorRegistration(), { wrapper })
      act(() => result.current.updateData({ name: 'Иван', email: 'ivan@mail.ru' }))
      expect(result.current.data.name).toBe('Иван')
      expect(result.current.data.email).toBe('ivan@mail.ru')
      expect(result.current.data.city).toBe('Москва')
    })

    it('накапливает несколько вызовов updateData', () => {
      const { result } = renderHook(() => useCreatorRegistration(), { wrapper })
      act(() => result.current.updateData({ name: 'Петр' }))
      act(() => result.current.updateData({ email: 'p@p.ru' }))
      expect(result.current.data.name).toBe('Петр')
      expect(result.current.data.email).toBe('p@p.ru')
    })

    it('обновляет числовые и null-поля', () => {
      const { result } = renderHook(() => useCreatorRegistration(), { wrapper })
      act(() => result.current.updateData({ userId: 42, token: 'tok-123' }))
      expect(result.current.data.userId).toBe(42)
      expect(result.current.data.token).toBe('tok-123')
    })
  })

  describe('resetData', () => {
    it('возвращает все поля к начальным значениям', () => {
      const { result } = renderHook(() => useCreatorRegistration(), { wrapper })
      act(() => result.current.updateData({ name: 'Изменён', city: 'Питер', userId: 99 }))
      act(() => result.current.resetData())
      expect(result.current.data.name).toBe('')
      expect(result.current.data.city).toBe('Москва')
      expect(result.current.data.userId).toBeNull()
    })
  })

  describe('useCreatorRegistration', () => {
    it('бросает ошибку вне провайдера', () => {
      expect(() => renderHook(() => useCreatorRegistration())).toThrow(
        'useCreatorRegistration must be used within CreatorRegistrationProvider',
      )
    })
  })
})
