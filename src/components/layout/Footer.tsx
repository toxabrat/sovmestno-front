import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

import iconTelegram from '../../assets/icons/footer/Vector(9).png'
import iconStar from '../../assets/icons/footer/Vector(11).png'
import logoText from '../../assets/icons/footer/СОВМЕСТНО(1).png'
import { subscribeNewsletter } from '../../api/auth'

export function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const handleSubscribe = async () => {
    const trimmed = email.trim()
    if (!trimmed || status === 'loading' || status === 'done') return
    setStatus('loading')
    try {
      await subscribeNewsletter(trimmed)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <footer className="footer">
      <div className="footer__inner">

        <div className="footer__left">
          <p className="footer__subscribeTitle">Узнавай новости самым первым</p>
          <div className="footer__subscribeRow">
            <input
              type="email"
              placeholder="E-MAIL"
              className="footer__emailInput"
              value={email}
              onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
              disabled={status === 'done'}
            />
            <button
              type="button"
              className="footer__subscribeBtn"
              onClick={handleSubscribe}
              disabled={status === 'loading' || status === 'done'}
            >
              {status === 'done' ? 'ПОДПИСАН' : status === 'loading' ? '...' : 'ПОДПИСАТЬСЯ'}
            </button>
          </div>
          {status === 'error' && (
            <p style={{ color: '#e53935', fontSize: '12px', marginTop: '4px' }}>Ошибка. Попробуйте ещё раз.</p>
          )}
          <div className="footer__socialIcons">
            <a href="https://t.me/+jkx2g8mkGB1iYzYy" target="_blank" rel="noopener noreferrer" className="footer__socialLink">
              <img src={iconTelegram} alt="Telegram" className="footer__socialIcon" />
            </a>
          </div>
          <p className="footer__email">Для вопросов и предложений: sovmestnoteam@mail.ru</p>
        </div>

        <div className="footer__nav">
          <Link to="/spaces" className="footer__navLink">Площадки</Link>
          <Link to="/events" className="footer__navLink">Мероприятия</Link>
          <Link to="/creators" className="footer__navLink">Креаторы</Link>
          <Link to="/landing/space" className="footer__navLink">О нас</Link>
        </div>

        <div className="footer__brand">
          <img src={logoText} alt="СОВМЕСТНО" className="footer__logoText" />
          <img src={iconStar} alt="" className="footer__star" />
        </div>

      </div>
    </footer>
  )
}
