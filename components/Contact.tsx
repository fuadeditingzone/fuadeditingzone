import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, set, serverTimestamp, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { siteConfig } from '../config';
import { EmailIcon, WhatsAppIcon, SparklesIcon, CloseIcon, CheckCircleIcon, UserCircleIcon, VfxIcon, ThumbnailIcon, BannerIcon } from './Icons';

// FIX: Declare emailjs on Window
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

const EMAILJS_SERVICE_ID = 'service_default';
const EMAILJS_TEMPLATE_ID = 'template_order_status';

interface Order {
  id: string;
  userId: string;
  service: string;
  message: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed';
  timestamp: number;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  price?: string;
  delivery?: string;
  isCustom?: boolean;
}

const SERVICE_TIERS = [
  { id: 'vfx', name: 'Cinematic VFX Mastery', price: '$50', delivery: '3-5 Days', features: ['4K HDR Render', 'Motion tracking', 'Premium FX'], icon: VfxIcon },
  { id: 'thumbnail', name: 'High-CTR Thumbnails', price: '$15', delivery: '24 Hours', features: ['Max Click-Rate', '3D Texturing', 'Pro Grading'], icon: ThumbnailIcon },
  { id: 'banner', name: 'Elite Branding Kit', price: '$25', delivery: '2 Days', features: ['Multi-Platform', 'Source Files', 'High-Res'], icon: BannerIcon },
  { id: 'custom', name: 'CUSTOM MISSION', price: 'Proposed', delivery: 'Requested', features: ['Your Briefing', 'Direct Comms', 'Bespoke Art'], icon: SparklesIcon }
];

