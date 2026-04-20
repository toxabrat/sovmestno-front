import type { InputHTMLAttributes, ReactNode } from 'react'
import './Checkbox.css'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  children: ReactNode
  error?: boolean
}

export function Checkbox({ children, className, error, ...props }: Props) {
  return (
    <label className="check">
      <input
        {...props}
        type="checkbox"
        className={[className ?? 'check__box', error ? 'check__box--error' : ''].filter(Boolean).join(' ')}
      />
      <span className="check__text">{children}</span>
    </label>
  )
}

