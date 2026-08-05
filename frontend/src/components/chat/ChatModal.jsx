'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, User } from 'lucide-react';
import { format } from 'date-fns';
import Modal from '../shared/Modal';
import { messagesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';

export default function ChatModal({ open, onClose, session }) {
  const { user } = useAuth();
  const socket   = useSocket();
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef  = useRef(null);
  const typingTimeout = useRef(null);

  const roomId    = session?.roomId;
  const otherUser = session?.otherUser;

  useEffect(() => {
    if (!open || !otherUser?.id) return;
    setLoading(true);
    messagesAPI.getHistory(otherUser.id)
      .then(res => setMessages(res.data.messages))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [open, otherUser?.id]);

  useEffect(() => {
    if (!socket || !open || !roomId) return;

    socket.emit('join_room', { roomId });

    const onReceive = (msg) => {
      if (msg.roomId === roomId) setMessages(prev => [...prev, msg]);
    };
    const onTyping      = ({ userId }) => { if (userId === otherUser?.id) setOtherTyping(true); };
    const onStopTyping  = ({ userId }) => { if (userId === otherUser?.id) setOtherTyping(false); };

    socket.on('receive_message', onReceive);
    socket.on('user_typing', onTyping);
    socket.on('user_stop_typing', onStopTyping);

    return () => {
      socket.emit('leave_room', { roomId });
      socket.off('receive_message', onReceive);
      socket.off('user_typing', onTyping);
      socket.off('user_stop_typing', onStopTyping);
    };
  }, [socket, open, roomId, otherUser?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  const sendMessage = useCallback(() => {
    const content = input.trim();
    if (!content || !socket || !roomId) return;
    socket.emit('send_message', { roomId, content, senderName: user.name });
    socket.emit('stop_typing', { roomId });
    setInput('');
  }, [input, socket, roomId, user?.name]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socket || !roomId) return;
    socket.emit('typing', { roomId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit('stop_typing', { roomId }), 1500);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Chat with ${otherUser?.name || ''}`} maxWidth="max-w-md">
      <div className="flex flex-col h-[60vh] -mx-6 -mb-6">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3" aria-live="polite">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-400" size={24} /></div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
              <User size={28} className="mb-2 text-slate-200" />
              <p className="text-sm">No messages yet — say hello!</p>
            </div>
          ) : (
            messages.map((m, i) => {
              const mine = m.senderId === user?.id;
              return (
                <div key={m._id || i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    mine ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-700 rounded-bl-sm'
                  }`}>
                    <p className="leading-relaxed break-words">{m.content}</p>
                    <p className={`text-[10px] mt-1 ${mine ? 'text-brand-100' : 'text-slate-400'}`}>
                      {format(new Date(m.createdAt), 'h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          {otherTyping && (
            <div className="flex justify-start" aria-label={`${otherUser?.name || 'They'} is typing`}>
              <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex gap-1">
                {[0,1,2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-100 px-4 py-3 flex items-center gap-2">
          <input
            value={input}
            onChange={handleTyping}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
            disabled={!socket}
            placeholder={socket ? 'Type a message…' : 'Connecting…'}
            aria-label="Message"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !socket}
            aria-label="Send message"
            className="p-2.5 rounded-xl bg-brand-600 text-white disabled:opacity-40 hover:bg-brand-700 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </Modal>
  );
}