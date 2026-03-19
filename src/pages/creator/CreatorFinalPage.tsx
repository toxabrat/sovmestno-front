import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatorRegistration } from '../../context/CreatorRegistrationContext'
import { updateCreatorProfile, uploadImage, addCreatorPhoto } from '../../api/auth'
import './CreatorFinalPage.css'

import plusIcon from '../../assets/icons/plus-icon.svg'
import socialMediaDecor from '../../assets/icons/social media.png'
import iconTelegram from '../../assets/icons/space_sign_up4/Vector(1).png'
import iconVk from '../../assets/icons/space_sign_up4/Vector(2).png'
import iconTiktok from '../../assets/icons/space_sign_up4/Vector(3).png'
import iconYoutube from '../../assets/icons/space_sign_up4/Vector(4).png'
import iconDzen from '../../assets/icons/space_sign_up4/Vector(5).png'

export function CreatorFinalPage() {
  const navigate = useNavigate()
  const { data } = useCreatorRegistration()

  const [telegramChannel, setTelegramChannel] = useState(data.telegramChannel)
  const [vk, setVk] = useState(data.vkLink)
  const [tiktok, setTiktok] = useState(data.tiktokLink)
  const [youtube, setYoutube] = useState(data.youtubeLink)
  const [dzen, setDzen] = useState(data.dzenLink)

  const [isLoading, setIsLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !data.token) return
    setUploadingPhoto(true)
    try {
      const preview = URL.createObjectURL(file)
      setPhotoPreviews(prev => [...prev, preview])
      const img = await uploadImage(file, 'venue-photo', data.token)
      await addCreatorPhoto(img.id, data.token)
    } catch (err) {
      console.error('Photo upload failed:', err)
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleBack = () => navigate('/creator/create')
  const handleSkip = () => navigate('/creator/success')

  const handleSave = async () => {
    if (!data.token || !data.userId || !data.name) {
      navigate('/creator/success')
      return
    }
    setIsLoading(true)
    try {
      await updateCreatorProfile(data.userId, {
        name: data.name,
        tg_channel_link: telegramChannel,
        vk_link: vk,
        tiktok_link: tiktok,
        youtube_link: youtube,
        dzen_link: dzen,
      }, data.token)
      navigate('/creator/success')
    } catch (err) {
      console.error('Error saving profile:', err)
      navigate('/creator/success')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="creatorFinal">
      <header className="creatorFinal__header">
        <button type="button" className="creatorFinal__backBtn" onClick={handleBack} aria-label="Назад">←</button>
        <div className="creatorFinal__headerText">
          <h1 className="creatorFinal__title">Ииии... финальный штрих!</h1>
          <p className="creatorFinal__subtitle">
            Вы можете добавить ссылки на свои социальные сети. Это поможет площадкам узнать о вас больше.
            Добавить фотографии портфолио можно будет позже из профиля.
          </p>
        </div>
      </header>

      <div className="creatorFinal__photoUpload">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
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
            { icon: iconTelegram, placeholder: 'Вставьте ссылку telegram-канал', value: telegramChannel, set: setTelegramChannel },
            { icon: iconVk,       placeholder: 'Вставьте ссылку vk',             value: vk,             set: setVk },
            { icon: iconTiktok,   placeholder: 'Вставьте ссылку tik-tok',        value: tiktok,         set: setTiktok },
            { icon: iconYoutube,  placeholder: 'Вставьте ссылку на youtube',     value: youtube,        set: setYoutube },
            { icon: iconDzen,     placeholder: 'Вставьте ссылку на dzen',        value: dzen,           set: setDzen },
          ].map(({ icon, placeholder, value, set }, i) => (
            <div key={i} className="creatorFinal__socialRow">
              <div className="creatorFinal__socialIcon">
                <img src={icon} alt="" />
              </div>
              <input
                type="text"
                className="creatorFinal__socialInput"
                placeholder={placeholder}
                value={value}
                onChange={e => set(e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="creatorFinal__footer">
        <button type="button" className="creatorFinal__skipBtn" onClick={handleSkip} disabled={isLoading}>
          Пропустить
        </button>
        <button type="button" className="creatorFinal__saveBtn" onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}
