import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { fetchImageUrl, apiLogout, deleteCreatorProfile, deleteVenueProfile } from '../../api/auth'
import { fetchApplications } from '../../api/applications'
import './Header.css'


function cx(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(' ')
}

export function Header() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const avatarUrlRef = useRef<string | null>(null)
  const avatarWrapRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })
  const { isAuthenticated, user, token, refreshToken, logout } = useAuth()
  const [appCount, setAppCount] = useState(0)

  useEffect(() => {
    if (!token || !isAuthenticated) { setAppCount(0); return }
    fetchApplications({ role: 'receiver', status: 'pending' }, token)
      .then(apps => setAppCount(apps.length))
      .catch(() => setAppCount(0))
  }, [token, isAuthenticated])

  const handleLogout = async () => {
    setMenuOpen(false)
    if (refreshToken) await apiLogout(refreshToken)
    logout()
    navigate('/landing/space')
  }

  const handleDeleteProfile = async () => {
    if (!token || !user) return
    const confirmed = window.confirm('Вы уверены, что хотите удалить свою страницу? Это действие необратимо.')
    if (!confirmed) return
    setMenuOpen(false)
    try {
      if (user.role === 'creator') {
        await deleteCreatorProfile(user.id, token)
      } else {
        await deleteVenueProfile(user.id, token)
      }
    } catch { /* ignore, proceed with logout */ }
    if (refreshToken) await apiLogout(refreshToken)
    logout()
    navigate('/landing/space')
  }

  const profilePath = user?.role === 'venue' ? '/venue/profile' : '/creator/profile'

  const handleMenuNavigate = useCallback((path: string) => {
    setMenuOpen(false)
    navigate(path)
  }, [navigate])

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
        console.warn('Avatar load failed:', err)
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

  const handleAvatarClick = useCallback(() => {
    if (avatarWrapRef.current) {
      const rect = avatarWrapRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom - 52,
        right: window.innerWidth - rect.right,
      })
    }
    setMenuOpen(prev => !prev)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      const inWrap = avatarWrapRef.current?.contains(target)
      const inDropdown = dropdownRef.current?.contains(target)
      if (!inWrap && !inDropdown) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const nav = useMemo(
    () => [
      { to: '/events', label: 'Мероприятия' },
      { to: '/spaces', label: 'Пространства' },
    ],
    [],
  )

  const dropdown = menuOpen ? createPortal(
    <>
      <div className="header__overlay" onClick={() => setMenuOpen(false)} />
      <div
        ref={dropdownRef}
        className="header__dropdown"
        style={{ top: dropdownPos.top, right: dropdownPos.right }}
      >
        <button
          type="button"
          className="header__dropdownItem header__dropdownItem--withAvatar"
          onClick={() => handleMenuNavigate(profilePath)}
        >
          <span>Моя страница</span>
          <div className="header__dropdownAvatar">
            {avatarUrl
              ? <img src={avatarUrl} alt="" className="header__dropdownAvatarImg" />
              : <span className="header__dropdownAvatarPlaceholder" />}
          </div>
        </button>
        <button
          type="button"
          className="header__dropdownItem"
          onClick={() => handleMenuNavigate(profilePath)}
        >
          Редактировать страницу
        </button>
        <div className="header__dropdownDivider" />
        <button
          type="button"
          className="header__dropdownItem"
          onClick={handleLogout}
        >
          Выйти
        </button>
        <button
          type="button"
          className="header__dropdownItem header__dropdownItem--danger"
          onClick={handleDeleteProfile}
        >
          Удалить страницу
        </button>
      </div>
    </>,
    document.body,
  ) : null

  return (
    <>
      {dropdown}

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
                <button
                  type="button"
                  className="header__myEventsBtn"
                  onClick={() => navigate('/my-events')}
                >
                  {appCount > 0 && (
                    <span className="header__myEventsBadge">+{appCount}</span>
                  )}
                  Мои мероприятия
                </button>
                {user?.role === 'creator' && (
                  <button
                    type="button"
                    className="header__createEventBtn"
                    onClick={() => navigate('/events/create')}
                  >
                    Создать мероприятие
                  </button>
                )}
                <div className="header__avatarWrap" ref={avatarWrapRef}>
                  <button
                    type="button"
                    className="header__avatar"
                    onClick={handleAvatarClick}
                    aria-label="Меню профиля"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Аватар" className="header__avatarImg" />
                    ) : (
                      <span className="header__avatarPlaceholder" />
                    )}
                  </button>
                </div>
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
    </>
  )
}

