import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { uploadImage, fetchImageUrl } from '../../api/auth'
import { createEvent, updateEvent, publishEvent, fetchEventById, fetchCategories } from '../../api/events'
import type { Category } from '../../api/events'
import './CreateEventPage.css'


export function CreateEventPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit') ? Number(searchParams.get('edit')) : null
  const copyId = searchParams.get('copy') ? Number(searchParams.get('copy')) : null
  const { token } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverPhotoId, setCoverPhotoId] = useState<number | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [titleError, setTitleError] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    fetchCategories(token)
      .then(setCategories)
      .catch(() => {})
  }, [token])

  useEffect(() => {
    const sourceId = editId ?? copyId
    if (!sourceId) return
    fetchEventById(sourceId, token).then(ev => {
      setTitle(ev.title)
      setDescription(ev.description ?? '')
      setCoverPhotoId(ev.cover_photo_id ?? null)
      setSelectedCategories(ev.category_ids ?? [])
      if (ev.cover_photo_id) {
        fetchImageUrl(ev.cover_photo_id).then(setCoverPreview).catch(() => {})
      }
    }).catch(() => {})
  }, [editId, copyId, token])

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return
    setUploadingCover(true)
    try {
      setCoverPreview(URL.createObjectURL(file))
      const img = await uploadImage(file, 'event-cover', token)
      setCoverPhotoId(img.id)
    } catch (err) {
      console.error('Cover upload failed:', err)
    } finally {
      setUploadingCover(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id],
    )
  }

  const handlePublish = async () => {
    if (!title.trim()) {
      setTitleError('Поле не должно быть пустым')
      return
    }
    setTitleError(null)
    if (!token) return

    setIsPublishing(true)
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        cover_photo_id: coverPhotoId ?? undefined,
        category_ids: selectedCategories.length > 0 ? selectedCategories : undefined,
      }

      if (editId && !copyId) {
        await updateEvent(editId, payload, token)
        await publishEvent(editId, token).catch(() => {})
      } else {
        await createEvent(payload, token)
      }
      navigate('/events/success')
    } catch (err) {
      console.error('Publish failed:', err)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleDelete = () => {
    setTitle('')
    setDescription('')
    setSelectedCategories([])
    setCoverPreview(null)
    setCoverPhotoId(null)
    setTitleError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="ce">
      <div className="ce__inner">
        <header className="ce__header">
          <button type="button" className="ce__back" onClick={() => navigate(-1)} aria-label="Назад">
            ←
          </button>
          <div>
            <h1 className="ce__title">
              {copyId ? 'Разместить заново' : editId ? 'Редактировать мероприятие' : 'Давайте создадим мероприятие'}
            </h1>
            <p className="ce__subtitle">
              Вы можете добавить подробные снимки пространства, рассказать о своих пожеланиях
              и поделиться ссылками на соц сети. Сделать это можно позже из своего профиля
            </p>
          </div>
        </header>

        <div className="ce__card">
          <div className="ce__cardTop">
          <div className="ce__cardLeft">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="ce__fileInput"
              onChange={handleCoverSelect}
            />
            {coverPreview ? (
              <button
                type="button"
                className="ce__coverPreview"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCover}
              >
                <img src={coverPreview} alt="" className="ce__coverImg" />
              </button>
            ) : (
              <button
                type="button"
                className="ce__coverBtn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCover}
              >
                <span className="ce__coverPlus">+</span>
                <span className="ce__coverText">
                  {uploadingCover ? 'Загрузка...' : 'Загрузить фото'}
                </span>
              </button>
            )}
          </div>

          <div className="ce__cardRight">
            <div className="ce__fieldWrap">
              <input
                type="text"
                className={`ce__input ${titleError ? 'ce__input--error' : ''}`}
                placeholder="Название мероприятия"
                value={title}
                onChange={e => { setTitle(e.target.value); setTitleError(null) }}
              />
              {titleError && <p className="ce__fieldError">{titleError}</p>}
            </div>
            <div className="ce__textareaWrap">
              <textarea
                className="ce__textarea"
                placeholder="Расскажите о ценностях и атмосфере вашего мероприятия"
                value={description}
                onChange={e => { if (e.target.value.length <= 400) setDescription(e.target.value) }}
                rows={5}
              />
              <span className="ce__charCount">{description.length}/400</span>
            </div>

          </div>
        
          </div>
        <div className="ce__categorySection">
          <div className="ce__categorySectionLeft">
            <h2 className="ce__categoryTitle">Формат мероприятия</h2>
            <p className="ce__categoryDesc">
              Выберете наиболее близкий к вашей идее описание формата мероприятия
            </p>
          </div>
          <div className="ce__categoryChips">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`ce__chip ${selectedCategories.includes(cat.id) ? 'ce__chip--active' : ''}`}
                onClick={() => toggleCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        </div>
        <div className="ce__actions">
          <button type="button" className="ce__deleteBtn" onClick={handleDelete} disabled={isPublishing}>
            Удалить
          </button>
          <button type="button" className="ce__publishBtn" onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? 'Публикация...' : 'Опубликовать'}
          </button>
        </div>
      </div>
    </div>
  )
}
