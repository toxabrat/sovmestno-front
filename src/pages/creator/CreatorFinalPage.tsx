import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatorRegistration } from '../../context/CreatorRegistrationContext'
import { updateCreatorProfile } from '../../api/auth'
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

  const handleBack = () => {
    navigate('/creator/create')
  }

  const submitSocialLinks = async (socialData: {
    telegramChannel: string
    vk: string
    tiktok: string
    youtube: string
    dzen: string
  }) => {
    if (!data.token || !data.userId) {
      console.error('No token or userId in context')
      navigate('/creator/success')
      return
    }
    
    setIsLoading(true)
    
    console.log('=== Update Social Links ===')
    console.log('userId:', data.userId)
    console.log('socialData:', socialData)
    
    try {
      await updateCreatorProfile(data.userId, {
        tg_channel_link: socialData.telegramChannel,
        vk_link: socialData.vk,
        tiktok_link: socialData.tiktok,
        youtube_link: socialData.youtube,
        dzen_link: socialData.dzen,
      }, data.token)
      
      console.log('Social links updated successfully')
      navigate('/creator/success')
    } catch (err) {
      console.error('Error updating social links:', err)
      navigate('/creator/success')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    navigate('/creator/success')
  }

  const handleSave = () => {
    submitSocialLinks({
      telegramChannel,
      vk,
      tiktok,
      youtube,
      dzen,
    })
  }

  return (
    <div className="creatorFinal">
      <header className="creatorFinal__header">
        <button 
          type="button" 
          className="creatorFinal__backBtn"
          onClick={handleBack}
          aria-label="Назад"
        >
          ←
        </button>
        <div className="creatorFinal__headerText">
          <h1 className="creatorFinal__title">Ииии... финальный штрих!</h1>
          <p className="creatorFinal__subtitle">
            Вы можете добавить фотографии ранее проведённых мероприятий, примеры своих работ или всё то, 
            что посчитаете нужным для своего портфолио. Сделать это можно позже из своего профиля
          </p>
        </div>
      </header>

      <div className="creatorFinal__photoUpload">
        <button type="button" className="creatorFinal__photoBtn">
          <img src={plusIcon} alt="" className="creatorFinal__photoIcon" />
          <span className="creatorFinal__photoText">Загрузить фото</span>
        </button>
      </div>

      <div className="creatorFinal__socialCard">
        <div className="creatorFinal__socialHeader">
          <h2 className="creatorFinal__socialTitle">Социальные сети</h2>
          <p className="creatorFinal__socialSubtitle">
            Можете поделиться своими ссылками на свои публичные социальные сети
          </p>

          <img src={socialMediaDecor} alt="" className="creatorFinal__decorSocial" />
        </div>

        <div className="creatorFinal__socialFields">
          <div className="creatorFinal__socialRow">
            <div className="creatorFinal__socialIcon">
              <img src={iconTelegram} alt="Telegram" />
            </div>
            <input
              type="text"
              className="creatorFinal__socialInput"
              placeholder="Вставьте ссылку telegram-канал"
              value={telegramChannel}
              onChange={(e) => setTelegramChannel(e.target.value)}
            />
          </div>

          <div className="creatorFinal__socialRow">
            <div className="creatorFinal__socialIcon">
              <img src={iconVk} alt="VK" />
            </div>
            <input
              type="text"
              className="creatorFinal__socialInput"
              placeholder="Вставьте ссылку vk"
              value={vk}
              onChange={(e) => setVk(e.target.value)}
            />
          </div>

          <div className="creatorFinal__socialRow">
            <div className="creatorFinal__socialIcon">
              <img src={iconTiktok} alt="TikTok" />
            </div>
            <input
              type="text"
              className="creatorFinal__socialInput"
              placeholder="Вставьте ссылку tik-tok"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
            />
          </div>

          <div className="creatorFinal__socialRow">
            <div className="creatorFinal__socialIcon">
              <img src={iconYoutube} alt="YouTube" />
            </div>
            <input
              type="text"
              className="creatorFinal__socialInput"
              placeholder="Вставьте ссылку на youtube"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
            />
          </div>

          <div className="creatorFinal__socialRow">
            <div className="creatorFinal__socialIcon">
              <img src={iconDzen} alt="Dzen" />
            </div>
            <input
              type="text"
              className="creatorFinal__socialInput"
              placeholder="Вставьте ссылку на dzen"
              value={dzen}
              onChange={(e) => setDzen(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="creatorFinal__footer">
        <button 
          type="button" 
          className="creatorFinal__skipBtn"
          onClick={handleSkip}
          disabled={isLoading}
        >
          {isLoading ? 'Загрузка...' : 'Пропустить'}
        </button>
        <button 
          type="button" 
          className="creatorFinal__saveBtn"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Загрузка...' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}
