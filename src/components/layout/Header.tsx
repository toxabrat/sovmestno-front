import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { fetchImageUrl, apiLogout } from '../../api/auth'
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
  const [dropdownPos] = useState({ top: 0, right: 0 })
  const { isAuthenticated, user, token, refreshToken, logout } = useAuth()
  const [appCount, setAppCount] = useState(0)

  useEffect(() => {
    if (!token || !isAuthenticated) { setAppCount(0); return }
    const refetch = () => {
      fetchApplications({ role: 'receiver', status: 'pending' }, token)
        .then(apps => setAppCount(apps.length))
        .catch(() => setAppCount(0))
    }
    refetch()
    window.addEventListener('app-count-changed', refetch)
    return () => window.removeEventListener('app-count-changed', refetch)
  }, [token, isAuthenticated])

  const handleLogout = async () => {
    setMenuOpen(false)
    setIsOpen(false)
    if (refreshToken) await apiLogout(refreshToken)
    logout()
    navigate('/landing/space')
  }

  const profilePath = user?.role === 'venue' ? '/venue/profile' : '/creator/profile'
  const editPath = user?.role === 'venue' ? '/space/create?edit=true' : '/creator/create?edit=true'

  const handleMenuNavigate = useCallback((path: string) => {
    setMenuOpen(false)
    navigate(path)
  }, [navigate])

  const avatarId = user?.avatar_id

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
    fetchImageUrl(avatarId!)
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
    navigate(profilePath)
  }, [navigate, profilePath])

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

  useEffect(() => {
    if (!isOpen) return
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

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
          onClick={() => handleMenuNavigate(editPath)}
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

      <div
        className={`header__mobileBackdrop ${isOpen ? 'header__mobileBackdrop--visible' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <div className={`header__mobileDrawer ${isOpen ? 'header__mobileDrawer--open' : ''}`}>
        <div className="header__mobileDrawerHead">
          <Link to="/" className="header__mobileDrawerLogo" onClick={() => setIsOpen(false)}>
            СОВМЕСТНО
          </Link>
          <button
            type="button"
            className="header__mobileDrawerClose"
            onClick={() => setIsOpen(false)}
            aria-label="Закрыть меню"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M1 1L15 15M15 1L1 15" stroke="#313235" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <nav className="header__mobileDrawerNav">
          {nav.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              className={({ isActive }) =>
                cx('header__mobileDrawerLink', isActive && 'header__mobileDrawerLink--active')
              }
              onClick={() => setIsOpen(false)}
            >
              {i.label}
            </NavLink>
          ))}
        </nav>

        {isAuthenticated && (
          <>
            <div className="header__mobileDrawerDivider" />
            <div className="header__mobileDrawerSection">
              <button
                type="button"
                className="header__mobileDrawerAction"
                onClick={() => { setIsOpen(false); navigate('/my-events') }}
              >
                <span>Заявки</span>
                {appCount > 0 && (
                  <span className="header__mobileDrawerBadge">+{appCount}</span>
                )}
              </button>
              {user?.role === 'creator' && (
                <button
                  type="button"
                  className="header__mobileDrawerAction header__mobileDrawerAction--lime"
                  onClick={() => { setIsOpen(false); navigate('/events/create') }}
                >
                  Создать мероприятие
                </button>
              )}
            </div>
          </>
        )}

        <div className="header__mobileDrawerFooter">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                className="header__mobileDrawerProfile"
                onClick={() => { setIsOpen(false); navigate(profilePath) }}
              >
                <div className="header__mobileDrawerAvatar">
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" className="header__mobileDrawerAvatarImg" />
                    : <span className="header__mobileDrawerAvatarPlaceholder" />
                  }
                </div>
                <span className="header__mobileDrawerProfileName">Моя страница</span>
              </button>
              <button
                type="button"
                className="header__mobileDrawerLogout"
                onClick={handleLogout}
              >
                Выйти
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="header__mobileDrawerLogin"
              onClick={() => setIsOpen(false)}
            >
              → ВОЙТИ
            </Link>
          )}
        </div>
      </div>

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
                  Заявки
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
      </header>
    </>
  )
}
