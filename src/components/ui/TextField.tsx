import type { InputHTMLAttributes, ReactNode } from 'react'
import './TextField.css'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: ReactNode
  rightSlot?: ReactNode
}

function cx(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(' ')
}

export function TextField({ label, hint, rightSlot, className, ...props }: Props) {
  return (
    <label className="field">
      {label ? (
        <div className="field__label">{label}</div>
      ) : null}
      <div className="field__wrap">
        <input
          {...props}
          className={cx(
            'field__input',
            rightSlot ? 'field__input--withRight' : undefined,
            className,
          )}
        />
        {rightSlot ? (
          <div className="field__right">{rightSlot}</div>
        ) : null}
      </div>
      {hint ? <div className="field__hint">{hint}</div> : null}
    </label>
  )
}

