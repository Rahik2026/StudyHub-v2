import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  subscribeToCollection, 
  sendMessage, 
  createOrGetChat 
} from '../services/db';
import { collection, query, orderBy, limit, onSnapshot, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Send, User as UserIcon, Search, Users, Plus, X } from 'lucide-react';
import { format } from 'date-fns';

const Messenger = () => {
  const { user } = useAuth();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const scrollRef = useRef();

  // Load user's active chats
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToCollection(
      'chats',
      [where('members', 'array-contains', user.uid), orderBy('createdAt', 'desc')],
      setChats
    );
    return unsub;
  }, [user]);

  // Load messages if chatId is present
  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [chatId]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;
    await sendMessage(chatId, user.uid, newMessage);
    setNewMessage('');
  };

  const startChat = async (targetUserId) => {
    const id = await createOrGetChat(user.uid, targetUserId);
    navigate(`/messenger/${id}`);
    setUsers([]);
    setSearchQuery('');
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    const groupChat = await addDoc(collection(db, "chats"), {
      name: groupName,
      members: [user.uid],
      type: 'group',
      admin: user.uid,
      createdAt: serverTimestamp()
    });
    setGroupName('');
    setShowGroupModal(false);
    navigate(`/messenger/${groupChat.id}`);
  };

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length > 2) {
      const q = query(
        collection(db, 'users'),
        where('displayName', '>=', val),
        where('displayName', '<=', val + '\uf8ff'),
        limit(5)
      );
      const snap = await getDocs(q);
      setUsers(snap.docs.map(d => d.data()).filter(u => u.uid !== user.uid));
    } else {
      setUsers([]);
    }
  };

  const currentChat = chats.find(c => c.id === chatId);

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="input-field pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
          {users.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
              {users.map(u => (
                <button 
                  key={u.uid}
                  onClick={() => startChat(u.uid)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                    {u.displayName?.[0] || '?'}
                  </div>
                  <span className="text-sm font-medium">{u.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col min-h-0">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="font-bold text-slate-700 uppercase text-xs tracking-wider">Messages</span>
            <button 
              onClick={() => setShowGroupModal(true)}
              className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
              title="New Group"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => navigate(`/messenger/${chat.id}`)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 ${chatId === chat.id ? 'bg-blue-50/50 border-r-4 border-r-blue-600' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${chat.type === 'group' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                  {chat.type === 'group' ? <Users className="w-5 h-5 text-purple-600" /> : <UserIcon className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="text-left overflow-hidden flex-1">
                  <div className="font-bold text-slate-900 truncate">
                    {chat.type === 'group' ? chat.name : `Chat with ${chat.id.slice(0, 5)}...`}
                  </div>
                  <div className="text-xs text-slate-500 truncate">Click to message</div>
                </div>
              </button>
            ))}
            {chats.length === 0 && !searchQuery && (
              <div className="p-8 text-center text-slate-400 text-sm">
                No active conversations
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 glass-card rounded-2xl overflow-hidden flex flex-col ${!chatId ? 'hidden md:flex' : 'flex'}`}>
        {chatId ? (
          <>
            <div className="p-4 border-b border-slate-100 bg-white/50 font-bold flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentChat?.type === 'group' ? 'bg-purple-600' : 'bg-blue-600'} text-white text-xs`}>
                   {currentChat?.type === 'group' ? <Users className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                 </div>
                 <div className="flex flex-col">
                   <span className="text-slate-900">{currentChat?.type === 'group' ? currentChat.name : 'Private Chat'}</span>
                   <span className="text-[10px] text-slate-400 font-normal">Real-time Encrypted</span>
                 </div>
               </div>
               <button onClick={() => navigate('/messenger')} className="md:hidden text-slate-400">
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20">
              {messages.map((msg) => {
                const isMe = msg.senderId === user.uid;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                      isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                    }`}>
                      {msg.text}
                      {msg.timestamp && (
                        <div className={`text-[9px] mt-1 font-medium opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                          {format(msg.timestamp.toDate(), 'HH:mm')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                className="input-field"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="bg-slate-100 p-8 rounded-full mb-4">
              <Send className="w-16 h-16" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Your Messages</h3>
            <p className="text-sm">Select a contact or group to start chatting.</p>
          </div>
        )}
      </div>

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Create Study Group</h2>
            <form onSubmit={createGroup}>
              <input 
                type="text" 
                placeholder="Group Name" 
                className="input-field mb-4"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowGroupModal(false)} className="flex-1 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messenger;
