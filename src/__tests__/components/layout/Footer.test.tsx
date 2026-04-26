import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Footer } from '../../../components/layout/Footer'

vi.mock('../../../api/auth', () => ({
  subscribeNewsletter: vi.fn(),
}))

import { subscribeNewsletter } from '../../../api/auth'
const mockSubscribe = vi.mocked(subscribeNewsletter)

function renderFooter() {
  return render(<MemoryRouter><Footer /></MemoryRouter>)
}


beforeEach(() => mockSubscribe.mockReset())
afterEach(() => vi.clearAllMocks())

describe('Footer', () => {
  describe('рендеринг', () => {
    it('показывает email input', () => {
      renderFooter()
      expect(screen.getByPlaceholderText('E-MAIL')).toBeInTheDocument()
    })

    it('показывает кнопку ПОДПИСАТЬСЯ', () => {
      renderFooter()
      expect(screen.getByRole('button', { name: /ПОДПИСАТЬСЯ/i })).toBeInTheDocument()
    })

    it('показывает навигационные ссылки', () => {
      renderFooter()
      expect(screen.getByRole('link', { name: /Площадки/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Мероприятия/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Креаторы/i })).toBeInTheDocument()
    })
  })

  describe('подписка на рассылку', () => {
    it('вызывает subscribeNewsletter с введённым email', async () => {
      mockSubscribe.mockResolvedValue()
      renderFooter()
      await userEvent.type(screen.getByPlaceholderText('E-MAIL'), 'user@mail.com')
      await userEvent.click(screen.getByRole('button', { name: /ПОДПИСАТЬСЯ/i }))
      await waitFor(() => expect(mockSubscribe).toHaveBeenCalledWith('user@mail.com'))
    })

    it('показывает ПОДПИСАН после успешной подписки', async () => {
      mockSubscribe.mockResolvedValue()
      renderFooter()
      await userEvent.type(screen.getByPlaceholderText('E-MAIL'), 'ok@mail.com')
      await userEvent.click(screen.getByRole('button', { name: /ПОДПИСАТЬСЯ/i }))
      await waitFor(() => expect(screen.getByText('ПОДПИСАН')).toBeInTheDocument())
    })

    it('input disabled после успешной подписки', async () => {
      mockSubscribe.mockResolvedValue()
      renderFooter()
      await userEvent.type(screen.getByPlaceholderText('E-MAIL'), 'ok@mail.com')
      await userEvent.click(screen.getByRole('button', { name: /ПОДПИСАТЬСЯ/i }))
      await waitFor(() => expect(screen.getByPlaceholderText('E-MAIL')).toBeDisabled())
    })

    it('обрезает пробелы из email перед отправкой', async () => {
      mockSubscribe.mockResolvedValue()
      renderFooter()
      await userEvent.type(screen.getByPlaceholderText('E-MAIL'), '  user@mail.com  ')
      await userEvent.click(screen.getByRole('button', { name: /ПОДПИСАТЬСЯ/i }))
      await waitFor(() => expect(mockSubscribe).toHaveBeenCalledWith('user@mail.com'))
    })

    it('не вызывает subscribeNewsletter с пустым email', async () => {
      renderFooter()
      await userEvent.click(screen.getByRole('button', { name: /ПОДПИСАТЬСЯ/i }))
      expect(mockSubscribe).not.toHaveBeenCalled()
    })

    it('кнопка disabled после успешной подписки', async () => {
      mockSubscribe.mockResolvedValue()
      renderFooter()
      await userEvent.type(screen.getByPlaceholderText('E-MAIL'), 'x@x.com')
      await userEvent.click(screen.getByRole('button', { name: /ПОДПИСАТЬСЯ/i }))
      await waitFor(() => expect(screen.getByText('ПОДПИСАН')).toBeDisabled())
    })

    it('не вызывает subscribeNewsletter повторно после успеха', async () => {
      mockSubscribe.mockResolvedValue()
      renderFooter()
      await userEvent.type(screen.getByPlaceholderText('E-MAIL'), 'x@x.com')
      await userEvent.click(screen.getByRole('button', { name: /ПОДПИСАТЬСЯ/i }))
      await waitFor(() => screen.getByText('ПОДПИСАН'))
      await userEvent.click(screen.getByText('ПОДПИСАН'))
      expect(mockSubscribe).toHaveBeenCalledTimes(1)
    })
  })
})
