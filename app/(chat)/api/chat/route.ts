import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { getRelevantItems } from '@/lib/db/queries';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are a helpful hotel inventory assistant. Your role is to help users find items in the hotel's stock system.
When answering:
1. Always mention the item codes when suggesting items
2. If multiple similar items exist, list all relevant options
3. Provide brief descriptions of items when relevant
4. If no exact match is found, suggest similar alternatives
5. Keep responses concise but informative
6. Format the response in a clear, easy-to-read manner`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages }: { messages: ChatMessage[] } = body;
    
    // Get relevant items from the database based on the last user message
    const userMessage = messages[messages.length - 1].content;
    const items = await getRelevantItems(userMessage);
    const itemsContext = items.map(item => 
      `- ${item.code}: ${item.name} (${item.quantity} in stock) - ${item.description}`
    ).join('\n');

    // Prepare messages for OpenAI
    const systemContext = items.length ? 
      `Here are the relevant items from our inventory:\n\n${itemsContext}` :
      'No exact matches found in our inventory. I will suggest alternatives or related items if appropriate.';

    const openaiMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(0, -1).map(msg => ({
        role: msg.role,
        content: msg.content
      })) as ChatCompletionMessageParam[],
      { role: 'assistant', content: systemContext },
      { role: 'user', content: userMessage }
    ];

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 1024
    });

    return new Response(completion.choices[0].message.content, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error: any) {
    console.error('AI API Error:', error);
    return new Response(error.message, { status: 500 });
  }
}
