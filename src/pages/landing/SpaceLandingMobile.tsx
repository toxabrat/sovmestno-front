import { useNavigate } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { Footer } from '../../components/layout/Footer'
import './SpaceLandingMobile.css'

import heroStar from '../../assets/icons/hero-star.svg'
import benefit1 from '../../assets/icons/landing_space/prototype/benefit1.png'
import benefit2 from '../../assets/icons/landing_space/prototype/benefit2.png'
import benefit3 from '../../assets/icons/landing_space/prototype/benefit3.png'
import benefit4 from '../../assets/icons/landing_space/prototype/benefit4.png'
import cardMockup1 from '../../assets/icons/landing_space/prototype/card_mockup1.png'
import cardMockup2 from '../../assets/icons/landing_space/prototype/card_mockup2.png'
import cardMockup3 from '../../assets/icons/landing_space/prototype/card_mockup3.png'
import arrow1 from '../../assets/icons/landing_space/prototype/arrow1.png'
import arrow2 from '../../assets/icons/landing_space/prototype/arrow2.png'
import heartsImg from '../../assets/icons/landing_space/prototype/hearts.png'
import blogPost1 from '../../assets/icons/landing_space/prototype/blog_post1.png'
import blogPost2 from '../../assets/icons/landing_space/prototype/blog_post2.png'
import blogPost3 from '../../assets/icons/landing_space/prototype/blog_post3.png'

import mStep1 from '../../assets/icons/landing_space/prototype/mobile/Frame 2131327899(1).png'
import mStep2 from '../../assets/icons/landing_space/prototype/mobile/Frame 2131328053(1).png'
import mStep3 from '../../assets/icons/landing_space/prototype/mobile/Frame 2131328052(4).png'
import mFeature1 from '../../assets/icons/landing_space/prototype/mobile/Frame 2131327904.png'
import mFeature2 from '../../assets/icons/landing_space/prototype/mobile/Frame 2131327905.png'
import mFeature3 from '../../assets/icons/landing_space/prototype/mobile/Frame 2131327902.png'
import mFeature4 from '../../assets/icons/landing_space/prototype/mobile/Frame 2131327903.png'
import mUrgently from '../../assets/icons/landing_space/prototype/mobile/Frame 2131328052.png'
import urgentlySection from '../../assets/icons/landing_space/prototype/urgently_section.png'
import mTelegram from '../../assets/icons/landing_space/prototype/mobile/Frame 2131328052(3).png'

