import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'
import './CreatorLandingMobile.css'

import heroStar from '../../assets/icons/hero-star.svg'
import benefit1 from '../../assets/icons/landing_creator/prototype/benefit1.png'
import benefit2 from '../../assets/icons/landing_creator/prototype/benefit2.png'
import benefit3 from '../../assets/icons/landing_creator/prototype/benefit3.png'
import benefit4 from '../../assets/icons/landing_creator/prototype/benefit4.png'
import arrowImg from '../../assets/icons/landing_space/prototype/arrow1.png'
import mRoleCard from '../../assets/icons/landing_creator/prototype/mobile/Group 1067465.png'
import mFeature1 from '../../assets/icons/landing_creator/prototype/mobile/Frame 2131327905(1).png'
import mFeature2 from '../../assets/icons/landing_creator/prototype/mobile/Frame 2131328404.png'

import mBanner from '../../assets/icons/landing_space/prototype/mobile/Frame 2131328052.png'
import heroCard from '../../assets/icons/landing_creator/prototype/hero_card.png'
import heroCard1 from '../../assets/icons/landing_creator/prototype/hero_card1.png'
import downArrow from '../../assets/icons/landing_creator/prototype/down_arrow.png'
import upArrow from '../../assets/icons/landing_creator/prototype/up_arrow.png'
import blogPost1 from '../../assets/icons/landing_space/prototype/blog_post1.png'
import blogPost2 from '../../assets/icons/landing_space/prototype/blog_post2.png'
import blogPost3 from '../../assets/icons/landing_space/prototype/blog_post3.png'
import mTelegram from '../../assets/icons/landing_space/prototype/mobile/Frame 2131328052(3).png'

const FAQS = [
  {
    q: 'Как опубликовать идею мероприятия?',
    a: 'Мы предложим заполнить карточку мероприятия, в которой вы дадите краткое описание своей инициативы, выберете формат и, по желанию, сможете прикрепить фотографию.',
  },
  {
    q: 'Кто увидит мою инициативу?',
    a: 'Ваша карточка с идеей мероприятия будет выложена в общий каталог мероприятий, где другие креаторы также предлагают свои инициативы. Видеть карточку будут все, а связаться с вами смогут только авторизованные пространства.',
  },
  {
    q: 'Как ускорить процесс отклика?',
    a: 'Вы можете не только выкладывать свои идеи в общий каталог, но и самостоятельно предлагать их конкретным пространствам. Найти место по душе можно в каталоге пространств, а узнать больше информации о месте — в личном профиле пространства.',
  },
]

