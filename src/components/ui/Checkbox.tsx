import type { InputHTMLAttributes, ReactNode } from 'react'
import './Checkbox.css'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  children: ReactNode
}

export function Checkbox({ children, className, ...props }: Props) {
  return (
    <label className="check">
      <input
        {...props}
        type="checkbox"
        className={className ?? 'check__box'}
      />
      <span className="check__text">{children}</span>
    </label>
  )
}

