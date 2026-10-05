import { useRef, useState, type PointerEvent } from 'react'
import type { MessageKey } from './i18n'

type Props = { guide: string; t: (key: MessageKey) => string }

export default function TracePad({ guide, t }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [clearCount, setClearCount] = useState(0)

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: (event.clientX - rect.left) * 640 / rect.width, y: (event.clientY - rect.top) * 260 / rect.height }
  }

  function start(event: PointerEvent<HTMLCanvasElement>) {
    event.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drawing.current = true
    const { x, y } = point(event)
    const context = canvas.getContext('2d')!
    context.strokeStyle = '#ff7b69'
    context.lineWidth = 20
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x, y)
    context.stroke()
  }

  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    event.preventDefault()
    const { x, y } = point(event)
    const context = canvasRef.current?.getContext('2d')
    context?.lineTo(x, y)
    context?.stroke()
  }

  function end() {
    drawing.current = false
  }

  function clear() {
    canvasRef.current?.getContext('2d')?.clearRect(0, 0, 640, 260)
    setClearCount(value => value + 1)
  }

  return (
    <div className="trace-section">
      <div className="trace-heading"><span>✏️ {t('trace')}</span><button className="small-button" onClick={clear} aria-label={t('clearTrace')}>↻ {t('clearTrace')}</button></div>
      <div className="trace-pad" key={`${guide}-${clearCount}`}>
        <span className="trace-guide" aria-hidden="true">{guide}</span>
        <canvas ref={canvasRef} width={640} height={260} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} aria-label={t('trace')} />
      </div>
    </div>
  )
}
