import dotenv from 'dotenv'
dotenv.config()

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

/**
 * Search for nearby resources using Google Places API (New).
 * Returns array of { name, address, phone, rating } or empty array on failure.
 */
async function searchNearby(query, location, maxResults = 3) {
  if (!PLACES_API_KEY || PLACES_API_KEY === 'your_google_places_api_key') {
    return null // API key not configured
  }

  try {
    // Use Text Search (simpler, works well for resource queries)
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${PLACES_API_KEY}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' || !data.results?.length) return []

    const results = data.results.slice(0, maxResults)

    // Fetch phone numbers via Place Details for each result
    const detailed = await Promise.all(results.map(async place => {
      try {
        const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,opening_hours&key=${PLACES_API_KEY}`
        const detailRes = await fetch(detailUrl)
        const detailData = await detailRes.json()
        const d = detailData.result || {}
        return {
          name: d.name || place.name,
          address: d.formatted_address || place.formatted_address,
          phone: d.formatted_phone_number || 'Call 211',
          hours: d.opening_hours?.weekday_text?.[0] || null
        }
      } catch {
        return {
          name: place.name,
          address: place.formatted_address,
          phone: 'Call 211',
          hours: null
        }
      }
    }))

    return detailed
  } catch (err) {
    console.error('Places API error:', err.message)
    return null
  }
}

/**
 * Get real nearby resources for a given city/zip and resource type.
 * Returns formatted string for injection into Gemini prompt, or null if unavailable.
 */
export async function getNearbyResources(cityOrZip, resourceType) {
  const queries = {
    shelter: `homeless shelter ${cityOrZip}`,
    food: `food bank ${cityOrZip}`,
    reentry: `reentry program ${cityOrZip}`,
    jobs: `job training center ${cityOrZip}`,
    id: `DMV free ID program ${cityOrZip}`,
    legal: `legal aid ${cityOrZip}`,
    benefits: `social services benefits office ${cityOrZip}`
  }

  const query = queries[resourceType] || `${resourceType} ${cityOrZip}`
  const results = await searchNearby(query, cityOrZip)

  if (!results || results.length === 0) return null

  return results.map(r =>
    `• ${r.name}\n  ${r.address}\n  ${r.phone}${r.hours ? `\n  ${r.hours}` : ''}`
  ).join('\n\n')
}

/**
 * Detect resource type from user message.
 */
export function detectResourceType(message) {
  const msg = message.toLowerCase()
  if (msg.match(/shelter|sleep|bed|night|homeless|housing/)) return 'shelter'
  if (msg.match(/food|eat|hungry|meal|bank|pantry/)) return 'food'
  if (msg.match(/job|work|employ|hire|career/)) return 'jobs'
  if (msg.match(/id|license|dmv|identification/)) return 'id'
  if (msg.match(/legal|court|debt|lawyer|attorney/)) return 'legal'
  if (msg.match(/benefit|snap|medicaid|welfare|assistance/)) return 'benefits'
  if (msg.match(/reentry|parole|prison|release|record/)) return 'reentry'
  return null
}

/**
 * Extract zip code or city from message or user profile.
 */
export function extractLocation(message, user) {
  // Check for zip code in message
  const zipMatch = message.match(/\b\d{5}\b/)
  if (zipMatch) return zipMatch[0]

  // Check for city name patterns
  const cityMatch = message.match(/\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
  if (cityMatch) return cityMatch[1]

  // Fall back to user's stored city
  return user?.city || null
}
