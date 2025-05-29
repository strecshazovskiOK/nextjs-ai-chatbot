'use client';

import { useChat } from '@ai-sdk/react';
import { Messages } from './messages';
import { generateUUID } from '@/lib/utils';
import { useState } from 'react';

export function Chat() {
  const [error, setError] = useState<string | null>(null);
  
  const {
    messages,
    input,
    handleSubmit,
    handleInputChange,
    isLoading,
  } = useChat({
    api: '/api/chat',
    id: generateUUID(),
    initialMessages: [],
    initialInput: '',
    onError: (error) => {
      console.error('Chat error:', error);
      setError('Sorry, there was an error processing your request. Please try again.');
    }
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!input.trim()) return;
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-center">Hotel Stock Management Assistant</h1>
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Ask me about any items in the hotel inventory. You can:
              <br />- Search for specific items by name or category
              <br />- Ask about available alternatives
              <br />- Get detailed information about items
              <br />- Find items by their characteristics
            </p>
          </div>
          <Messages messages={messages} isLoading={isLoading} />
          {error && (
            <div className="p-4 mb-4 text-sm text-red-500 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={onSubmit} className="max-w-3xl mx-auto flex gap-2">
          <input
            className="flex-1 p-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={input}
            placeholder="Ask about hotel inventory items..."
            onChange={handleInputChange}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Thinking...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
