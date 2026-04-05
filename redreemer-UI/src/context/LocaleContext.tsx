import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import i18n, { enFlat } from '@/i18n'
import { CATALOG_VERSION } from '@/i18n/catalogVersion'
import { fetchTranslatedFlat } from '@/lib/translateUiBatch'

type LocaleContextValue = {
  /** BCP-47 code */
  language: string
  switching: boolean
  switchLanguage: (lng: string) => Promise<void>
  i18nReady: boolean
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

const STORAGE_KEY = 'redreemer_locale'

function cacheKey(lng: string) {
  return `redreemer_ui_v${CATALOG_VERSION}_${lng}`
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(() => localStorage.getItem(STORAGE_KEY) || 'en')
  const [switching, setSwitching] = useState(false)
  const [i18nReady, setI18nReady] = useState(false)

  const switchLanguage = useCallback(async (lng: string) => {
    const normalized = lng.trim()
    localStorage.setItem(STORAGE_KEY, normalized)
    document.documentElement.lang = normalized

    const base = normalized.split('-')[0].toLowerCase()
    if (base === 'en') {
      await i18n.changeLanguage('en')
      setLanguage('en')
      return
    }

    const ck = cacheKey(normalized)
    const raw = localStorage.getItem(ck)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Record<string, string>
        i18n.addResourceBundle(normalized, 'translation', parsed, true, true)
        await i18n.changeLanguage(normalized)
        setLanguage(normalized)
        return
      } catch {
        localStorage.removeItem(ck)
      }
    }

    setSwitching(true)
    try {
      const merged = await fetchTranslatedFlat(normalized, enFlat)
      localStorage.setItem(ck, JSON.stringify(merged))
      i18n.addResourceBundle(normalized, 'translation', merged, true, true)
      await i18n.changeLanguage(normalized)
      setLanguage(normalized)
    } catch (e) {
      console.error('[Locale] Translation failed, falling back to English', e)
      await i18n.changeLanguage('en')
      setLanguage('en')
      localStorage.setItem(STORAGE_KEY, 'en')
    } finally {
      setSwitching(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const saved = localStorage.getItem(STORAGE_KEY) || 'en'
      document.documentElement.lang = saved
      if (saved === 'en' || saved.split('-')[0].toLowerCase() === 'en') {
        await i18n.changeLanguage('en')
        if (!cancelled) {
          setLanguage(saved)
          setI18nReady(true)
        }
        return
      }
      const ck = cacheKey(saved)
      const raw = localStorage.getItem(ck)
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Record<string, string>
          i18n.addResourceBundle(saved, 'translation', parsed, true, true)
          await i18n.changeLanguage(saved)
          if (!cancelled) {
            setLanguage(saved)
            setI18nReady(true)
          }
          return
        } catch {
          localStorage.removeItem(ck)
        }
      }
      try {
        const merged = await fetchTranslatedFlat(saved, enFlat)
        localStorage.setItem(ck, JSON.stringify(merged))
        i18n.addResourceBundle(saved, 'translation', merged, true, true)
        await i18n.changeLanguage(saved)
        if (!cancelled) setLanguage(saved)
      } catch (e) {
        console.warn('[Locale] Could not restore saved language, using English', e)
        await i18n.changeLanguage('en')
        localStorage.setItem(STORAGE_KEY, 'en')
        if (!cancelled) setLanguage('en')
      }
      if (!cancelled) setI18nReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({ language, switching, switchLanguage, i18nReady }),
    [language, switching, switchLanguage, i18nReady]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
