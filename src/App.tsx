import { useEffect, useState } from 'react'
import Drawing from './tools/Drawing'
import Coloring from './tools/Coloring'
import Letters from './tools/Letters'
import Numbers from './tools/Numbers'
import { translate, type Language, type MessageKey } from './shared/i18n'

type ToolId = 'draw' | 'color' | 'letters' | 'numbers'
type Modal = 'setup' | 'pin' | 'settings' | null
type Settings = { language: Language; sound: boolean; duration: number }

const SETTINGS_KEY = 'kinderwelt-settings-v1'
const DEADLINE_KEY = 'kinderwelt-deadline-v1'
const tools: { id: ToolId; emoji: string; tint: string; label: MessageKey; description: MessageKey }[] = [
  { id: 'draw', emoji: '🖍️', tint: 'peach', label: 'draw', description: 'drawDescription' },
  { id: 'color', emoji: '🎨', tint: 'lavender', label: 'color', description: 'colorDescription' },
  { id: 'letters', emoji: '🔤', tint: 'butter', label: 'letters', description: 'lettersDescription' },
  { id: 'numbers', emoji: '🔢', tint: 'mint', label: 'numbers', description: 'numbersDescription' },
]

function readSettings(): Settings {
  try {
    const value = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
    return {
      language: value.language === 'en' ? 'en' : 'de',
      sound: value.sound !== false,
      duration: [5, 10, 20, 30].includes(value.duration) ? value.duration : 10,
    }
  } catch {
    return { language: 'de', sound: true, duration: 10 }
  }
}

function hasParentPin() { return !!localStorage.getItem('kinderwelt-parent-pin-v1') }

