import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Orb } from '@/components/handshake/Orb';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  role: 'agent',
  content: "Hi! I'm the Handshake Agent. Describe your agreement and I'll structure it for you. You can say something like:\n\n*\"John will design a logo for $300 by Friday with 2 revisions included.\"*",
};

const AgentChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!input.trim() || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Mock AI response
    setTimeout(() => {
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content:
          "I've structured your agreement:\n\n**Task:** Design a logo\n**Payment:** $300\n**Deadline:** Friday\n**Deliverables:** Final logo files\n**Revisions:** 2 rounds included\n\nWould you like to edit anything, or shall I prepare it for signing?",
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsThinking(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="w-10 h-10">
          <Orb state={isThinking ? 'processing' : 'idle'} size={40} />
        </div>
        <div>
          <h1 className="logo-text text-lg text-foreground leading-tight">Handshake Agent</h1>
          <p className="text-xs text-muted-foreground">
            {isThinking ? 'Thinking...' : 'Online'}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/50" />

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'rounded-bl-md'
                }`}
                style={
                  msg.role === 'agent'
                    ? {
                        background: 'hsla(218, 90%, 60%, 0.08)',
                        border: '1px solid hsla(218, 90%, 60%, 0.12)',
                        color: 'hsl(var(--foreground))',
                      }
                    : undefined
                }
              >
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>
                    {line.split(/(\*\*.*?\*\*|\*.*?\*)/).map((part, j) => {
                      if (part.startsWith('**') && part.endsWith('**'))
                        return <strong key={j}>{part.slice(2, -2)}</strong>;
                      if (part.startsWith('*') && part.endsWith('*'))
                        return <em key={j}>{part.slice(1, -1)}</em>;
                      return <span key={j}>{part}</span>;
                    })}
                    {i < msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Thinking indicator */}
        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div
              className="rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5"
              style={{
                background: 'hsla(218, 90%, 60%, 0.08)',
                border: '1px solid hsla(218, 90%, 60%, 0.12)',
              }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/50"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 pb-20 pt-2">
        <div
          className="flex items-end gap-2 rounded-2xl px-3 py-2"
          style={{
            background: 'hsla(218, 90%, 60%, 0.06)',
            border: '1px solid hsla(218, 90%, 60%, 0.12)',
          }}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your agreement..."
            className="flex-1 min-h-[40px] max-h-[120px] border-0 bg-transparent text-sm resize-none p-1 focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={1}
          />
          <Button
            size="icon"
            className="rounded-xl h-9 w-9 shrink-0"
            disabled={!input.trim() || isThinking}
            onClick={handleSend}
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentChatPage;
