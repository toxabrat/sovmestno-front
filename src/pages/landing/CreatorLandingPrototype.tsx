import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Footer } from '../../components/layout/Footer'
import { Header } from '../../components/layout/Header'
import './CreatorLandingPrototype.css'

import arrowImg from '../../assets/icons/landing_creator/prototype/arrow.png'
import benefit1 from '../../assets/icons/landing_creator/prototype/benefit1.png'
import benefit2 from '../../assets/icons/landing_creator/prototype/benefit2.png'
import benefit3 from '../../assets/icons/landing_creator/prototype/benefit3.png'
import benefit4 from '../../assets/icons/landing_creator/prototype/benefit4.png'
import ctaHconnect from '../../assets/icons/landing_creator/prototype/cta_hconnect.png'
import downArrow from '../../assets/icons/landing_creator/prototype/down_arrow.png'
import heroCard from '../../assets/icons/landing_creator/prototype/hero_card.png'
import heroCard1 from '../../assets/icons/landing_creator/prototype/hero_card1.png'
import heroStar from '../../assets/icons/hero-star.svg'
import roleCardUnion from '../../assets/icons/landing_creator/prototype/role_card_union.png'
import sectionAcquaint from '../../assets/icons/landing_creator/prototype/section_acquaint.png'
import sectionPrivacy from '../../assets/icons/landing_creator/prototype/section_privacy.png'
import upArrow from '../../assets/icons/landing_creator/prototype/up_arrow.png'
import blogHeader from '../../assets/icons/landing_space/prototype/blog_header.png'
import blogPost1 from '../../assets/icons/landing_space/prototype/blog_post1.png'
import blogPost2 from '../../assets/icons/landing_space/prototype/blog_post2.png'
import blogPost3 from '../../assets/icons/landing_space/prototype/blog_post3.png'
import ctaBottom from '../../assets/icons/landing_space/prototype/cta_bottom.png'
import telegramSection from '../../assets/icons/landing_space/prototype/telegram_section.png'

const FAQS = [
  {
    q: 'Как опубликовать идею мероприятия?',
    a: 'Опыт, взгляды, компетенции — обо всём, что вы посчитаете нужным для самопрезентации, можно рассказать на своей личной странице, а также опубликовать состоявшиеся коллаборации',
  },
  {
    q: 'Кто увидит мою инициативу?',
    a: 'После публикации карточка с инициативой попадает в общий каталог мероприятий, где её могут увидеть все пользователи, а ответить — только представители пространств.',
  },
  {
    q: 'Как ускорить процесс отклика?',
    a: 'Опыт, взгляды, компетенции — обо всём, что вы посчитаете нужным для самопрезентации, можно рассказать на своей личной странице, а также опубликовать состоявшиеся коллаборации',
  },
  {
    q: 'Как мне определиться с форматом мероприятия?',
    a: 'Опыт, взгляды, компетенции — обо всём, что вы посчитаете нужным для самопрезентации, можно рассказать на своей личной странице, а также опубликовать состоявшиеся коллаборации',
  },
  {
    q: 'У меня скоро свадьба, мне поможет этот сервис?',
    a: 'Опыт, взгляды, компетенции — обо всём, что вы посчитаете нужным для самопрезентации, можно рассказать на своей личной странице, а также опубликовать состоявшиеся коллаборации',
  },
]

