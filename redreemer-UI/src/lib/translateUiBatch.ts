import { api } from '@/lib/api'

/** Split flat record into chunks of at most `size` keys (server limit 45). */
export function chunkFlatStrings(flat: Record<string, string>, size = 40): Record<string, string>[] {
  const keys = Object.keys(flat).sort()
  const chunks: Record<string, string>[] = []
  for (let i = 0; i < keys.length; i += size) {
    const slice = keys.slice(i, i + size)
    const part: Record<string, string> = {}
    for (const k of slice) part[k] = flat[k]
    chunks.push(part)
  }
  return chunks
}

export async function fetchTranslatedFlat(
  targetLang: string,
  flat: Record<string, string>
): Promise<Record<string, string>> {
  const chunks = chunkFlatStrings(flat, 40)
  const merged: Record<string, string> = {}
  const concurrency = 2
  for (let i = 0; i < chunks.length; i += concurrency) {
    const batch = chunks.slice(i, i + concurrency)
    const results = await Promise.all(
      batch.map(async (strings) => {
        const { data } = await api.post<{ strings: Record<string, string> }>('/api/i18n/translate-ui', {
          targetLang,
          strings,
        })
        return data.strings || {}
      })
    )
    for (const r of results) Object.assign(merged, r)
  }
  return merged
}
