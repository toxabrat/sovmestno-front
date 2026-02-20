import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSpaceRegistration } from '../../context/SpaceRegistrationContext'
import { updateVenueProfile, uploadImage } from '../../api/auth'
import './SpaceFinalPage.css'

import plusIcon from '../../assets/icons/plus-icon.svg'
import socialMediaDecor from '../../assets/icons/social media.png'
import iconTelegram from '../../assets/icons/space_sign_up4/Vector(1).png'
import iconVk from '../../assets/icons/space_sign_up4/Vector(2).png'
import iconTiktok from '../../assets/icons/space_sign_up4/Vector(3).png'
import iconYoutube from '../../assets/icons/space_sign_up4/Vector(4).png'
import iconDzen from '../../assets/icons/space_sign_up4/Vector(5).png'

const EVENT_FORMATS = [
  'Лекции',
  'Концерты',
  'Мастер-классы',
  'Игры',
  'Выставки',
  'Разговорные клубы',
  'Показы',
  'Обмен',
]

export function SpaceFinalPage() {
  const navigate = useNavigate()
  const { data, updateData } = useSpaceRegistration()

  const photoInputRef = useRef<HTMLInputElement>(null)

  const [photos, setPhotos] = useState<Array<{ preview: string; uploading: boolean }>>([])
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [telegram, setTelegram] = useState(data.telegramChannel)
  const [vk, setVk] = useState(data.vkLink)
  const [tiktok, setTiktok] = useState(data.tiktokLink)
  const [youtube, setYoutube] = useState(data.youtubeLink)
  const [dzen, setDzen] = useState(data.dzenLink)
  const [isLoading, setIsLoading] = useState(false)

  const allSelected = selectedFormats.length === EVENT_FORMATS.length

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedFormats([])
    } else {
      setSelectedFormats([...EVENT_FORMATS])
    }
  }

  const toggleFormat = (format: string) => {
    if (selectedFormats.includes(format)) {
      setSelectedFormats(selectedFormats.filter(f => f !== format))
    } else {
      setSelectedFormats([...selectedFormats, format])
    }
  }

  const handleBack = () => {
    navigate('/space/create')
  }

  const handlePhotoClick = () => {
    photoInputRef.current?.click()
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    for (const file of files) {
      const preview = URL.createObjectURL(file)
      const idx = photos.length
      setPhotos(prev => [...prev, { preview, uploading: true }])

      if (data.token) {
        try {
          await uploadImage(file, 'venue-photo', data.token)
        } catch (err) {
          console.error('Error uploading venue photo:', err)
        }
      }

      setPhotos(prev => prev.map((p, i) => i === idx ? { ...p, uploading: false } : p))
    }

    e.target.value = ''
  }

  const handleSkip = () => {
    navigate('/space/success')
  }

  const submitData = async () => {
    if (!data.token || !data.userId) {
      console.error('No token or userId, navigating to success anyway')
      navigate('/space/success')
      return
    }

    setIsLoading(true)

    try {
      const streetAddress = [data.city, data.street].filter(Boolean).join(', ')
      await updateVenueProfile(data.userId, {
        name: data.name,
        description: data.description || undefined,
        street_address: streetAddress || undefined,
        tg_channel_link: telegram || undefined,
        vk_link: vk || undefined,
        tiktok_link: tiktok || undefined,
        youtube_link: youtube || undefined,
        dzen_link: dzen || undefined,
      }, data.token)

      updateData({
        telegramChannel: telegram,
        vkLink: vk,
        tiktokLink: tiktok,
        youtubeLink: youtube,
        dzenLink: dzen,
      })

      navigate('/space/success')
    } catch (err) {
      console.error('Error updating venue social links:', err)
      navigate('/space/success')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    submitData()
  }

  return (
    <div className="spaceFinal">
      <header className="spaceFinal__header">
        <button 
          type="button" 
          className="spaceFinal__backBtn"
          onClick={handleBack}
          aria-label="Назад"
        >
          ←
        </button>
        <div className="spaceFinal__headerText">
          <h1 className="spaceFinal__title">Ииии... финальный штрих!</h1>
          <p className="spaceFinal__subtitle">
            Вы можете добавить подробные снимки пространства, рассказать о своих пожеланиях
            и поделиться ссылками на соц сети. Сделать это можно позже из своего профиля
          </p>
        </div>
      </header>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoChange}
        style={{ display: 'none' }}
      />

      <div className="spaceFinal__photoUpload">
        <div className="spaceFinal__photoGallery">
          <button type="button" className="spaceFinal__photoBtn" onClick={handlePhotoClick}>
            <img src={plusIcon} alt="" className="spaceFinal__photoIcon" />
            <span className="spaceFinal__photoText">Загрузить фото</span>
          </button>

          {photos.map((photo, i) => (
            <div key={i} className="spaceFinal__photoThumb">
              <img src={photo.preview} alt="" className="spaceFinal__photoThumbImg" />
              {photo.uploading && <div className="spaceFinal__photoThumbOverlay" />}
            </div>
          ))}
        </div>
      </div>

      <div className="spaceFinal__formatsCard">
        <div className="spaceFinal__formatsHeader">
          <h2 className="spaceFinal__formatsTitle">Какие форматы вам интересны</h2>
          <p className="spaceFinal__formatsSubtitle">
            Выберете форматы мероприятий, которые вы хотели бы проводить в своём пространстве
          </p>
        </div>
        
        <div className="spaceFinal__formatsContent">
          <label className="spaceFinal__selectAll">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              className="spaceFinal__checkbox"
            />
            <span className="spaceFinal__checkboxCustom"></span>
            <span className="spaceFinal__selectAllText">Выбрать всё</span>
          </label>

          <div className="spaceFinal__tags">
            {EVENT_FORMATS.map((format) => (
              <button
                key={format}
                type="button"
                className={`spaceFinal__tag ${selectedFormats.includes(format) ? 'spaceFinal__tag--selected' : ''}`}
                onClick={() => toggleFormat(format)}
              >
                {format}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="spaceFinal__socialCard">
        <div className="spaceFinal__socialHeader">
          <h2 className="spaceFinal__socialTitle">Социальные сети</h2>
          <p className="spaceFinal__socialSubtitle">
            Можете поделиться своими ссылками на свои публичные социальные сети
          </p>

          <img src={socialMediaDecor} alt="" className="spaceFinal__decorSocial" />
        </div>

        <div className="spaceFinal__socialFields">
          <div className="spaceFinal__socialRow">
            <div className="spaceFinal__socialIcon">
              <img src={iconTelegram} alt="Telegram" />
            </div>
            <input
              type="text"
              className="spaceFinal__socialInput"
              placeholder="Вставьте ссылку telegram-канал"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
            />
          </div>

          <div className="spaceFinal__socialRow">
            <div className="spaceFinal__socialIcon">
              <img src={iconVk} alt="VK" />
            </div>
            <input
              type="text"
              className="spaceFinal__socialInput"
              placeholder="Вставьте ссылку vk"
              value={vk}
              onChange={(e) => setVk(e.target.value)}
            />
          </div>

          <div className="spaceFinal__socialRow">
            <div className="spaceFinal__socialIcon">
              <img src={iconTiktok} alt="TikTok" />
            </div>
            <input
              type="text"
              className="spaceFinal__socialInput"
              placeholder="Вставьте ссылку tik-tok"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
            />
          </div>

          <div className="spaceFinal__socialRow">
            <div className="spaceFinal__socialIcon">
              <img src={iconYoutube} alt="YouTube" />
            </div>
            <input
              type="text"
              className="spaceFinal__socialInput"
              placeholder="Вставьте ссылку на youtube"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
            />
          </div>

          <div className="spaceFinal__socialRow">
            <div className="spaceFinal__socialIcon">
              <img src={iconDzen} alt="Dzen" />
            </div>
            <input
              type="text"
              className="spaceFinal__socialInput"
              placeholder="Вставьте ссылку на dzen"
              value={dzen}
              onChange={(e) => setDzen(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="spaceFinal__footer">
        <button
          type="button"
          className="spaceFinal__skipBtn"
          onClick={handleSkip}
          disabled={isLoading}
        >
          {isLoading ? 'Загрузка...' : 'Пропустить'}
        </button>
        <button
          type="button"
          className="spaceFinal__saveBtn"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Загрузка...' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}
