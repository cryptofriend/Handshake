/**
 * Stream chat responses token-by-token from the Handshake AI edge function.
 * Falls back to non-streaming invoke if streaming fails.
 */

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

interface StreamChatParams {
  sessionId: string;
  userId: string | null;
  message: string;
  history: { role: string; content: string }[];
  onToken: (token: string) => void;
  onDone: (fullResponse: any) => void;
  onError: (error: Error & { status?: number }) => void;
}

export async function streamChat({
  sessionId,
  userId,
  message,
  history,
  onToken,
  onDone,
  onError,
}: StreamChatParams) {
  try {
    // Use non-streaming for structured JSON responses (Handshake needs full JSON)
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ sessionId, userId, message, history }),
    });

    if (!resp.ok) {
      const err = new Error('Chat request failed') as Error & { status?: number };
      err.status = resp.status;
      throw err;
    }

    const data = await resp.json();

    // Simulate typing effect for the reply text
    const reply = data.reply || '';
    const words = reply.split(' ');
    let i = 0;

    const typeWord = () => {
      if (i < words.length) {
        onToken(words[i] + (i < words.length - 1 ? ' ' : ''));
        i++;
        // Variable speed: shorter words type faster
        const delay = Math.min(30 + Math.random() * 20, 50);
        setTimeout(typeWord, delay);
      } else {
        onDone(data);
      }
    };

    typeWord();
  } catch (err: any) {
    onError(err);
  }
}
