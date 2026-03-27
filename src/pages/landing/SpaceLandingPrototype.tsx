import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'
import './SpaceLandingPrototype.css'

import heroCardSpace from '../../assets/icons/landing_space/prototype/hero_card(1).png'
import heroCardCreator from '../../assets/icons/landing_space/prototype/hero_card(1).png'
import heartsImg from '../../assets/icons/landing_space/prototype/hearts.png'
import benefit1 from '../../assets/icons/landing_space/prototype/benefit1.png'
import benefit2 from '../../assets/icons/landing_space/prototype/benefit2.png'
import benefit3 from '../../assets/icons/landing_space/prototype/benefit3.png'
import benefit4 from '../../assets/icons/landing_space/prototype/benefit4.png'
import cardMockup1 from '../../assets/icons/landing_space/prototype/card_mockup1.png'
import cardMockup2 from '../../assets/icons/landing_space/prototype/card_mockup2.png'
import cardMockup3 from '../../assets/icons/landing_space/prototype/card_mockup3.png'
import arrow1 from '../../assets/icons/landing_space/prototype/arrow1.png'
import arrow2 from '../../assets/icons/landing_space/prototype/arrow2.png'
import quoteSection from '../../assets/icons/landing_space/prototype/quote_section.png'
import stepsSection from '../../assets/icons/landing_space/prototype/steps_section.png'
import urgentlySection from '../../assets/icons/landing_space/prototype/urgently_section.png'
import featureLeft from '../../assets/icons/landing_space/prototype/feature_left.png'
import featureTop from '../../assets/icons/landing_space/prototype/feature_top.png'
import featureBL from '../../assets/icons/landing_space/prototype/feature_bl.png'
import featureBR from '../../assets/icons/landing_space/prototype/feature_br.png'
import blogHeader from '../../assets/icons/landing_space/prototype/blog_header.png'
import blogPost1 from '../../assets/icons/landing_space/prototype/blog_post1.png'
import blogPost2 from '../../assets/icons/landing_space/prototype/blog_post2.png'
import blogPost3 from '../../assets/icons/landing_space/prototype/blog_post3.png'
import telegramSection from '../../assets/icons/landing_space/prototype/telegram_section.png'
import ctaBottom from '../../assets/icons/landing_space/prototype/cta_bottom.png'

