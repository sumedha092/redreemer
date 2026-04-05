import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Wifi, Battery, Signal } from 'lucide-react';
import { api } from '@/lib/api';

interface Message {
  role: string;
  content: string;
  created_at: string;
}

interface Props {
  clientId: string;
  clientPhone: string;
  clientName: string;
}

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

export default function PhoneSimulator({ clientId, clientPhone, clientName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  // Poll by phone number — maps directly to Supabase user regardless of mock ID
  const [pollKey, setPollKey] = useState(clientPhone);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const key = encodeURIComponent(pollKey);
      const { data } = await api.get(`/api/clients/${key}/messages`);
      if (Array.isArray(data)) {
        console.log('[PhoneSimulator] messages:', data.length, data);
        setMessages(data);
      }
    } catch (err) {
      console.warn('[PhoneSimulator] fetch failed:', err);
    }
  }, [pollKey]);

  // Reset and restart polling when client changes
  useEffect(() => {
    setMessages([]);
    setTyping(false);
    setPollKey(clientPhone);
  }, [clientId, clientPhone]);

  useEffect(() => {
    fetchMessages();
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(fetchMessages, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const text = input.trim();
    setInput('');
    setSending(true);
    setTyping(true);

    // Optimistically show the sent message immediately
    const optimistic: Message = { role: 'user', content: text, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);

    try {
      if (MOCK_MODE) {
        const { data } = await api.post('/api/sms/simulate', { phone: clientPhone, message: text });
        // If server returns a userId, switch polling to that UUID for accurate results
        if (data?.userId) setPollKey(data.userId);
      } else {
        await api.post('/sms/incoming', new URLSearchParams({
          From: clientPhone, Body: text, To: '+16812726392',
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      }

      // Poll immediately and aggressively until reply arrives
      let prevCount = messages.length + 1; // +1 for the optimistic message
      let attempts = 0;
      const fastPoll = setInterval(async () => {
        attempts++;
        await fetchMessages();
        // Stop typing indicator once we have more messages than before
        setMessages(current => {
          if (current.length > prevCount) {
            setTyping(false);
            clearInterval(fastPoll);
          }
          return current;
        });
        if (attempts >= 25) { clearInterval(fastPoll); setTyping(false); }
      }, 800);

      // Safety timeout
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        clearInterval(fastPoll);
        setTyping(false);
      }, 25000);

    } catch (err) {
      console.error('[PhoneSimulator] send error:', err);
      setTyping(false);
    } finally {
      setSending(false);
    }
  }

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full">
      <p className="text-xs text-muted-foreground mb-3 text-center">
        {MOCK_MODE ? 'Demo mode — Gemini AI' : 'Live SMS via Twilio + Gemini'}
      </p>

      <div className="flex-1 flex flex-col bg-[#1c1c1e] rounded-[2.5rem] border-[3px] border-[#3a3a3c] shadow-2xl overflow-hidden min-h-0" style={{ maxHeight: '680px' }}>
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1 bg-[#1c1c1e] shrink-0">
          <span className="text-white text-xs font-semibold">{time}</span>
          <div className="flex items-center gap-1.5">
            <Signal size={12} className="text-white" />
            <Wifi size={12} className="text-white" />
            <Battery size={14} className="text-white" />
          </div>
        </div>

        {/* Contact header */}
        <div className="flex flex-col items-center py-3 bg-[#1c1c1e] border-b border-[#3a3a3c] shrink-0">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm mb-1">
            {clientName?.[0] ?? '?'}
          </div>
          <p className="text-white text-sm font-semibold">{clientName}</p>
          <p className="text-[#8e8e93] text-xs">{clientPhone}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-4 bg-[#000000] min-h-0">
          {messages.length === 0 && !typing && (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#8e8e93] text-xs text-center">No messages yet.<br />Type below to start.</p>
            </div>
          )}

          <div className="space-y-0.5">
            {messages.map((msg, i) => {
              // user = client sent it (right/blue), assistant = Redreemer replied (left/gray)
              const isUser = msg.role === 'user';
              const showTime = i === 0 ||
                new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() > 60000;

              return (
                <div key={`${msg.created_at}-${i}`}>
                  {showTime && (
                    <p className="text-center text-[#8e8e93] text-[10px] my-2">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-0.5`}>
                    <div
                      className={`max-w-[75%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-[#0a84ff] text-white rounded-[18px] rounded-br-[4px]'
                          : 'bg-[#3a3a3c] text-white rounded-[18px] rounded-bl-[4px]'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="flex justify-start mb-0.5">
                <div className="bg-[#3a3a3c] rounded-[18px] rounded-bl-[4px] px-4 py-3 flex gap-1 items-center">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#8e8e93]"
                      style={{ animation: 'bounce 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="flex items-center gap-2 px-3 py-3 bg-[#1c1c1e] border-t border-[#3a3a3c] shrink-0">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="iMessage"
            disabled={sending}
            className="flex-1 bg-[#3a3a3c] text-white placeholder:text-[#8e8e93] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0a84ff] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-8 h-8 rounded-full bg-[#0a84ff] disabled:bg-[#3a3a3c] flex items-center justify-center transition-colors shrink-0"
          >
            <Send size={14} className="text-white ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
