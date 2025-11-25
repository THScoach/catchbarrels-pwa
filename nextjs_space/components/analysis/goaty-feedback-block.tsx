'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, MicOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GoatyFeedbackBlockProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export function GoatyFeedbackBlock({ messages, onSendMessage }: GoatyFeedbackBlockProps) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'text' | 'voice'>('text');

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Let's Talk About Your Swing!
          </h3>
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'text' | 'voice')} className="w-auto">
            <TabsList className="grid w-[120px] grid-cols-2 h-8">
              <TabsTrigger value="text" className="text-xs">Text</TabsTrigger>
              <TabsTrigger value="voice" className="text-xs">Voice</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Message area */}
        <div className="mb-4 max-h-[300px] overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {messages.length === 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-sm text-blue-200">
                Hey! I'm GOATY, your AI baseball coach. I've just analyzed your swing. 
                Want to know more about your results, or have questions about improving your game? 
                Ask me anything!
              </p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-orange-500/20 border border-orange-500/30 ml-8'
                  : 'bg-gray-700/50 border border-gray-600 mr-8'
              }`}
            >
              <p className="text-sm text-gray-200">{msg.content}</p>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div className="flex gap-2">
          {mode === 'text' ? (
            <>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask GOATY about your swing..."
                className="flex-1 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Mic className="w-4 h-4 mr-2" />
              Tap to speak
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
