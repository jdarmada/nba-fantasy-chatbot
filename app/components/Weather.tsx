
'use client'
 
import { useState } from 'react'
import { getWeatherInfo } from '../actions'
 
type WeatherResponse = {
  content: string;
  error?: string;
}

export function Weather() {
  const [weatherResult, setWeatherResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const city = formData.get('city') as string
    
    if (!city) {
      setError('Please enter a city name')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await getWeatherInfo(city)
      
      if (response.error) {
        setError(`Error: ${response.error}`)
      } else {
        setWeatherResult(response.content)
      }
    } catch (err) {
      console.error('Error in submit handler:', err)
      setError('Failed to fetch weather information: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Weather Information</h1>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input 
            name="city" 
            placeholder="Enter city name" 
            className="flex-1 px-3 py-2 border rounded"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Weather'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="mt-4 p-4 border rounded bg-blue-50">
          Loading weather information...
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 border rounded bg-red-50 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {weatherResult && !error && (
        <div >
          <div className="text-white">{weatherResult}</div>
        </div>
      )}
    </div>
  )
}