import { useState } from 'react'
import TracePad from '../shared/TracePad'
import { speak, type ToolProps } from '../shared/toolTypes'

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function Letters({ t, language, sound }: ToolProps) {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<'correct' | 'wrong' | null>(null)
  const letter = alphabet[index]
  const options = [alphabet[(index + 3) % 26], letter, alphabet[(index + 7) % 26]]

  function next() { setIndex(current => (current + 1) % alphabet.length); setAnswer(null) }
  function choose(value: string) {
    const correct = value === letter
    setAnswer(correct ? 'correct' : 'wrong')
    if (correct) speak(letter, language, sound)
  }

  return <div className="learning-layout">
    <div className="learning-main"><div className="lesson-badge">{index + 1} / 26</div><div className="letter-display"><span className="letter-big">{letter}</span><span className="letter-small">{letter.toLowerCase()}</span></div><button className="listen-button" onClick={() => speak(letter, language, sound)}>🔊 {t('listen')}</button><TracePad key={letter} guide={letter} t={t} /></div>
    <div className="challenge-card"><span className="challenge-icon">🔎</span><h2>{t('findLetter')} <strong>{letter}</strong></h2><div className="answer-row">{options.map(value => <button key={value} className={answer === 'correct' && value === letter ? 'correct' : ''} onClick={() => choose(value)}>{value}</button>)}</div><p className={`feedback ${answer || ''}`} role="status">{answer === 'correct' ? `⭐ ${t('great')}` : answer === 'wrong' ? `↻ ${t('tryAgain')}` : '\u00a0'}</p><button className="primary-button" onClick={next}>{t('next')} →</button></div>
  </div>
}
