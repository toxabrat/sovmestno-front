import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppShell } from '../../../components/layout/AppShell'

vi.mock('../../../components/layout/Header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, Outlet: () => <div data-testid="outlet">page content</div> }
})

describe('AppShell', () => {
  it('рендерит Header', () => {
    render(<MemoryRouter><AppShell /></MemoryRouter>)
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('рендерит Outlet внутри main', () => {
    render(<MemoryRouter><AppShell /></MemoryRouter>)
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })

  it('main имеет класс appShell__main', () => {
    render(<MemoryRouter><AppShell /></MemoryRouter>)
    expect(screen.getByRole('main').className).toContain('appShell__main')
  })

  it('корневой элемент имеет класс appShell', () => {
    const { container } = render(<MemoryRouter><AppShell /></MemoryRouter>)
    expect(container.firstChild).toHaveClass('appShell')
  })
})