export function SpaceLandingPrototype() {
  const [tab, setTab] = useState<'space' | 'creator'>('space')
  const navigate = useNavigate()

  const handleTab = (t: 'space' | 'creator') => {
    setTab(t)
    if (t === 'creator') navigate('/landing/creator')
  }

  return (
    <div className="slp">
      <Header />

      <section className="slp__section slp__section--padded">
        <div className="slp__heroWrap">
          <img
            src={tab === 'space' ? heroCardSpace : heroCardCreator}
            alt="Скрепляем людей в события, созданные совместно"
            className="slp__heroImg"
          />

          <div className="slp__heroToggle">
            <button
              className={`slp__heroToggleBtn ${tab === 'space' ? 'slp__heroToggleBtn--active' : ''}`}
              onClick={() => handleTab('space')}
            >
              Площадкам
            </button>
            <button
              className={`slp__heroToggleBtn ${tab === 'creator' ? 'slp__heroToggleBtn--active' : ''}`}
              onClick={() => handleTab('creator')}
            >
              Креаторам
            </button>
          </div>

          <Link to="/events" className="slp__heroOverlayBtn" aria-label="Искать мероприятие" />
        </div>
      </section>

      <section className="slp__section slp__section--padded">
        <div className="slp__benefits">
          <img src={benefit1} alt="Экономия времени" className="slp__benefitImg" />
          <img src={benefit2} alt="Готовые идеи мероприятий" className="slp__benefitImg" />
          <img src={benefit3} alt="Позиционирование на рынке" className="slp__benefitImg" />
          <img src={benefit4} alt="Привлечение аудитории" className="slp__benefitImg" />
        </div>
      </section>

      <section className="slp__section slp__section--padded slp__descSection">
        <div className="slp__descGrid">

          <div className="slp__descLeft">
            <h2 className="slp__bigTitle">Больше не надо искать,<br />привлекать и рисковать</h2>
            <p className="slp__bodyText">
              Сервис «Совместно» собирает общественные пространства и креаторов — тех, кто ищет возможности
              реализовать свои идеи. Обе стороны могут заранее узнать друг о друге и понять, сойдутся ли они по духу
            </p>
            <div className="slp__mockupsWrap">
              <div className="slp__mockupPill">хотят провести</div>
              <div className="slp__mockupStack">
                <img src={cardMockup1} alt="" className="slp__mockupImg slp__mockupImg--1" />
                <img src={cardMockup2} alt="" className="slp__mockupImg slp__mockupImg--2" />
                <img src={cardMockup3} alt="" className="slp__mockupImg slp__mockupImg--3" />
              </div>
            </div>
          </div>

          <div className="slp__descRight">
            <div className="slp__arrow1Wrap">
              <img src={arrow1} alt="" className="slp__arrow1" />
            </div>

            <div className="slp__descBlock">
              <h3 className="slp__medTitle">
                Креаторы сами предлагают{' '}
                <span className="slp__hl">готовые идеи</span>{' '}
                мероприятий
              </h3>
              <p className="slp__bodyText">
                А также готовы их подготовить и провести по заранее обозначенным условиям.
                А если вы уже заранее знаете, что хотите — отлично!
                Укажите свои планы и предпочтения в профиле, чтобы креаторы видели ваш запрос
              </p>
            </div>

            <div className="slp__arrow2Wrap">
              <img src={arrow2} alt="" className="slp__arrow2" />
            </div>

            <div className="slp__descBlock">
              <h3 className="slp__medTitle">
                Вам останется{' '}
                <span className="slp__hl">только выбрать</span>
              </h3>
            </div>
          </div>

        </div>
      </section>

      <section className="slp__section slp__section--padded">
        <img src={quoteSection} alt="Мы хотим делать организацию событий проще" className="slp__fullSectionImg" style={{ borderRadius: 40 }} />
      </section>

      <section className="slp__section slp__section--padded">
        <img src={stepsSection} alt="Устроить мероприятие в три шага" className="slp__fullSectionImg" />
      </section>

      <section className="slp__section slp__section--padded slp__urgentlySection">
        <h2 className="slp__bigTitle" style={{ marginBottom: 32 }}>Нужно срочно? Не проблема!</h2>

        <div className="slp__urgentlyRow">
          <div className="slp__urgentlyImgWrap">
            <img src={urgentlySection} alt="Нужно срочно" className="slp__urgentlyImg" />
            <div className="slp__badge slp__badge--zayvka">
              <span className="slp__badgePlus">+</span> новая заявка
            </div>
            <div className="slp__badge slp__badge--recom">
              <span className="slp__badgePlus">+</span> новая рекомендация
            </div>
            <div className="slp__badge slp__badge--count">
              <img src={heartsImg} alt="" className="slp__badgeHeartsImg" /> 250
            </div>
          </div>

          <div className="slp__urgentlyRight">
            <span className="slp__tag" style={{ marginBottom: 20 }}>продвижение</span>
            <p className="slp__bodyText">
              Мы поможем продвинуть вашу заявку, чтобы она стала заметна всем, а самое главное — стала заметна тому креатору,
              с которым у вас получится самое продуктивное сотрудничество
            </p>
          </div>
        </div>
      </section>

      <section className="slp__section slp__section--padded slp__featuresSection">
        <h2 className="slp__featuresTitle">
          Лишний раз никто<br />
          <span className="slp__hl">не побеспокоит</span>
        </h2>

        <div className="slp__featuresGrid">
          <img src={featureLeft} alt="" className="slp__featureImg slp__featureImg--left" />
          <div className="slp__featuresRight">
            <img src={featureTop} alt="" className="slp__featureImg slp__featureImg--top" />
            <div className="slp__featuresBottomRow">
              <img src={featureBL} alt="" className="slp__featureImg slp__featureImg--half" />
              <img src={featureBR} alt="" className="slp__featureImg slp__featureImg--half" />
            </div>
          </div>
        </div>
      </section>

      <section className="slp__section slp__section--padded slp__blogSection">
        <img src={blogHeader} alt="Наша задача — убрать всю рутину поиска и переговоров" className="slp__blogHeaderImg" />

        <span className="slp__tag" style={{ marginBottom: 24 }}>коммьюнити</span>

        <div className="slp__blogGrid">
          <div className="slp__blogLeft">
            <h2 className="slp__medTitle">
              Будем рады, если вы<br />поделитесь{' '}
              <span className="slp__hl">своим опытом</span>
            </h2>
            <p className="slp__bodyText">
              Мы всегда ждём ваши истории — интересные, поучительные, успешные и не только
              в нашем коммьюнити в социальных сетях
            </p>
          </div>

          <div className="slp__blogCards">
            <img src={blogPost1} alt="" className="slp__blogCard" />
            <img src={blogPost2} alt="" className="slp__blogCard" />
            <img src={blogPost3} alt="" className="slp__blogCard" />
          </div>
        </div>

        <div className="slp__blogTags">
          <span className="slp__tag">полезные материалы</span>
          <span className="slp__tag">интервью с экспертами</span>
          <span className="slp__tag">важные анонсы</span>
          <span className="slp__tag">подборки креаторов и площадок</span>
          <span className="slp__tag">вдохновляющие кейсы</span>
        </div>
      </section>

      <section className="slp__section slp__section--padded">
        <div className="slp__telegramWrap">
          <img src={telegramSection} alt="Подписаться на Telegram" className="slp__fullSectionImg" style={{ borderRadius: 40 }} />
          <a
            href="https://t.me/sovmestno"
            target="_blank"
            rel="noopener noreferrer"
            className="slp__telegramOverlayBtn"
            aria-label="Подписаться на Telegram"
          />
        </div>
      </section>

      <section className="slp__section">
        <div className="slp__ctaWrap">
          <img src={ctaBottom} alt="Лучшие события рождаются тогда, когда нужные люди находят друг друга" className="slp__ctaImg" />
          <Link to="/events" className="slp__ctaOverlayBtn" aria-label="Искать мероприятие" />
        </div>
      </section>

      <Footer />
    </div>
  )
}
