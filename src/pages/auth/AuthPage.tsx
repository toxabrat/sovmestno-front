import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Checkbox } from '../../components/ui/Checkbox'
import { TextField } from '../../components/ui/TextField'
import { useCreatorRegistration } from '../../context/CreatorRegistrationContext'
import { useAuth } from '../../context/AuthContext'
import { registerCreator, login as apiLogin } from '../../api/auth'
import './AuthPage.css'

type Tab = 'signup' | 'login'
type Role = 'creator' | 'space' | null

function cx(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(' ')
}

function ArrowRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M13 5l7 7-7 7M4 12h15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EyeIcon({ crossed }: { crossed?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      {crossed ? (
        <path
          d="M4 4l16 16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  )
}

import roleCreatorImg from '../../assets/icons/role-creator.png'
import roleSpaceImg from '../../assets/icons/role-space.svg'

function CreatorArt() {
  return (
    <img 
      src={roleCreatorImg} 
      alt="" 
      className="roleCard__art" 
    />
  )
}

function SpaceArt() {
  return (
    <img 
      src={roleSpaceImg} 
      alt="" 
      className="roleCard__art" 
    />
  )
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[a-zA-Z0-9.-]+$/
  return emailRegex.test(email)
}

function isValidPassword(password: string): boolean {
  return password.length >= 6
}

export function AuthPage() {
  const navigate = useNavigate()
  const { updateData } = useCreatorRegistration()
  const { login } = useAuth()
  
  const [tab, setTab] = useState<Tab>('signup')
  const [signupStep, setSignupStep] = useState<1 | 2>(1)
  const [role, setRole] = useState<Role>(null)
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const isFormValid = name.trim() !== '' && isValidEmail(email) && isValidPassword(password)
  const isLoginFormValid = isValidEmail(loginEmail) && loginPassword.trim() !== ''

  const handleCreateAccount = async () => {
    if (!isFormValid || isLoading) return
    
    if (role === 'space') {
      navigate('/space/create')
    } else if (role === 'creator') {
      setIsLoading(true)

      try {
        const response = await registerCreator({
          name: name.trim(),
          email: email.trim(),
          password,
        })
        
        console.log('Registration successful:', response)

        updateData({ 
          token: response.token,
          userId: response.user.id,
          name: name.trim(), 
          email: email.trim(), 
          password,
        })

        navigate('/creator/create')
      } catch (err) {
        console.error('Registration error:', err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleLogin = async () => {
    if (!isLoginFormValid || isLoading) return
    
    setIsLoading(true)
    
    try {
      const response = await apiLogin({
        email: loginEmail.trim(),
        password: loginPassword,
      })
      
      console.log('Login successful:', response)

      const avatarId = response.user.creator?.photo?.id ?? (response.user.venue as { logo?: { id: number } })?.logo?.id ?? undefined

      login(response.token, {
        id: response.user.id,
        email: response.user.email,
        role: response.user.role,
        avatarId: avatarId ?? undefined,
        name: response.user.creator?.name || response.user.venue?.name,
      })

      navigate('/landing/space')
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getDescription = () => {
    if (tab === 'login') {
      return 'Находите партнёров для организации мероприятий. Войдите в аккаунт, чтобы начать сотрудничество'
    }
    if (signupStep === 1) {
      return 'Выберите, в какой роли хотите присоединиться — креатора или представителя пространства'
    }
    return 'Находите партнёров для организации мероприятий. Создайте аккаунт, чтобы начать сотрудничество'
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__header">
          <div className="auth__tabs">
            <button
              type="button"
              className={cx(
                'auth__tabBig',
                tab === 'signup' ? 'auth__tab--active' : 'auth__tab--inactive',
              )}
              onClick={() => {
                setTab('signup')
                setSignupStep(1)
              }}
            >
              Регистрация
            </button>
            <button
              type="button"
              className={cx(
                'auth__tabSmall',
                tab === 'login' ? 'auth__tab--active' : 'auth__tab--inactive',
              )}
              onClick={() => setTab('login')}
            >
              Вход
            </button>
          </div>

          <p className="auth__desc">{getDescription()}</p>
        </div>

        {tab === 'login' ? (
          <div className="auth__section">
            <div className="auth__fields">
              <TextField 
                placeholder="Email" 
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <TextField
                placeholder="Пароль"
                autoComplete="current-password"
                type={showPass ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                rightSlot={
                  <button
                    type="button"
                    className="iconBtn"
                    aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
                    onClick={() => setShowPass((v) => !v)}
                  >
                    <EyeIcon crossed={!showPass} />
                  </button>
                }
              />
            </div>

            <button type="button" className="auth__link">
              Не помню пароль
            </button>

            <Button 
              className="btn--full" 
              size="lg"
              onClick={handleLogin}
              disabled={!isLoginFormValid || isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'} {!isLoading && <ArrowRight />}
            </Button>

            <div className="auth__footer">
              Ещё нет аккаунта?{' '}
              <button
                type="button"
                className="auth__footerBtn"
                onClick={() => {
                  setTab('signup')
                  setSignupStep(1)
                }}
              >
                Создайте его
              </button>
            </div>
          </div>
        ) : (
          <>
            {signupStep === 1 ? (
              <div className="auth__section">
                <RoleCard
                  title="Креатор"
                  description={`Я организатор мероприятий,\nхочу найти места для\nих проведения`}
                  selected={role === 'creator'}
                  onSelect={() => setRole('creator')}
                  art={<CreatorArt />}
                />
                <RoleCard
                  title="Пространство"
                  description="Я представляю общественное пространство и хочу найти подходящее мероприятие"
                  selected={role === 'space'}
                  onSelect={() => setRole('space')}
                  art={<SpaceArt />}
                />

                <Button
                  className="btn--full"
                  size="lg"
                  disabled={!role}
                  onClick={() => setSignupStep(2)}
                >
                  Продолжить <ArrowRight />
                </Button>

                <div className="auth__footer">
                  Уже есть аккаунт?{' '}
                  <button
                    type="button"
                    className="auth__footerBtn"
                    onClick={() => setTab('login')}
                  >
                    Авторизуйтесь
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth__section">
                <div className="auth__fields">
                  <TextField
                    placeholder={
                      role === 'space' ? 'Ваше название' : 'Ваше имя'
                    }
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <TextField 
                    placeholder="Email" 
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <TextField
                    placeholder="Пароль"
                    autoComplete="new-password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    rightSlot={
                      <button
                        type="button"
                        className="iconBtn"
                        aria-label={
                          showPass ? 'Скрыть пароль' : 'Показать пароль'
                        }
                        onClick={() => setShowPass((v) => !v)}
                      >
                        <EyeIcon crossed={!showPass} />
                      </button>
                    }
                  />
                </div>

                <div className="auth__checkboxes">
                  <Checkbox defaultChecked>
                    Я согласен получать рекламную рассылку от Sovmestno
                  </Checkbox>
                  <Checkbox>
                    Даю согласие на обработку персональных данных
                  </Checkbox>
                </div>

                <Button 
                  className="btn--full" 
                  size="lg" 
                  onClick={handleCreateAccount}
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? 'Регистрация...' : 'Создать аккаунт'}
                </Button>

                <div className="auth__footer">
                  Уже есть аккаунт?{' '}
                  <button
                    type="button"
                    className="auth__footerBtn"
                    onClick={() => setTab('login')}
                  >
                    Авторизуйтесь
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function RoleCard({
  title,
  description,
  selected,
  onSelect,
  art,
}: {
  title: string
  description: string
  selected: boolean
  onSelect: () => void
  art: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx('roleCard', selected && 'roleCard--selected')}
    >
      <div className="roleCard__content">
        <div className="roleCard__title">{title}</div>
        <div className="roleCard__desc">{description}</div>
      </div>
      <div className="roleCard__right">
        {art}
        <span className="roleCard__radio" aria-hidden="true">
          {selected ? <span className="roleCard__dot" /> : null}
        </span>
      </div>
    </button>
  )
}

