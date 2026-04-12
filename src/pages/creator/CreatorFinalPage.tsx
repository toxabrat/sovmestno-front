import { useRef, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCreatorRegistration } from '../../context/CreatorRegistrationContext'
import { useAuth } from '../../context/AuthContext'
import { updateCreatorProfile, uploadImage, addCreatorPhoto, fetchCreatorProfile, fetchImageUrl } from '../../api/auth'
import './CreatorFinalPage.css'

import plusIcon from '../../assets/icons/plus-icon.svg'
import socialMediaDecor from '../../assets/icons/social media.png'
import backArrow from '../../assets/icons/Vector 2376.png'
import iconTelegram from '../../assets/icons/space_sign_up4/Vector(1).png'
import iconVk from '../../assets/icons/space_sign_up4/Vector(2).png'
import iconTiktok from '../../assets/icons/space_sign_up4/Vector(3).png'
import iconYoutube from '../../assets/icons/space_sign_up4/Vector(4).png'
import iconDzen from '../../assets/icons/space_sign_up4/Vector(5).png'

export function CreatorFinalPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEditMode = searchParams.get('edit') === 'true'
  const { data } = useCreatorRegistration()
  const { token: authToken, user: authUser } = useAuth()

  const activeToken = isEditMode ? authToken : data.token
  const activeUserId = isEditMode ? (authUser?.id ?? null) : data.userId

  const [telegramChannel, setTelegramChannel] = useState(data.telegramChannel)
  const [vk, setVk] = useState(data.vkLink)
  const [tiktok, setTiktok] = useState(data.tiktokLink)
  const [youtube, setYoutube] = useState(data.youtubeLink)
  const [dzen, setDzen] = useState(data.dzenLink)
  const [profileName, setProfileName] = useState(data.name || '')

  const [storedDescription, setStoredDescription] = useState(data.description || '')
  const [storedPhone, setStoredPhone] = useState(data.phone || '')
  const [storedWorkEmail, setStoredWorkEmail] = useState(data.workEmail || '')
  const [storedTgPersonal, setStoredTgPersonal] = useState(data.telegramPersonal || '')
  const [storedPhotoId, setStoredPhotoId] = useState<number | null>(data.photoId)

  const [isLoading, setIsLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    if (!isEditMode || !activeToken || !activeUserId) return
    fetchCreatorProfile(activeUserId, activeToken)
      .then(async profile => {
        setProfileName(profile.name || '')
        setStoredDescription(profile.description || '')
        setStoredPhone(profile.phone || '')
        setStoredWorkEmail(profile.work_email || '')
        setStoredTgPersonal(profile.tg_personal_link || '')
        setStoredPhotoId(profile.photo_id ?? null)
        setTelegramChannel(profile.tg_channel_link || '')
        setVk(profile.vk_link || '')
        setTiktok(profile.tiktok_link || '')
        setYoutube(profile.youtube_link || '')
        setDzen(profile.dzen_link || '')
        if (profile.photos && profile.photos.length > 0) {
          const results = await Promise.allSettled(
            profile.photos.map(p => fetchImageUrl(p.image_id))
          )
          const urls = results
            .filter(r => r.status === 'fulfilled')
            .map(r => (r as PromiseFulfilledResult<string>).value)
          setPhotoPreviews(urls)
        }
      })
      .catch(() => {})
  }, [isEditMode]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeToken) return
    setUploadingPhoto(true)
    try {
      const preview = URL.createObjectURL(file)
      setPhotoPreviews(prev => [...prev, preview])
      const img = await uploadImage(file, 'venue-photo', activeToken)
      await addCreatorPhoto(img.id, activeToken)
    } catch (err) {
      console.error('Photo upload failed:', err)
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleBack = () => {
    if (isEditMode) navigate('/creator/create?edit=true')
    else navigate('/creator/create')
  }

  const handleSkip = () => {
    if (isEditMode) navigate('/creator/profile')
    else navigate('/creator/success')
  }

  const handleSave = async () => {
    if (!activeToken || !activeUserId) {
      handleSkip()
      return
    }
    setIsLoading(true)
    try {
      await updateCreatorProfile(activeUserId, {
        name: profileName || data.name,
        description: storedDescription || undefined,
        phone: storedPhone || undefined,
        work_email: storedWorkEmail || undefined,
        tg_personal_link: storedTgPersonal || undefined,
        photo_id: storedPhotoId || undefined,
        tg_channel_link: telegramChannel || undefined,
        vk_link: vk || undefined,
        tiktok_link: tiktok || undefined,
        youtube_link: youtube || undefined,
        dzen_link: dzen || undefined,
      }, activeToken)
      if (isEditMode) navigate('/creator/profile')
      else navigate('/creator/success')
    } catch (err) {
      console.error('Error saving profile:', err)
      handleSkip()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="creatorFinal">
      <header className="creatorFinal__header">
        <button type="button" className="creatorFinal__backBtn" onClick={handleBack} aria-label="Назад"><img src={backArrow} alt="Назад" /></button>
        <div className="creatorFinal__headerText">
          <h1 className="creatorFinal__title">{isEditMode ? 'Редактирование профиля' : 'Ииии... финальный штрих!'}</h1>
          <p className="creatorFinal__subtitle">
            {isEditMode
              ? 'Обновите ссылки на социальные сети и фотографии портфолио'
              : 'Вы можете добавить ссылки на свои социальные сети. Это поможет площадкам узнать о вас больше. Добавить фотографии портфолио можно будет позже из профиля.'}
          </p>
        </div>
      </header>

      <div className="creatorFinal__photoUpload">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="creatorFinal__fileInput"
          onChange={handlePhotoSelect}
        />
        <div className="creatorFinal__photoGrid">
          <button
            type="button"
            className="creatorFinal__photoBtn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
          >
            <img src={plusIcon} alt="" className="creatorFinal__photoIcon" />
            <span className="creatorFinal__photoText">
              {uploadingPhoto ? 'Загрузка...' : 'Загрузить фото'}
            </span>
          </button>
          {photoPreviews.map((src, i) => (
            <div key={i} className="creatorFinal__photoPreview">
              <img src={src} alt="" className="creatorFinal__photoPreviewImg" />
            </div>
          ))}
        </div>
      </div>

      <div className="creatorFinal__socialCard">
        <div className="creatorFinal__socialHeader">
          <h2 className="creatorFinal__socialTitle">Социальные сети</h2>
          <p className="creatorFinal__socialSubtitle">
            Можете поделиться ссылками на свои публичные социальные сети
          </p>
          <img src={socialMediaDecor} alt="" className="creatorFinal__decorSocial" />
        </div>

        <div className="creatorFinal__socialFields">
          {[
            { icon: iconTelegram, placeholder: 'Вставьте ссылку на telegram-канал', value: telegramChannel, onChange: (v: string) => setTelegramChannel(v) },
            { icon: iconVk,       placeholder: 'Вставьте ссылку vk',             value: vk,              onChange: (v: string) => setVk(v) },
            { icon: iconTiktok,   placeholder: 'Вставьте ссылку tik-tok',        value: tiktok,          onChange: (v: string) => setTiktok(v) },
            { icon: iconYoutube,  placeholder: 'Вставьте ссылку на youtube',     value: youtube,         onChange: (v: string) => setYoutube(v) },
            { icon: iconDzen,     placeholder: 'Вставьте ссылку на dzen',        value: dzen,            onChange: (v: string) => setDzen(v) },
          ].map(({ icon, placeholder, value, onChange }, i) => (
            <div key={i} className="creatorFinal__socialRow">
              <div className={`creatorFinal__socialIcon${value.trim() ? ' creatorFinal__socialIcon--active' : ''}`}>
                <img src={icon} alt="" />
              </div>
              <input
                type="text"
                className="creatorFinal__socialInput"
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="creatorFinal__footer">
        <button type="button" className="creatorFinal__skipBtn" onClick={handleSkip} disabled={isLoading}>
          {isEditMode ? 'Отмена' : 'Пропустить'}
        </button>
        <button type="button" className="creatorFinal__saveBtn" onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}
