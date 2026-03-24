import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, Sparkles } from 'lucide-react';
import { ChatMessage, AgreementPreview } from '@/types/chat';
import { ChatAgreementCard } from '@/components/handshake/ChatAgreementCard';
import { useAppStore } from '@/store/appStore';

const WELCOME_MSG: ChatMessage = {
  id: 'welcome',
  role: 'agent',
  content: "Hi! I'm Handshake — your agreement agent. Describe your deal and I'll structure it for you.\n\nTry something like:\n*\"John will design a logo for $300 by Friday with 2 revisions included.\"*",
  timestamp: new Date().toISOString(),
};

/**
 * Simulates Handshake brain interpreting the user's message.
 * In production this calls the backend which routes to the AI brain.
 */
const simulateHandshakeResponse = (
  userContent: string,
  turnIndex: number
): ChatMessage => {
  const now = new Date().toISOString();
  const id = (Date.now() + 1).toString();

  // First message: ask for clarification
  if (turnIndex === 0) {
    const hasParty = /\b(john|alice|bob|mike|sarah)\b/i.test(userContent);
    const hasAmount = /\$[\d,]+|\d+\s*(usd|ton|usdt)/i.test(userContent);
    const hasDeadline = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next week|by \w+)\b/i.test(userContent);

    const missing: string[] = [];
    if (!hasParty) missing.push('Counterparty name');
    if (!hasAmount) missing.push('Payment amount');
    if (!hasDeadline) missing.push('Deadline');

    if (missing.length >= 2) {
      return {
        id,
        role: 'agent',
        content: "I need a few more details to structure this properly. Could you clarify the following?",
        timestamp: now,
        handshakeStatus: 'needs_clarification',
        agreement: {
          id: `draft-${Date.now()}`,
          title: 'New Agreement',
          summary: extractSummary(userContent),
          parties: hasParty ? [extractParty(userContent), 'You'] : ['You'],
          keyTerms: {
            ...(hasAmount ? { Payment: extractAmount(userContent) } : {}),
            ...(hasDeadline ? { Deadline: extractDeadline(userContent) } : {}),
          },
          missingFields: missing,
          status: 'needs_clarification',
        },
      };
    }

    // Enough info → draft ready
    return {
      id,
      role: 'agent',
      content: "I've structured your agreement. Review the details below and let me know if you'd like to edit anything.",
      timestamp: now,
      handshakeStatus: 'draft_ready',
      agreementId: `draft-${Date.now()}`,
      agreement: {
        id: `draft-${Date.now()}`,
        title: buildTitle(userContent),
        summary: extractSummary(userContent),
        parties: [extractParty(userContent) || 'Counterparty', 'You'],
        keyTerms: {
          Task: extractTask(userContent),
          Payment: extractAmount(userContent) || 'TBD',
          Deadline: extractDeadline(userContent) || 'TBD',
        },
        status: 'draft_ready',
      },
    };
  }

  // Second+ message: ready to sign
  return {
    id,
    role: 'agent',
    content: "Your agreement is finalized and ready for on-chain signing. Open it below to review and sign.",
    timestamp: now,
    handshakeStatus: 'sign_ready',
    agreementId: `agreement-${Date.now()}`,
    agreement: {
      id: `agreement-${Date.now()}`,
      title: 'Service Agreement',
      summary: 'Agreement structured from your conversation with Handshake.',
      parties: ['You', 'Counterparty'],
      keyTerms: {
        Task: 'As discussed',
        Payment: 'As agreed',
        Deadline: 'As agreed',
      },
      status: 'sign_ready',
      openAgreementUrl: '/sign',
    },
  };
};

// Simple extraction helpers (Handshake brain handles this server-side in production)
const extractParty = (s: string) => {
  const match = s.match(/\b([A-Z][a-z]+)\b/);
  return match?.[1] || '';
};
const extractAmount = (s: string) => {
  const match = s.match(/\$[\d,]+|\d+\s*(usd|ton|usdt)/i);
  return match?.[0] || '';
};
const extractDeadline = (s: string) => {
  const match = s.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next week|by \w+)\b/i);
  return match?.[0] || '';
};
const extractTask = (s: string) => {
  const cleaned = s.replace(/\$[\d,]+/g, '').replace(/\b(by|for|until)\s+\w+$/i, '').trim();
  return cleaned.length > 60 ? cleaned.slice(0, 60) + '...' : cleaned;
};
const extractSummary = (s: string) => {
  return s.length > 100 ? s.slice(0, 100) + '...' : s;
};
const buildTitle = (s: string) => {
  const party = extractParty(s);
  return party ? `Agreement with ${party}` : 'New Agreement';
};

const AgentChatPage = () => {
  const chatConversation = useAppStore((s) => s.chatConversation);
  const addChatMessage = useAppStore((s) => s.addChatMessage);

  const messages: ChatMessage[] = chatConversation?.messages ?? [WELCOME_MSG];
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [userTurns, setUserTurns] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize conversation with welcome message if empty
  useEffect(() => {
    if (!chatConversation) {
      addChatMessage(WELCOME_MSG);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!input.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);
    setInput('');
    setIsThinking(true);

    const currentTurn = userTurns;
    setUserTurns((t) => t + 1);

    // Simulate Handshake brain response
    setTimeout(() => {
      const response = simulateHandshakeResponse(userMsg.content, currentTurn);
      addChatMessage(response);
      setIsThinking(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/(\*\*.*?\*\*|\*.*?\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**'))
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          if (part.startsWith('*') && part.endsWith('*'))
            return <em key={j}>{part.slice(1, -1)}</em>;
          return <span key={j}>{part}</span>;
        })}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
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
              <div className={`max-w-[85%] ${msg.role === 'user' ? '' : ''}`}>
                {/* Message bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
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
                  {renderMarkdown(msg.content)}
                </div>

                {/* Agreement Card (inline, below the message bubble) */}
                {msg.agreement && (
                  <ChatAgreementCard agreement={msg.agreement} />
                )}
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
