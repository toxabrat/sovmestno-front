import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextField } from '../../../components/ui/TextField'

describe('TextField', () => {
  describe('рендеринг', () => {
    it('рендерит input', () => {
      render(<TextField />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('показывает label когда передан', () => {
      render(<TextField label="Email" />)
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('не рендерит label когда не передан', () => {
      const { container } = render(<TextField />)
      expect(container.querySelector('.field__label')).not.toBeInTheDocument()
    })

    it('показывает hint когда передан', () => {
      render(<TextField hint="Минимум 8 символов" />)
      expect(screen.getByText('Минимум 8 символов')).toBeInTheDocument()
    })

    it('не рендерит hint когда не передан', () => {
      const { container } = render(<TextField />)
      expect(container.querySelector('.field__hint')).not.toBeInTheDocument()
    })

    it('показывает rightSlot когда передан', () => {
      render(<TextField rightSlot={<span>👁</span>} />)
      expect(screen.getByText('👁')).toBeInTheDocument()
    })

    it('не рендерит rightSlot когда не передан', () => {
      const { container } = render(<TextField />)
      expect(container.querySelector('.field__right')).not.toBeInTheDocument()
    })
  })

  describe('CSS классы', () => {
    it('применяет field__input по умолчанию', () => {
      render(<TextField />)
      expect(screen.getByRole('textbox').className).toContain('field__input')
    })

    it('добавляет field__input--error при error=true', () => {
      render(<TextField error />)
      expect(screen.getByRole('textbox').className).toContain('field__input--error')
    })

    it('нет класса error без prop error', () => {
      render(<TextField />)
      expect(screen.getByRole('textbox').className).not.toContain('field__input--error')
    })

    it('добавляет field__input--withRight при наличии rightSlot', () => {
      render(<TextField rightSlot={<span>X</span>} />)
      expect(screen.getByRole('textbox').className).toContain('field__input--withRight')
    })

    it('добавляет кастомный className к input', () => {
      render(<TextField className="my-input" />)
      expect(screen.getByRole('textbox').className).toContain('my-input')
    })
  })

  describe('props прокидываются в input', () => {
    it('placeholder', () => {
      render(<TextField placeholder="Введите email" />)
      expect(screen.getByPlaceholderText('Введите email')).toBeInTheDocument()
    })

    it('type', () => {
      const { container } = render(<TextField type="password" />)
      expect(container.querySelector('input')).toHaveAttribute('type', 'password')
    })

    it('disabled', () => {
      render(<TextField disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('value контролируемый', () => {
      render(<TextField value="тест" onChange={vi.fn()} />)
      expect(screen.getByRole('textbox')).toHaveValue('тест')
    })
  })

  describe('события', () => {
    it('вызывает onChange при вводе текста', async () => {
      const handler = vi.fn()
      render(<TextField onChange={handler} />)
      await userEvent.type(screen.getByRole('textbox'), 'abc')
      expect(handler).toHaveBeenCalled()
    })
  })
})
