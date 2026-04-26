import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'

function renderButton(props: Parameters<typeof Button>[0]) {
  return render(
    <MemoryRouter>
      <Button {...props} />
    </MemoryRouter>,
  )
}

describe('Button', () => {
  describe('рендеринг', () => {
    it('показывает children', () => {
      renderButton({ children: 'Нажми меня' })
      expect(screen.getByText('Нажми меня')).toBeInTheDocument()
    })

    it('рендерит <button> по умолчанию', () => {
      renderButton({ children: 'Кнопка' })
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('рендерит <a> ссылку когда передан prop to', () => {
      renderButton({ children: 'Ссылка', to: '/some/path' })
      expect(screen.getByRole('link')).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('CSS классы', () => {
    it('применяет класс btn по умолчанию', () => {
      renderButton({ children: 'X' })
      expect(screen.getByRole('button').className).toContain('btn')
    })

    it('применяет btn--primary по умолчанию', () => {
      renderButton({ children: 'X' })
      expect(screen.getByRole('button').className).toContain('btn--primary')
    })

    it('применяет btn--lime для variant="lime"', () => {
      renderButton({ children: 'X', variant: 'lime' })
      expect(screen.getByRole('button').className).toContain('btn--lime')
    })

    it('применяет btn--ghost для variant="ghost"', () => {
      renderButton({ children: 'X', variant: 'ghost' })
      expect(screen.getByRole('button').className).toContain('btn--ghost')
    })

    it('применяет btn--sm для size="sm"', () => {
      renderButton({ children: 'X', size: 'sm' })
      expect(screen.getByRole('button').className).toContain('btn--sm')
    })

    it('применяет btn--lg для size="lg"', () => {
      renderButton({ children: 'X', size: 'lg' })
      expect(screen.getByRole('button').className).toContain('btn--lg')
    })

    it('добавляет кастомный className', () => {
      renderButton({ children: 'X', className: 'my-custom' })
      expect(screen.getByRole('button').className).toContain('my-custom')
    })
  })

  describe('атрибуты', () => {
    it('тип button по умолчанию', () => {
      renderButton({ children: 'X' })
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('тип submit когда type="submit"', () => {
      renderButton({ children: 'X', type: 'submit' })
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('disabled атрибут', () => {
      renderButton({ children: 'X', disabled: true })
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('события', () => {
    it('вызывает onClick при клике', async () => {
      const handler = vi.fn()
      renderButton({ children: 'Клик', onClick: handler })
      await userEvent.click(screen.getByRole('button'))
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('не вызывает onClick когда disabled', async () => {
      const handler = vi.fn()
      renderButton({ children: 'Клик', onClick: handler, disabled: true })
      await userEvent.click(screen.getByRole('button'))
      expect(handler).not.toHaveBeenCalled()
    })
  })
})
