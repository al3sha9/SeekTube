'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TranscriptPanel } from './transcript-panel';
import { ChatPanel } from './chat-panel';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, RotateCcw } from 'lucide-react';

import { VideoTalkAgent } from '@/lib/video-talk-agent';

interface MainAppViewProps {
  videoUrl: string;
  transcript: string;
  talkAgent: VideoTalkAgent | null;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export function MainAppView({ videoUrl, transcript, talkAgent }: MainAppViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSendMessage = async (content: string) => {
    if (!talkAgent) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      const response = await talkAgent.askQuestion(content);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSummarize = async () => {
    if (!talkAgent) return;
    
    setIsGenerating(true);
    
    try {
      const summaryContent = await talkAgent.getVideoSummary();
      
      const summary: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: summaryContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, summary]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error while generating the summary. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    if (talkAgent) {
      talkAgent.clearHistory();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 px-6 py-4"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500 rounded-xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">YouTube Q&A</h1>
              <p className="text-sm text-gray-500 truncate max-w-md">{videoUrl}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSummarize}
              disabled={isGenerating}
              className="rounded-xl"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Summarize Video
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              disabled={messages.length === 0}
              className="rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Chat
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto p-6 gap-6 min-h-[calc(100vh-88px)]">
        {/* Transcript Panel */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:w-1/2"
        >
          <TranscriptPanel transcript={transcript} />
        </motion.div>

        {/* Chat Panel */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:w-1/2"
        >
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
          />
        </motion.div>
      </div>
    </div>
  );
}