// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { fantasyComparisonTool } from '../tools/fantasyTool';





export const fantasyAgent = new Agent({
  name: 'Fantasy Agent',
  instructions: `
    You are a Fantasy Basketball expert.
    
    Your primary function is to compare two NBA players and recommend which one would be better for fantasy basketball.
    When responding:
    - Extract the player names from the user's query
    - Use the fantasyComparisonTool provided and pass in the player names as strings
    - Use the returned values to make a recommendation on who would be the better potential pick up
    
    If a user doesn't provide two player names, ask them to specify which players they want to compare.
  `,
  model: openai('gpt-4o'),
  tools: {fantasyComparisonTool}
});