import { useNavigate } from 'react-router-dom'
import './NotFoundPage.css'

import flagsImage from '../../assets/icons/error404/Frame 2131327884.png'

export function NotFoundPage() {
  const navigate = useNavigate()

  const handleGoToCatalog = () => {
    navigate('/events')
  }

  return (
    <div className="notFound">
      <div className="notFound__card">
        <img src={flagsImage} alt="Флажки" className="notFound__image"         />

        <h1 className="notFound__title">Ой, тут пусто</h1>
        <p className="notFound__subtitle">
          Зато в каталоге мероприятий
          <br />
          всегда есть что посмотреть
        </p>

        <button 
          type="button" 
          className="notFound__btn"
          onClick={handleGoToCatalog}
        >
          ПЕРЕЙТИ В КАТАЛОГ →
        </button>
      </div>
    </div>
  )
}
