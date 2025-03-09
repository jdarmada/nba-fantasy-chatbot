// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { mastra } from '@/mastra'
import { NextResponse } from 'next/server'
 
export async function POST(req: Request) {
  const { city } = await req.json()
  const agent = mastra.getAgent('weatherAgent')
 
  const result = await agent.stream(`What's the weather like in ${city}?`)
  console.log(result)
 
  return result.toDataStreamResponse()
}