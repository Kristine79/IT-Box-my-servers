'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { db, useAuth } from '@/lib/providers';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function AIConsultant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHiddenFully, setIsHiddenFully] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai-chat-history');
      if (saved) {
        try { return JSON.parse(saved); } catch { return []; }
      }
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { user, userPlan } = useAuth();
  const [contextData, setContextData] = useState<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem('ai-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { 
          role: 'model', 
          text: t('ai_welcome', 'Здравствуйте! Я StackBox AI — ваш технический консультант. Помогу с управлением инфраструктурой, напишу конфиги Nginx/Docker/systemd, помогу с DevOps-задачами. Что вас интересует?') 
        }
      ]);
      
      if (user && !user.isAnonymous) {
        const fetchContext = async () => {
          try {
            const [projSnap, servSnap, svcSnap, credSnap] = await Promise.all([
              getDocs(query(collection(db, "projects"), where("ownerId", "==", user.uid))),
              getDocs(query(collection(db, "servers"), where("ownerId", "==", user.uid))),
              getDocs(query(collection(db, "services"), where("ownerId", "==", user.uid))),
              getDocs(query(collection(db, "credentials"), where("ownerId", "==", user.uid))),
            ]);
            
            const projects = projSnap.docs.map(d => ({ name: d.data().name, description: d.data().description, status: d.data().status, stack: d.data().stack }));
            const servers = servSnap.docs.map(d => ({ name: d.data().name, ip: d.data().ipAddress, location: d.data().location, os: d.data().os, provider: d.data().provider }));
            const services = svcSnap.docs.map(d => ({ name: d.data().name, url: d.data().url, port: d.data().port, status: d.data().status }));
            const creds = credSnap.docs.map(d => ({ name: d.data().name, type: d.data().type, host: d.data().host }));
            
            const ctx = [
              `User Plan: ${userPlan}`,
              `Projects (${projects.length}): ${JSON.stringify(projects)}`,
              `Servers (${servers.length}): ${JSON.stringify(servers)}`,
              `Services (${services.length}): ${JSON.stringify(services)}`,
              `Credentials (${creds.length}, passwords hidden): ${JSON.stringify(creds)}`,
            ].join('\n');
            setContextData(ctx);
          } catch(e) {
            console.error("Error fetching context for AI", e);
          }
        };
        fetchContext();
      }
    }
  }, [isOpen, messages.length, t, user, userPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const allMessages = [...messages, { role: 'user' as const, text: userMessage }];

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          context: contextData,
          uid: user?.uid || 'guest',
          plan: userPlan,
        }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'model', text: data.message || t('ai_rate_limit', 'Лимит сообщений на сегодня исчерпан.') }]);
        setRemaining(0);
        return;
      }

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      // Streaming SSE
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let fullText = '';

      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) {
                fullText += parsed.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'model', text: fullText };
                  return updated;
                });
              }
              if (parsed.remaining !== undefined) {
                setRemaining(parsed.remaining);
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: t('ai_error', 'Произошла ошибка при обращении к ИИ. Пожалуйста, попробуйте позже.') }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && !isHiddenFully && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-4 right-4 z-50 flex flex-col items-center gap-2"
          >
             <button title="Скрыть ИИ-консультанта" aria-label="Hide AI assistant" onClick={() => setIsHiddenFully(true)} className="w-6 h-6 neu-button rounded-full flex items-center justify-center text-[var(--neu-text-muted)] opacity-50 hover:opacity-100 hover:text-red-400 focus:outline-none transition-colors">
                <X className="w-3.5 h-3.5" />
             </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="w-12 h-12 neu-button-accent rounded-full flex items-center justify-center shadow-lg opacity-90 hover:opacity-100 focus:outline-none"
              aria-label="Open AI assistant"
            >
              <Bot className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 flex flex-col overflow-hidden max-w-sm w-[calc(100vw-24px)] sm:w-[340px] md:w-[360px] h-[calc(100vh-160px)] sm:h-[420px] md:h-[460px] bottom-16 right-2 sm:right-4 md:right-5 bg-[var(--neu-bg)] neu-panel shadow-[8px_8px_16px_var(--neu-dark),-8px_-8px_16px_var(--neu-light)]`}
            style={{ 
              borderRadius: '32px',
            }}
          >
            {/* Header */}
            <div className="flex flex-col items-center justify-center pt-5 pb-3 relative shrink-0">
              <h3 className="font-bold text-lg md:text-xl text-[var(--neu-text)] text-opacity-80 tracking-tight">StackBox AI</h3>
              {remaining !== null && userPlan !== 'premium' && (
                <span className="text-[10px] text-[var(--neu-text-muted)] mt-0.5">
                  {remaining > 0 ? `${remaining} ${t('messages_left', 'сообщ. осталось')}` : t('limit_reached', 'Лимит исчерпан')}
                </span>
              )}
              {userPlan === 'premium' && (
                <span className="text-[10px] text-[var(--neu-accent)] mt-0.5">PRO model</span>
              )}
              <div className="absolute right-5 top-4 flex gap-1">
                <button 
                  onClick={() => { setMessages([]); localStorage.removeItem('ai-chat-history'); }}
                  className="p-1 rounded-full text-[var(--neu-text-muted)] hover:text-[var(--neu-text)] transition-colors"
                  title={t('clear_chat', 'Очистить чат')}
                  aria-label="Clear chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1 rounded-full text-[var(--neu-text-muted)] hover:text-[var(--neu-text)] transition-colors"
                  title="Закрыть"
                  aria-label="Close AI chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Panel Container */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-[var(--neu-text-muted)]/30 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] px-4 py-3 text-[14px] leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[var(--neu-accent)] text-white font-medium rounded-2xl rounded-br-md shadow-[0_4px_14px_0_rgba(14,165,233,0.39)]' 
                        : 'neu-panel-inset text-[var(--neu-text)] font-medium rounded-2xl !shadow-[inset_3px_3px_8px_var(--neu-dark),inset_-3px_-3px_8px_var(--neu-light)] border border-white/5'
                    }`}>
                      {msg.role === 'user' ? (
                        <div>{msg.text}</div>
                      ) : (
                        <div className="prose prose-lg dark:prose-invert max-w-none prose-p:my-1 prose-headings:mb-2 prose-headings:mt-3 prose-ul:my-1">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="neu-panel-inset rounded-[24px] px-6 py-5 flex gap-1.5 items-center">
                      <span className="w-2.5 h-2.5 bg-[var(--neu-accent)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2.5 h-2.5 bg-[var(--neu-accent)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2.5 h-2.5 bg-[var(--neu-accent)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <div className="px-5 pb-6 pt-3 bg-transparent mt-auto">
                <form onSubmit={handleSubmit} className="flex gap-3 relative items-center">
                  <div className="flex-1 relative h-[48px]">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t('ai_placeholder', 'Спросите меня о чем угодно...')}
                      className="w-full h-full text-[14px] pl-4 pr-10 neu-panel-inset rounded-2xl font-medium text-[var(--neu-text)] placeholder:text-[var(--neu-text-muted)] placeholder:opacity-60 focus:outline-none !shadow-[inset_3px_3px_8px_var(--neu-dark),inset_-3px_-3px_8px_var(--neu-light)]"
                      disabled={isLoading}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={!input.trim() || isLoading}
                    className="w-[44px] h-[44px] shrink-0 flex items-center justify-center rounded-full neu-panel text-[#2563ea] disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_8px_var(--neu-dark),-4px_-4px_8px_var(--neu-light)] active:shadow-inner"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
