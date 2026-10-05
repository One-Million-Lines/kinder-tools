import type { Language, MessageKey } from './i18n'

export type ToolProps = {
  language: Language
  t: (key: MessageKey) => string
  sound: boolean
}

export function speak(text: string, language: Language, enabled: boolean): boolean {
  if (!enabled) return false
  if (!('speechSynthesis' in window)) return false

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  const targetLang = language === 'de' ? 'de-DE' : 'en-US'
  utterance.lang = targetLang
  utterance.rate = 0.8
  utterance.pitch = 1.15

  // Explicitly find and assign a voice matching the language code
  const voices = window.speechSynthesis.getVoices()
  const matchingVoice = voices.find(voice => voice.lang.startsWith(targetLang.slice(0, 2)))

  if (matchingVoice) {
    utterance.voice = matchingVoice
  }

  window.speechSynthesis.speak(utterance)
  return true
}
