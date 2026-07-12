import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useLocation } from 'react-router-dom';

export const SupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: string; sender: string; content: string; createdAt: string }[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    let vId = localStorage.getItem('visitor_id');
    if (!vId) {
      vId = 'v_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('visitor_id', vId);
    }

    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http:
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('visitor_connect', { visitorId: vId, page: window.location.pathname });
    });

    newSocket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.emit('visitor_disconnect', { visitorId: vId });
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && socket.connected) {
      const vId = localStorage.getItem('visitor_id');
      socket.emit('visitor_connect', { visitorId: vId, page: location.pathname });
    }
  }, [location.pathname, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    const vId = localStorage.getItem('visitor_id');
    socket.emit('send_message', { visitorId: vId, sender: 'VISITOR', content: input });
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 bg-white border border-slate-200 shadow-2xl rounded-2xl w-80 sm:w-96 overflow-hidden flex flex-col h-[450px] transform origin-bottom-right transition-all">
          <div className="bg-[#0A1128] p-4 flex justify-between items-center text-white">
            <div>
              <h3 className="font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
                Live Chat Support
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">We typically reply in a few minutes</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
            <div className="text-center mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">Today</span>
            </div>
            
            <div className="self-start max-w-[85%] bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
              <p className="text-sm text-slate-700">Hi there! 👋 How can we help you today?</p>
            </div>
            
            {messages.map((msg, i) => {
              const isVisitor = msg.sender === 'VISITOR';
              return (
                <div key={i} className={`self-${isVisitor ? 'end' : 'start'} max-w-[85%] ${isVisitor ? 'bg-[#0A1128] text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'} rounded-2xl px-4 py-2.5 shadow-sm`}>
                  <p className="text-sm break-words">{msg.content}</p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="bg-[#F59E0B] text-white p-2.5 rounded-xl disabled:opacity-50 hover:bg-amber-600 transition-colors shadow-sm cursor-pointer shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#F59E0B] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(245,158,11,0.4)] hover:bg-amber-500 transition-all hover:scale-105 cursor-pointer z-50 group relative"
        aria-label="Support"
      >
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
          </span>
        )}
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />}
      </button>
    </div>
  );
};
