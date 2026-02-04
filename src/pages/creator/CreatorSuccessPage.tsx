import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatorRegistration } from '../../context/CreatorRegistrationContext'
import { useAuth } from '../../context/AuthContext'
import './CreatorSuccessPage.css'

import starBig from '../../assets/icons/space_gratitude/Star 42.png'
import starSmall from '../../assets/icons/space_gratitude/Star 43.png'
import decorLeft from '../../assets/icons/Frame 2131327917.png'
import underlineLine from '../../assets/icons/space_gratitude/Vector 2370.png'

export function CreatorSuccessPage() {
  const navigate = useNavigate()
  const { data, resetData } = useCreatorRegistration()
  const { login, isAuthenticated } = useAuth()

  useEffect(() => {
    if (data.token && data.userId && !isAuthenticated) {
      login(data.token, {
        id: data.userId,
        email: data.email,
        role: 'creator',
        name: data.name,
        avatarId: data.photoId ?? undefined,
      })
      resetData()
    }
  }, [data, login, isAuthenticated, resetData])

  const handleCreateEvent = () => {
    navigate('/events/create')
  }

  const handleSkip = () => {
    navigate('/landing/space')
  }

  return (
    <div className="creatorSuccess">
      <div className="creatorSuccess__card">
        <img src={decorLeft} alt="" className="creatorSuccess__decorLeft"         />

        <div className="creatorSuccess__starsGroup">
          <img src={starBig} alt="" className="creatorSuccess__starWhite" />
          <img src={starSmall} alt="" className="creatorSuccess__starGray" />
        </div>

        <div className="creatorSuccess__content">
          <h1 className="creatorSuccess__title">
            Поздравляем, аккаунт{' '}
            <span className="creatorSuccess__titleHighlight">
              создан!
              <img src={underlineLine} alt="" className="creatorSuccess__underline" />
            </span>
          </h1>

          <p className="creatorSuccess__subtitle">
            Теперь вы можете публиковать идеи мероприятий,
            <br />
            самостоятельно предлагать их пространствам или
            <br />
            принимать приглашения.
          </p>

          <button 
            type="button" 
            className="creatorSuccess__btn"
            onClick={handleCreateEvent}
          >
            Создать мероприятие →
          </button>

          <button 
            type="button" 
            className="creatorSuccess__skipLink"
            onClick={handleSkip}
          >
            Пропустить
          </button>
        </div>
      </div>
    </div>
  )
}
