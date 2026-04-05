/** Flatten nested JSON (string leaves only) to dot paths for API + i18n (keySeparator: false). */
export function flattenNestedStrings(obj: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  if (obj === null || typeof obj !== 'object') return out
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      const p = prefix ? `${prefix}.${i}` : String(i)
      if (typeof item === 'string') {
        out[p] = item
      } else if (item && typeof item === 'object' && !Array.isArray(item)) {
        Object.assign(out, flattenNestedStrings(item, p))
      }
    })
    return out
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') {
      out[key] = v
    } else if (v && typeof v === 'object') {
      Object.assign(out, flattenNestedStrings(v, key))
    }
  }
  return out
}
