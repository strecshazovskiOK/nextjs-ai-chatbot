'use client';

import { useChat } from '@ai-sdk/react';
import { generateUUID } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { TypingIndicator } from './typing-indicator';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from 'ai';

// Send icon component
function SendIcon() {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );
}

// Initial messages for the hotel stock management context
const initialMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: "Hello! I'm your Hotel Stock Management Assistant. I can help you with:\n- Searching for items in inventory\n- Checking item availability\n- Finding alternatives\n- Getting item details\n- Managing stock levels\n\nHow can I assist you today?"
  }
];

export function Chat() {
  const [error, setError] = useState<string | null>(null);
  const [chatId] = useState(() => {
    // Check if we're in the browser before using localStorage
    if (typeof window === 'undefined') return generateUUID();
    
    // Try to get existing chatId from localStorage or create new one
    const storedChatId = localStorage.getItem('chatId');
    const newChatId = storedChatId || generateUUID();
    if (!storedChatId) {
      localStorage.setItem('chatId', newChatId);
    }
    return newChatId;
  });
  
  const {
    messages,
    input,
    handleSubmit,
    handleInputChange,
    isLoading,
    setMessages
  } = useChat({
    api: '/api/chat',
    id: chatId,
    initialMessages,
    initialInput: '',
    onError: (error) => {
      console.error('Chat error:', error);
      setError('Sorry, there was an error processing your request. Please try again.');
    }
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_messages_${chatId}`, JSON.stringify(messages));
    }
  }, [messages, chatId]);

  // Load saved messages on component mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedMessages = localStorage.getItem(`chat_messages_${chatId}`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (e) {
        console.error('Error loading saved messages:', e);
      }
    }
  }, [chatId, setMessages]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!input.trim()) return;
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="chat-container">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`message-group message-group-${message.role}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <div className="flex items-start gap-3">
                  <div className={`message-avatar ${message.role === 'user' ? 'user-avatar order-2' : 'bot-avatar'}`}>
                    {message.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className={`chat-message chat-message-${message.role} ${message.role === 'user' ? 'order-1' : ''}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              className="message-group message-group-bot"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-3">
                <div className="message-avatar bot-avatar">🤖</div>
                <TypingIndicator />
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="p-4 mb-4 text-sm text-red-500 bg-red-100 rounded-lg dark:bg-red-900/50 dark:text-red-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}
        </div>
      </div>
      
      <div className="chat-input-container">
        <form onSubmit={onSubmit} className="max-w-3xl mx-auto relative">
          <input
            className="chat-input"
            value={input}
            placeholder="Ask about hotel inventory..."
            onChange={handleInputChange}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="chat-submit-button"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Thinking</span>
              </div>
            ) : (
              <>
                <span>Send</span>
                <SendIcon />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
