import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

// ─── Topic Config ─────────────────────────────────────────────────────────────
const TOPICS = [
  { id: 'general', name: 'General', icon: '💬', color: 'bg-blue-500' },
  { id: 'hr', name: 'HR Interview', icon: '🎤', color: 'bg-purple-500' },
  { id: 'technical', name: 'Technical', icon: '💻', color: 'bg-indigo-500' },
  { id: 'dsa', name: 'DSA', icon: '⚡', color: 'bg-emerald-500' },
  { id: 'sql', name: 'SQL', icon: '🗄️', color: 'bg-cyan-500' },
  { id: 'dbms', name: 'DBMS', icon: '🏗️', color: 'bg-amber-500' },
  { id: 'oop', name: 'OOP', icon: '🧱', color: 'bg-rose-500' },
  { id: 'resume', name: 'Resume Advice', icon: '📄', color: 'bg-teal-500' },
  { id: 'career', name: 'Career Guidance', icon: '🚀', color: 'bg-sky-500' },
  { id: 'company', name: 'Company Prep', icon: '🏢', color: 'bg-orange-500' }
];

const PROMPT_SUGGESTIONS = {
  general: ["How should I prepare for campus placements?", "What skills are most in demand right now?"],
  hr: ["Tell me about yourself - give a model answer", "How do I answer 'What is your biggest weakness?'"],
  technical: ["What are common technical questions asked in 1st round?", "Explain REST API vs GraphQL"],
  dsa: ["Explain Binary Search with code and complexity", "Give me 5 top array patterns for LeetCode"],
  sql: ["Write a query to find the 2nd highest salary", "Explain INNER JOIN vs LEFT JOIN with examples"],
  dbms: ["Explain ACID properties with real-world examples", "What is Normalization? Explain 1NF to BCNF"],
  oop: ["Explain the 4 pillars of OOP with code examples", "What is the difference between Abstract Class and Interface?"],
  resume: ["How do I write ATS-friendly bullet points?", "What projects should a CSE student put on their resume?"],
  career: ["Create a 3-month placement preparation roadmap", "Should I focus on Competitive Programming or Web Dev?"],
  company: ["What is the hiring process for Amazon SDE-1?", "How to prepare for TCS Digital vs TCS NQT?"]
};

