import OpenAI from "openai";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export async function queryAI(messages: any[], tools: any[]) {
  return await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    tools, 
    tool_choice: "auto", 
    store: true, 
  });
}
