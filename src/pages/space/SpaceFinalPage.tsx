import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [telegram, setTelegram] = useState('')
  const [vk, setVk] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [youtube, setYoutube] = useState('')
  const [dzen, setDzen] = useState('')

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

  const handleSkip = () => {
    navigate('/space/success')
  }

  const handleSave = () => {
    console.log({
      selectedFormats,
      telegram,
      vk,
      tiktok,
      youtube,
      dzen,
    })
    navigate('/space/success')
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

      <div className="spaceFinal__photoUpload">
        <button type="button" className="spaceFinal__photoBtn">
          <img src={plusIcon} alt="" className="spaceFinal__photoIcon" />
          <span className="spaceFinal__photoText">Загрузить фото</span>
        </button>
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
        >
          Пропустить
        </button>
        <button 
          type="button" 
          className="spaceFinal__saveBtn"
          onClick={handleSave}
        >
          Сохранить
        </button>
      </div>
    </div>
  )
}
