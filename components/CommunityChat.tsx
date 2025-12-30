import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, onValue, set, serverTimestamp, query, limitToLast, onDisconnect, update, get, remove } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { SparklesIcon, SendIcon, SearchIcon, UserCircleIcon, GlobeAltIcon, CheckCircleIcon, CloseIcon, BriefcaseIcon, ChevronRightIcon, ChatBubbleIcon } from './Icons';

declare global {
  interface Window {
    emailjs: any;
  }
}

const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY",
  projectId: "fuad-editing-zone",
  messagingSenderId: "1032345523456",
  appId: "1:1032345523456:web:123456789",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const OWNER_USERNAME = 'fuadeditingzone';

interface Profile {
  role: 'Client' | 'Designer' | 'Editor';
  profession: string;
  experience: string;
  bio: string;
}

interface ChatUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  online?: boolean;
  profile?: Profile;
}

interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
}

interface Connection {
  status: 'pending' | 'accepted';
  initiatorId: string;
}

interface Order {
  id: string;
  userId: string;
  service: string;
  status: string;
  timestamp: number;
}

const StarRating: React.FC<{ rating: number; total: number; onRate?: (score: number) => void; canRate?: boolean }> = ({ rating, total, onRate, canRate }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={!canRate}
            onMouseEnter={() => canRate && setHover(star)}
            onMouseLeave={() => canRate && setHover(0)}
            onClick={() => onRate && onRate(star)}
            className={`transition-all ${canRate ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          >
            <i className={`fa-solid fa-star text-sm ${
              (hover || rating) >= star 
                ? 'text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]' 
                : 'text-white/10'
            }`} />
          </button>
        ))}
      </div>
      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
        {rating.toFixed(1)}/5 • {total} Agent{total !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

const AgentProfileModal: React.FC<{ user: ChatUser; currentUser: any; onClose: () => void; onMessage: () => void }> = ({ user, currentUser, onClose, onMessage }) => {
  const isOwner = user.username === OWNER_USERNAME;
  const isClient = user.profile?.role === 'Client';
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [ratings, setRatings] = useState<{ avg: number; count: number; userScore: number }>({ avg: 0, count: 0, userScore: 0 });
  const [canRate, setCanRate] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Fetch Order History & Ratings
  useEffect(() => {
    const ordersRef = ref(db, `orders/${user.id}`);
    onValue(ordersRef, (snap) => {
      const data = snap.val();
      if (data) setUserOrders(Object.values(data) as Order[]);
    });

    const ratingsRef = ref(db, `ratings/${user.id}`);
    onValue(ratingsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const scores = Object.values(data) as number[];
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        setRatings({ avg, count: scores.length, userScore: data[currentUser?.id] || 0 });
      }
    });

    // Check if current user can rate (completed order check)
    // For this portfolio, we assume completion of any order with Fuad allows rating
    if (currentUser && currentUser.id !== user.id) {
       const checkOrdersRef = ref(db, 'orders');
       onValue(checkOrdersRef, (snap) => {
          const allOrders = snap.val();
          if (allOrders) {
             let hasCompleted = false;
             // Check if currentUser has a completed order
             const myOrders = allOrders[currentUser.id] || {};
             Object.values(myOrders).forEach((o: any) => {
                if (o.status === 'Completed') hasCompleted = true;
             });
             // Also allow Owner to rate clients back
             if (currentUser.username === OWNER_USERNAME) {
                const targetOrders = allOrders[user.id] || {};
                Object.values(targetOrders).forEach((o: any) => {
                   if (o.status === 'Completed') hasCompleted = true;
                });
             }
             setCanRate(hasCompleted);
          }
       });
    }
  }, [user.id, currentUser]);

  const handleRate = async (score: number) => {
    if (!canRate || !currentUser) return;
    await set(ref(db, `ratings/${user.id}/${currentUser.id}`), score);
    alert("Neural Reputation Synced.");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[800] bg-black/80 backdrop-blur-[12px] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
        className="relative w-full max-w-[450px] glass-modal rounded-[3.5rem] shadow-[0_50px_150px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-blue-600 to-red-600 shadow-xl"></div>
        
        <button onClick={onClose} className="absolute top-8 right-8 z-20 p-3 bg-white/5 hover:bg-red-600 rounded-full text-white transition-all active:scale-90 border border-white/5">
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 md:p-12 flex flex-col items-center">
            <div className="relative mb-8 mt-4">
                <div className={`w-32 h-32 rounded-[3rem] overflow-hidden border-4 ${isOwner ? 'border-red-600 shadow-[0_0_40px_rgba(225,0,0,0.4)]' : 'border-white/10'} p-1.5 bg-black`}>
                    <img src={user.avatar} className="w-full h-full object-cover rounded-[2.4rem]" alt="" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-4 border-black ${user.online ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]' : 'bg-gray-700'}`}></div>
            </div>

            <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{user.name}</h2>
                    {isOwner && <span className="owner-badge text-[7px] py-1">OWNER</span>}
                </div>
                <p className="text-red-500 font-black text-[10px] uppercase tracking-[0.5em] opacity-80 mb-6">@{user.username}</p>
                <StarRating rating={ratings.avg} total={ratings.count} onRate={handleRate} canRate={canRate && ratings.userScore === 0} />
            </div>

            <div className="w-full space-y-4 mb-10">
                <div className="grid grid-cols-2 gap-3">
                    <div className="px-6 py-5 bg-white/5 rounded-3xl border border-white/5 flex flex-col gap-1 text-center">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Sector Role</span>
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">{user.profile?.role || 'Agent'}</span>
                    </div>
                    {!isClient && (
                      <div className="px-6 py-5 bg-white/5 rounded-3xl border border-white/5 flex flex-col gap-1 text-center">
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Rank XP</span>
                          <span className="text-[11px] font-black text-white uppercase tracking-widest">{user.profile?.experience || '1+ Year'}</span>
                      </div>
                    )}
                </div>

                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                    <h4 className="text-red-600 font-black text-[9px] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                      <div className="w-1 h-1 bg-red-600 rounded-full animate-pulse"></div> Signal Brief
                    </h4>
                    <p className="text-[12px] text-gray-300 font-medium leading-relaxed italic">
                        "{user.profile?.bio || 'Neural signal restricted.'}"
                    </p>
                </div>

                {/* MISSION LOG (PUBLIC ORDER HISTORY) */}
                <div className="p-8 bg-black border border-white/10 rounded-[2.5rem] space-y-6">
                    <h4 className="text-white font-black text-[10px] uppercase tracking-[0.4em] border-b border-white/5 pb-4">Mission Log</h4>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                        {userOrders.filter(o => o.status !== 'Rejected').length === 0 ? (
                            <p className="text-center py-6 text-[9px] text-gray-600 uppercase font-black">No missions recorded</p>
                        ) : (
                            userOrders.filter(o => o.status !== 'Rejected').map(order => (
                                <div key={order.id} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-black text-white uppercase truncate">{order.service}</p>
                                        <p className="text-[8px] text-gray-600 font-bold uppercase">{new Date(order.timestamp).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${
                                      order.status === 'Completed' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 
                                      order.status === 'Accepted' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' : 
                                      'text-yellow-500 border-yellow-500/20 bg-yellow-500/5'
                                    }`}>{order.status}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <button 
                onClick={(e) => { e.preventDefault(); onMessage(); onClose(); }} 
                className="w-full py-6 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.6em] text-[10px] rounded-[2rem] shadow-2xl transition-all active:scale-95 border border-white/10"
            >
                Initiate Link
            </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const CommunityChat: React.FC = () => {
  const { user: clerkUser, isSignedIn } = useUser();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [recentChats, setRecentChats] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [viewingProfile, setViewingProfile] = useState<ChatUser | null>(null);
  const [isGlobal, setIsGlobal] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState<Profile>({ role: 'Client', profession: '', experience: '', bio: '' });
  const [connection, setConnection] = useState<Connection | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const userRef = ref(db, `users/${clerkUser.id}`);
      onValue(userRef, (snap) => {
        if (!snap.val()?.profile) setShowSetup(true);
      });
      update(userRef, { online: true, name: clerkUser.fullName || clerkUser.username, avatar: clerkUser.imageUrl, username: clerkUser.username, id: clerkUser.id });
      onDisconnect(userRef).update({ online: false });
    }
  }, [isSignedIn, clerkUser]);

  useEffect(() => {
    onValue(ref(db, 'users'), (snapshot) => {
      const data = snapshot.val();
      if (data) setUsers(Object.values(data) as ChatUser[]);
    });
  }, []);

  const chatPath = useMemo(() => {
    if (isGlobal) return 'community/global';
    if (!clerkUser?.id || !selectedUser?.id) return null;
    return `messages/${[clerkUser.id, selectedUser.id].sort().join('_')}`;
  }, [isGlobal, clerkUser?.id, selectedUser?.id]);

  useEffect(() => {
    if (!isSignedIn || !clerkUser || !users.length) return;
    const inboxRef = ref(db, `inbox/${clerkUser.id}`);
    const unsubscribe = onValue(inboxRef, (snap) => {
        const data = snap.val();
        if (data) {
            const sortedIds = Object.entries(data).sort((a: any, b: any) => b[1].timestamp - a[1].timestamp).map(e => e[0]);
            setRecentChats(sortedIds.map(id => users.find(u => u.id === id)).filter(Boolean) as ChatUser[]);
        }
    });
    return () => unsubscribe();
  }, [isSignedIn, clerkUser, users]);

  useEffect(() => {
    if (isGlobal || !chatPath) {
      setConnection(null);
      return;
    }
    const chatId = chatPath.replace('messages/', '');
    const connRef = ref(db, `connections/${chatId}`);
    const unsubscribe = onValue(connRef, (snap) => setConnection(snap.val()));
    return () => unsubscribe();
  }, [isGlobal, chatPath]);

  useEffect(() => {
    if (!chatPath) return;
    setMessages([]);
    const chatQuery = query(ref(db, chatPath), limitToLast(50));
    const unsubscribe = onChildAdded(chatQuery, (snap) => {
      setMessages(prev => prev.some(m => m.id === snap.key) ? prev : [...prev, { ...snap.val() as Message, id: snap.key }]);
    });
    return () => unsubscribe();
  }, [chatPath]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const messageCountFromMe = useMemo(() => {
    if (isGlobal || !clerkUser) return 0;
    return messages.filter(m => m.senderId === clerkUser.id).length;
  }, [messages, isGlobal, clerkUser]);

  const isLocked = useMemo(() => {
    if (isGlobal || !clerkUser || !selectedUser) return false;
    if (clerkUser.username === OWNER_USERNAME || selectedUser.username === OWNER_USERNAME) return false;
    if (connection?.status === 'accepted') return false;
    return messageCountFromMe >= 3;
  }, [messageCountFromMe, isGlobal, connection, clerkUser, selectedUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !inputValue.trim() || !chatPath || !clerkUser || isLocked) return;

    const newMessage = { 
      senderId: clerkUser.id, 
      senderName: clerkUser.fullName || clerkUser.username || 'Legend', 
      senderAvatar: clerkUser.imageUrl, 
      text: inputValue.trim(), 
      timestamp: Date.now() 
    };
    setInputValue('');
    await push(ref(db, chatPath), newMessage);

    if (!isGlobal && selectedUser) {
        const timestamp = Date.now();
        update(ref(db, `inbox/${clerkUser.id}/${selectedUser.id}`), { timestamp });
        update(ref(db, `inbox/${selectedUser.id}/${clerkUser.id}`), { timestamp });
    }
  };

  const handleRequestConnection = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!chatPath || !clerkUser) return;
    const chatId = chatPath.replace('messages/', '');
    await set(ref(db, `connections/${chatId}`), { 
      status: 'pending', 
      initiatorId: clerkUser.id,
      timestamp: Date.now()
    });
  };

  const handleAcceptConnection = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!chatPath || !clerkUser || !selectedUser) return;
    const chatId = chatPath.replace('messages/', '');
    
    await update(ref(db, `connections/${chatId}`), { status: 'accepted' });
    
    // EmailJS notification
    if (window.emailjs && selectedUser) {
      window.emailjs.send("service_default", "template_neural_link", {
        to_name: selectedUser.name,
        from_name: clerkUser.fullName || clerkUser.username,
        message: "Neural Link Established! Your connection request has been accepted."
      });
    }
    alert("Neural Link Established!");
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clerkUser) {
      await update(ref(db, `users/${clerkUser.id}/profile`), setupData);
      setShowSetup(false);
    }
  };

  return (
    <section id="community" className="py-24 bg-black relative z-10 select-none overflow-hidden">
      <AnimatePresence>
        {viewingProfile && (
            <AgentProfileModal 
                user={viewingProfile} 
                currentUser={clerkUser}
                onClose={() => setViewingProfile(null)} 
                onMessage={() => { setIsGlobal(false); setSelectedUser(viewingProfile); }} 
            />
        )}
        
        {showSetup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl">
             <div className="w-full max-w-lg bg-[#080808] border border-white/10 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_20px_rgba(225,0,0,0.5)]"></div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Neural Link Sync</h3>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-10">Define your zone role</p>
                <form onSubmit={handleSetup} className="space-y-6">
                   <div>
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Identity Role</label>
                      <select value={setupData.role} onChange={e => setSetupData({...setupData, role: e.target.value as any})} className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-red-600 transition-all outline-none">
                         <option value="Client">Client (Mission Giver)</option>
                         <option value="Designer">Designer (Creative Entity)</option>
                      </select>
                   </div>
                   {setupData.role !== 'Client' && (
                       <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Rank XP</label>
                                <input placeholder="e.g. 3 Years" onChange={e => setSetupData({...setupData, experience: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Core Profession</label>
                                <input placeholder="e.g. AMV Editor" onChange={e => setSetupData({...setupData, profession: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white" />
                            </div>
                       </div>
                   )}
                   <div>
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Neural Signature (Bio)</label>
                      <textarea required rows={3} onChange={e => setSetupData({...setupData, bio: e.target.value})} placeholder="What defines your presence?" className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white resize-none" />
                   </div>
                   <button type="submit" className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-[0.5em] text-[11px] rounded-2xl shadow-xl hover:bg-red-700 active:scale-95 transition-all">Establish Identity</button>
                </form>
             </div>
          </motion.div>
        )}

        {isSearching && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[750] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={(e) => { e.preventDefault(); setIsSearching(false); }}
          >
             <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-lg glass-modal rounded-[2.5rem] flex flex-col h-[500px] shadow-2xl relative"
                onClick={e => { e.preventDefault(); e.stopPropagation(); }}
             >
                <div className="p-8 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-black text-white uppercase tracking-widest">Find Agents</h3>
                    <button onClick={(e) => { e.preventDefault(); setIsSearching(false); }} className="text-gray-500 hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-8 border-b border-white/5">
                    <div className="relative">
                        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                        <input autoFocus value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Sector Search..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white outline-none focus:border-red-600 transition-all" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                    {users.filter(u => u.id !== clerkUser?.id && (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase()))).map(u => (
                        <button key={u.id} onClick={(e) => { e.preventDefault(); setViewingProfile(u); setIsSearching(false); }} className="w-full bg-white/5 hover:bg-red-600/10 border border-white/5 rounded-2xl p-4 flex items-center gap-4 transition-all group">
                            <img src={u.avatar} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-[13px] font-black text-white uppercase truncate">{u.name}</p>
                                <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest">@{u.username}</p>
                            </div>
                        </button>
                    ))}
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-12 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-3 block">Neural Grid</span>
          <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tighter">Community Sector</h2>
        </div>

        <div className="w-full bg-[#080808] border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[800px] relative">
          
          <div className="w-full md:w-80 border-r border-white/5 flex flex-col bg-[#050505]/50">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/30">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Inbox Signals</span>
                </div>
                <button onClick={(e) => { e.preventDefault(); setIsSearching(true); }} className="p-2.5 rounded-xl bg-white/5 hover:bg-red-600/20 text-red-600 transition-all border border-white/5">
                    <SearchIcon className="w-4 h-4" />
                </button>
            </div>
            
            <button onClick={(e) => { e.preventDefault(); setIsGlobal(true); setSelectedUser(null); }} className={`flex items-center gap-4 p-7 border-b border-white/5 transition-all ${isGlobal ? 'bg-red-600/10' : 'hover:bg-white/5'}`}>
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${isGlobal ? 'bg-red-600 border-red-500 text-white shadow-xl shadow-red-600/20' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                <GlobeAltIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className={`text-[11px] font-black uppercase tracking-widest ${isGlobal ? 'text-white' : 'text-gray-500'}`}>Global Sync</p>
                <p className="text-[8px] text-gray-600 font-bold uppercase">All Agents Sync</p>
              </div>
            </button>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {recentChats.map(u => (
                <button key={u.id} onClick={(e) => { e.preventDefault(); setIsGlobal(false); setSelectedUser(u); }} className={`w-full flex items-center gap-4 p-4 rounded-[2.2rem] transition-all border ${selectedUser?.id === u.id && !isGlobal ? 'bg-blue-600/10 border-blue-600/20' : 'border-transparent hover:bg-white/5'}`}>
                  <div className="relative flex-shrink-0">
                    <img src={u.avatar} className={`w-10 h-10 rounded-[1rem] border ${u.username === OWNER_USERNAME ? 'border-red-600 shadow-lg' : 'border-white/10'} object-cover`} alt="" />
                    {u.online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-black bg-green-500"></div>}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[11px] font-black text-white uppercase truncate flex items-center gap-1">
                        {u.name} 
                        {u.username === OWNER_USERNAME && <span className="owner-badge scale-[0.6] origin-left">OWNER</span>}
                    </p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase truncate">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-black">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-600/15 flex items-center justify-center border border-red-600/30 overflow-hidden shadow-inner">
                    {isGlobal ? <GlobeAltIcon className="w-6 h-6 text-red-500" /> : <img src={selectedUser?.avatar} className="w-full h-full object-cover cursor-pointer" onClick={(e) => { e.preventDefault(); if (selectedUser) setViewingProfile(selectedUser); }} />}
                  </div>
                  <div>
                    <h4 className="text-[16px] font-black text-white uppercase tracking-widest">{isGlobal ? 'Global Transmission' : selectedUser?.name}</h4>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">{isGlobal ? 'Sector: Public Grid' : `@${selectedUser?.username}`}</p>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-4 custom-scrollbar">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-5 ${msg.senderId === clerkUser?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                   <img src={msg.senderAvatar} className="w-10 h-10 rounded-[0.8rem] border border-white/5 object-cover cursor-pointer shadow-lg active:scale-90" alt="" onClick={(e) => { e.preventDefault(); const u = users.find(usr => usr.id === msg.senderId); if(u) setViewingProfile(u); }} />
                   <div className={`max-w-[75%] ${msg.senderId === clerkUser?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                      <span className="text-[9px] font-black text-gray-600 uppercase mb-2">{msg.senderName}</span>
                      <div className={`p-4 rounded-[1.5rem] text-[13px] font-medium border ${msg.senderId === clerkUser?.id ? 'bg-red-600/10 border-red-600/30 text-white rounded-tr-none' : 'bg-white/5 border-white/10 text-gray-300 rounded-tl-none shadow-lg'}`}>{msg.text}</div>
                   </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {!isGlobal && connection?.status === 'pending' && connection.initiatorId !== clerkUser?.id && (
                <div className="p-8 bg-red-600/10 border-t border-red-600/20 flex flex-col items-center gap-4 animate-pulse">
                    <p className="text-[11px] font-black text-white uppercase tracking-widest">Connection Protocol Detected</p>
                    <div className="flex gap-4 w-full max-w-sm">
                        <button onClick={handleAcceptConnection} className="flex-1 py-4 bg-red-600 text-white rounded-[1.2rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl active:scale-95 transition-all">Accept</button>
                        <button onClick={async (e) => { e.preventDefault(); const chatId = chatPath!.replace('messages/', ''); await remove(ref(db, `connections/${chatId}`)); }} className="flex-1 py-4 bg-white/5 border border-white/10 text-gray-400 rounded-[1.2rem] font-black uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all">Ignore</button>
                    </div>
                </div>
            )}

            <div className="p-8 md:p-10 bg-black border-t border-white/5">
              {isSignedIn ? (
                <div className="space-y-4">
                    {isLocked && !connection && (
                        <div className="bg-red-600/10 border border-red-600/20 rounded-[2.5rem] p-8 text-center shadow-[0_0_50px_rgba(255,0,0,0.1)]">
                            <p className="text-[10px] font-black text-red-500 uppercase mb-5 tracking-[0.4em]">Signal Limit (3/3 Comms)</p>
                            <button onClick={handleRequestConnection} className="w-full py-5 bg-red-600 text-white font-black uppercase text-[10px] tracking-[0.5em] rounded-2xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                                <SparklesIcon className="w-4 h-4" /> Initialize Connection Request
                            </button>
                        </div>
                    )}
                    {isLocked && connection?.status === 'pending' && connection.initiatorId === clerkUser.id && (
                         <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Signal Transmitted • Awaiting Authorization</p>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className={`flex gap-4 bg-white/5 border border-white/10 rounded-[1.8rem] p-2 transition-all duration-500 ${isLocked ? 'opacity-20 pointer-events-none scale-95' : 'opacity-100'}`}>
                        <input value={inputValue} onChange={e => setInputValue(e.target.value)} disabled={isLocked} placeholder={isGlobal ? "Broadcast Signal..." : `Private Signal to ${selectedUser?.name}...`} className="flex-1 bg-transparent px-6 py-4 text-sm font-bold text-white outline-none" />
                        <button type="submit" disabled={!inputValue.trim() || isLocked} className="bg-red-600 text-white w-14 h-14 flex items-center justify-center rounded-2xl active:scale-90 shadow-2xl transition-all"><SendIcon className="w-5 h-5" /></button>
                    </form>
                </div>
              ) : (
                <div className="text-center py-6">
                    <SignInButton mode="modal"><button onClick={(e) => e.preventDefault()} className="bg-red-600 text-white font-black py-5 px-16 rounded-2xl text-[12px] uppercase tracking-[0.5em] shadow-2xl active:scale-95 transition-all">Verify Signature to Sync</button></SignInButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};