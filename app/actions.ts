'use server'
 
import { mastra } from '@/mastra'
 
export async function comparePlayersForFantasy(query: string) {
    try {
        const agent = mastra.getAgent('fantasyAgent')
  
        const result = await agent.generate(query)

        const content = result.text

        return {content}

    } catch(error) {
        console.error('Error in comparePlayersForFantasy:', error);
        return {
            content: 'Error comparing players. Please try again.',
            error: error instanceof Error ? error.message : String(error)
        }
    }
   
}