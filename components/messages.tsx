'use client';

import { type Message } from 'ai';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface MessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

export function Messages({ messages, isLoading }: MessagesProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mb-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex items-start gap-4 p-6 rounded-lg shadow-sm',
            message.role === 'user'
              ? 'bg-primary/10 border border-primary/20'
              : 'bg-muted/50 border border-border/50'
          )}
        >
          <div className="min-w-[2rem] text-center font-semibold">
            {message.role === 'user' ? '👤' : '🤖'}
          </div>
          <div className="flex-1 space-y-2 overflow-hidden">
            <ReactMarkdown
              className="prose dark:prose-invert break-words prose-p:leading-relaxed prose-pre:p-0 max-w-none prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0"
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-center justify-center p-4 gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">Thinking...</span>
        </div>
      )}
    </div>
  );
}
