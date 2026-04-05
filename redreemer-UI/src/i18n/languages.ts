/**
 * 80+ locales (BCP-47), sorted by code for a neutral ordering.
 * Coverage: widely spoken languages, national/official languages, major regional languages.
 */
export const APP_LOCALE_CODES: string[] = [
  'af',
  'am',
  'ar',
  'az',
  'be',
  'bg',
  'bn',
  'bs',
  'ca',
  'ceb',
  'ckb',
  'cs',
  'cy',
  'da',
  'de',
  'el',
  'en',
  'es',
  'et',
  'eu',
  'fa',
  'fi',
  'fr',
  'ga',
  'gl',
  'gu',
  'ha',
  'he',
  'hi',
  'hr',
  'ht',
  'hu',
  'hy',
  'id',
  'ig',
  'is',
  'it',
  'ja',
  'jv',
  'ka',
  'kk',
  'km',
  'kn',
  'ko',
  'ku',
  'lo',
  'lt',
  'lv',
  'mk',
  'ml',
  'mn',
  'mr',
  'ms',
  'mt',
  'my',
  'nb',
  'ne',
  'nl',
  'pa',
  'pl',
  'ps',
  'pt',
  'pt-BR',
  'ro',
  'ru',
  'rw',
  'si',
  'sk',
  'sl',
  'so',
  'sq',
  'sr',
  'st',
  'sv',
  'sw',
  'ta',
  'te',
  'tg',
  'th',
  'tl',
  'tr',
  'uk',
  'ur',
  'uz',
  'vi',
  'xh',
  'yo',
  'zh-CN',
  'zh-TW',
  'zu',
].sort((a, b) => a.localeCompare(b, 'en'))

export function localeMenuLabel(code: string): string {
  const base = code.split('-')[0]
  try {
    const native = new Intl.DisplayNames([code], { type: 'language' }).of(base)
    const en = new Intl.DisplayNames(['en'], { type: 'language' }).of(base)
    if (native && en) {
      if (code.includes('-') && code !== base) {
        const region = code.split('-')[1]
        try {
          const regEn = new Intl.DisplayNames(['en'], { type: 'region' }).of(region)
          return regEn ? `${native} (${regEn})` : `${native} (${code})`
        } catch {
          return `${native} (${code})`
        }
      }
      return native !== en ? `${native} (${en})` : native
    }
    return native || en || code
  } catch {
    return code
  }
}