export const Contact: React.FC<{ onStartOrder: (platform: 'whatsapp' | 'email') => void }> = ({ onStartOrder }) => {
  const { isSignedIn, user } = useUser();
  const [intersectionRef] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [formData, setFormData] = useState({ message: '', customName: '', customPrice: '', customTime: '' });
  
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  const isOwner = user?.username === 'fuadeditingzone';

  // 1. Fetch Global Orders for Public Feed & Admin
  useEffect(() => {
    const allOrdersRef = ref(db, 'orders');
    const unsubscribe = onValue(allOrdersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let fullList: Order[] = [];
        Object.entries(data).forEach(([userId, orders]: [string, any]) => {
          Object.entries(orders).forEach(([orderId, orderVal]: [string, any]) => {
            fullList.push({ id: orderId, userId, ...orderVal } as Order);
          });
        });
        fullList.sort((a, b) => b.timestamp - a.timestamp);
        setAllOrders(fullList);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Local User Filter
  useEffect(() => {
    if (isSignedIn && user) {
      setUserOrders(allOrders.filter(o => o.userId === user.id));
    }
  }, [allOrders, isSignedIn, user]);

  const hasPendingOrder = useMemo(() => userOrders.some(o => o.status === 'Pending'), [userOrders]);

  const handleAdminAction = async (e: React.MouseEvent, order: Order, newStatus: 'Accepted' | 'Rejected') => {
    e.preventDefault();
    if (!isOwner) return;

    try {
      await update(ref(db, `orders/${order.userId}/${order.id}`), { status: newStatus });
      if (window.emailjs && order.userEmail && newStatus === 'Accepted') {
        window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          user_name: order.userName,
          user_email: order.userEmail,
          order_status: newStatus,
          service_type: order.service,
          admin_handle: "@fuadeditingzone"
        });
      }
      alert(`Signal: MISSION ${newStatus.toUpperCase()}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !user || hasPendingOrder || !selectedTier) return;

    setStatus('submitting');
    const isCustom = selectedTier === 'custom';
    const tier = SERVICE_TIERS.find(t => t.id === selectedTier);
    
    const orderId = `order_${Date.now()}`;
    const orderData = {
      service: isCustom ? formData.customName : tier?.name,
      message: formData.message,
      status: 'Pending',
      price: isCustom ? formData.customPrice : tier?.price,
      delivery: isCustom ? formData.customTime : tier?.delivery,
      isCustom,
      timestamp: Date.now(),
      userName: user.fullName || user.username || 'Agent',
      userEmail: user.primaryEmailAddress?.emailAddress,
      userAvatar: user.imageUrl
    };

    try {
      await set(ref(db, `orders/${user.id}/${orderId}`), orderData);
      setStatus('success');
      setFormData({ message: '', customName: '', customPrice: '', customTime: '' });
      setSelectedTier(null);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('idle');
    }
  };

  return (
    <section ref={intersectionRef} id="contact" className="py-24 bg-black relative z-10 select-none overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* PUBLIC LIVE TRANSMISSIONS (ACCEPTED ONLY FOR SOCIAL PROOF) */}
        <div className="mb-24">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter">Live Transmissions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allOrders.filter(o => o.status === 'Accepted').slice(0, 4).map(order => (
                    <div key={order.id} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center gap-4 transition-all hover:bg-white/10">
                        <img src={order.userAvatar} className="w-12 h-12 rounded-2xl border border-red-600/30 object-cover" alt="" />
                        <div className="min-w-0">
                            <p className="text-[11px] font-black text-white uppercase truncate">{order.userName}</p>
                            <p className="text-[8px] text-gray-500 font-bold uppercase truncate">{order.service}</p>
                            <span className="text-[7px] font-black text-blue-500 border border-blue-500/20 bg-blue-500/5 px-2 py-0.5 rounded uppercase mt-2 inline-block">ACCEPTED</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="mb-16 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-3 block">Neural Control</span>
          <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter">
            {isOwner ? 'Overseer Console' : 'Initiate Dispatch'}
          </h2>
          <div className="mt-4 inline-block px-6 py-2 rounded-full border border-red-600/30 bg-red-600/10">
            <span className="text-[14px] font-black text-red-500 uppercase tracking-[0.4em] neon-glow-red">@fuadeditingzone</span>
            {isOwner && <span className="owner-badge ml-4 scale-90">OWNER</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          <div className="space-y-10">
            {isOwner ? (
                /* OWNER VIEW: ADMIN HUB */
                <div className="bg-[#080808]/95 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div> Global Signals
                    </h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
                        {allOrders.map(order => (
                            <div key={order.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <img src={order.userAvatar} className="w-10 h-10 rounded-xl object-cover border border-red-600/30" alt="" />
                                        <div>
                                            <p className="text-[12px] font-black text-white uppercase">{order.userName}</p>
                                            <p className="text-[9px] text-red-500 font-bold uppercase">{order.service} • {order.price}</p>
                                        </div>
                                    </div>
                                    <div className={`text-[8px] font-black uppercase px-2 py-1 rounded ${order.status === 'Accepted' ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-500'}`}>{order.status}</div>
                                </div>
                                <p className="text-[11px] text-gray-400 mb-6 italic border-l-2 border-white/10 pl-4">"{order.message}"</p>
                                {order.status === 'Pending' && (
                                    <div className="flex gap-2">
                                        <button onClick={(e) => handleAdminAction(e, order, 'Accepted')} className="flex-1 bg-blue-600 text-white font-black py-2 rounded-xl text-[9px] uppercase tracking-widest active:scale-95 transition-all">Accept</button>
                                        <button onClick={(e) => handleAdminAction(e, order, 'Rejected')} className="flex-1 bg-red-600/10 border border-red-600/20 text-red-500 font-black py-2 rounded-xl text-[9px] uppercase tracking-widest active:scale-95 transition-all">Reject</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* USER VIEW: DISPATCH FORM */
                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {SERVICE_TIERS.map(tier => (
                            <button 
                                key={tier.id}
                                onClick={(e) => { e.preventDefault(); setSelectedTier(tier.id); }}
                                className={`flex flex-col p-4 rounded-[1.5rem] border transition-all duration-500 text-left bg-white/5 ${selectedTier === tier.id ? 'service-card-selected' : 'border-white/10 hover:border-white/20'}`}
                            >
                                <tier.icon className={`w-6 h-6 mb-3 ${selectedTier === tier.id ? 'text-white' : 'text-red-600'}`} />
                                <h4 className="text-[10px] font-black text-white uppercase mb-1 leading-tight">{tier.name}</h4>
                                <p className="text-[8px] text-gray-500 font-bold mb-3">{tier.price}</p>
                                <ul className="space-y-1 opacity-50 hidden md:block">
                                    {tier.features.slice(0, 2).map(f => <li key={f} className="text-[6px] text-white uppercase flex items-center gap-1 font-bold"><div className="w-1 h-1 bg-red-600 rounded-full"></div> {f}</li>)}
                                </ul>
                            </button>
                        ))}
                    </div>

                    <div className="bg-[#080808]/95 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                        {!isSignedIn ? (
                            <SignInButton mode="modal"><button onClick={(e) => e.preventDefault()} className="w-full bg-red-600 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.6em] shadow-xl">Verify Signal to Order</button></SignInButton>
                        ) : (
                            <div className="space-y-6">
                                {selectedTier === 'custom' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input required value={formData.customName} onChange={e => setFormData({...formData, customName: e.target.value})} placeholder="Mission Objective Name" className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-xs text-white focus:border-red-600 outline-none" />
                                        <input required value={formData.customPrice} onChange={e => setFormData({...formData, customPrice: e.target.value})} placeholder="Proposed Payment ($)" className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-xs text-white focus:border-red-600 outline-none" />
                                        <input required value={formData.customTime} onChange={e => setFormData({...formData, customTime: e.target.value})} placeholder="Requested Delivery (Days)" className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-xs text-white focus:border-red-600 outline-none" />
                                    </div>
                                )}
                                <textarea required rows={4} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-red-600 outline-none resize-none shadow-lg" placeholder="Mission Briefing..." />
                                <button type="submit" disabled={status === 'submitting' || hasPendingOrder || !selectedTier} className={`w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.6em] transition-all flex items-center justify-center gap-4 ${hasPendingOrder || !selectedTier ? 'bg-yellow-600/10 text-yellow-500 cursor-not-allowed border border-yellow-500/20' : 'bg-red-600 hover:bg-red-700 text-white shadow-xl active:scale-95'}`}>
                                    {status === 'submitting' ? <SparklesIcon className="w-5 h-5 animate-spin" /> : hasPendingOrder ? 'Active Protocol' : 'Dispatch Signal'}
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[3.5rem] p-10 min-h-[500px] shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-8">
                    <h3 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-4">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div> Mission Log
                    </h3>
                </div>
                <div className="space-y-6 max-h-[550px] overflow-y-auto pr-3 custom-scrollbar">
                    {userOrders.length === 0 ? (
                        <div className="py-24 text-center opacity-10 flex flex-col items-center gap-6"><SparklesIcon className="w-20 h-20" /><p className="text-[11px] uppercase font-black">Empty Sector</p></div>
                    ) : (
                        userOrders.map((order) => (
                            <motion.div key={order.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className={`p-8 rounded-[2.5rem] border transition-all duration-700 ${order.status === 'Accepted' ? 'bg-blue-600/5 border-blue-500/20' : 'bg-white/5 border-white/10'}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[15px] font-black text-white uppercase tracking-wider truncate mb-1">{order.service}</p>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase">{new Date(order.timestamp).toLocaleString()} • {order.price}</p>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${order.status === 'Pending' ? 'text-yellow-500 border-yellow-500/30' : order.status === 'Accepted' ? 'text-blue-500 border-blue-500/30' : 'text-red-500 border-red-500/30'}`}>{order.status}</div>
                                </div>
                                <div className="space-y-4 opacity-40">
                                   <input disabled value={order.service} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-gray-400 font-bold uppercase" />
                                   <div className="grid grid-cols-2 gap-4">
                                       <input disabled value={order.price} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-gray-400 font-bold uppercase" />
                                       <input disabled value={order.delivery} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-gray-400 font-bold uppercase" />
                                   </div>
                                   <textarea disabled value={order.message} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-gray-400 font-bold uppercase resize-none" />
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};