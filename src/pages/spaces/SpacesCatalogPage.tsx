import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchVenues, fetchImageUrl } from '../../api/auth'
import type { VenueListItem } from '../../api/auth'
import './SpacesCatalogPage.css'

import heroBanner from '../../assets/icons/space_catalog/Frame 2131327750.png'

function PinIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5S5.17 3.5 6 3.5 7.5 4.17 7.5 5 6.83 6.5 6 6.5z" fill="currentColor"/>
    </svg>
  )
}


function VenueCard({ venue: initialVenue, token }: { venue: VenueListItem; token: string | null }) {
  const [venue, setVenue] = useState<VenueListItem>(initialVenue)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!token || (initialVenue.description && (initialVenue.street_address || initialVenue.address))) return
    let cancelled = false
    fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/user/users/venues/${initialVenue.user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && !cancelled) setVenue(prev => ({ ...prev, ...data }))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [initialVenue.user_id, token, initialVenue.description, initialVenue.street_address, initialVenue.address])

  useEffect(() => {
    if (!token) return
    let cancelled = false

    const coverId = venue.cover_photo_id ?? (venue.cover_photo as { id?: number } | undefined)?.id
    const logoId = venue.logo_id ?? (venue.logo as { id?: number } | undefined)?.id

    if (coverId) {
      fetchImageUrl(coverId, token)
        .then((url) => { if (!cancelled) setCoverUrl(url) })
        .catch(() => {})
    }

    if (logoId) {
      fetchImageUrl(logoId, token)
        .then((url) => { if (!cancelled) setLogoUrl(url) })
        .catch(() => {})
    }

    return () => { cancelled = true }
  }, [venue.cover_photo_id, venue.logo_id, venue.cover_photo, venue.logo, token])

  return (
    <div className="venueCard">
      <div className="venueCard__cover">
        {coverUrl ? (
          <img src={coverUrl} alt={venue.name} className="venueCard__coverImg" />
        ) : (
          <div className="venueCard__coverPlaceholder" />
        )}
      </div>

      <div className="venueCard__body">
        <div className="venueCard__nameRow">
          <div className="venueCard__logo">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="venueCard__logoImg" />
            ) : (
              <div className="venueCard__logoPlaceholder" />
            )}
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

        <button type="button" className="venueCard__proposeBtn">
          Предложить мероприятие
        </button>
      </div>
    </div>
  )
}

export function SpacesCatalogPage() {
  const { token } = useAuth()
  const [venues, setVenues] = useState<VenueListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const limit = 9

  useEffect(() => {
    setIsLoading(true)
    fetchVenues(token, limit, offset)
      .then((res) => {
        setVenues(res.data ?? [])
        setTotal(res.total ?? 0)
      })
      .catch((err) => {
        console.error('Failed to fetch venues:', err)
        setVenues([])
      })
      .finally(() => setIsLoading(false))
  }, [token, offset])

  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <div className="spacesCatalog">
      <div className="spacesCatalog__content">
        <img src={heroBanner} alt="Места для лучшего сотрудничества" className="spacesCatalog__heroBanner" />

        <h2 className="spacesCatalog__title">Каталог пространств</h2>

        {isLoading ? (
          <div className="spacesCatalog__loading">Загрузка...</div>
        ) : venues.length === 0 ? (
          <div className="spacesCatalog__empty">Пространства не найдены</div>
        ) : (
          <>
            <div className="spacesCatalog__grid">
              {venues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} token={token} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="spacesCatalog__pagination">
                <button
                  type="button"
                  className="spacesCatalog__pageBtn"
                  disabled={currentPage === 1}
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                >
                  ←
                </button>
                <span className="spacesCatalog__pageInfo">
                  {currentPage} из {totalPages}
                </span>
                <button
                  type="button"
                  className="spacesCatalog__pageBtn"
                  disabled={currentPage === totalPages}
                  onClick={() => setOffset(offset + limit)}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
