import './Footer.css'

import iconTelegram from '../../assets/icons/footer/Vector(9).png'
import iconSocial from '../../assets/icons/footer/Vector(10).png'
import iconStar from '../../assets/icons/footer/Vector(11).png'
import logoText from '../../assets/icons/footer/СОВМЕСТНО(1).png'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">

        <div className="footer__left">
          <p className="footer__subscribeTitle">Узнавай новости самым первым</p>
          <div className="footer__subscribeRow">
            <input
              type="email"
              placeholder="E-MAIL"
              className="footer__emailInput"
            />
            <button type="button" className="footer__subscribeBtn">
              ПОДПИСАТЬСЯ
            </button>
          </div>
          <div className="footer__socialIcons">
            <a href="https://t.me/sovmestno" target="_blank" rel="noopener noreferrer" className="footer__socialLink">
              <img src={iconTelegram} alt="Telegram" className="footer__socialIcon" />
            </a>
            <a href="#" className="footer__socialLink">
              <img src={iconSocial} alt="Социальные сети" className="footer__socialIcon" />
            </a>
          </div>
          <p className="footer__email">Для вопросов и предложений: pochta@mail.com</p>
        </div>

        <div className="footer__nav">
          <a href="#" className="footer__navLink">Площадки</a>
          <a href="#" className="footer__navLink">Мероприятия</a>
          <a href="#" className="footer__navLink">Креаторы</a>
          <a href="#" className="footer__navLink">Кейсы</a>
          <a href="#" className="footer__navLink">О нас</a>
        </div>

        <div className="footer__brand">
          <img src={logoText} alt="СОВМЕСТНО" className="footer__logoText" />
          <img src={iconStar} alt="" className="footer__star" />
        </div>

      </div>
    </footer>
  )
}
