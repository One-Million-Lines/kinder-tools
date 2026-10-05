import { useEffect, useState, type ReactNode } from 'react'
import type { ToolProps } from '../shared/toolTypes'

type Picture = 'butterfly' | 'flower' | 'rocket'
type Fills = Record<string, string>
const palette = ['#f36f69', '#ffa941', '#f6d965', '#7cc798', '#75b9dc', '#aa94df', '#ed91ba', '#fffaf1']
const pictures: { id: Picture; emoji: string }[] = [{ id: 'butterfly', emoji: '🦋' }, { id: 'flower', emoji: '🌼' }, { id: 'rocket', emoji: '🚀' }]

function readFills(picture: Picture): Fills {
  try { return JSON.parse(localStorage.getItem(`kinderwelt-color-${picture}`) || '{}') }
  catch { return {} }
}

export default function Coloring({ t }: ToolProps) {
  const [picture, setPicture] = useState<Picture>('butterfly')
  const [color, setColor] = useState(palette[0])
  const [fills, setFills] = useState<Fills>(() => readFills('butterfly'))
  useEffect(() => { localStorage.setItem(`kinderwelt-color-${picture}`, JSON.stringify(fills)) }, [picture, fills])

  function choosePicture(next: Picture) { setPicture(next); setFills(readFills(next)) }
  function paint(part: string) { setFills(current => ({ ...current, [part]: color })) }
  function reset() { setFills({}) }

  function Part({ id, children }: { id: string; children: ReactNode }) {
    return <g fill={fills[id] || '#fffaf1'} className="paintable" role="button" tabIndex={0} aria-label={`${t('pickColor')}: ${id}`} onClick={() => paint(id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); paint(id) } }}>{children}</g>
  }

  return <div className="color-layout">
    <div className="picture-chooser"><span>{t('choosePicture')}</span><div>{pictures.map(item => <button key={item.id} className={picture === item.id ? 'active' : ''} onClick={() => choosePicture(item.id)}><span>{item.emoji}</span>{t(item.id)}</button>)}</div></div>
    <div className="color-main"><div className="color-stage"><svg viewBox="0 0 600 500" role="img" aria-label={t(picture)}>
      {picture === 'butterfly' && <>
        <path d="M0 420 Q300 360 600 420 V500 H0Z" fill="#ddf3df" /><circle cx="490" cy="76" r="36" fill="#ffe7a2" />
        <Part id="left-top"><path d="M286 238 C205 68 66 91 90 218 C102 282 190 291 286 259Z" /></Part>
        <Part id="right-top"><path d="M314 238 C395 68 534 91 510 218 C498 282 410 291 314 259Z" /></Part>
        <Part id="left-bottom"><path d="M280 271 C171 254 121 315 147 382 C178 455 269 391 292 300Z" /></Part>
        <Part id="right-bottom"><path d="M320 271 C429 254 479 315 453 382 C422 455 331 391 308 300Z" /></Part>
        <Part id="body"><ellipse cx="300" cy="280" rx="31" ry="112" /></Part>
        <path d="M290 180 Q266 125 237 120 M310 180 Q334 125 363 120" fill="none" stroke="#51466a" strokeWidth="8" strokeLinecap="round" /><circle cx="236" cy="120" r="8" fill="#51466a" /><circle cx="364" cy="120" r="8" fill="#51466a" />
        <circle cx="290" cy="216" r="5" fill="#51466a" /><circle cx="310" cy="216" r="5" fill="#51466a" /><path d="M291 233 Q300 244 309 233" fill="none" stroke="#51466a" strokeWidth="4" strokeLinecap="round" />
      </>}
      {picture === 'flower' && <>
        <path d="M0 420 Q300 380 600 420 V500 H0Z" fill="#ddf3df" /><path d="M300 283 V442" fill="none" stroke="#5c9d6c" strokeWidth="20" strokeLinecap="round" />
        <Part id="leaf-left"><path d="M300 388 C238 320 169 343 184 398 C200 443 266 426 300 397Z" /></Part>
        <Part id="leaf-right"><path d="M300 398 C346 323 426 331 413 390 C402 441 335 426 300 405Z" /></Part>
        {[0, 60, 120, 180, 240, 300].map((angle, index) => <Part key={angle} id={`petal-${index}`}><ellipse cx="300" cy="165" rx="49" ry="96" transform={`rotate(${angle} 300 250)`} /></Part>)}
        <Part id="center"><circle cx="300" cy="250" r="64" /></Part>
        <circle cx="280" cy="239" r="5" fill="#51466a" /><circle cx="320" cy="239" r="5" fill="#51466a" /><path d="M284 269 Q300 284 316 269" fill="none" stroke="#51466a" strokeWidth="5" strokeLinecap="round" />
        <circle cx="88" cy="88" r="36" fill="#ffe7a2" />
      </>}
      {picture === 'rocket' && <>
        <circle cx="88" cy="85" r="8" fill="#e7ce67" /><circle cx="509" cy="109" r="8" fill="#e7ce67" /><circle cx="479" cy="373" r="6" fill="#e7ce67" /><circle cx="135" cy="342" r="5" fill="#e7ce67" />
        <Part id="flame"><path d="M260 370 Q263 450 300 481 Q337 450 340 370Z" /></Part>
        <Part id="fin-left"><path d="M253 294 Q187 310 180 402 L265 378Z" /></Part>
        <Part id="fin-right"><path d="M347 294 Q413 310 420 402 L335 378Z" /></Part>
        <Part id="body"><path d="M300 48 Q380 98 365 294 L341 391 H259 L235 294 Q220 98 300 48Z" /></Part>
        <Part id="top"><path d="M300 48 Q341 76 357 144 H243 Q259 76 300 48Z" /></Part>
        <Part id="window"><circle cx="300" cy="231" r="57" /></Part>
        <circle cx="300" cy="231" r="36" fill="#d3ecf4" stroke="#51466a" strokeWidth="5" />
      </>}
    </svg></div><div className="color-sidebar"><p>✨ {t('tapToColor')}</p><div className="color-swatches">{palette.map(value => <button key={value} className={`swatch ${color === value ? 'active' : ''}`} style={{ '--swatch': value } as React.CSSProperties} onClick={() => setColor(value)} aria-label={value} />)}</div><button className="secondary-button" onClick={reset}>↻ {t('clear')}</button></div></div>
  </div>
}
