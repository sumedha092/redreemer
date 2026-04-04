import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const WEATHER_API_KEY = process.env.WEATHER_API_KEY
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5'

/**
 * Get current temperature in °F for a city.
 * Returns null if the API call fails.
 */
export async function getTemperatureForCity(city) {
  try {
    const response = await axios.get(`${WEATHER_API_BASE}/weather`, {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: 'imperial'
      }
    })
    return response.data.main.temp
  } catch (err) {
    console.error(`Weather API error for city ${city}:`, err.message)
    return null
  }
}

/**
 * Get shelter information for a city.
 * In production this would query a shelter availability API or database.
 * For the hackathon, returns a static lookup with real shelter names.
 */
export async function getShelterForCity(city) {
  const shelters = {
    'chicago': { name: 'Pacific Garden Mission', beds: 12, address: '1458 S Canal St, Chicago, IL 60607', phone: '(312) 492-9410' },
    'new york': { name: 'Bowery Mission', beds: 8, address: '227 Bowery, New York, NY 10002', phone: '(212) 674-3456' },
    'los angeles': { name: 'Union Rescue Mission', beds: 15, address: '545 S San Pedro St, Los Angeles, CA 90013', phone: '(213) 347-6300' },
    'atlanta': { name: 'Atlanta Mission', beds: 10, address: '250 Hilliard St NE, Atlanta, GA 30312', phone: '(404) 367-4663' },
    'houston': { name: 'Star of Hope Mission', beds: 20, address: '6897 Ardmore St, Houston, TX 77054', phone: '(713) 748-0700' },
    'phoenix': { name: 'Central Arizona Shelter Services', beds: 14, address: '230 S 12th Ave, Phoenix, AZ 85007', phone: '(602) 256-6945' },
    'dallas': { name: 'Austin Street Center', beds: 18, address: '2929 Hickory St, Dallas, TX 75226', phone: '(214) 428-4242' },
    'seattle': { name: 'DESC Crisis Solutions Center', beds: 9, address: '216 2nd Ave Ext S, Seattle, WA 98104', phone: '(206) 464-1570' }
  }

  const key = city.toLowerCase().trim()
  return shelters[key] || {
    name: 'Local Emergency Shelter',
    beds: 5,
    address: `Call 211 for shelter locations in ${city}`,
    phone: '211'
  }
}
