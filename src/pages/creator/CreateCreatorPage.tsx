import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatorRegistration } from '../../context/CreatorRegistrationContext'
import { uploadImage, updateCreatorProfile } from '../../api/auth'
import './CreateCreatorPage.css'

import plusIcon from '../../assets/icons/plus-icon.svg'
import contactsDecor from '../../assets/icons/Frame 2131327962.png'

export function CreateCreatorPage() {
  const navigate = useNavigate()
  const { data, updateData } = useCreatorRegistration()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userName = data.name || 'Пользователь'

  const [about, setAbout] = useState(data.description)
  const [city, setCity] = useState(data.city || 'Москва')
  const [phone, setPhone] = useState(data.phone)
  const [workEmail, setWorkEmail] = useState(data.workEmail)
  const [telegram, setTelegram] = useState(data.telegramPersonal)

  const [photoFile, setPhotoFile] = useState<File | null>(data.photoFile || null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(data.photoPreview || null)
  
  const [isLoading, setIsLoading] = useState(false)

  const maxAboutLength = 400

  const hasAtLeastOneContact = 
    phone.trim() !== '' || 
    workEmail.trim() !== '' || 
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

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      console.log('Selected photo:', file.name, file.type, file.size)
    }
  }

  const handleSubmit = async () => {
    if (!isFormValid || isLoading) return
    if (!data.token || !data.userId) {
      console.error('No token or userId in context')
      return
    }
    
    setIsLoading(true)
    
    try {
      let photoId: number | null = null

      if (photoFile) {
        const uploadResponse = await uploadImage(photoFile, 'avatar', data.token)
        photoId = uploadResponse.id
        console.log('Photo uploaded, id:', photoId)
      }

      await updateCreatorProfile(data.userId, {
        name: data.name,
        description: about.trim(),
        phone: phone.trim(),
        work_email: workEmail.trim(),
        tg_personal_link: telegram.trim(),
        photo_id: photoId || undefined,
      }, data.token)

      updateData({
        description: about.trim(),
        city,
        phone: phone.trim(),
        workEmail: workEmail.trim(),
        telegramPersonal: telegram.trim(),
        photoFile,
        photoPreview,
        photoId,
      })
      
      navigate('/creator/final')
    } catch (err) {
      console.error('Error updating profile:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="createCreator">
      <header className="createCreator__header">
        <button 
          type="button" 
          className="createCreator__backBtn"
          onClick={handleBack}
          aria-label="Назад"
        >
          ←
        </button>
        <div className="createCreator__headerText">
          <h1 className="createCreator__title">
            Добро пожаловать, {userName}!
          </h1>
          <p className="createCreator__subtitle">
            Давайте создадим вашу визитную карточку — рассказ о себе
            поможет найти близких по духу людей для сотрудничества
          </p>
        </div>
      </header>

      <div className="createCreator__profileCard">
        <div className="createCreator__profileContent">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
          <button 
            type="button" 
            className="createCreator__photo"
            onClick={handlePhotoClick}
            style={photoPreview ? { backgroundImage: `url(${photoPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
            {!photoPreview && (
              <>
                <img src={plusIcon} alt="" className="createCreator__photoIcon" />
                <span className="createCreator__photoText">Загрузить фото</span>
              </>
            )}
          </button>

          <div className="createCreator__info">
            <div className="createCreator__aboutWrapper">
              <textarea
                className="createCreator__about"
                placeholder="Расскажите о ценностях и атмосфере вашего пространства"
                value={about}
                onChange={handleAboutChange}
              />
              <span className="createCreator__aboutCounter">
                {about.length}/{maxAboutLength}
              </span>
            </div>

            <select
              className="createCreator__citySelect"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="Москва">Москва</option>
              <option value="Санкт-Петербург">Санкт-Петербург</option>
              <option value="Казань">Казань</option>
              <option value="Новосибирск">Новосибирск</option>
              <option value="Екатеринбург">Екатеринбург</option>
            </select>
          </div>
        </div>
      </div>

      <div className="createCreator__contactsCard">
        <img src={contactsDecor} alt="" className="createCreator__contactsDecor" />

        <div className="createCreator__contactsHeader">
          <h2 className="createCreator__contactsTitle">
            Укажите удобные
            <br />
            для вас способы связи
          </h2>
          <p className="createCreator__contactsSubtitle">
            Контакты станут доступны только тому,
            <br />
            с кем у вас было взаимное одобрение заявки
          </p>
        </div>

        <div className="createCreator__contactsFields">
          <div className="createCreator__contactRow">
            <label className="createCreator__contactLabel">Контактный телефон</label>
            <input
              type="tel"
              className="createCreator__contactInput"
              placeholder="+7"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="createCreator__contactRow">
            <label className="createCreator__contactLabel">Рабочая почта</label>
            <input
              type="email"
              className="createCreator__contactInput"
              placeholder="sovmestno@yandex.ru"
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
            />
          </div>
          <div className="createCreator__contactRow">
            <label className="createCreator__contactLabel">Аккаунт в telegram</label>
            <input
              type="text"
              className="createCreator__contactInput"
              placeholder="sovmestnomedia"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="createCreator__footer">
        <button 
          type="button" 
          className="createCreator__submitBtn"
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          style={{ opacity: (isFormValid && !isLoading) ? 1 : 0.5, cursor: (isFormValid && !isLoading) ? 'pointer' : 'not-allowed' }}
        >
          {isLoading ? 'Сохранение...' : 'Продолжить →'}
        </button>
      </div>
    </div>
  )
}
