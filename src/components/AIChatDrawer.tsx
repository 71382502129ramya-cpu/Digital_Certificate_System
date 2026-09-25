import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User as UserIcon,
  ShieldCheck,
  GraduationCap,
  RefreshCw,
  Copy,
  Check,
  Minimize2,
  Maximize2,
  ChevronDown,
} from 'lucide-react';
import { useCertificate } from '../context/CertificateContext';
import { sendAIChatMessage, ChatMessage } from '../utils/aiService';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose }) => {
  const { currentUser, certificates, institutions, events } = useCertificate();
  const role = currentUser?.role || 'student';
  const isAdmin = role === 'admin';

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-init',
        role: 'model',
        content: isAdmin
          ? `Greetings, Administrator. I am your CertVault Security & Compliance Copilot. I can assist with cryptographic integrity audits, SHA-256 ledger verification, drafting formal certificate conferral text, or analyzing suspicious verification logs. How may I assist your registrar office?`
          : `Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! I am your CertVault Academic & Career Advisor. I can help translate your verified certificates into high-impact resume bullet points, prepare you for upcoming hackathons, or explain cryptographic verification badges to employers. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const studentQuickPrompts = [
    'How do I showcase my SHA-256 certificate on LinkedIn?',
    'What skills from my certificates are most in-demand?',
    'Recommend upcoming events based on my credentials',
    'Explain how cryptographic tamper detection works',
  ];

  const adminQuickPrompts = [
    'Explain the avalanche effect in our SHA-256 ledger',
    'What is the standard protocol for certificate revocation?',
    'Draft an academic citation for Cloud Architecture',
    'Summarize recent verification security logs',
  ];

  const quickPrompts = isAdmin ? adminQuickPrompts : studentQuickPrompts;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const historyForApi = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const contextData = {
        userName: currentUser?.name,
        role: currentUser?.role,
        totalCerts: certificates.length,
        institutionsCount: institutions.length,
        eventsCount: events.length,
      };

      const replyText = await sendAIChatMessage(historyForApi, role, contextData);

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'model',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'model',
        content: `I encountered an issue processing your request. Please check your network connection or try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full sm:w-[420px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-64px)] bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Drawer Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">
                {isAdmin ? 'CertVault Security Copilot' : 'CertVault AI Advisor'}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isAdmin ? 'Cryptographic & Compliance Assistant' : 'Academic & Career Advisor'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-xs'
                  : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              <div
                className={`mt-1.5 flex items-center justify-between text-[10px] ${
                  msg.role === 'user' ? 'text-emerald-200' : 'text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.role === 'model' && (
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.content)}
                    className="hover:text-emerald-300 ml-2 transition-colors cursor-pointer"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center shrink-0 mt-0.5">
                <UserIcon className="w-4 h-4 text-emerald-400" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl rounded-tl-xs p-3 flex items-center gap-1.5 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[11px] ml-1">Analyzing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isAdmin ? 'Ask compliance or cryptographic question...' : 'Ask about your certificates, resume, or events...'}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || loading}
          className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
