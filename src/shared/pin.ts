const PIN_KEY = 'kinderwelt-parent-pin-v1'

async function digest(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('')
}

export function hasPin(): boolean {
  return !!localStorage.getItem(PIN_KEY)
}

export async function setPin(pin: string): Promise<void> {
  const salt = crypto.randomUUID()
  localStorage.setItem(PIN_KEY, `${salt}:${await digest(`${salt}:${pin}`)}`)
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_KEY)
  if (!stored) return false
  const [salt, hash] = stored.split(':')
  return (await digest(`${salt}:${pin}`)) === hash
}
