export function stripMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/`(.*?)`/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
}

export function splitIntoMessages(text, maxLength = 300) {
  if (text.length <= maxLength) return [text]
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const messages = []
  let current = ''
  for (const sentence of sentences) {
    if ((current + sentence).length > maxLength && current) {
      messages.push(current.trim())
      current = sentence
    } else {
      current += sentence
    }
  }
  if (current.trim()) messages.push(current.trim())
  return messages.length ? messages : [text.substring(0, maxLength)]
}

export function formatForSMS(text) {
  return stripMarkdown(text)
}
