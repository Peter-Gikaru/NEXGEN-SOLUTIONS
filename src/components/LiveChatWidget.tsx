import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Draggable from 'react-draggable';
import { io, Socket } from 'socket.io-client';
import { MessageSquare, X } from 'lucide-react';

// Use a persistent visitor ID from localStorage or generate one
const getVisitorId = () => {
  let id = localStorage.getItem('nexgen_visitor_id');
  if (!id) {
    id = 'v_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem('nexgen_visitor_id', id);
  }
  return id;
};

export const LiveChatWidget: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string, content: string }[]>([]);
  const [input, setInput] = useState('');
  const location = useLocation();
  const visitorId = getVisitorId();

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      // Connect as visitor and notify admin what page they are on
      newSocket.emit('visitor_connect', { visitorId, page: location.pathname });
    });

    newSocket.on('receive_message', (msg: any) => {
      setMessages(prev => [...prev, { sender: msg.sender, content: msg.content }]);
      if (msg.sender === 'ADMIN' && !isOpen) {
        setIsOpen(true);
      }
    });

    return () => {
      newSocket.emit('visitor_disconnect', { visitorId });
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Update backend whenever the user navigates to a new page
  useEffect(() => {
    if (socket && socket.connected) {
      socket.emit('visitor_connect', { visitorId, page: location.pathname });
    }
  }, [location.pathname, socket, visitorId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    socket.emit('send_message', { visitorId, sender: 'VISITOR', content: input });
    setMessages(prev => [...prev, { sender: 'VISITOR', content: input }]); // Optimistic UI
    setInput('');
  };

  return (
    <Draggable bounds="window" handle=".drag-handle">
      <div className="fixed bottom-6 right-6 z-[100]">
        {isOpen ? (
          <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[400px]">
            <div className="bg-[#0f172a] text-white p-4 flex justify-between items-center drag-handle cursor-move">
              <div>
                <h3 className="font-bold text-sm">NexGen Live Support</h3>
                <p className="text-xs text-slate-400">We typically reply in a few minutes.</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.length === 0 ? (
                <p className="text-center text-slate-400 text-sm mt-10">Send us a message to start chatting!</p>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'VISITOR' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      msg.sender === 'VISITOR' 
                        ? 'bg-[#f59e0b] text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#f59e0b]"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-[#0f172a] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button 
            onClick={() => setIsOpen(true)}
            className="bg-[#f59e0b] text-white p-4 rounded-full shadow-lg hover:bg-[#d97706] hover:scale-105 active:scale-95 transition-all flex items-center justify-center drag-handle cursor-move"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        )}
      </div>
    </Draggable>
  );
};
