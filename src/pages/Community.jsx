import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { sendCommunityMessage } from '../services/db';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Send, Hash, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const rooms = [
  { id: 'general', name: 'General', icon: MessageSquare },
  { id: 'math', name: 'Mathematics', icon: Hash },
  { id: 'science', name: 'Science', icon: Hash },
  { id: 'programming', name: 'Programming', icon: Hash },
];

const Community = () => {
  const { user } = useAuth();
  const [activeRoom, setActiveRoom] = useState(rooms[0]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    const q = query(
      collection(db, `community/${activeRoom.id}/messages`),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [activeRoom]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await sendCommunityMessage(activeRoom.id, user.uid, user.displayName, newMessage);
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6">
      {/* Rooms Sidebar */}
      <div className="w-full md:w-64 flex flex-col gap-4">
        <h2 className="text-xl font-bold px-2">Rooms</h2>
        <div className="flex flex-col gap-1">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeRoom.id === room.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <room.icon className="w-5 h-5" />
              <span className="font-medium">{room.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-card rounded-3xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-white/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
               <activeRoom.icon className="w-6 h-6" />
             </div>
             <div>
               <h3 className="font-bold text-slate-900 leading-tight">#{activeRoom.name}</h3>
               <p className="text-xs text-slate-500">Public Study Room</p>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {messages.map((msg) => {
            const isMe = msg.senderId === user.uid;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && <span className="text-xs font-bold text-slate-400 mb-1 ml-1">{msg.senderName}</span>}
                <div className={`max-w-[80%] md:max-w-[60%] p-4 rounded-2xl shadow-sm text-sm ${
                  isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                }`}>
                  {msg.text}
                  {msg.timestamp && (
                    <div className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                      {format(msg.timestamp.toDate(), 'HH:mm')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
          <input
            type="text"
            className="input-field py-3"
            placeholder={`Message #${activeRoom.name}`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-6 rounded-xl hover:bg-blue-700 transition-all font-bold">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Community;
