import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchCreators, fetchImageUrl } from '../../api/auth'
import type { CreatorListItem } from '../../api/auth'
import { Footer } from '../../components/layout/Footer'
import './CreatorsCatalogPage.css'

import bannerBg from '../../assets/icons/creator_directory/Frame 2131328280.png'
import searchIcon from '../../assets/icons/creator_directory/A_IconSearch.png'

function CreatorCard({ creator }: { creator: CreatorListItem }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!creator.photo_id) return
    let cancelled = false
    fetchImageUrl(creator.photo_id).then(url => { if (!cancelled) setPhotoUrl(url) }).catch(() => {})
    return () => { cancelled = true }
  }, [creator.photo_id])

  return (
    <Link to={`/creator/profile/${creator.user_id}`} className="ccCard">
      <div className="ccCard__avatar">
        {photoUrl ? <img src={photoUrl} alt="" /> : <div className="ccCard__avatarPlaceholder" />}
      </div>
      <div className="ccCard__info">
        <span className="ccCard__name">{creator.name}</span>
      </div>
    </Link>
  )
}

const LIMIT = 20

export function CreatorsCatalogPage() {
  const { token } = useAuth()

  const [creators, setCreators] = useState<CreatorListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setIsLoading(true)
    fetchCreators(token, LIMIT, offset)
      .then(res => {
        setCreators(res.data)
        setTotal(res.total)
      })
      .catch(() => setCreators([]))
      .finally(() => setIsLoading(false))
  }, [token, offset])

  const filtered = search.trim()
    ? creators.filter(c => c.name.toLowerCase().includes(search.trim().toLowerCase()))
    : creators

  const totalPages = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  return (
    <div className="ccPage">
      <div className="ccPage__content">

        <div className="ccPage__banner">
          <img src={bannerBg} alt="" className="ccPage__bannerImg" />
          <div className="ccPage__bannerOverlay">
            <h1 className="ccPage__bannerTitle">Креаторы —</h1>
            <p className="ccPage__bannerDesc">
              Креаторы — люди, которые хотят провести мероприятия.
              Ищите инициативы в каталоге или в личных профилях креаторов.
            </p>
          </div>
        </div>

        <div className="ccPage__search">
          <img src={searchIcon} alt="" className="ccPage__searchIcon" />
          <input
            type="text"
            className="ccPage__searchInput"
            placeholder="Поиск по имени среди креаторов"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="ccPage__loading">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className="ccPage__empty">Креаторы не найдены</div>
        ) : (
          <div className="ccPage__grid">
            {filtered.map(c => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="ccPage__pagination">
            <button
              type="button"
              className="ccPage__pageBtn"
              disabled={currentPage === 1}
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
            >←</button>
            <span className="ccPage__pageInfo">{currentPage} из {totalPages}</span>
            <button
              type="button"
              className="ccPage__pageBtn"
              disabled={currentPage === totalPages}
              onClick={() => setOffset(offset + LIMIT)}
            >→</button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
