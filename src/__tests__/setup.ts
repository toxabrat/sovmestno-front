import '@testing-library/jest-dom'
import { vi } from 'vitest'

Object.defineProperty(globalThis.URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'blob:mock-url'),
})
Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn(),
})
