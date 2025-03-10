'use server'
 
import { mastra } from '@/mastra'
 
export async function comparePlayersForFantasy(query: string) {
  const agent = mastra.getAgent('fantasyAgent')
  
  const result = await agent.generate(query)
 
  // Extract just the text content from the result
  return { 
    content: result.text || "No comparison information available" 
  }
}