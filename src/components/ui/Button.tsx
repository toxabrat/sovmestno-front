import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './Button.css'

type ButtonVariant = 'primary' | 'lime' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

type Props = {
  children: ReactNode
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
  to?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: () => void
}

function cx(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(' ')
}

const base = 'btn'
const variants: Record<ButtonVariant, string> = {
  primary: 'btn--primary',
  lime: 'btn--lime',
  ghost: 'btn--ghost',
}
const sizes: Record<ButtonSize, string> = {
  sm: 'btn--sm',
  md: 'btn--md',
  lg: 'btn--lg',
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  to,
  type = 'button',
  disabled,
  onClick,
}: Props) {
  const classes = cx(base, variants[variant], sizes[size], className)

  if (to) {
    return (
      <Link to={to} className={classes} aria-disabled={disabled}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

