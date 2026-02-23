import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import './SpaceLandingPage.css'

export function SpaceLandingPage() {
  const [activeTab, setActiveTab] = useState<'space' | 'creator'>('space')

  return (
    <div className="landing">
      <Header />

      <section className="landing__hero">
        <div className="landing__heroCard">
          <div className="landing__heroToggle">
            <button
              className={`landing__heroToggleBtn ${activeTab === 'space' ? 'landing__heroToggleBtn--active' : ''}`}
              onClick={() => setActiveTab('space')}
            >
              Площадкам
            </button>
            <button
              className={`landing__heroToggleBtn ${activeTab === 'creator' ? 'landing__heroToggleBtn--active' : ''}`}
              onClick={() => setActiveTab('creator')}
            >
              Креаторам
            </button>
          </div>

          <h1 className="landing__heroTitle">
            Скрепляем людей
            <br />
            в события, созданные
            <br />
            <span className="landing__heroTitleLast">
              совместно
              <span className="landing__heroLine" />
            </span>
          </h1>

          <p className="landing__heroSubtitle">
            Сервис для кооперации общественных пространств
            <br />и организаторов мероприятий
          </p>

          <Link to="/auth" className="landing__heroBtn">
            Искать мероприятие →
          </Link>

          <img 
            src="/src/assets/icons/hero-star.svg" 
            alt="" 
            className="landing__heroStar" 
          />
        </div>
      </section>

      <section className="landing__section">
        <div className="landing__benefits">
          <img 
            src="/src/assets/icons/space_landing/Frame 2131327892.png" 
            alt="Экономия времени" 
            className="landing__benefitImg"
          />
          <img 
            src="/src/assets/icons/space_landing/Frame 2131327893.png" 
            alt="Готовые идеи мероприятий" 
            className="landing__benefitImg"
          />
          <img 
            src="/src/assets/icons/space_landing/Frame 2131328051.png" 
            alt="Привлечение аудитории" 
            className="landing__benefitImg"
          />
          <img 
            src="/src/assets/icons/space_landing/Frame 2131327894.png" 
            alt="Позиционирование на рынке" 
            className="landing__benefitImg"
          />
        </div>
      </section>


    </div>
  )
}

