import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { ToolProps } from '../shared/toolTypes'
import { deleteArtwork, listArtwork, saveArtwork, type Artwork } from '../shared/storage'

const colors = ['#f36962', '#ffb341', '#f6da4b', '#65bb8a', '#66abd5', '#9a81d5', '#493c55', '#ffffff']
const sizes = [6, 13, 25]

export default function Drawing({ t }: ToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const history = useRef<string[]>([])
  const [color, setColor] = useState(colors[0])
  const [size, setSize] = useState(1)
  const [message, setMessage] = useState('')
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [artworks, setArtworks] = useState<Artwork[]>([])

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d')
    if (!context || !canvasRef.current) return
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, 1000, 620)
    history.current = [canvasRef.current.toDataURL('image/jpeg', 0.85)]
  }, [])

  function coords(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: (event.clientX - rect.left) * 1000 / rect.width, y: (event.clientY - rect.top) * 620 / rect.height }
  }

  function start(event: PointerEvent<HTMLCanvasElement>) {
    event.preventDefault()
    const context = canvasRef.current?.getContext('2d')
    if (!context) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drawing.current = true
    const { x, y } = coords(event)
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x, y)
    context.strokeStyle = color
    context.lineWidth = sizes[size]
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.stroke()
    setMessage('')
  }

  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    event.preventDefault()
    const context = canvasRef.current?.getContext('2d')
    if (!context) return
    const { x, y } = coords(event)
    context.lineTo(x, y)
    context.stroke()
  }

  function end() {
    if (!drawing.current || !canvasRef.current) return
    drawing.current = false
    history.current.push(canvasRef.current.toDataURL('image/jpeg', 0.85))
    if (history.current.length > 20) history.current.shift()
  }

  function restore(image: string) {
    const context = canvasRef.current?.getContext('2d')
    if (!context) return
    const picture = new Image()
    picture.onload = () => { context.clearRect(0, 0, 1000, 620); context.drawImage(picture, 0, 0, 1000, 620) }
    picture.src = image
  }

  function undo() {
    if (history.current.length < 2) return
    history.current.pop()
    restore(history.current.at(-1)!)
  }

  function clear() {
    const context = canvasRef.current?.getContext('2d')
    if (!context || !canvasRef.current) return
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, 1000, 620)
    history.current.push(canvasRef.current.toDataURL('image/jpeg', 0.85))
    setMessage('')
  }

  async function save() {
    if (!canvasRef.current) return
    try { await saveArtwork(canvasRef.current.toDataURL('image/jpeg', 0.85)); setMessage(t('saved')) }
    catch { setMessage(t('saveError')) }
  }

  async function openGallery() {
    setGalleryOpen(true)
    try { setArtworks(await listArtwork()) } catch { setArtworks([]) }
  }

  async function remove(id: string) {
    await deleteArtwork(id)
    setArtworks(items => items.filter(item => item.id !== id))
  }

  return <div className="drawing-layout">
    <div className="drawing-toolbar">
      <div className="toolbar-group"><span className="toolbar-label">{t('pickColor')}</span><div className="swatches">{colors.map(value => <button key={value} className={`swatch ${color === value ? 'active' : ''}`} style={{ '--swatch': value } as React.CSSProperties} onClick={() => setColor(value)} aria-label={value} />)}</div></div>
      <div className="toolbar-group"><span className="toolbar-label">{t('brush')}</span><div className="brush-options">{sizes.map((value, index) => <button key={value} className={size === index ? 'active' : ''} onClick={() => setSize(index)} aria-label={t(index === 0 ? 'small' : index === 1 ? 'medium' : 'big')}><span style={{ width: 5 + index * 6, height: 5 + index * 6 }} /></button>)}</div></div>
      <div className="toolbar-actions"><button className="small-button" onClick={undo}>↶ {t('undo')}</button><button className="small-button" onClick={clear}>✧ {t('clear')}</button></div>
    </div>
    <div className="drawing-paper"><canvas ref={canvasRef} width={1000} height={620} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} aria-label={t('draw')} /></div>
    <div className="drawing-bottom"><button className="secondary-button" onClick={() => void openGallery()}>🖼️ {t('gallery')}</button><span className="save-message" role="status">{message}</span><button className="primary-button" onClick={() => void save()}>💾 {t('save')}</button></div>
    {galleryOpen && <div className="modal-backdrop"><div className="gallery-modal" role="dialog" aria-modal="true" aria-label={t('gallery')}><div className="gallery-heading"><h2>{t('gallery')}</h2><button className="icon-close" onClick={() => setGalleryOpen(false)} aria-label={t('close')}>×</button></div>{artworks.length ? <div className="gallery-grid">{artworks.map(item => <div className="gallery-item" key={item.id}><img src={item.image} alt={new Date(item.createdAt).toLocaleDateString()} /><button className="small-button" onClick={() => void remove(item.id)}>🗑️ {t('deletePicture')}</button></div>)}</div> : <p className="empty-gallery">{t('galleryEmpty')}</p>}</div></div>}
  </div>
}
