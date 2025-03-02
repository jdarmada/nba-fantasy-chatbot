import { createOllama } from 'ollama-ai-provider';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const ollama = createOllama({
  baseURL: 'http://localhost:11434/api',
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  try {
    const result = streamText({
      model: ollama('llama3'),
      messages

    });
  
    return result.toDataStreamResponse();
  } catch(e) {
    console.error(e);
    return { message: "Woj needs a timeout" }
  }
}