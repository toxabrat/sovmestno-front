import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSpaceRegistration } from '../../context/SpaceRegistrationContext'
import { uploadImage, registerVenue, updateVenueProfile } from '../../api/auth'
import './CreateSpacePage.css'

import plusIcon from '../../assets/icons/plus-icon.svg'
import contactsDecor from '../../assets/icons/Frame 2131327962.png'

export function CreateSpacePage() {
  const navigate = useNavigate()
  const { data, updateData } = useSpaceRegistration()

  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const userName = data.name || 'Пространство'

  const [about, setAbout] = useState(data.description)
  const [city, setCity] = useState(data.city || 'Москва')
  const [street, setStreet] = useState(data.street)
  const [phone, setPhone] = useState(data.phone)
  const [email, setEmail] = useState(data.workEmail)
  const [telegram, setTelegram] = useState(data.telegramPersonal)

  const [logoFile, setLogoFile] = useState<File | null>(data.logoFile || null)
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logoPreview || null)
  const [coverFile, setCoverFile] = useState<File | null>(data.coverFile || null)
  const [coverPreview, setCoverPreview] = useState<string | null>(data.coverPreview || null)

  const [isLoading, setIsLoading] = useState(false)

  const maxAboutLength = 400

  const hasAtLeastOneContact =
    phone.trim() !== '' ||
    email.trim() !== '' ||
    telegram.trim() !== ''

  const isFormValid = about.trim() !== '' && hasAtLeastOneContact

  const handleAboutChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= maxAboutLength) {
      setAbout(value)
    }
  }

  const handleBack = () => {
    navigate('/auth')
  }

  const handleLogoClick = () => {
    logoInputRef.current?.click()
  }

  const handleCoverClick = () => {
    coverInputRef.current?.click()
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setCoverPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!isFormValid || isLoading) return
    if (!data.name || !data.email || !data.password) {
      console.error('Missing name/email/password in context, redirecting to auth')
      navigate('/auth')
      return
    }

    setIsLoading(true)

    try {
      const address = [city, street].filter(Boolean).join(', ')

      const response = await registerVenue({
        name: data.name,
        email: data.email,
        password: data.password,
        description: about.trim(),
        street_address: address,
        phone: phone.trim(),
        work_email: email.trim(),
        tg_personal_link: telegram.trim(),
      })

      const token = response.token
      const userId = response.user.id
      const venueId = response.user.venue?.id ?? null

      let logoId: number | null = null
      let coverId: number | null = null

      if (logoFile) {
        const res = await uploadImage(logoFile, 'venue-logo', token)
        logoId = res.id
      }

      if (coverFile) {
        const res = await uploadImage(coverFile, 'venue-cover', token)
        coverId = res.id
      }

      if (userId) {
        await updateVenueProfile(userId, {
          name: data.name,
          description: about.trim(),
          street_address: address,
          phone: phone.trim() || undefined,
          work_email: email.trim() || undefined,
          tg_personal_link: telegram.trim() || undefined,
          logo_id: logoId ?? undefined,
          cover_photo_id: coverId ?? undefined,
        }, token)
      }

      updateData({
        token,
        userId,
        venueId,
        description: about.trim(),
        city,
        street: street.trim(),
        phone: phone.trim(),
        workEmail: email.trim(),
        telegramPersonal: telegram.trim(),
        logoFile,
        logoPreview,
        logoId,
        coverFile,
        coverPreview,
        coverId,
      })

      navigate('/space/final')
    } catch (err) {
      console.error('Error registering venue:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="createSpace">
      <header className="createSpace__header">
        <button
          type="button"
          className="createSpace__backBtn"
          onClick={handleBack}
          aria-label="Назад"
        >
          ←
        </button>
        <div className="createSpace__headerText">
          <h1 className="createSpace__title">
            Добро пожаловать, {userName}!
          </h1>
          <p className="createSpace__subtitle">
            Давайте создадим визитную карточку вашего пространства — рассказ о себе
            поможет найти близких по духу людей для сотрудничества
          </p>
        </div>
      </header>

      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverChange}
        style={{ display: 'none' }}
      />
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoChange}
        style={{ display: 'none' }}
      />

      <div className="createSpace__profileCard">
        <button
          type="button"
          className="createSpace__cover createSpace__cover--desktop"
          onClick={handleCoverClick}
          style={coverPreview ? { backgroundImage: `url(${coverPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          {!coverPreview && (
            <>
              <img src={plusIcon} alt="" className="createSpace__coverIcon" />
              <span className="createSpace__coverText">Загрузить фото на обложку</span>
            </>
          )}
        </button>

        <div className="createSpace__profileBottom">
          <div className="createSpace__uploadRow">
            <button
              type="button"
              className="createSpace__cover"
              onClick={handleCoverClick}
              style={coverPreview ? { backgroundImage: `url(${coverPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
            >
              {!coverPreview && (
                <>
                  <img src={plusIcon} alt="" className="createSpace__coverIcon" />
                  <span className="createSpace__coverText">Добавить фото на обложку</span>
                </>
              )}
            </button>
            <button
              type="button"
              className="createSpace__logo"
              onClick={handleLogoClick}
              style={logoPreview ? { backgroundImage: `url(${logoPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
            >
              {!logoPreview && (
                <>
                  <img src={plusIcon} alt="" className="createSpace__logoIcon" />
                  <span className="createSpace__logoText">Добавить логотип</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            className="createSpace__logo createSpace__logo--desktop"
            onClick={handleLogoClick}
            style={logoPreview ? { backgroundImage: `url(${logoPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
            {!logoPreview && (
              <>
                <img src={plusIcon} alt="" className="createSpace__logoIcon" />
                <span className="createSpace__logoText">Загрузить логотип</span>
              </>
            )}
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
          disabled={!isFormValid || isLoading}
          style={{
            opacity: isFormValid && !isLoading ? 1 : 0.5,
            cursor: isFormValid && !isLoading ? 'pointer' : 'not-allowed',
          }}
        >
          {isLoading ? 'Сохранение...' : 'Продолжить →'}
        </button>
      </div>
    </div>
  )
}

