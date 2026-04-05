import { useState, useRef, useEffect } from 'react'
import { Globe, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocale } from '@/context/LocaleContext'
import { APP_LOCALE_CODES, localeMenuLabel } from '@/i18n/languages'

type Props = {
  className?: string
  /** Show full label next to globe (e.g. header) */
  showCurrentLabel?: boolean
  align?: 'left' | 'right'
  /** Called when the menu is opened (e.g. close other popovers) */
  onOpen?: () => void
}

export default function LanguageMenu({ className = '', showCurrentLabel = true, align = 'right', onOpen }: Props) {
  const { t } = useTranslation()
  const { language, switching, switchLanguage, i18nReady } = useLocale()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const currentLabel = localeMenuLabel(language)

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={!i18nReady || switching}
        onClick={() => {
          setOpen((v) => {
            if (!v) onOpen?.()
            return !v
          })
        }}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors text-xs font-medium disabled:opacity-50"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('shell.language')}
      >
        {switching ? <Loader2 size={14} className="animate-spin shrink-0" /> : <Globe size={14} className="shrink-0" />}
        {showCurrentLabel && <span className="hidden sm:inline max-w-[140px] truncate">{currentLabel}</span>}
      </button>
      {open && (
        <div
          className={`absolute top-10 z-[60] w-[min(100vw-2rem,20rem)] max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          role="listbox"
        >
          {APP_LOCALE_CODES.map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={language === code}
              onClick={() => {
                setOpen(false)
                void switchLanguage(code)
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                language === code ? 'bg-yellow-50 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="truncate pr-2">{localeMenuLabel(code)}</span>
              {language === code && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />}
            </button>
          ))}
          <p className="px-3 py-2 text-[11px] leading-snug text-gray-500 border-t border-gray-100">
            {t('shell.translationDemoHint')}
          </p>
        </div>
      )}
    </div>
  )
}
