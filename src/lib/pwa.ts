import { useEffect, useState } from 'react'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: InstallPromptEvent | null = null

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as InstallPromptEvent
  })
}

/** Можно ли установить приложение на домашний экран */
export function useInstallPrompt(): {
  available: boolean
  installed: boolean
  install: () => Promise<'accepted' | 'dismissed' | 'unavailable'>
} {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(deferredPrompt)
  const [installed, setInstalled] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(display-mode: standalone)').matches,
  )

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      const installEvent = event as InstallPromptEvent
      deferredPrompt = installEvent
      setPrompt(installEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      deferredPrompt = null
      setPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function install() {
    if (!prompt) return 'unavailable' as const
    await prompt.prompt()
    const choice = await prompt.userChoice
    if (choice.outcome === 'accepted') {
      deferredPrompt = null
      setPrompt(null)
    }
    return choice.outcome
  }

  return { available: Boolean(prompt) && !installed, installed, install }
}
