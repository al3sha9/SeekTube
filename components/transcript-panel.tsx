'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock } from 'lucide-react';

interface TranscriptPanelProps {
  transcript: string;
}

export function TranscriptPanel({ transcript }: TranscriptPanelProps) {
  const parseTranscript = (text: string) => {
    return text.split('\n\n').map((chunk, index) => {
      const timestampMatch = chunk.match(/^\[(\d{2}:\d{2})\]/);
      const timestamp = timestampMatch ? timestampMatch[1] : null;
      const content = chunk.replace(/^\[\d{2}:\d{2}\]\s*/, '');
      
      return {
        id: index,
        timestamp,
        content: content.trim()
      };
    }).filter(chunk => chunk.content);
  };

  const chunks = parseTranscript(transcript);

  return (
    <Card className="h-full shadow-lg border-0 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
          <Clock className="w-5 h-5 mr-2 text-red-500" />
          Video Transcript
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 h-[calc(100vh-200px)]">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-1">
            {chunks.map((chunk, index) => (
              <motion.div
                key={chunk.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl flex gap-4 ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                {chunk.timestamp && (
                  <div className="flex-shrink-0">
                    <span className="text-sm font-mono text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                      {chunk.timestamp}
                    </span>
                  </div>
                )}
                
                <div className="flex-1">
                  <p className="text-gray-800 leading-relaxed">
                    {chunk.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}