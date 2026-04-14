import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCreatorRegistration } from '../../context/CreatorRegistrationContext'
import { useAuth } from '../../context/AuthContext'
import { uploadImage, updateCreatorProfile, fetchCreatorProfile, fetchImageUrl } from '../../api/auth'
import './CreateCreatorPage.css'

import plusIcon from '../../assets/icons/plus-icon.svg'
import contactsDecor from '../../assets/icons/Frame 2131327962.png'
import backArrow from '../../assets/icons/Vector 2376.png'

export function CreateCreatorPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEditMode = searchParams.get('edit') === 'true'
  const { data, updateData } = useCreatorRegistration()
  const { token: authToken, user: authUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeToken = isEditMode ? authToken : data.token
  const activeUserId = isEditMode ? (authUser?.id ?? null) : data.userId

  const [profileName, setProfileName] = useState(data.name || '')
  const userName = profileName || data.name || 'Пользователь'

  const [about, setAbout] = useState(data.description)
  const [city, setCity] = useState(data.city || 'Москва')
  const [phone, setPhone] = useState(data.phone)
  const [workEmail, setWorkEmail] = useState(data.workEmail)
  const [telegram, setTelegram] = useState(data.telegramPersonal)

  const [photoFile, setPhotoFile] = useState<File | null>(data.photoFile || null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(data.photoPreview || null)
  const [existingPhotoId, setExistingPhotoId] = useState<number | null>(data.photoId)

  const [existingTgChannel, setExistingTgChannel] = useState('')
  const [existingVk, setExistingVk] = useState('')
  const [existingTiktok, setExistingTiktok] = useState('')
  const [existingYoutube, setExistingYoutube] = useState('')
  const [existingDzen, setExistingDzen] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [backendError, setBackendError] = useState<string | null>(null)

  const maxAboutLength = 400

  useEffect(() => {
    if (!isEditMode || !activeToken || !activeUserId) return
    setIsLoadingProfile(true)
    fetchCreatorProfile(activeUserId, activeToken)
      .then(async profile => {
        setProfileName(profile.name || '')
        setAbout(profile.description || '')
        setPhone(profile.phone || '')
        setWorkEmail(profile.work_email || '')
        setTelegram(profile.tg_personal_link || '')
        if (profile.photo_id) {
          setExistingPhotoId(profile.photo_id)
          try {
            const url = await fetchImageUrl(profile.photo_id)
            setPhotoPreview(url)
          } catch {}
        }
        setExistingTgChannel(profile.tg_channel_link || '')
        setExistingVk(profile.vk_link || '')
        setExistingTiktok(profile.tiktok_link || '')
        setExistingYoutube(profile.youtube_link || '')
        setExistingDzen(profile.dzen_link || '')
      })
      .catch(() => {})
      .finally(() => setIsLoadingProfile(false))
  }, [isEditMode]) // eslint-disable-line react-hooks/exhaustive-deps

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
    if (isEditMode) navigate('/creator/profile')
    else navigate('/auth')
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
    if (!activeToken || !activeUserId) {
      console.error('No token or userId')
      return
    }

    setIsLoading(true)
    setBackendError(null)

    try {
      let photoId: number | null = isEditMode ? existingPhotoId : null

      if (photoFile) {
        const uploadResponse = await uploadImage(photoFile, 'avatar', activeToken)
        photoId = uploadResponse.id
        console.log('Photo uploaded, id:', photoId)
      }

      await updateCreatorProfile(activeUserId, {
        name: profileName || data.name,
        description: about.trim(),
        phone: phone.trim(),
        work_email: workEmail.trim(),
        tg_personal_link: telegram.trim(),
        photo_id: photoId || undefined,
        ...(isEditMode && {
          tg_channel_link: existingTgChannel || undefined,
          vk_link: existingVk || undefined,
          tiktok_link: existingTiktok || undefined,
          youtube_link: existingYoutube || undefined,
          dzen_link: existingDzen || undefined,
        }),
      }, activeToken)

      if (!isEditMode) {
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
      }

      navigate(isEditMode ? '/creator/final?edit=true' : '/creator/final')
    } catch (err) {
      console.error('Error updating profile:', err)
      try { setBackendError(JSON.parse((err as Error).message)?.errors?.[0]?.message ?? 'Что-то пошло не так') } catch { setBackendError('Что-то пошло не так') }
    } finally {
      setIsLoading(false)
    }
  }

  if (isEditMode && isLoadingProfile) {
    return <div className="createCreator" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>Загрузка...</div>
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
          <img src={backArrow} alt="Назад" />
        </button>
        <div className="createCreator__headerText">
          <h1 className="createCreator__title">
            {isEditMode ? 'Редактирование профиля' : `Добро пожаловать, ${userName}!`}
          </h1>
          <p className="createCreator__subtitle">
            {isEditMode
              ? 'Обновите информацию о себе'
              : 'Давайте создадим вашу визитную карточку — рассказ о себе поможет найти близких по духу людей для сотрудничества'}
          </p>
        </div>
      </header>

      <div className="createCreator__profileCard">
        <div className="createCreator__profileContent">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
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
                placeholder="Расскажите о себе, своих интересах и деятельности"
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

      {backendError && <p className="createCreator__backendError">{backendError}</p>}

      <div className="createCreator__footer">
        <button
          type="button"
          className="createCreator__submitBtn"
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          style={{ opacity: (isFormValid && !isLoading) ? 1 : 0.5, cursor: (isFormValid && !isLoading) ? 'pointer' : 'not-allowed' }}
        >
          {isLoading ? 'Сохранение...' : (isEditMode ? 'Далее →' : 'Продолжить →')}
        </button>
      </div>
    </div>
  )
}
