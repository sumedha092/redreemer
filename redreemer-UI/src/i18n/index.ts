import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enNested from './en.json'
import { flattenNestedStrings } from './flatten'

export const enFlat = flattenNestedStrings(enNested as unknown as Record<string, unknown>)

void i18n.use(initReactI18next).init({
  resources: { en: { translation: enFlat } },
  lng: 'en',
  fallbackLng: 'en',
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})

export default i18n
