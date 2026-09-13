import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Menu, Plus, MessageCircle, Settings, Trash2, X, User, Bot, Sparkles } from 'lucide-react';

interface Message {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const WebApp = (window as any).Telegram?.WebApp;
  const API_URL = import.meta.env.VITE_API_URL || '/api';
  const userId = WebApp?.initDataUnsafe?.user?.id || 123456789; 

  useEffect(() => {
    WebApp?.ready();
    WebApp?.expand();
    if (WebApp) {
      document.documentElement.style.setProperty('--tg-viewport-height', `${WebApp.viewportHeight || window.innerHeight}px`);
    }
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history?user_id=${userId}`);
      setMessages(res.data.history.reverse());
    } catch (error) {
      console.error('Failed to load history', error);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, {
        user_id: userId,
        message: text
      });

      const aiMessage: Message = { role: 'assistant', content: res.data.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message', error);
      const errorMessage: Message = { role: 'assistant', content: '❌ Xatolik yuz berdi.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!confirm('Chat tarixini tozalaysizmi?')) return;
    try {
      await axios.post(`${API_URL}/clear`, { user_id: userId });
      setMessages([]);
      setSidebarOpen(false);
    } catch (error) {
      console.error('Error clearing chat', error);
    }
  };

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden text-white bg-black/40">
      
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 absolute lg:relative lg:translate-x-0 z-50 flex flex-col w-[280px] h-full glass border-r-0 border-white/10 p-4 shadow-2xl`}>
        {/* Top Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent px-2">AI Yordamchi</h2>
          <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-full lg:hidden text-white transition">
            <X size={20} />
          </button>
        </div>
        
        <button 
          onClick={clearChat}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white rounded-xl py-3 px-4 text-sm transition font-medium shadow-[0_0_15px_rgba(6,182,212,0.3)] w-full border border-cyan-400/30"
        >
          <Plus size={18} />
          Yangi suhbat
        </button>

        <div className="mt-6 flex-1 overflow-y-auto no-scrollbar">
          <h3 className="text-[11px] font-bold text-cyan-400 mb-3 px-3 uppercase tracking-wider">Tarix</h3>
          <button className="flex items-center gap-3 w-full p-3 bg-white/10 rounded-xl text-sm text-left border border-white/5 hover:bg-white/20 transition shadow-sm">
            <MessageCircle size={18} className="text-cyan-400" />
            <span className="truncate font-medium text-white">Joriy suhbat</span>
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
          <button onClick={clearChat} className="flex items-center gap-3 p-3 hover:bg-red-500/20 rounded-xl text-sm transition text-red-400 border border-transparent hover:border-red-500/30">
            <Trash2 size={18} />
            <span className="font-medium">Tarixni tozalash</span>
          </button>
          <button className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl text-sm transition text-gray-200">
            <Settings size={18} className="text-gray-400" />
            <span className="font-medium">Sozlamalar</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header / Navbar */}
        <div className="flex items-center justify-between p-4 glass-header z-10 absolute top-0 left-0 right-0 shadow-lg shadow-black/20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-full lg:hidden text-white transition">
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-white/20">
                <Bot size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-wide">Smart AI</h1>
                <p className="text-[11px] text-cyan-400 font-medium tracking-wider">ONLINE</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto pb-24 pt-24 px-4 md:px-10 scroll-smooth no-scrollbar relative z-0">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center gap-5 animate-in fade-in duration-700 zoom-in-95">
              <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)] border border-cyan-400/20">
                <Sparkles size={40} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent mb-2">Qanday yordam bera olaman?</h2>
                <p className="text-gray-300 text-sm max-w-sm mx-auto leading-relaxed">
                  Savollaringizni bering, kod yozdiring yoki istalgan mavzuda suhbatlashing.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-auto shadow-lg border border-white/10 ${msg.role === 'user' ? 'bg-white/20 backdrop-blur-md text-white' : 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'}`}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  
                  <div 
                    className={`px-5 py-3.5 text-[15px] leading-relaxed whitespace-pre-wrap shadow-lg backdrop-blur-md rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-cyan-500/80 text-white rounded-br-sm border border-cyan-400/30' 
                        : 'glass text-gray-100 rounded-bl-sm border-white/10'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3 max-w-[85%] mr-auto animate-in fade-in slide-in-from-bottom-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center shrink-0 mt-auto shadow-[0_0_10px_rgba(6,182,212,0.4)] border border-white/20">
                    <Bot size={18} />
                  </div>
                  <div className="px-5 py-4 glass text-white rounded-2xl rounded-bl-sm flex gap-1.5 items-center shadow-lg border-white/10">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce shadow-[0_0_5px_rgba(6,182,212,0.8)]" style={{animationDelay: '150ms'}} />
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce shadow-[0_0_5px_rgba(6,182,212,0.8)]" style={{animationDelay: '300ms'}} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-10 pb-6 px-4 md:px-10 z-10">
          <div className="max-w-3xl mx-auto relative flex items-end gap-2 glass-input p-1.5 rounded-[28px] shadow-[0_0_20px_rgba(0,0,0,0.3)] focus-within:border-cyan-400/50 transition-all focus-within:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Suhbatni boshlang..."
              className="flex-1 bg-transparent border-none px-5 py-3.5 outline-none resize-none overflow-hidden max-h-32 text-[15px] text-white placeholder-gray-400 font-medium"
              rows={1}
              style={{ minHeight: '52px' }}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              className="m-1 p-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-full hover:opacity-90 disabled:opacity-30 transition shadow-lg shrink-0 border border-white/20"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
