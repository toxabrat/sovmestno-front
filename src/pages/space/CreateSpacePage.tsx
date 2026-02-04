import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CreateSpacePage.css'

import plusIcon from '../../assets/icons/plus-icon.svg'
import contactsDecor from '../../assets/icons/Frame 2131327962.png'

export function CreateSpacePage() {
  const navigate = useNavigate()

  const userName = 'Арт-кафе Ромашка'

  const [about, setAbout] = useState('')
  const [city, setCity] = useState('Москва')
  const [street, setStreet] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [telegram, setTelegram] = useState('')

  const maxAboutLength = 400

  const handleAboutChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= maxAboutLength) {
      setAbout(value)
    }
  }

  const handleSubmit = () => {
    console.log({
      about,
      city,
      street,
      phone,
      email,
      telegram,
    })
    navigate('/space/final')
  }

  return (
    <div className="createSpace">
      <header className="createSpace__header">
        <h1 className="createSpace__title">
          Добро пожаловать, {userName}!
        </h1>
        <p className="createSpace__subtitle">
          Давайте создадим визитную карточку вашего пространства — рассказ о себе
          поможет найти близких по духу людей для сотрудничества
        </p>
      </header>

      <div className="createSpace__profileCard">
        <button type="button" className="createSpace__cover createSpace__cover--desktop">
          <img src={plusIcon} alt="" className="createSpace__coverIcon" />
          <span className="createSpace__coverText">Загрузить фото на обложку</span>
        </button>

        <div className="createSpace__profileBottom">
          <div className="createSpace__uploadRow">
            <button type="button" className="createSpace__cover">
              <img src={plusIcon} alt="" className="createSpace__coverIcon" />
              <span className="createSpace__coverText">Добавить фото на обложку</span>
            </button>
            <button type="button" className="createSpace__logo">
              <img src={plusIcon} alt="" className="createSpace__logoIcon" />
              <span className="createSpace__logoText">Добавить логотип</span>
            </button>
          </div>

          <button type="button" className="createSpace__logo createSpace__logo--desktop">
            <img src={plusIcon} alt="" className="createSpace__logoIcon" />
            <span className="createSpace__logoText">Загрузить логотип</span>
          </button>

          <div className="createSpace__info">
            <div className="createSpace__aboutWrapper">
              <textarea
                className="createSpace__about"
                placeholder="Расскажите о ценностях и атмосфере вашего пространства"
                value={about}
                onChange={handleAboutChange}
              />
              <span className="createSpace__aboutCounter">
                {about.length}/{maxAboutLength}
              </span>
            </div>

            <div className="createSpace__address">
              <select
                className="createSpace__citySelect"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="Москва">Москва</option>
                <option value="Санкт-Петербург">Санкт-Петербург</option>
                <option value="Казань">Казань</option>
                <option value="Новосибирск">Новосибирск</option>
                <option value="Екатеринбург">Екатеринбург</option>
              </select>
              <input
                type="text"
                className="createSpace__streetInput"
                placeholder="Улица, дом"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="createSpace__contactsCard">
        <img src={contactsDecor} alt="" className="createSpace__contactsDecor" />

        <div className="createSpace__contactsHeader">
          <h2 className="createSpace__contactsTitle">
            Укажите удобные
            <br />
            для вас способы связи
          </h2>
          <p className="createSpace__contactsSubtitle">
            Контакты станут доступны только тому,
            <br />
            с кем у вас было взаимное одобрение заявки
          </p>
        </div>

        <div className="createSpace__contactsFields">
          <div className="createSpace__contactRow">
            <label className="createSpace__contactLabel">Контактный телефон</label>
            <input
              type="tel"
              className="createSpace__contactInput"
              placeholder="+7"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="createSpace__contactRow">
            <label className="createSpace__contactLabel">Рабочая почта</label>
            <input
              type="email"
              className="createSpace__contactInput"
              placeholder="example@mail.ru"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="createSpace__contactRow">
            <label className="createSpace__contactLabel">Аккаунт в telegram</label>
            <input
              type="text"
              className="createSpace__contactInput"
              placeholder="@username"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="createSpace__footer">
        <button 
          type="button" 
          className="createSpace__submitBtn"
          onClick={handleSubmit}
        >
          Продолжить →
        </button>
      </div>
    </div>
  )
}
