import { useRef, useState, useCallback } from 'react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import './ImageCropModal.css'

interface Props {
  src: string
  aspect?: number
  circularCrop?: boolean
  onConfirm: (file: File, previewUrl: string) => void
  onCancel: () => void
}

function initCrop(aspect?: number): Crop {
  if (!aspect) {
    return { unit: '%', x: 10, y: 10, width: 80, height: 80 }
  }
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 80 }, aspect, 1, 1),
    100,
    100,
  )
}

async function cropToFile(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
  circularCrop: boolean,
): Promise<{ file: File; url: string }> {
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  const outW = Math.round(pixelCrop.width * scaleX)
  const outH = Math.round(pixelCrop.height * scaleY)

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')!

  if (circularCrop) {
    ctx.beginPath()
    ctx.arc(outW / 2, outH / 2, Math.min(outW, outH) / 2, 0, Math.PI * 2)
    ctx.clip()
  }

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    outW,
    outH,
    0,
    0,
    outW,
    outH,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) { reject(new Error('Canvas is empty')); return }
      const url = URL.createObjectURL(blob)
      resolve({ file: new File([blob], 'crop.jpg', { type: 'image/jpeg' }), url })
    }, 'image/jpeg', 0.92)
  })
}

export function ImageCropModal({ src, aspect, circularCrop = false, onConfirm, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>(() => initCrop(aspect))
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const [processing, setProcessing] = useState(false)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const initial = aspect
      ? centerCrop(makeAspectCrop({ unit: '%', width: 80 }, aspect, width, height), width, height)
      : { unit: '%' as const, x: 10, y: 10, width: 80, height: 80 }
    setCrop(initial)
    // Enable the confirm button immediately without requiring the user to drag the crop area
    setCompletedCrop({
      unit: 'px',
      x: Math.round((initial.x / 100) * width),
      y: Math.round((initial.y / 100) * height),
      width: Math.round((initial.width / 100) * width),
      height: Math.round((initial.height / 100) * height),
    })
  }, [aspect])

  const handleConfirm = async () => {
    if (!imgRef.current || !completedCrop) return
    setProcessing(true)
    try {
      const { file, url } = await cropToFile(imgRef.current, completedCrop, circularCrop)
      onConfirm(file, url)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="cropOverlay" onClick={onCancel}>
      <div className="cropModal" onClick={e => e.stopPropagation()}>
        <p className="cropModal__hint">Выберите область фото</p>
        <div className="cropModal__imgWrap">
          <ReactCrop
            crop={crop}
            onChange={setCrop}
            onComplete={c => setCompletedCrop(c)}
            aspect={aspect}
            circularCrop={circularCrop}
          >
            <img
              ref={imgRef}
              src={src}
              alt=""
              className="cropModal__img"
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>
        <div className="cropModal__actions">
          <button type="button" className="cropModal__cancelBtn" onClick={onCancel} disabled={processing}>
            Отмена
          </button>
          <button
            type="button"
            className="cropModal__confirmBtn"
            onClick={handleConfirm}
            disabled={!completedCrop || processing}
          >
            {processing ? 'Обработка...' : 'Готово'}
          </button>
        </div>
      </div>
    </div>
  )
}
