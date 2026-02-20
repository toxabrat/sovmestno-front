import { useMemo, useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { fetchImageUrl } from '../../api/auth'
import './Header.css'

import iconBookmark from '../../assets/icons/auth_success/Vector(7).png'
import iconBell from '../../assets/icons/auth_success/Vector(8).png'

function cx(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(' ')
}

export function Header() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const avatarUrlRef = useRef<string | null>(null)
  const { isAuthenticated, user, token, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/landing/space')
  }

  const avatarId = user?.avatarId

  useEffect(() => {
    if (!token || !isAuthenticated || !avatarId) {
      setAvatarUrl(null)
      if (avatarUrlRef.current) {
        URL.revokeObjectURL(avatarUrlRef.current)
        avatarUrlRef.current = null
      }
      return
    }
    let cancelled = false
    fetchImageUrl(avatarId!, token)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url)
          return
        }
        if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current)
        avatarUrlRef.current = url
        setAvatarUrl(url)
      })
      .catch((err) => {
        if (!cancelled) setAvatarUrl(null)
        console.warn('Avatar load failed (id=1):', err)
      })
    return () => {
      cancelled = true
      if (avatarUrlRef.current) {
        URL.revokeObjectURL(avatarUrlRef.current)
        avatarUrlRef.current = null
      }
      setAvatarUrl(null)
    }
  }, [token, isAuthenticated, avatarId])

  const nav = useMemo(
    () => [
      { to: '/events', label: 'Мероприятия' },
      { to: '/spaces', label: 'Пространства' },
    ],
    [],
  )

  return (
    <header className="header">
      <div className="header__inner">
        <button
          type="button"
          className="header__burger"
          aria-label="Открыть меню"
          onClick={() => setIsOpen((v) => !v)}
        >
          <span className="header__burgerLines" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <div className="header__left">
          <Link to="/" className="header__logo">
            СОВМЕСТНО
          </Link>

          <nav className="header__nav">
            {nav.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                className={({ isActive }) =>
                  cx('header__link', isActive && 'header__link--active')
                }
              >
                {i.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="header__right">
          {isAuthenticated ? (
            <div className="header__user">
              {user?.role === 'creator' && (
                <button type="button" className="header__createBtn">
                  создать мероприятие
                </button>
              )}
              <button type="button" className="header__iconBtn">
                <img src={iconBookmark} alt="Закладки" className="header__icon" />
              </button>
              <button type="button" className="header__iconBtn header__iconBtn--bell">
                <img src={iconBell} alt="Уведомления" className="header__icon" />
                <span className="header__bellDot" />
              </button>
              <button
                type="button"
                className="header__avatar"
                onClick={() => {
                  if (user?.role === 'venue') navigate('/venue/profile')
                  else if (user?.role === 'creator') navigate('/creator/profile')
                }}
                style={{ cursor: (user?.role === 'venue' || user?.role === 'creator') ? 'pointer' : 'default' }}
                aria-label="Профиль"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Аватар" className="header__avatarImg" />
                ) : (
                  <span className="header__avatarPlaceholder" />
                )}
              </button>
              <button type="button" className="header__logout" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          ) : (
            <Button to="/auth" variant="lime" size="sm">
              → ВОЙТИ
            </Button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="header__mobile">
          <nav className="header__mobileInner">
            <div className="header__mobileNav">
              {nav.map((i) => (
                <NavLink
                  key={i.to}
                  to={i.to}
                  className="header__mobileLink"
                  onClick={() => setIsOpen(false)}
                >
                  {i.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

