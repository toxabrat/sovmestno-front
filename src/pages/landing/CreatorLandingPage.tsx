import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'
import './CreatorLandingPage.css'

import landingImg from '../../assets/icons/landing_creator/lending page креатор(2).png'

export function CreatorLandingPage() {
  const [activeTab, setActiveTab] = useState<'space' | 'creator'>('creator')
  const navigate = useNavigate()

  const handleTabChange = (tab: 'space' | 'creator') => {
    setActiveTab(tab)
    if (tab === 'space') navigate('/landing/space')
  }

  return (
    <div className="landingCreator">
      <Header />

      <div className="landingCreator__imageWrap">
        <div className="landingCreator__canvas">
          <img
            src={landingImg}
            alt="Совместно — для креаторов"
            className="landingCreator__bgImage"
          />

          <div className="landingCreator__topOverlay">
            <div className="landingCreator__heroToggle">
              <button
                type="button"
                className={`landingCreator__heroToggleBtn ${activeTab === 'space' ? 'landingCreator__heroToggleBtn--active' : ''}`}
                onClick={() => handleTabChange('space')}
              >
                Площадкам
              </button>
              <button
                type="button"
                className={`landingCreator__heroToggleBtn ${activeTab === 'creator' ? 'landingCreator__heroToggleBtn--active' : ''}`}
                onClick={() => handleTabChange('creator')}
              >
                Креаторам
              </button>
            </div>

            <Link to="/events" className="landingCreator__heroBtn">
              Искать мероприятие →
            </Link>
          </div>

          <div className="landingCreator__tgOverlay">
            <a
              href="https://t.me/sovmestno"
              target="_blank"
              rel="noopener noreferrer"
              className="landingCreator__tgBtn"
            >
              ПОДПИСАТЬСЯ НА TELEGRAM →
            </a>
          </div>

          <div className="landingCreator__bottomOverlay">
            <Link to="/events" className="landingCreator__bottomBtn">
              ИСКАТЬ МЕРОПРИЯТИЕ →
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
