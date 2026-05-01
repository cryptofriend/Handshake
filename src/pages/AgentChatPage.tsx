import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, Sparkles } from 'lucide-react';
import { ChatMessage, AgreementPreview, HandshakeStatus } from '@/types/chat';
import { ChatAgreementCard } from '@/components/handshake/ChatAgreementCard';
import { useAppStore } from '@/store/appStore';
import { streamChat } from '@/lib/streamChat';
import { toast } from 'sonner';

const WELCOME_MSG: ChatMessage = {
  id: 'welcome',
  role: 'agent',
  content: "Hi! I'm Handshake — your agreement agent. Describe your deal and I'll structure it for you.\n\nTry something like:\n*\"John will design a logo for $300 by Friday with 2 revisions included.\"*",
  timestamp: new Date().toISOString(),
};

const getSessionId = (userKey: string): string => {
  const storageKey = `handshake_session_id::${userKey}`;
  let sid = sessionStorage.getItem(storageKey);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(storageKey, sid);
  }
  return sid;
};

const AgentChatPage = () => {
  const chatConversation = useAppStore((s) => s.chatConversation);
  const addChatMessage = useAppStore((s) => s.addChatMessage);
  const authIdentity = useAppStore((s) => s.authIdentity);

  // Per-user namespace: e.g. "solana:7xK..." / "ton:EQ..." / "world:0xnull..."
  const userKey = authIdentity
    ? `${authIdentity.method}:${authIdentity.address}`
    : 'anon';

  const messages: ChatMessage[] = chatConversation?.messages ?? [WELCOME_MSG];
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(getSessionId(userKey));

  useEffect(() => {
    if (!chatConversation) {
      addChatMessage(WELCOME_MSG);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking, streamingText]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);
    const messageText = input.trim();
    setInput('');
    setIsThinking(true);

    const msgId = (Date.now() + 1).toString();
    setStreamingId(msgId);
    setStreamingText('');

    const history = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, content: m.content }));

    streamChat({
      sessionId: sessionId.current,
      userId: userKey,
      message: messageText,
      history,
      onToken: (token) => {
        setStreamingText((prev) => prev + token);
      },
      onDone: (data) => {
        setIsThinking(false);
        setStreamingId(null);
        setStreamingText('');

        const agreement: AgreementPreview | undefined = data.agreement
          ? {
              id: data.agreement.id || `draft-${Date.now()}`,
              title: data.agreement.title,
              summary: data.agreement.summary,
              parties: (data.agreement.parties || []).map((p: any) => p.name || p),
              keyTerms: Object.fromEntries(
                (data.agreement.terms || []).map((t: string, i: number) => [`Term ${i + 1}`, t])
              ),
              missingFields: data.agreement.missingFields,
              status: data.status as HandshakeStatus,
              openAgreementUrl: data.actions?.openAgreementUrl || undefined,
            }
          : undefined;

        const agentMsg: ChatMessage = {
          id: msgId,
          role: 'agent',
          content: data.reply,
          timestamp: new Date().toISOString(),
          handshakeStatus: data.status as HandshakeStatus,
          agreement,
          agreementId: data.agreement?.id,
        };

        addChatMessage(agentMsg);
      },
      onError: (err) => {
        setIsThinking(false);
        setStreamingId(null);
        setStreamingText('');

        if (err?.status === 429) {
          toast.error('Rate limited. Please wait a moment.');
        } else if (err?.status === 402) {
          toast.error('AI credits exhausted.');
        } else {
          toast.error('Failed to get response. Try again.');
        }

        addChatMessage({
          id: msgId,
          role: 'agent',
          content: "I'm having trouble connecting right now. Please try again.",
          timestamp: new Date().toISOString(),
        });
      },
    });
  }, [input, isThinking, messages, addChatMessage]);

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

  const agentBubbleStyle = {
    background: 'hsla(218, 90%, 60%, 0.08)',
    border: '1px solid hsla(218, 90%, 60%, 0.12)',
    color: 'hsl(var(--foreground))',
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col z-10">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="logo-text text-lg text-foreground leading-tight">Handshake Agent</h1>
          <p className="text-xs text-muted-foreground">
            {isThinking ? (streamingText ? 'Typing...' : 'Thinking...') : 'Online'}
          </p>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[85%]">
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'rounded-bl-md'
                  }`}
                  style={msg.role === 'agent' ? agentBubbleStyle : undefined}
                >
                  {renderMarkdown(msg.content)}
                </div>

                {msg.agreement && (
                  <ChatAgreementCard agreement={msg.agreement} />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming message (typing effect) */}
        {streamingId && streamingText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%]">
              <div
                className="rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed"
                style={agentBubbleStyle}
              >
                {renderMarkdown(streamingText)}
                <motion.span
                  className="inline-block w-0.5 h-4 bg-primary/60 ml-0.5 align-middle"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Thinking dots (before streaming starts) */}
        {isThinking && !streamingText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div
              className="rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5"
              style={agentBubbleStyle}
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
      <div className="px-3 pb-20 pt-2">
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
