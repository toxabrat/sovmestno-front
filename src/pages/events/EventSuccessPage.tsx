import { useNavigate } from 'react-router-dom'
import decorBg from '../../assets/icons/creating_an_event/Frame 2131327916.png'
import './EventSuccessPage.css'

export function EventSuccessPage() {
  const navigate = useNavigate()

  return (
    <div className="es">
      <div className="es__card">
        <img src={decorBg} alt="" className="es__decor" />
        <div className="es__content">
          <h1 className="es__title">Мероприятие опубликовано!</h1>
          <p className="es__subtitle">
            Инициатива появится в общем каталоге мероприятий, но вы уже сейчас
            можете самостоятельно предлагать её пространствам
          </p>
          <button
            type="button"
            className="es__btn"
            onClick={() => navigate('/spaces')}
          >
            Смотреть пространства
          </button>
        </div>
      </div>
    </div>
  )
}
