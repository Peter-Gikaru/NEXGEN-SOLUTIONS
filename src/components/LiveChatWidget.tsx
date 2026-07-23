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

  const nodeRef = React.useRef(null);

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle">
      <div ref={nodeRef} className="fixed bottom-6 right-6 z-[100]">
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
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-2">
                  <p className="text-slate-500 text-sm mb-2">
                    Start a live chat with our agents below, or use our alternative support channels:
                  </p>
                  <button 
                    onClick={() => window.open(`https://wa.me/254717043408?text=${encodeURIComponent('Hello NexGen Gadgets Support, I need help with...')}`, '_blank')}
                    className="w-full bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 3.825 0 6.938 3.112 6.938 6.937 0 3.825-3.113 6.938-6.938 6.938z"/></svg>
                    WhatsApp Support
                  </button>
                  <button
                    onClick={() => window.open('/faq', '_self')}
                    className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    Visit FAQ
                  </button>
                </div>
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
            aria-label="Open Live Chat"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        )}
      </div>
    </Draggable>
  );
};
