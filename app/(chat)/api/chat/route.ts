import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { getRelevantItems } from '@/lib/db/queries';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const SYSTEM_PROMPT = `You are a helpful hotel inventory assistant. Your role is to help users find items in the hotel's stock system.
When answering:
1. Always mention the item codes when suggesting items
2. If multiple similar items exist, list all relevant options
3. Provide brief descriptions of items when relevant
4. If no exact match is found, suggest similar alternatives
5. Keep responses concise but informative
6. Format the response in a clear, easy-to-read manner`;

function formatDirectResponse(items: any[]) {
  if (items.length === 0) {
    return "I couldn't find any matching items in our inventory.";
  }

  const response = items.map(item => (
    `• ${item.name} (Code: ${item.code})
     - Category: ${item.category}
     - Description: ${item.description}
     - Unit: ${item.unit}
     - Price: $${item.price}`
  )).join('\n\n');

  return `Here are the items I found:\n\n${response}`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    console.log('Received messages:', messages);

    const userMessage = messages[messages.length - 1].content;
    console.log('User message:', userMessage);

    // Search for relevant items in the database
    const items = await getRelevantItems(userMessage);
    console.log('Found items:', items);
    
    // Format items for the AI context
    const itemsContext = items.map(item => (
      `• ${item.name} (Code: ${item.code})
       - Category: ${item.category}
       - Description: ${item.description}
       - Unit: ${item.unit}
       - Price: ${item.price}`
    )).join('\n\n');

    try {
      const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-1106',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'system',
            content: items.length ? 
              `Here are the relevant items from our inventory:\n\n${itemsContext}` :
              'No exact matches found in our inventory. I will suggest alternatives or related items if appropriate.'
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
      });

      // Create a ReadableStream from the OpenAI stream
      const textEncoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              controller.enqueue(textEncoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(textEncoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });

    } catch (aiError) {
      console.error('AI API Error:', aiError);
      // If AI API fails, provide a direct response based on database results
      const fallbackResponse = formatDirectResponse(items);
      return new Response(
        JSON.stringify({ text: fallbackResponse }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

  } catch (error) {
    console.error('Chat API Error:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return new Response(
      JSON.stringify({ error: 'Failed to process your request. Please try again.' }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
}