export function CreatorLandingPrototype() {
  const [tab, setTab] = useState<'space' | 'creator'>('creator')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const navigate = useNavigate()

  const handleTab = (t: 'space' | 'creator') => {
    setTab(t)
    if (t === 'space') navigate('/landing/space')
  }

  return (
    <div className="clp">
      <Header />

      <section className="clp__section clp__section--padded">
        <div className="clp__heroWrap">
          <div className="clp__heroCard">
            <div className="clp__heroToggle">
              <button
                className={`clp__heroToggleBtn ${tab === 'space' ? 'clp__heroToggleBtn--active' : ''}`}
                onClick={() => handleTab('space')}
              >
                Площадкам
              </button>
              <button
                className={`clp__heroToggleBtn ${tab === 'creator' ? 'clp__heroToggleBtn--active' : ''}`}
                onClick={() => handleTab('creator')}
              >
                Креаторам
              </button>
            </div>

            <h1 className="clp__heroTitle">
              Скрепляем людей
              <br />
              в события, созданные
              <br />
              <span className="clp__heroTitleLast">
                совместно
                <span className="clp__heroLine" />
              </span>
            </h1>

            <p className="clp__heroSubtitle">
              Сервис для кооперации общественных пространств
              <br />и организаторов мероприятий
            </p>

            <Link to="/spaces" className="clp__heroBtn">
              Искать пространство →
            </Link>

            <img src={heroStar} alt="" className="clp__heroStar" />
          </div>
        </div>
      </section>

      <section className="clp__section clp__section--padded">
        <div className="clp__benefits">
          <img src={benefit1} alt="" className="clp__benefitImg" />
          <img src={benefit2} alt="" className="clp__benefitImg" />
          <img src={benefit3} alt="" className="clp__benefitImg" />
          <img src={benefit4} alt="" className="clp__benefitImg" />
        </div>
      </section>

      <section className="clp__section clp__section--padded clp__descSection">
        <div className="clp__descGrid">

          <div className="clp__descLeft">
            <h2 className="clp__bigTitle">
              Устроить{' '}
              <span className="clp__hl">публичное мероприятие</span>{' '}
              — не проблема
            </h2>
            <p className="clp__bodyText">
              Если вы давно мечтали вести клуб по интересам,
              устроить выставку или у вас есть знания и навыки, которыми вы хотите поделиться — сделать это стало
              гораздо проще с помощью нашей платформы.
            </p>
            <div className="clp__arrowWrap">
              <img src={arrowImg} alt="" className="clp__arrow" />
            </div>
          </div>

          <div className="clp__descRight">
            <h2 className="clp__bigTitle">
              Мы создали цифровую{' '}
              <span className="clp__hl">витрину мероприятий</span>
            </h2>
            <p className="clp__bodyText">
              Теперь вы можете поделиться своей инициативой с заинтересованными в этом заведениями,
              которые сами готовы будут откликнуться на предложение.
            </p>
          </div>

        </div>

        <img src={roleCardUnion} alt="" className="clp__roleCardUnion" />
      </section>

      <section className="clp__section clp__section--padded clp__centeredSection">
        <h2 className="clp__centeredTitle">
          Не пробиваться, а{' '}
          <span className="clp__hl">выбирать</span>
        </h2>
        <p className="clp__centeredBody">
          Мы знаем как сложно самостоятельно продвигать свои идеи и сталкиваться с отказами,
          несовпадением интересов и ценностей — поэтому делаем всё,{' '}
          чтобы случился мэтч между вами и пространством.
        </p>
      </section>

      <section className="clp__section clp__section--padded clp__featureSection">
        <div className="clp__featureRow">
          <img src={sectionAcquaint} alt="" className="clp__featureCardAcquaint" />
          <img src={sectionPrivacy} alt="" className="clp__featureCardPrivacy" />
        </div>
      </section>

      <section className="clp__section clp__section--padded">
        <img src={ctaHconnect} alt="" className="clp__fullSectionImg" />
      </section>

      <section className="clp__section clp__section--padded clp__centeredSection">
        <h2 className="clp__centeredTitle">
          Опыт — ваша визитка
        </h2>
        <p className="clp__centeredBody">
          Ваши умения, навыки, знания — это самый ценный ресурс,
          о котором можно и нужно рассказывать миру.
        </p>
      </section>

      <section className="clp__section clp__section--padded clp__portfolioSection">
        <div className="clp__portfolioGrid">
          <div className="clp__portfolioLeft">
            <span className="clp__tag">личный бренд</span>
            <h2 className="clp__bigTitle">
              Успешные кейсы добавятся<br />в ваше{' '}
              <span className="clp__hl">публичное портфолио</span>
            </h2>
            <p className="clp__bodyText">
              Опыт, взгляды, компетенции — обо всём, что вы посчитаете нужным для самопрезентации,
              можно рассказать на своей личной странице,
              а также опубликовать состоявшиеся коллаборации
            </p>
          </div>
          <div className="clp__portfolioCards">
            <span className="clp__portfolioBadge">проведённые мероприятия</span>
            <img src={heroCard} alt="" className="clp__portfolioCardBack" />
            <img src={heroCard1} alt="" className="clp__portfolioCardFront" />
          </div>
        </div>
      </section>

      <section className="clp__section clp__section--padded clp__faqSection">
        <h2 className="clp__faqTitle">Частые вопросы</h2>
        <div className="clp__faqList">
          {FAQS.map((item, i) => (
            <div key={i} className="clp__faqItem">
              <button
                className="clp__faqTrigger"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>{item.q}</span>
                <img
                  src={openFaq === i ? upArrow : downArrow}
                  alt=""
                  className="clp__faqArrow"
                />
              </button>
              {openFaq === i && (
                <p className="clp__faqAnswer">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="clp__section clp__section--padded clp__blogSection">
        <img src={blogHeader} alt="Наша задача — убрать всю рутину поиска и переговоров" className="clp__blogHeaderImg" />
        <span className="clp__tag" style={{ marginBottom: 24 }}>коммьюнити</span>
        <div className="clp__blogGrid">
          <div className="clp__blogLeft">
            <h2 className="clp__medTitle">
              Будем рады, если вы<br />поделитесь{' '}
              <span className="clp__hl">своим опытом</span>
            </h2>
            <p className="clp__bodyText">
              Мы всегда ждём ваши истории — интересные, поучительные, успешные и не только
              в нашем коммьюнити в социальных сетях
            </p>
          </div>
          <div className="clp__blogCards">
            <img src={blogPost1} alt="" className="clp__blogCard" />
            <img src={blogPost2} alt="" className="clp__blogCard" />
            <img src={blogPost3} alt="" className="clp__blogCard" />
          </div>
        </div>
        <div className="clp__blogTags">
          <span className="clp__tag">полезные материалы</span>
          <span className="clp__tag">интервью с экспертами</span>
          <span className="clp__tag">важные анонсы</span>
          <span className="clp__tag">подборки креаторов и площадок</span>
          <span className="clp__tag">вдохновляющие кейсы</span>
        </div>
      </section>

      <section className="clp__section clp__section--padded">
        <div className="clp__telegramWrap">
          <img src={telegramSection} alt="Подписаться на Telegram" className="clp__fullSectionImg" />
          <a
            href="https://t.me/sovmestno"
            target="_blank"
            rel="noopener noreferrer"
            className="clp__telegramOverlayBtn"
            aria-label="Подписаться на Telegram"
          />
        </div>
      </section>

      <section className="clp__section">
        <div className="clp__ctaWrap">
          <img src={ctaBottom} alt="Лучшие события рождаются тогда, когда нужные люди находят друг друга" className="clp__ctaImg" />
          <Link to="/events" className="clp__ctaOverlayBtn" aria-label="Искать мероприятие" />
        </div>
      </section>

      <Footer />
    </div>
  )
}