// Simple Markdown Formatter Helper
const FormatMarkdown = ({ content }) => {
  if (!content) return null;

  // Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const match = part.match(/^```(\w+)?\n([\s\S]*?)```$/);
          const lang = match ? match[1] || '' : '';
          const code = match ? match[2] : part.replace(/^```\w*\n?/, '').replace(/```$/, '');
          return (
            <div key={i} className="my-3 rounded-xl overflow-hidden bg-gray-900 text-gray-100 text-xs font-mono border border-gray-800">
              {lang && <div className="bg-gray-800 px-4 py-1.5 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">{lang}</div>}
              <pre className="p-4 overflow-x-auto whitespace-pre-wrap">{code.trim()}</pre>
            </div>
          );
        }

        // Regular text parsing (bold, list items)
        const lines = part.split('\n');
        return (
          <div key={i} className="space-y-1">
            {lines.map((line, idx) => {
              if (!line.trim()) return <div key={idx} className="h-1" />;

              // Handle Bullet points
              if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                const text = line.trim().substring(2);
                return (
                  <div key={idx} className="flex gap-2 items-start ml-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{parseInline(text)}</span>
                  </div>
                );
              }

              // Handle numbered lists
              if (/^\d+\./.test(line.trim())) {
                return (
                  <div key={idx} className="flex gap-2 items-start ml-2">
                    <span className="font-semibold text-primary">{line.match(/^\d+\./)[0]}</span>
                    <span>{parseInline(line.replace(/^\d+\./, '').trim())}</span>
                  </div>
                );
              }

              // Headings
              if (line.startsWith('### ')) return <h4 key={idx} className="font-bold text-gray-900 mt-3 text-base">{parseInline(line.substring(4))}</h4>;
              if (line.startsWith('## ')) return <h3 key={idx} className="font-bold text-gray-900 mt-4 text-lg border-b pb-1">{parseInline(line.substring(3))}</h3>;

              return <p key={idx}>{parseInline(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

// Helper to parse **bold** and `code`
function parseInline(text) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i} className="font-bold text-gray-900">{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith('`') && p.endsWith('`')) {
      return <code key={i} className="bg-gray-100 text-primary px-1.5 py-0.5 rounded font-mono text-xs border">{p.slice(1, -1)}</code>;
    }
    return p;
  });
}

// ─── Main Chat Component ──────────────────────────────────────────────────────
const CareerChat = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeTopic, setActiveTopic] = useState('general');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Fetch user conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Load selected conversation
  const loadConversation = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/chat/conversations/${id}/messages`);
      setCurrentConvId(id);
      setActiveTopic(res.data.conversation.topic || 'general');
      setMessages(res.data.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Start new conversation
  const startNewChat = (topicId = activeTopic) => {
    setCurrentConvId(null);
    setActiveTopic(topicId);
    setMessages([]);
  };

  // Send message
  const handleSendMessage = async (textToSend = inputMessage) => {
    if (!textToSend.trim() || loading) return;

    const userText = textToSend.trim();
    setInputMessage('');

    // Optimistically push user message
    const tempUserMsg = { id: Date.now(), role: 'user', content: userText };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.post('/chat/message', {
        conversation_id: currentConvId,
        message: userText,
        topic: activeTopic
      });

      const { conversation_id, message: assistantReply } = res.data;
      
      if (!currentConvId) {
        setCurrentConvId(conversation_id);
        fetchConversations();
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: assistantReply }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: '⚠️ Failed to get response. Please check your network or try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Delete conversation
  const handleDeleteConv = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      try {
        await api.delete(`/chat/conversations/${id}`);
        if (currentConvId === id) startNewChat();
        fetchConversations();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-50 overflow-hidden">
      
      {/* ── Left Sidebar (Conversations & Topics) ── */}
      <div className={`w-80 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-10 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full absolute md:relative md:translate-x-0'}`}>
        
        {/* Top Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <button 
            onClick={() => startNewChat()}
            className="flex-1 bg-gradient-to-r from-primary to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl hover:shadow-md transition flex items-center justify-center gap-2 text-sm"
          >
            <span>+</span> New Chat
          </button>
        </div>

        {/* Topic Selector Bar */}
        <div className="p-3 border-b border-gray-100 bg-gray-50">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Focus Topic</label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {TOPICS.map(t => (
              <button
                key={t.id}
                onClick={() => { setActiveTopic(t.id); if(!currentConvId) setMessages([]); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${activeTopic === t.id ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'}`}
              >
                <span>{t.icon}</span> {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">History</h4>
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-400 px-2 py-4 text-center">No chat history yet.</p>
          ) : (
            conversations.map(c => (
              <div
                key={c.id}
                onClick={() => loadConversation(c.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer text-sm transition-all ${currentConvId === c.id ? 'bg-indigo-50 text-primary font-semibold border border-indigo-100' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-base">{TOPICS.find(t => t.id === c.topic)?.icon || '💬'}</span>
                  <span className="truncate text-xs">{c.title}</span>
                </div>
                <button 
                  onClick={(e) => handleDeleteConv(e, c.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* User Info Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>Logged as <strong className="text-gray-800">{user?.full_name?.split(' ')[0]}</strong></span>
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Online</span>
        </div>
      </div>

      {/* ── Right Main Chat View ── */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        
        {/* Chat Top Nav Bar */}
        <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              ☰
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{TOPICS.find(t => t.id === activeTopic)?.icon}</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{TOPICS.find(t => t.id === activeTopic)?.name} Assistant</h3>
                <p className="text-[11px] text-gray-400">Powered by OpenAI GPT-4o</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => startNewChat()}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear Screen
          </button>
        </div>

        {/* Chat Message Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Welcome Screen if empty */}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center text-3xl shadow-lg mb-4">
                {TOPICS.find(t => t.id === activeTopic)?.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                CareerCompass AI — {TOPICS.find(t => t.id === activeTopic)?.name} Coach
              </h2>
              <p className="text-gray-500 text-sm mb-8 max-w-md">
                Ask any question about interviews, technical concepts, or career advice. Pick a suggestion below to get started!
              </p>

              {/* Prompt Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {(PROMPT_SUGGESTIONS[activeTopic] || PROMPT_SUGGESTIONS.general).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-4 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-2xl text-xs text-gray-700 font-medium transition-all text-left flex justify-between items-center group"
                  >
                    <span>"{prompt}"</span>
                    <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages list */}
          {messages.map((m, i) => (
            <motion.div
              key={m.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 mt-1">
                  AI
                </div>
              )}

              <div 
                className={`max-w-3xl p-5 rounded-2xl shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none'
                }`}
              >
                {m.role === 'user' ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <FormatMarkdown content={m.content} />
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 mt-1">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
              )}
            </motion.div>
          ))}

          {/* Loading Typing Animation */}
          {loading && (
            <div className="flex gap-4 items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
                AI
              </div>
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="max-w-4xl mx-auto relative flex items-center"
          >
            <textarea
              rows="1"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Ask a question about ${TOPICS.find(t => t.id === activeTopic)?.name}... (Press Enter)`}
              className="w-full pl-5 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-sm text-gray-800"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="absolute right-3 p-2.5 bg-primary text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-700 transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </form>
          <p className="text-center text-[11px] text-gray-400 mt-2">CareerCompass AI Assistant can make mistakes. Verify important technical details.</p>
        </div>

      </div>

    </div>
  );
};

export default CareerChat;
