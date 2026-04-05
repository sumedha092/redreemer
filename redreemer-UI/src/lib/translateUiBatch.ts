import { api } from '@/lib/api'

/** Split flat record into chunks of at most `size` keys (server limit 45). */
export function chunkFlatStrings(flat: Record<string, string>, size = 45): Record<string, string>[] {
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

async function postTranslateChunk(
  targetLang: string,
  strings: Record<string, string>
): Promise<Record<string, string>> {
  const maxAttempts = 4
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const { data } = await api.post<{ strings: Record<string, string> }>('/api/i18n/translate-ui', {
        targetLang,
        strings,
      })
      return data.strings || {}
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } }
      const status = err.response?.status
      const retry =
        status === 429 || status === 503 || status === 502 || (status != null && status >= 500)
      if (retry && attempt < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)))
        continue
      }
      throw e
    }
  }
  return {}
}

/** Fetches UI strings via POST /api/i18n/translate-ui (needs API + GEMINI_API_KEY). */
export async function fetchTranslatedFlat(
  targetLang: string,
  flat: Record<string, string>
): Promise<Record<string, string>> {
  const chunks = chunkFlatStrings(flat, 45)
  const merged: Record<string, string> = {}
  const concurrency = 2
  for (let i = 0; i < chunks.length; i += concurrency) {
    const batch = chunks.slice(i, i + concurrency)
    const results = await Promise.all(batch.map((strings) => postTranslateChunk(targetLang, strings)))
    for (const r of results) Object.assign(merged, r)
  }
  return merged
}
