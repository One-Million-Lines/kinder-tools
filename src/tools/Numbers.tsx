import { useState } from 'react'
import TracePad from '../shared/TracePad'
import { speak, type ToolProps } from '../shared/toolTypes'

const objects = [
  { emoji: '⭐', label: 'stars' as const, singular: 'star' as const },
  { emoji: '🍎', label: 'apples' as const, singular: 'apple' as const },
  { emoji: '⚽', label: 'balls' as const, singular: 'ball' as const },
]

export default function Numbers({ t, language, sound }: ToolProps) {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<'correct' | 'wrong' | null>(null)
  const number = index + 1
  const object = objects[index % objects.length]
  const options = number === 1 ? [2, 1, 3] : number === 10 ? [8, 10, 9] : [number - 1, number, number + 1]

  function next() { setIndex(current => (current + 1) % 10); setAnswer(null) }
  function choose(value: number) {
    const correct = value === number
    setAnswer(correct ? 'correct' : 'wrong')
    if (correct) speak(String(number), language, sound)
  }

  return <div className="learning-layout">
    <div className="learning-main number-main"><div className="lesson-badge">{number} / 10</div><div className="number-display"><span>{number}</span></div><button className="listen-button" onClick={() => speak(String(number), language, sound)}>🔊 {t('listen')}</button><TracePad key={number} guide={String(number)} t={t} /></div>
    <div className="challenge-card"><span className="challenge-icon">🧮</span><h2>{t('count')}</h2><div className="count-objects" aria-label={`${number} ${t(number === 1 ? object.singular : object.label)}`}>{Array.from({ length: number }, (_, i) => <span key={i}>{object.emoji}</span>)}</div><div className="answer-row">{options.map(value => <button key={value} className={answer === 'correct' && value === number ? 'correct' : ''} onClick={() => choose(value)}>{value}</button>)}</div><p className={`feedback ${answer || ''}`} role="status">{answer === 'correct' ? `⭐ ${t('great')}` : answer === 'wrong' ? `↻ ${t('tryAgain')}` : '\u00a0'}</p><button className="primary-button" onClick={next}>{t('next')} →</button></div>
  </div>
}