export function SpaceLandingMobile() {
  const navigate = useNavigate()

  return (
    <div className="slpm">
      <Header />

      <section className="slpm__section slpm__hero">
        <div className="slpm__heroCard">
          <div className="slpm__heroToggle">
            <button className="slpm__heroToggleBtn slpm__heroToggleBtn--active">
              Площадкам
            </button>
            <button
              className="slpm__heroToggleBtn"
              onClick={() => navigate('/landing/creator')}
            >
              Креаторам
            </button>
          </div>

          <img src={heroStar} alt="" className="slpm__heroStar" />

          <h1 className="slpm__heroTitle">
            Скрепляем людей в события, созданные{' '}
            <span className="slpm__heroTitleLast">
              совместно
              <span className="slpm__heroLine" />
            </span>
          </h1>

          <p className="slpm__heroSubtitle">
            Сервис для кооперации общественных пространств и организаторов мероприятий
          </p>

          <button className="slpm__heroBtn" onClick={() => navigate('/events')}>
            Искать мероприятие →
          </button>
        </div>
      </section>

      <section className="slpm__section slpm__benefits">
        <div className="slpm__benefitsGrid">
          <img src={benefit1} alt="Экономия времени" className="slpm__benefitImg" />
          <img src={benefit2} alt="Готовые идеи мероприятий" className="slpm__benefitImg" />
          <img src={benefit3} alt="Позиционирование на рынке" className="slpm__benefitImg" />
          <img src={benefit4} alt="Привлечение аудитории" className="slpm__benefitImg" />
        </div>
      </section>

      <section className="slpm__section slpm__desc">
        <h2 className="slpm__bigTitle">Больше не надо искать, привлекать и рисковать</h2>
        <p className="slpm__bodyText">
          Сервис «Совместно» собирает общественные пространства и креаторов — тех, кто ищет возможности
          реализовать свои идеи. Обе стороны могут заранее узнать друг о друге и понять, сойдутся ли они по духу
        </p>

        <div className="slpm__arrow1Wrap">
          <img src={arrow1} alt="" className="slpm__arrow1" />
        </div>

        <h3 className="slpm__medTitle">
          Креаторы сами предлагают{' '}
          <span className="slpm__hl">готовые идеи</span>{' '}
          мероприятий
        </h3>
        <p className="slpm__bodyText">
          А также готовы их подготовить и провести по заранее обозначенным условиям.
          А если вы уже заранее знаете, что хотите — отлично!
          Укажите свои планы и предпочтения в профиле, чтобы креаторы видели ваш запрос
        </p>

        <div className="slpm__arrow2Wrap">
          <img src={arrow2} alt="" className="slpm__arrow2" />
        </div>

        <h3 className="slpm__medTitle">
          Вам останется<br />
          <span className="slpm__hl">только выбрать</span>
        </h3>

        <div className="slpm__mockupPill">хотят провести</div>

        <div className="slpm__mockupStack">
          <img src={cardMockup1} alt="" className="slpm__mockupImg slpm__mockupImg--1" />
          <img src={cardMockup2} alt="" className="slpm__mockupImg slpm__mockupImg--2" />
          <img src={cardMockup3} alt="" className="slpm__mockupImg slpm__mockupImg--3" />
        </div>
      </section>

      <section className="slpm__section slpm__quote">
        <div className="slpm__quoteCard">
          <img src={mUrgently} alt="" className="slpm__quoteImg" />
          <div className="slpm__quoteOverlay">
            <h2 className="slpm__quoteTitle">
              Мы хотим делать организацию событий проще, а пространство для встреч —{' '}
              <span className="slpm__quoteLime">доступнее</span>
            </h2>
          </div>
        </div>
      </section>

      <section className="slpm__section slpm__steps">
        <div className="slpm__tag">скорость</div>
        <h2 className="slpm__bigTitle">
          Устроить мероприятие<br />
          <span className="slpm__hl">в три шага</span>
        </h2>
        <p className="slpm__bodyText">
          Наша задача — убрать лишние шаги на пути к сотрудничеству, чтобы вы могли сосредоточиться на развитии своего дела
        </p>

        <div className="slpm__stepItem">
          <img src={mStep1} alt="Шаг 1" className="slpm__stepImg" />
          <p className="slpm__stepLabel">Выбрать мероприятие</p>
        </div>
        <div className="slpm__stepItem">
          <img src={mStep2} alt="Шаг 2" className="slpm__stepImg" />
          <p className="slpm__stepLabel">Пригласить креатора</p>
        </div>
        <div className="slpm__stepItem">
          <img src={mStep3} alt="Шаг 3" className="slpm__stepImg" />
          <p className="slpm__stepLabel">Договориться о встрече</p>
        </div>
      </section>

      <section className="slpm__section slpm__urgently">
        <div className="slpm__tag">продвижение</div>
        <h2 className="slpm__bigTitle">Нужно срочно? Не проблема!</h2>
        <p className="slpm__bodyText">
          Мы поможем продвинуть вашу заявку, чтобы она стала заметна всем, а самое главное —
          стала заметна тому креатору, с которым у вас получится самое продуктивное сотрудничество
        </p>

        <div className="slpm__urgentlyImgWrap">
          <img src={urgentlySection} alt="Срочное продвижение" className="slpm__urgentlyImg" />
          <div className="slpm__badge slpm__badge--zayvka">
            <span className="slpm__badgePlus">+</span> новая заявка
          </div>
          <div className="slpm__badge slpm__badge--recom">
            <span className="slpm__badgePlus">+</span> новая рекомендация
          </div>
          <div className="slpm__badge slpm__badge--count">
            <img src={heartsImg} alt="" className="slpm__badgeHeartsImg" /> 250
          </div>
        </div>
      </section>

      <section className="slpm__section slpm__features">
        <h2 className="slpm__bigTitle">
          Лишний раз никто{' '}
          <span className="slpm__hl">не побеспокоит</span>
        </h2>

        <div className="slpm__featureCard">
          <div className="slpm__featureImgWrap">
            <img src={mFeature3} alt="" className="slpm__featureImg" />
            <span className="slpm__featureTag">настройка статуса</span>
            <p className="slpm__featureText">Сервис ограничит возможность предлагать вам мероприятия, если они пока не нужны</p>
          </div>
        </div>

        <div className="slpm__featureCard">
          <div className="slpm__featureImgWrap">
            <img src={mFeature1} alt="" className="slpm__featureImg" />
            <span className="slpm__featureTag">конфиденциальность</span>
            <p className="slpm__featureText">Ваши контакты будут скрыты и станут доступны только после взаимного сотрудничества</p>
          </div>
        </div>

        <div className="slpm__featureCard">
          <div className="slpm__featureImgWrap">
            <img src={mFeature2} alt="" className="slpm__featureImg" />
            <span className="slpm__featureTag">планирование</span>
            <p className="slpm__featureText">Если вы пока не готовы оставить отклик, можете сохранить заявку и вернуться к ней позже</p>
          </div>
        </div>

        <div className="slpm__featureCard">
          <div className="slpm__featureImgWrap">
            <img src={mFeature4} alt="" className="slpm__featureImg" />
            <span className="slpm__featureTag">персонализация</span>
            <p className="slpm__featureText">Вы уже отказали креатору — больше не будем предлагать его мероприятие и скоро похожие</p>
          </div>
        </div>
      </section>

      <section className="slpm__section slpm__goal">
        <h2 className="slpm__bigTitle">Наша задача — убрать всю рутину поиска и переговоров</h2>
        <p className="slpm__bodyText">
          чтобы вы могли сфокусироваться на главном — на идеях, росте и сообществе, а также месте для лучших событий
        </p>

        <div className="slpm__blogRow">
          <img src={blogPost1} alt="" className="slpm__blogCard" />
          <img src={blogPost2} alt="" className="slpm__blogCard" />
          <img src={blogPost3} alt="" className="slpm__blogCard" />
        </div>
      </section>

      <section className="slpm__section slpm__community">
        <div className="slpm__tag">коммьюнити</div>
        <h2 className="slpm__bigTitle">
          Будем рады, если вы поделитесь своим опытом
        </h2>
        <p className="slpm__bodyText">
          Мы всегда ждём ваши истории — интересные, поучительные, успешные и не только
          в нашем коммьюнити в социальных сетях
        </p>

        <div className="slpm__telegramBlock">
          <img src={mTelegram} alt="" className="slpm__telegramImg" />
          <div className="slpm__telegramOverlay">
            <div className="slpm__communityTags">
              <span className="slpm__tag">интервью с экспертами</span>
              <span className="slpm__tag">важные анонсы</span>
              <span className="slpm__tag">полезные материалы</span>
              <span className="slpm__tag">вдохновляющие кейсы</span>
              <span className="slpm__tag">подборки креаторов и площадок</span>
            </div>
            <a
              href="https://t.me/+jkx2g8mkGB1iYzYy"
              target="_blank"
              rel="noopener noreferrer"
              className="slpm__telegramLink"
            >
              ПОДПИСАТЬСЯ НА TELEGRAM →
            </a>
          </div>
        </div>
      </section>

      <section className="slpm__cta">
        <div className="slpm__ctaCard">
          <h2 className="slpm__ctaTitle">
            Лучшие{' '}
            <span className="slpm__ctaOutlined">события</span>{' '}
            рождаются тогда, когда нужные люди находят{' '}
            <span className="slpm__ctaUnderline">друг друга</span>
          </h2>
          <p className="slpm__ctaSubtitle">
            Начните поиск коллаборации уже сейчас, чтобы стать живой площадкой
            устойчивого и творческого сообщества
          </p>
          <button className="slpm__heroBtn" onClick={() => navigate('/events')}>
            Искать мероприятие →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
