// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

'use client'
 
import { getWeatherInfo } from '../actions'
 
export function Weather() {

  async function handleSubmit(formData: FormData) {
    const city = formData.get('city') as string
    const result = await getWeatherInfo(city)
    // Handle the result
    console.log('new result',result)
  }
 
  return (
    <form onSubmit={handleSubmit}>
      <input name="city" placeholder="Enter city name" />
      <button type="submit">Get Weather</button>
    </form>
  )
}