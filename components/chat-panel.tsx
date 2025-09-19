'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from './chat-message';
import { MessageCircle, Send } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isGenerating: boolean;
}

export function ChatPanel({ messages, onSendMessage, isGenerating }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        // Smooth scroll to bottom
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <Card className="h-full shadow-lg border-0 bg-white flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
          <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
          AI Assistant
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-40"
                >
                  <p className="text-gray-500 text-center">
                    Ask any question about the video content!<br />
                    <span className="text-sm">I&apos;ll help you understand and explore the topics discussed.</span>
                  </p>
                </motion.div>
              ) : (
                messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    index={index}
                  />
                ))
              )}
            </AnimatePresence>

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm p-4 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((dot) => (
                        <motion.div
                          key={dot}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: dot * 0.2
                          }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the video..."
              disabled={isGenerating}
              className="flex-1 h-12 rounded-2xl border-2 focus:border-blue-500 focus:ring-blue-500/20"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isGenerating}
              className="h-12 px-6 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white shadow-md"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}