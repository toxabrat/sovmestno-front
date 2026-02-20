import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchVenueProfile, fetchImageUrl } from '../../api/auth'
import type { VenueProfile } from '../../api/auth'
import './VenueProfilePage.css'

import iconPin from '../../assets/playground_profile/Group 1067450.png'
import iconSocial from '../../assets/playground_profile/Frame 2131328057.png'
import iconTelegram from '../../assets/icons/space_sign_up4/Vector(1).png'
import iconVk       from '../../assets/icons/space_sign_up4/Vector(2).png'
import iconTiktok   from '../../assets/icons/space_sign_up4/Vector(3).png'
import iconDzen     from '../../assets/icons/space_sign_up4/Vector(4).png'


function PhotoThumb({ imageId, token }: { imageId: number; token: string }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchImageUrl(imageId, token)
      .then(u => { if (!cancelled) setUrl(u) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [imageId, token])

  return (
    <div className="venueProfile__photoThumb">
      {url
        ? <img src={url} alt="" className="venueProfile__photoImg" />
        : <div className="venueProfile__photoPlaceholder" />}
    </div>
  )
}


const SOCIAL_CONFIG = {
  vk:     { icon: iconVk       },
  tg:     { icon: iconTelegram },
  tiktok: { icon: iconTiktok   },
  dzen:   { icon: iconDzen     },
}

type SocialType = keyof typeof SOCIAL_CONFIG

function SocialBadge({ href, label, type }: { href: string; label: string; type: SocialType }) {
  const cfg = SOCIAL_CONFIG[type]
  const fullHref = href.startsWith('http') ? href : `https://${href}`

  return (
    <a
      href={fullHref}
      target="_blank"
      rel="noopener noreferrer"
      className="venueProfile__socialBadge"
    >
      <img src={cfg.icon} alt="" className="venueProfile__socialBadgeImg" />
      <span className="venueProfile__socialBadgeLabel">{label}</span>
    </a>
  )
}


export function VenueProfilePage() {
  const { user, token } = useAuth()

  const [profile, setProfile] = useState<VenueProfile | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id || !token) return
    setIsLoading(true)
    fetchVenueProfile(user.id, token)
      .then(data => {
        setProfile(data)

        const coverId = data.cover_photo?.id ?? data.cover_photo_id
        const logoId  = data.logo?.id ?? data.logo_id

        if (coverId) fetchImageUrl(coverId, token).then(setCoverUrl).catch(() => {})
        if (logoId)  fetchImageUrl(logoId,  token).then(setLogoUrl).catch(() => {})
      })
      .catch(err => {
        console.error('Failed to load venue profile:', err)
        setError('Не удалось загрузить профиль')
      })
      .finally(() => setIsLoading(false))
  }, [user?.id, token])

  const address = profile?.street_address || profile?.address || ''

  const socials: Array<{ href: string; label: string; type: SocialType }> = []
  const clean = (s: string, prefix?: string) =>
    s.replace(/^https?:\/\//, '').replace(prefix ? new RegExp(`^${prefix}/?@?`) : /x/, '').replace(/\/$/, '')

  if (profile?.vk_link)          socials.push({ href: profile.vk_link,          label: clean(profile.vk_link, 'vk\\.com'), type: 'vk' })
  if (profile?.tg_channel_link)  socials.push({ href: profile.tg_channel_link,  label: clean(profile.tg_channel_link, 't\\.me'),  type: 'tg' })
  if (profile?.tg_personal_link) socials.push({ href: profile.tg_personal_link, label: clean(profile.tg_personal_link, 't\\.me'), type: 'tg' })
  if (profile?.tiktok_link)      socials.push({ href: profile.tiktok_link,      label: clean(profile.tiktok_link),  type: 'tiktok' })
  if (profile?.dzen_link)        socials.push({ href: profile.dzen_link,        label: clean(profile.dzen_link),    type: 'dzen' })

  const photoItems = (profile?.photos ?? []).filter(p => p?.image?.id)

  if (isLoading) return <div className="venueProfile__state">Загрузка...</div>
  if (error || !profile) return <div className="venueProfile__state venueProfile__state--error">{error ?? 'Профиль не найден'}</div>

  return (
    <div className="venueProfile">
      <div className="venueProfile__content">

        <div className="venueProfile__layout">

          <div className="venueProfile__main">
            <div className="venueProfile__card">

              <div className="venueProfile__cover">
                {coverUrl
                  ? <img src={coverUrl} alt="" className="venueProfile__coverImg" />
                  : <div className="venueProfile__coverPlaceholder" />}
              </div>

              <div className="venueProfile__cardBody">
                <div className="venueProfile__identity">
                  <div className="venueProfile__logo">
                    {logoUrl
                      ? <img src={logoUrl} alt="" className="venueProfile__logoImg" />
                      : <div className="venueProfile__logoPlaceholder" />}
                  </div>
                  <div className="venueProfile__nameBlock">
                    <h1 className="venueProfile__name">{profile.name}</h1>
                    {profile.description && (
                      <p className="venueProfile__desc">{profile.description}</p>
                    )}
                  </div>
                </div>

                <div className="venueProfile__actions">
                  <button type="button" className="venueProfile__saveBtn">
                    Сохранить
                  </button>
                  <button type="button" className="venueProfile__proposeBtn">
                    Предложить мероприятие
                  </button>
                </div>
              </div>

            </div>
          </div>

          <aside className="venueProfile__sidebar">
            {address && (
              <div className="venueProfile__sideCard">
                <div className="venueProfile__sideHeader">
                  <img src={iconPin} alt="" className="venueProfile__sideIcon" />
                  <span className="venueProfile__sideTitle">Адрес</span>
                </div>
                <p className="venueProfile__address">{address}</p>
              </div>
            )}

            {socials.length > 0 && (
              <div className="venueProfile__sideCard">
                <div className="venueProfile__sideHeader">
                  <img src={iconSocial} alt="" className="venueProfile__sideIcon" />
                  <span className="venueProfile__sideTitle">Социальные сети</span>
                </div>
                <div className="venueProfile__socialList">
                  {socials.map((s, i) => (
                    <SocialBadge key={i} {...s} />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {photoItems.length > 0 && (
          <section className="venueProfile__photos">
            <h2 className="venueProfile__photosTitle">Фотографии пространства</h2>
            <div className="venueProfile__photosGrid">
              {photoItems.map(p => (
                <PhotoThumb key={p.id} imageId={p.image.id} token={token!} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