export default function App() {
  const [settings, setSettings] = useState<Settings>(readSettings)
  const [deadline, setDeadline] = useState<number>(() => Number(localStorage.getItem(DEADLINE_KEY)) || 0)
  const [now, setNow] = useState(Date.now())
  const [tool, setTool] = useState<ToolId | null>(null)
  const [modal, setModal] = useState<Modal>(() => hasParentPin() ? null : 'setup')
  const [pin, setPin] = useState('')
  const [repeatPin, setRepeatPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement))
  const [fullscreenError, setFullscreenError] = useState(false)
  const t = (key: MessageKey) => translate(settings.language, key)
  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000))
  const active = remaining > 0

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    const onVisible = () => setNow(Date.now())
    document.addEventListener('visibilitychange', onVisible)
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible) }
  }, [])
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); document.documentElement.lang = settings.language }, [settings])
  useEffect(() => { localStorage.setItem(DEADLINE_KEY, String(deadline)) }, [deadline])
  useEffect(() => { if (!active) setTool(null) }, [active])
  useEffect(() => { window.scrollTo(0, 0) }, [tool])
  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])

  async function toggleFullscreen() {
    setFullscreenError(false)
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen()
      else setFullscreenError(true)
    } catch { setFullscreenError(true) }
  }

  function startSession() {
    setDeadline(Date.now() + settings.duration * 60_000)
    setNow(Date.now())
    setModal(null)
    setTool(null)
    setPin('')
    setRepeatPin('')
    setError('')
  }

  function openParent() {
    setPin('')
    setError('')
    setModal(hasParentPin() ? 'pin' : 'setup')
  }

  async function submitPin() {
    if (busy) return
    if (!/^\d{4}$/.test(pin)) { setError(t('pinLength')); return }
    setBusy(true)
    try {
      if (modal === 'setup') {
        if (pin !== repeatPin) { setError(t('pinMismatch')); return }
        const { setPin } = await import('./shared/pin')
        await setPin(pin)
        startSession()
      } else {
        const { verifyPin } = await import('./shared/pin')
        if (await verifyPin(pin)) { setModal('settings'); setPin(''); setError('') }
        else setError(t('wrongPin'))
      }
    } finally { setBusy(false) }
  }

  const clockText = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`
  const toolTitle = tool ? t(tools.find(item => item.id === tool)!.label) : ''
  return (
    <div className="app-shell">
      <div className="background-shape shape-one" /><div className="background-shape shape-two" />
      <header className="topbar">
        <button className="brand" onClick={() => setTool(null)} aria-label={t('home')}><span className="brand-mark">✦</span><span>{t('brand')}</span></button>
        <div className="topbar-actions">
          {active && <div className={`timer-pill ${remaining <= 120 ? 'timer-soon' : ''}`} aria-label={`${t('timeLeft')}: ${clockText}`}><span>⏳</span><span className="timer-label">{t('timeLeft')}</span><strong>{clockText}</strong></div>}
          <button className="parent-button" onClick={openParent} aria-label={t('parent')} title={t('parent')}>⚙ <span>{t('parent')}</span></button>
        </div>
      </header>

      {!active ? (
        <main className="break-screen">
          <div className="break-art" aria-hidden="true"><span className="moon">🌙</span><span className="break-star star-a">✦</span><span className="break-star star-b">✦</span><span className="break-star star-c">✦</span></div>
          <h1>{t('timeUp')}</h1><p>{t('timeUpDetail')}</p>
          <button className="primary-button" onClick={openParent}>🔒 {t('moreTime')}</button>
        </main>
      ) : tool ? (
        <main className="tool-layout">
          <div className="tool-header"><button className="back-button" onClick={() => setTool(null)}>← <span>{t('home')}</span></button><h1>{toolTitle}</h1><span className="tool-header-spacer" /></div>
          {tool === 'draw' && <Drawing language={settings.language} t={t} sound={settings.sound} />}
          {tool === 'color' && <Coloring language={settings.language} t={t} sound={settings.sound} />}
          {tool === 'letters' && <Letters language={settings.language} t={t} sound={settings.sound} />}
          {tool === 'numbers' && <Numbers language={settings.language} t={t} sound={settings.sound} />}
        </main>
      ) : (
        <main className="home-screen">
          <div className="hero"><div><div className="eyebrow"><span>✦</span> {t('tagline')} <span>✦</span></div><h1>{t('hello')}</h1><p>{t('subtitle')}</p></div><div className="hero-art" aria-hidden="true"><span className="hero-sun">☀️</span><span className="hero-pencil">✏️</span><span className="hero-spark">✦</span></div></div>
          <div className="tool-grid">{tools.map(item => <button key={item.id} className={`tool-card ${item.tint}`} onClick={() => setTool(item.id)}><span className="tool-emoji" aria-hidden="true">{item.emoji}</span><span className="tool-card-copy"><strong>{t(item.label)}</strong><small>{t(item.description)}</small></span><span className="card-arrow" aria-hidden="true">↗</span></button>)}</div>
          <div className="home-footer" aria-hidden="true"><span>★</span><span>●</span><span>✿</span><span>●</span><span>★</span></div>
        </main>
      )}

      {modal && <div className="modal-backdrop" role="presentation"><div className="parent-modal" role="dialog" aria-modal="true" aria-label={t(modal === 'setup' ? 'setupTitle' : modal === 'pin' ? 'enterPin' : 'settings')}>
        <div className="modal-top"><span className="modal-icon">👨‍👩‍👧</span>{active && modal !== 'setup' && <button className="icon-close" onClick={() => setModal(null)} aria-label={t('close')}>×</button>}</div>
        {modal === 'setup' || modal === 'pin' ? <>
          <h2>{t(modal === 'setup' ? 'setupTitle' : 'enterPin')}</h2>
          {modal === 'setup' && <p>{t('setupText')}</p>}
          <label className="form-label">{t('pin')}<input type="password" inputMode="numeric" pattern="[0-9]*" maxLength={4} autoComplete="off" value={pin} onChange={event => { setPin(event.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }} onKeyDown={event => { if (event.key === 'Enter') void submitPin() }} /></label>
          {modal === 'setup' && <label className="form-label">{t('repeatPin')}<input type="password" inputMode="numeric" pattern="[0-9]*" maxLength={4} autoComplete="off" value={repeatPin} onChange={event => { setRepeatPin(event.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }} onKeyDown={event => { if (event.key === 'Enter') void submitPin() }} /></label>}
          {modal === 'setup' && <DurationPicker duration={settings.duration} onChange={duration => setSettings({ ...settings, duration })} t={t} />}
          {modal === 'setup' && <button className="secondary-button fullscreen-button" onClick={() => void toggleFullscreen()}>⛶ {t(fullscreen ? 'exitFullscreen' : 'fullscreen')}</button>}
          {fullscreenError && <p className="form-error" role="alert">{t('fullscreenUnavailable')}</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button modal-submit" disabled={busy} onClick={() => void submitPin()}>{t(modal === 'setup' ? 'start' : 'unlock')}</button>
          {modal === 'pin' && active && <button className="text-button" onClick={() => setModal(null)}>{t('cancel')}</button>}
        </> : <>
          <h2>{t('settings')}</h2>
          <DurationPicker duration={settings.duration} onChange={duration => setSettings({ ...settings, duration })} t={t} />
          <div className="setting-row"><span>{t('language')}</span><div className="segmented"><button className={settings.language === 'de' ? 'selected' : ''} onClick={() => setSettings({ ...settings, language: 'de' })}>Deutsch</button><button className={settings.language === 'en' ? 'selected' : ''} onClick={() => setSettings({ ...settings, language: 'en' })}>English</button></div></div>
          <div className="setting-row"><span>{t('sound')}</span><div className="segmented"><button className={settings.sound ? 'selected' : ''} onClick={() => setSettings({ ...settings, sound: true })}>{t('soundOn')}</button><button className={!settings.sound ? 'selected' : ''} onClick={() => setSettings({ ...settings, sound: false })}>{t('soundOff')}</button></div></div>
          <button className="secondary-button fullscreen-button" onClick={() => void toggleFullscreen()}>⛶ {t(fullscreen ? 'exitFullscreen' : 'fullscreen')}</button>
          {fullscreenError && <p className="form-error" role="alert">{t('fullscreenUnavailable')}</p>}
          <button className="primary-button modal-submit" onClick={startSession}>{t(active ? 'restart' : 'start')}</button>
          <p className="parent-note">{t('parentNote')}</p>
        </>}
      </div></div>}
    </div>
  )
}

function DurationPicker({ duration, onChange, t }: { duration: number; onChange: (value: number) => void; t: (key: MessageKey) => string }) {
  return <div className="duration-picker"><span className="form-label">{t('duration')}</span><div className="duration-options">{[5, 10, 20, 30].map(value => <button key={value} className={duration === value ? 'selected' : ''} onClick={() => onChange(value)}><strong>{value}</strong><small>{t('minutes')}</small></button>)}</div></div>
}
