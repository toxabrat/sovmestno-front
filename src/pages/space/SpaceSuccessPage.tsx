import { useNavigate } from 'react-router-dom'
import './SpaceSuccessPage.css'

import starBig from '../../assets/icons/space_gratitude/Star 42.png'
import starSmall from '../../assets/icons/space_gratitude/Star 43.png'
import decorLeft from '../../assets/icons/Frame 2131327917.png'
import underlineLine from '../../assets/icons/space_gratitude/Vector 2370.png'

export function SpaceSuccessPage() {
  const navigate = useNavigate()

  const handleViewEvents = () => {
    navigate('/events')
  }

  return (
    <div className="spaceSuccess">
      <div className="spaceSuccess__card">
        <img src={decorLeft} alt="" className="spaceSuccess__decorLeft"         />

        <div className="spaceSuccess__starsGroup">
          <img src={starBig} alt="" className="spaceSuccess__starWhite" />
          <img src={starSmall} alt="" className="spaceSuccess__starGray" />
        </div>

        <div className="spaceSuccess__content">
          <h1 className="spaceSuccess__title">
            <span className="spaceSuccess__titleLine1">Поздравляем, профиль</span>
            <span className="spaceSuccess__titleLine2">
              вашего пространства{' '}
              <span className="spaceSuccess__titleHighlight">
                создан!
                <img src={underlineLine} alt="" className="spaceSuccess__underline" />
              </span>
            </span>
          </h1>

          <p className="spaceSuccess__subtitle">
            Он появится в общем каталоге пространств.
            <br />
            Вы можете принимать предложения от креаторов
            <br />
            или самостоятельно выбирать мероприятия
          </p>

          <button 
            type="button" 
            className="spaceSuccess__btn"
            onClick={handleViewEvents}
          >
            Посмотреть мероприятия →
          </button>
        </div>
      </div>
    </div>
  )
}
