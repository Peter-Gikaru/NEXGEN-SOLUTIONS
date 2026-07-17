import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Users, Circle, Clock, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface VisitorSession {
  visitorId: string;
  status: string;
  ipAddress: string | null;
  page?: string;
  createdAt: string;
  lastSeen: string;
  user?: { name: string, email: string } | null;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
}

const AdminLiveChat: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [visitors, setVisitors] = useState<VisitorSession[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Audio for notifications
  const [audio] = useState(new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg'));

  useEffect(() => {
    
    api.get('/livechat/visitors').then(res => setVisitors(res.data)).catch(console.error);

    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('admin_join');
    });

    newSocket.on('new_visitor', (data: VisitorSession) => {
      setVisitors(prev => {
        const exists = prev.find(v => v.visitorId === data.visitorId);
        if (exists) return prev;
        return [data, ...prev];
      });
      const displayName = data.user ? `${data.user.name} (User)` : `Guest Visitor (${data.visitorId.slice(0, 6)})`;
      toast(`New active visitor: ${displayName}`, { icon: '💬' });
      audio.play().catch(console.error);
    });

    newSocket.on('visitor_status_update', (data: { visitorId: string, status: string, page?: string, user?: { name: string, email: string } | null }) => {
      setVisitors(prev => prev.map(v => 
        v.visitorId === data.visitorId 
          ? { ...v, status: data.status, page: data.page || v.page, user: data.user !== undefined ? data.user : v.user, lastSeen: new Date().toISOString() } 
          : v
      ));
    });

    newSocket.on('receive_message', (msg: ChatMessage & { visitorId: string }) => {
      if (msg.sender === 'VISITOR') {
        audio.play().catch(console.error);
      }
      if (msg.visitorId === selectedVisitor) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [audio, selectedVisitor]);

  
  useEffect(() => {
    if (selectedVisitor) {
      api.get(`/livechat/visitors/${selectedVisitor}/messages`)
        .then(res => setMessages(res.data))
        .catch(console.error);
    } else {
      setMessages([]);
    }
  }, [selectedVisitor]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !selectedVisitor) return;
    socket.emit('send_message', { visitorId: selectedVisitor, sender: 'ADMIN', content: input });
    setInput('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex h-[600px]">
      {/* Sidebar: Visitor List */}
      <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#F59E0B]" /> Active Visitors
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {visitors.map(v => (
            <div 
              key={v.visitorId}
              onClick={() => setSelectedVisitor(v.visitorId)}
              className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-white transition-colors ${selectedVisitor === v.visitorId ? 'bg-white border-l-4 border-l-[#F59E0B]' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold text-sm text-slate-800 truncate pr-2">
                  {v.user ? v.user.name : `Visitor ${v.visitorId.slice(0, 6)}`}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  <Circle className={`w-2 h-2 fill-current ${v.status === 'ONLINE' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold text-slate-500">{v.status}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 mb-1">
                Page: {v.page || 'Unknown'}
              </p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 
                  Seen: {new Date(v.lastSeen).toLocaleTimeString()}
                </p>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  v.user ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {v.user ? 'User' : 'Guest'}
                </span>
              </div>
            </div>
          ))}
          {visitors.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              No active visitors recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white relative">
        {selectedVisitor ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
              <div>
                {(() => {
                  const currentVisitor = visitors.find(v => v.visitorId === selectedVisitor);
                  return (
                    <>
                      <h3 className="font-bold text-slate-800">
                        {currentVisitor?.user ? currentVisitor.user.name : `Visitor ${selectedVisitor.slice(0, 6)}`}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {currentVisitor?.user ? `${currentVisitor.user.email} (Registered User)` : 'Live Chat Guest'}
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50 flex flex-col gap-4">
              {messages.map((msg, i) => {
                const isAdmin = msg.sender === 'ADMIN';
                return (
                  <div key={msg.id || i} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isAdmin ? 'bg-[#F59E0B] text-white rounded-tr-sm shadow-md shadow-amber-500/20' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
                      <p className="text-sm break-words">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 mx-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={sendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message to the visitor..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-[#F59E0B] text-white px-5 rounded-xl disabled:opacity-50 hover:bg-amber-600 transition-colors shadow-md flex items-center justify-center shrink-0 cursor-pointer font-bold"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare className="w-16 h-16 mb-4 text-slate-200" />
            <p className="text-lg font-medium text-slate-500">Select a visitor to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLiveChat;
