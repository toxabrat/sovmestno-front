import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '../../../components/ui/Checkbox'

describe('Checkbox', () => {
  describe('рендеринг', () => {
    it('рендерит checkbox input', () => {
      render(<Checkbox>Согласен</Checkbox>)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('показывает текст children', () => {
      render(<Checkbox>Принимаю условия</Checkbox>)
      expect(screen.getByText('Принимаю условия')).toBeInTheDocument()
    })

    it('рендерит внутри label', () => {
      const { container } = render(<Checkbox>Текст</Checkbox>)
      expect(container.querySelector('label')).toBeInTheDocument()
    })
  })

  describe('состояния', () => {
    it('unchecked по умолчанию', () => {
      render(<Checkbox>Текст</Checkbox>)
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('checked когда checked=true', () => {
      render(<Checkbox checked onChange={vi.fn()}>Текст</Checkbox>)
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('disabled когда disabled=true', () => {
      render(<Checkbox disabled>Текст</Checkbox>)
      expect(screen.getByRole('checkbox')).toBeDisabled()
    })
  })

  describe('CSS классы', () => {
    it('применяет класс check__box по умолчанию', () => {
      render(<Checkbox>Текст</Checkbox>)
      expect(screen.getByRole('checkbox').className).toContain('check__box')
    })

    it('добавляет check__box--error при error=true', () => {
      render(<Checkbox error>Текст</Checkbox>)
      expect(screen.getByRole('checkbox').className).toContain('check__box--error')
    })

    it('нет класса error без prop error', () => {
      render(<Checkbox>Текст</Checkbox>)
      expect(screen.getByRole('checkbox').className).not.toContain('check__box--error')
    })
  })

  describe('события', () => {
    it('вызывает onChange при клике', async () => {
      const handler = vi.fn()
      render(<Checkbox onChange={handler}>Текст</Checkbox>)
      await userEvent.click(screen.getByRole('checkbox'))
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })
})
