'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { db, useAuth } from '@/lib/providers';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function AIConsultant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHiddenFully, setIsHiddenFully] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { user } = useAuth();
  const [contextData, setContextData] = useState<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { 
          role: 'model', 
          text: t('ai_welcome', 'Здравствуйте! Я ИИ-консультант StackBox. Я могу помочь вам в управлении проектами и серверами. Что вас интересует?') 
        }
      ]);
      
      // Fetch user data right after opening snippet context
      if (user) {
        const fetchContext = async () => {
          try {
            const qProjects = query(collection(db, "projects"), where("ownerId", "==", user.uid));
            const qServers = query(collection(db, "servers"), where("ownerId", "==", user.uid));
            const [projSnap, servSnap] = await Promise.all([getDocs(qProjects), getDocs(qServers)]);
            
            const projects = projSnap.docs.map(d => ({ id: d.id, name: d.data().name, description: d.data().description, status: d.data().status }));
            const servers = servSnap.docs.map(d => ({ id: d.id, name: d.data().name, ip: d.data().ipAddress, location: d.data().location }));
            
            setContextData(`Current User's Data:\nProjects: ${JSON.stringify(projects)}\nServers: ${JSON.stringify(servers)}`);
          } catch(e) {
            console.error("Error fetching context for AI", e);
          }
        };
        fetchContext();
      }
    }
  }, [isOpen, messages.length, t, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const contents = [
        "System Instruction: You are an AI consultant and technical helper for an IT infrastructure management application called 'StackBox'. StackBox manages Projects, Servers, Services, and Credentials for IT teams. Use markdown for your responses (make them well formatted, use bold fonts, lists when needed). Write in the language of the user's prompt (mostly Russian or English). Be helpful and professional, keep your logic concise.\n\n" + (contextData ? contextData : ""),
        ...messages.map(m => (m.role === 'user' ? 'User: ' : 'AI: ') + m.text),
        "User: " + userMessage
      ].join('\n\n');

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || '...' }]);
    } catch (error) {
      console.error('Gemini API Error:', error);
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
             <button title="Скрыть ИИ-консультанта" onClick={() => setIsHiddenFully(true)} className="w-6 h-6 neu-button rounded-full flex items-center justify-center text-[var(--neu-text-muted)] opacity-50 hover:opacity-100 hover:text-red-400 focus:outline-none transition-colors">
                <X className="w-3.5 h-3.5" />
             </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="w-12 h-12 neu-button-accent rounded-full flex items-center justify-center shadow-lg opacity-90 hover:opacity-100 focus:outline-none"
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
              width: isExpanded ? 'calc(100vw - 48px)' : '400px',
              height: isExpanded ? 'calc(100vh - 48px)' : '550px',
              bottom: isExpanded ? '24px' : '24px',
              right: isExpanded ? '24px' : '24px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 flex flex-col overflow-hidden max-w-md w-[calc(100vw-32px)] sm:w-[400px] sm:h-[600px] h-[calc(100vh-100px)] bottom-24 right-4 sm:bottom-24 sm:right-6 bg-[var(--neu-bg)] neu-panel`}
            style={{ 
              borderRadius: '32px',
            }}
          >
            {/* Header */}
            <div className="flex flex-col items-center justify-center pt-8 pb-4 relative">
              <h3 className="font-bold text-[22px] text-[var(--neu-text)] text-opacity-80 text-center w-full">StackBox AI Chat</h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="absolute right-6 top-8 p-1.5 rounded-full text-[var(--neu-text-muted)] hover:text-[var(--neu-text)] transition-colors"
                title="Закрыть"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main Panel Container */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] px-6 py-5 text-[15px] shadow-sm leading-relaxed rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-[var(--neu-accent)] text-white font-medium rounded-br-md shadow-[0_4px_14px_0_rgba(14,165,233,0.39)]' 
                        : 'neu-panel-inset text-[var(--neu-text)] font-medium rounded-bl-md'
                    }`}>
                      {msg.role === 'user' ? (
                        <div>{msg.text}</div>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:mb-2 prose-headings:mt-3 prose-ul:my-1">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="neu-panel-inset rounded-[24px] rounded-bl-md px-6 py-5 flex gap-1.5 items-center">
                      <span className="w-2 h-2 bg-[var(--neu-accent)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-[var(--neu-accent)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-[var(--neu-accent)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <div className="px-6 pb-6 pt-2 bg-transparent">
                <form onSubmit={handleSubmit} className="flex gap-4 relative items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('ai_placeholder', 'Спросите меня о чем угодно...')}
                    className="flex-1 text-[15px] py-4 pl-6 pr-4 neu-panel-inset rounded-2xl font-medium text-[var(--neu-text)] placeholder:text-[var(--neu-text-muted)] placeholder:opacity-60 focus:outline-none"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit" 
                    disabled={!input.trim() || isLoading}
                    className="w-[52px] h-[52px] shrink-0 flex items-center justify-center rounded-full neu-panel text-[#2563ea] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-[20px] h-[20px] ml-1" />
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
