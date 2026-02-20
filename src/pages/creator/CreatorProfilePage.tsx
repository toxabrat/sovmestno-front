import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchCreatorProfile, fetchImageUrl } from '../../api/auth'
import type { CreatorProfile } from '../../api/auth'
import './CreatorProfilePage.css'

import iconSocial from '../../assets/playground_profile/Frame 2131328057.png'
import iconTelegram from '../../assets/icons/space_sign_up4/Vector(1).png'
import iconVk       from '../../assets/icons/space_sign_up4/Vector(2).png'
import iconTiktok   from '../../assets/icons/space_sign_up4/Vector(3).png'
import iconDzen     from '../../assets/icons/space_sign_up4/Vector(4).png'


const SOCIAL_CONFIG = {
  vk:     { icon: iconVk       },
  tg:     { icon: iconTelegram },
  tiktok: { icon: iconTiktok   },
  dzen:   { icon: iconDzen     },
}
type SocialType = keyof typeof SOCIAL_CONFIG

function SocialBadge({ href, label, type }: { href: string; label: string; type: SocialType }) {
  const fullHref = href.startsWith('http') ? href : `https://${href}`
  return (
    <a
      href={fullHref}
      target="_blank"
      rel="noopener noreferrer"
      className="creatorProfile__socialBadge"
    >
      <img src={SOCIAL_CONFIG[type].icon} alt="" className="creatorProfile__socialBadgeImg" />
      <span className="creatorProfile__socialBadgeLabel">{label}</span>
    </a>
  )
}


export function CreatorProfilePage() {
  const { user, token } = useAuth()

  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id || !token) return
    setIsLoading(true)
    fetchCreatorProfile(user.id, token)
      .then(data => {
        setProfile(data)
        const photoId = data.photo?.id ?? data.photo_id
        if (photoId) fetchImageUrl(photoId, token).then(setPhotoUrl).catch(() => {})
      })
      .catch(err => {
        console.error('Failed to load creator profile:', err)
        setError('Не удалось загрузить профиль')
      })
      .finally(() => setIsLoading(false))
  }, [user?.id, token])

  const clean = (s: string, prefix?: string) =>
    s.replace(/^https?:\/\//, '').replace(prefix ? new RegExp(`^${prefix}/?@?`) : /x/, '').replace(/\/$/, '')

  const socials: Array<{ href: string; label: string; type: SocialType }> = []
  if (profile?.vk_link)          socials.push({ href: profile.vk_link,          label: clean(profile.vk_link, 'vk\\.com'), type: 'vk' })
  if (profile?.tg_channel_link)  socials.push({ href: profile.tg_channel_link,  label: clean(profile.tg_channel_link, 't\\.me'),  type: 'tg' })
  if (profile?.tg_personal_link) socials.push({ href: profile.tg_personal_link, label: clean(profile.tg_personal_link, 't\\.me'), type: 'tg' })
  if (profile?.tiktok_link)      socials.push({ href: profile.tiktok_link,      label: clean(profile.tiktok_link),  type: 'tiktok' })
  if (profile?.dzen_link)        socials.push({ href: profile.dzen_link,        label: clean(profile.dzen_link),    type: 'dzen' })

  if (isLoading) return <div className="creatorProfile__state">Загрузка...</div>
  if (error || !profile) return <div className="creatorProfile__state creatorProfile__state--error">{error ?? 'Профиль не найден'}</div>

  return (
    <div className="creatorProfile">
      <div className="creatorProfile__content">
        <div className="creatorProfile__layout">

          <div className="creatorProfile__card">
            <div className="creatorProfile__identity">
              <div className="creatorProfile__avatarWrap">
                <div className="creatorProfile__avatar">
                  {photoUrl
                    ? <img src={photoUrl} alt="" className="creatorProfile__avatarImg" />
                    : <div className="creatorProfile__avatarPlaceholder" />}
                </div>
                <span className="creatorProfile__onlineDot" />
              </div>

              <div className="creatorProfile__info">
                <h1 className="creatorProfile__name">{profile.name}</h1>
                {profile.description && (
                  <p className="creatorProfile__desc">{profile.description}</p>
                )}
              </div>
            </div>

            <div className="creatorProfile__actions">
              <button type="button" className="creatorProfile__saveBtn">
                Сохранить
              </button>
              <button type="button" className="creatorProfile__proposeBtn">
                Предложить сотрудничать
              </button>
            </div>
          </div>

          {socials.length > 0 && (
            <aside className="creatorProfile__sidebar">
              <div className="creatorProfile__sideCard">
                <div className="creatorProfile__sideHeader">
                  <img src={iconSocial} alt="" className="creatorProfile__sideIcon" />
                  <span className="creatorProfile__sideTitle">Социальные сети</span>
                </div>
                <div className="creatorProfile__socialList">
                  {socials.map((s, i) => (
                    <SocialBadge key={i} {...s} />
                  ))}
                </div>
              </div>
            </aside>
          )}

        </div>
      </div>
    </div>
  )
}
