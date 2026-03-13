import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchVenues, fetchImageUrl } from '../../api/auth'
import type { VenueListItem } from '../../api/auth'
import { Footer } from '../../components/layout/Footer'
import './SpacesCatalogPage.css'

import heroBg from '../../assets/icons/space_catalog_new/Frame 2131328255.png'
import categoryBanner from '../../assets/icons/space_catalog_new/Frame 2131328255(1).png'
import iconVenueTag from '../../assets/icons/space_catalog_new/Frame 2131328054.png'

function PinIcon() {
  return (
    <svg width="11" height="13" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5S5.17 3.5 6 3.5 7.5 4.17 7.5 5 6.83 6.5 6 6.5z" fill="currentColor"/>
    </svg>
  )
}

function VenueCard({
  venue: initialVenue,
  token,
  isCreator,
}: {
  venue: VenueListItem
  token: string | null
  isCreator: boolean
}) {
  const [venue, setVenue] = useState<VenueListItem>(initialVenue)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (initialVenue.description && (initialVenue.street_address || initialVenue.address)) return
    let cancelled = false
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/user/users/venues/${initialVenue.user_id}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && !cancelled) setVenue(prev => ({ ...prev, ...data })) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [initialVenue.user_id, token, initialVenue.description, initialVenue.street_address, initialVenue.address])

  useEffect(() => {
    if (!token) return
    let cancelled = false
    const coverId = venue.cover_photo_id ?? (venue.cover_photo as { id?: number } | undefined)?.id
    const logoId = venue.logo_id ?? (venue.logo as { id?: number } | undefined)?.id
    if (coverId) fetchImageUrl(coverId, token).then(u => { if (!cancelled) setCoverUrl(u) }).catch(() => {})
    if (logoId) fetchImageUrl(logoId, token).then(u => { if (!cancelled) setLogoUrl(u) }).catch(() => {})
    return () => { cancelled = true }
  }, [venue.cover_photo_id, venue.logo_id, venue.cover_photo, venue.logo, token])

  return (
    <div className="venueCard">
      <div className="venueCard__cover">
        {coverUrl
          ? <img src={coverUrl} alt={venue.name} className="venueCard__coverImg" />
          : <div className="venueCard__coverPlaceholder" />}
      </div>

      <div className="venueCard__body">
        <div className="venueCard__nameRow">
          <div className="venueCard__logo">
            {logoUrl
              ? <img src={logoUrl} alt="" className="venueCard__logoImg" />
              : <div className="venueCard__logoPlaceholder" />}
          </div>
          <span className="venueCard__name">{venue.name}</span>
        </div>

        {venue.description && (
          <p className="venueCard__desc">{venue.description}</p>
        )}

        {(venue.street_address || venue.address) && (
          <div className="venueCard__address">
            <PinIcon />
            <span>{venue.street_address ?? venue.address}</span>
          </div>
        )}

        {isCreator && (
          <div className="venueCard__actions">
            <button type="button" className="venueCard__saveBtn">Сохранить</button>
            <button type="button" className="venueCard__proposeBtn">Предложить мероприятие</button>
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryBannerRow({
  venue,
  token,
  isCreator,
}: {
  venue: VenueListItem | null
  token: string | null
  isCreator: boolean
}) {
  return (
    <div className="spacesCatalog__categoryRow">
      <div className="spacesCatalog__categoryBanner">
        <img src={categoryBanner} alt="Отмечаем лучшие места в каждой категории" className="spacesCatalog__categoryBannerImg" />
      </div>
      {venue && (
        <VenueCard venue={venue} token={token} isCreator={isCreator} />
      )}
    </div>
  )
}

function HeroBanner({ featuredVenue, token }: { featuredVenue: VenueListItem | null; token: string | null }) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!featuredVenue || !token) return
    let cancelled = false
    const coverId = featuredVenue.cover_photo_id ?? (featuredVenue.cover_photo as { id?: number } | undefined)?.id
    if (coverId) fetchImageUrl(coverId, token).then(u => { if (!cancelled) setCoverUrl(u) }).catch(() => {})
    return () => { cancelled = true }
  }, [featuredVenue, token])

  return (
    <div className="heroBanner">
      <div className="heroBanner__left">
        <img src={heroBg} alt="" className="heroBanner__bgImg" />
      </div>

      <div className="heroBanner__right">
        {featuredVenue ? (
          <>
            {coverUrl
              ? <img src={coverUrl} alt={featuredVenue.name} className="heroBanner__coverImg" />
              : <div className="heroBanner__coverPlaceholder" />}
            <div className="heroBanner__overlay">
              <div className="heroBanner__venueIcon">
                <img src={iconVenueTag} alt="" className="heroBanner__tagIcon" />
              </div>
              <div className="heroBanner__bottom">
                <div className="heroBanner__textBlock">
                  <h2 className="heroBanner__title">{featuredVenue.name}</h2>
                  {featuredVenue.description && (
                    <p className="heroBanner__desc">{featuredVenue.description}</p>
                  )}
                </div>
                <button type="button" className="heroBanner__btn">Перейти →</button>
              </div>
            </div>
          </>
        ) : (
          <div className="heroBanner__coverPlaceholder" />
        )}
      </div>
    </div>
  )
}

const LIMIT = 9

export function SpacesCatalogPage() {
  const { token, user } = useAuth()
  const isCreator = user?.role === 'creator'

  console.log('SpacesCatalog: user=', user, 'isCreator=', isCreator)

  const [venues, setVenues] = useState<VenueListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    setIsLoading(true)
    fetchVenues(token, LIMIT, offset)
      .then(res => {
        setVenues(res.data ?? [])
        setTotal(res.total ?? 0)
      })
      .catch(() => setVenues([]))
      .finally(() => setIsLoading(false))
  }, [token, offset])

  const totalPages = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  const featuredVenue = venues[0] ?? null
  const gridVenues = venues.slice(1)


  const BANNER_AFTER = 6
  const beforeBanner = gridVenues.slice(0, BANNER_AFTER)
  const bannerSideVenue = gridVenues[BANNER_AFTER] ?? null
  const afterBanner = gridVenues.slice(BANNER_AFTER + 1)

  return (
    <div className="spacesCatalog">
      <div className="spacesCatalog__content">

        <HeroBanner featuredVenue={featuredVenue} token={token} />

        {isLoading ? (
          <div className="spacesCatalog__loading">Загрузка...</div>
        ) : venues.length === 0 ? (
          <div className="spacesCatalog__empty">Пространства не найдены</div>
        ) : (
          <>
            <div className="spacesCatalog__grid">
              {beforeBanner.map(venue => (
                <VenueCard key={venue.id} venue={venue} token={token} isCreator={isCreator} />
              ))}
            </div>

            <CategoryBannerRow
              venue={bannerSideVenue}
              token={token}
              isCreator={isCreator}
            />

            {afterBanner.length > 0 && (
              <div className="spacesCatalog__grid spacesCatalog__grid--after">
                {afterBanner.map(venue => (
                  <VenueCard key={venue.id} venue={venue} token={token} isCreator={isCreator} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="spacesCatalog__pagination">
                <button
                  type="button"
                  className="spacesCatalog__pageBtn"
                  disabled={currentPage === 1}
                  onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                >←</button>
                <span className="spacesCatalog__pageInfo">{currentPage} из {totalPages}</span>
                <button
                  type="button"
                  className="spacesCatalog__pageBtn"
                  disabled={currentPage === totalPages}
                  onClick={() => setOffset(offset + LIMIT)}
                >→</button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