export function CreatorLandingMobile() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="clpm">
      <Header />

      <section className="clpm__section clpm__hero">
        <div className="clpm__heroCard">
          <div className="clpm__heroToggle">
            <button
              className="clpm__heroToggleBtn"
              onClick={() => navigate('/landing/space')}
            >
              Площадкам
            </button>
            <button className="clpm__heroToggleBtn clpm__heroToggleBtn--active">
              Креаторам
            </button>
          </div>

          <img src={heroStar} alt="" className="clpm__heroStar" />

          <h1 className="clpm__heroTitle">
            Скрепляем людей в события, созданные{' '}
            <span className="clpm__heroTitleLast">
              совместно
              <span className="clpm__heroLine" />
            </span>
          </h1>

          <p className="clpm__heroSubtitle">
            Сервис для кооперации общественных пространств и организаторов мероприятий
          </p>

          <button className="clpm__heroBtn" onClick={() => navigate('/spaces')}>
            Искать пространство →
          </button>
        </div>
      </section>

      <section className="clpm__section">
        <div className="clpm__benefitsGrid">
          <img src={benefit1} alt="" className="clpm__benefitImg" />
          <img src={benefit2} alt="" className="clpm__benefitImg" />
          <img src={benefit3} alt="" className="clpm__benefitImg" />
          <img src={benefit4} alt="" className="clpm__benefitImg" />
        </div>
      </section>

      <section className="clpm__section clpm__desc">
        <h2 className="clpm__bigTitle">
          Устроить публичное мероприятие — не проблема
        </h2>
        <p className="clpm__bodyText">
          Если вы давно мечтали вести клуб по интересам,
          устроить выставку или у вас есть знания и навыки, которыми вы хотите поделиться — сделать это стало
          гораздо проще с помощью нашей платформы.
        </p>

        <div className="clpm__arrowWrap">
          <img src={arrowImg} alt="" className="clpm__arrow" />
        </div>

        <h2 className="clpm__bigTitle">
          Мы создали цифровую <span className="clpm__hl">витрину мероприятий</span>
        </h2>
        <p className="clpm__bodyText">
          Теперь вы можете поделиться своей инициативой с заинтересованными в этом заведениями,
          которые сами готовы будут откликнуться на предложение.
        </p>

        <div className="clpm__roleCardWrap">
          <img src={mRoleCard} alt="" className="clpm__roleCardImg" />
          <div className="clpm__roleCardLabel clpm__roleCardLabel--space">
            <p className="clpm__roleCardTitle">Пространство</p>
            <p className="clpm__roleCardDesc">Я представляю общественное пространство и хочу найти подходящее мероприятие</p>
          </div>
          <div className="clpm__roleCardLabel clpm__roleCardLabel--creator">
            <p className="clpm__roleCardTitle">Креатор</p>
            <p className="clpm__roleCardDesc">Я организатор мероприятий, хочу найти места для их проведения</p>
          </div>
        </div>
      </section>

      <section className="clpm__section clpm__centered">
        <h2 className="clpm__centeredTitle">Не пробиваться, а выбирать</h2>
        <p className="clpm__centeredBody">
          Мы знаем как сложно самостоятельно продвигать свои идеи и сталкиваться с отказами,
          несовпадением интересов и ценностей — поэтому делаем всё,{' '}
          чтобы случился мэтч между вами и пространством.
        </p>
      </section>

      <section className="clpm__section clpm__features">
        <div className="clpm__featureCard">
          <div className="clpm__featureImgWrap">
            <img src={mFeature1} alt="" className="clpm__featureImg" />
            <span className="clpm__featureTag">планирование</span>
            <p className="clpm__featureText">Больше не нужно искать личного знакомства с представителями общественных пространств — все они собраны в одном месте и открыто заявляют о своей заинтересованности и планах</p>
          </div>
        </div>

        <div className="clpm__featureCard">
          <div className="clpm__featureImgWrap">
            <img src={mFeature2} alt="" className="clpm__featureImg" />
            <span className="clpm__featureTag">знакомство заранее</span>
            <p className="clpm__featureText">Можно заранее оценить вайб места по его фото и описанию</p>
          </div>
        </div>
      </section>

      <section className="clpm__section">
        <div className="clpm__quoteCard">
          <img src={mBanner} alt="" className="clpm__quoteImg" />
          <div className="clpm__quoteOverlay">
            <h2 className="clpm__quoteTitle">
              Мы хотим, чтобы возможность строить горизонтальные связи была{' '}
              <span className="clpm__quoteLime">доступна каждому</span>
            </h2>
          </div>
        </div>
      </section>

      <section className="clpm__section clpm__centered">
        <h2 className="clpm__centeredTitle">Опыт — ваша визитка</h2>
        <p className="clpm__centeredBody">
          Ваши умения, навыки, знания — это самый ценный ресурс,
          о котором можно и нужно рассказывать миру.
        </p>
      </section>

      <section className="clpm__section">
        <div className="clpm__tag">личный бренд</div>
        <h2 className="clpm__bigTitle">
          Успешные кейсы добавятся в ваше{' '}
          <span className="clpm__hl">публичное портфолио</span>
        </h2>
        <p className="clpm__bodyText">
          Опыт, взгляды, компетенции — обо всём, что вы посчитаете нужным для самопрезентации,
          можно рассказать на своей личной странице,
          а также опубликовать состоявшиеся коллаборации
        </p>

        <div className="clpm__portfolioCards">
          <span className="clpm__portfolioBadge">проведённые мероприятия</span>
          <img src={heroCard} alt="" className="clpm__portfolioCardBack" />
          <img src={heroCard1} alt="" className="clpm__portfolioCardFront" />
        </div>
      </section>

      <section className="clpm__section clpm__faq">
        <h2 className="clpm__bigTitle">Частые вопросы</h2>
        <div className="clpm__faqList">
          {FAQS.map((item, i) => (
            <div key={i} className="clpm__faqItem">
              <button
                className="clpm__faqTrigger"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>{item.q}</span>
                <img
                  src={openFaq === i ? upArrow : downArrow}
                  alt=""
                  className="clpm__faqArrow"
                />
              </button>
              {openFaq === i && (
                <p className="clpm__faqAnswer">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="clpm__section clpm__goal">
        <h2 className="clpm__bigTitle">Наша задача — убрать всю рутину поиска и переговоров</h2>
        <p className="clpm__bodyText">
          чтобы вы могли сфокусироваться на главном — на идеях, росте и сообществе, а также месте для лучших событий
        </p>
        <div className="clpm__blogRow">
          <img src={blogPost1} alt="" className="clpm__blogCard" />
          <img src={blogPost2} alt="" className="clpm__blogCard" />
          <img src={blogPost3} alt="" className="clpm__blogCard" />
        </div>
      </section>

      <section className="clpm__section clpm__community">
        <div className="clpm__tag">коммьюнити</div>
        <h2 className="clpm__bigTitle">
          Будем рады, если вы поделитесь своим опытом
        </h2>
        <p className="clpm__bodyText">
          Мы всегда ждём ваши истории — интересные, поучительные, успешные и не только
          в нашем коммьюнити в социальных сетях
        </p>

        <div className="clpm__telegramBlock">
          <img src={mTelegram} alt="" className="clpm__telegramImg" />
          <div className="clpm__telegramOverlay">
            <div className="clpm__communityTags">
              <span className="clpm__tag">интервью с экспертами</span>
              <span className="clpm__tag">важные анонсы</span>
              <span className="clpm__tag">полезные материалы</span>
              <span className="clpm__tag">вдохновляющие кейсы</span>
              <span className="clpm__tag">подборки креаторов и площадок</span>
            </div>
            <a
              href="https://t.me/+jkx2g8mkGB1iYzYy"
              target="_blank"
              rel="noopener noreferrer"
              className="clpm__telegramLink"
            >
              ПОДПИСАТЬСЯ НА TELEGRAM →
            </a>
          </div>
        </div>
      </section>

      <section className="clpm__cta">
        <div className="clpm__ctaCard">
          <h2 className="clpm__ctaTitle">
            Лучшие{' '}
            <span className="clpm__ctaOutlined">события</span>{' '}
            рождаются тогда, когда нужные люди находят{' '}
            <span className="clpm__ctaUnderline">друг друга</span>
          </h2>
          <p className="clpm__ctaSubtitle">
            Начните поиск коллаборации уже сейчас — найдите пространство для вашей идеи
          </p>
          <button className="clpm__heroBtn" onClick={() => navigate('/spaces')}>
            Искать пространство →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
