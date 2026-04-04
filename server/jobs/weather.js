import cron from 'node-cron'
import { getDistinctHomelessCities, getHomelessUsersByCity } from '../services/supabase.js'
import { getTemperatureForCity, getShelterForCity } from '../services/weather.js'
import { sendSMS } from '../services/twilio.js'

const COLD_THRESHOLD_F = 35

/**
 * Weather trigger — runs every 6 hours.
 * When temp drops below 35°F in a city with homeless users, sends a shelter alert.
 * Cron: 0 every-6-hours * * *
 */
export function startWeatherJob() {
  cron.schedule('0 */6 * * *', async () => {
    console.log('[Weather] Checking temperatures for homeless user cities...')

    try {
      const cities = await getDistinctHomelessCities()

      for (const city of cities) {
        try {
          const temp = await getTemperatureForCity(city)
          if (temp === null) continue

          if (temp < COLD_THRESHOLD_F) {
            console.log(`[Weather] Cold alert for ${city}: ${temp}°F`)
            const shelter = await getShelterForCity(city)
            const users = await getHomelessUsersByCity(city)

            for (const user of users) {
              if (!user.phone_number) continue
              try {
                const message = `Tonight is going to be ${Math.round(temp)}°F in ${city}. ${shelter.name} has ${shelter.beds} beds available at ${shelter.address}. Text SHELTER for directions.`
                await sendSMS(user.phone_number, message)
                await new Promise(r => setTimeout(r, 300))
              } catch (err) {
                console.error(`[Weather] Failed to alert user ${user.id}:`, err.message)
              }
            }
          }
        } catch (err) {
          console.error(`[Weather] Error processing city ${city}:`, err.message)
        }
      }
    } catch (err) {
      console.error('[Weather] Job error:', err)
    }
  })
}
