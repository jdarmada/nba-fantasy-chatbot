'use server'
 
import { mastra } from '@/mastra'
 
export async function getWeatherInfo(city: string) {
  try {
    console.log(`Getting weather for: ${city}`)
    const agent = mastra.getAgent('weatherAgent')
    
    const result = await agent.generate(`What's the weather like in ${city}?`)
    
    return { 
      content: result.text || "No weather information available" 
    }
  } catch (error) {
    console.error('Error in getWeatherInfo:', error)
    return { 
      content: 'Error fetching weather information. Please try again.',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}