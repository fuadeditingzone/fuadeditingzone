import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, set, serverTimestamp, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { siteConfig } from '../config';
import { EmailIcon, WhatsAppIcon, SparklesIcon, PlayIcon, CloseIcon, CheckCircleIcon, UserCircleIcon, VfxIcon, ThumbnailIcon, BannerIcon } from './Icons';

// FIX: Declare emailjs on the global Window interface to resolve TypeScript property access errors
declare global {
  interface Window {
    emailjs: any;
  }
}

// Initialize Services
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
}

const SERVICE_TIERS = [
  {
    id: 'vfx',
    name: 'Cinematic VFX Mastery',
    price: '$50',
    delivery: '3-5 Days',
    features: ['4K High Dynamic Range', 'Custom Motion tracking', 'Hollywood Grade FX', 'Premium Sound Design'],
    icon: VfxIcon
  },
  {
    id: 'thumbnail',
    name: 'High-CTR Thumbnails',
    price: '$15',
    delivery: '24 Hours',
    features: ['High-Click Rate Design', 'Custom 3D Text Rendering', 'Pro Manipulation', 'Unlimited Revisions'],
    icon: ThumbnailIcon
  },
  {
    id: 'banner',
    name: 'Premium Branding Kit',
    price: '$25',
    delivery: '2 Days',
    features: ['Multi-Platform Banners', 'Full Brand Cohesion', 'Source File Inclusion', 'High-Res Export'],
    icon: BannerIcon
  }
];

export const Contact: React.FC<{ onStartOrder: (platform: 'whatsapp' | 'email') => void }> = ({ onStartOrder }) => {
  const { isSignedIn, user } = useUser();
  const [intersectionRef] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [formData, setFormData] = useState({ message: '' });
  
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [notifiedOrderId, setNotifiedOrderId] = useState<string | null>(null);

  const isOwner = user?.username === 'fuadeditingzone';

  // 1. Sync User Data
  useEffect(() => {
    if (isSignedIn && user) {
      const userRef = ref(db, `users/${user.id}`);
      update(userRef, {
        id: user.id,
        name: user.fullName || 'Selected Legend',
        username: user.username || user.firstName?.toLowerCase() || 'legend',
        avatar: user.imageUrl,
        email: user.primaryEmailAddress?.emailAddress,
        lastSeen: serverTimestamp()
      });
    }
  }, [isSignedIn, user]);

  // 2. Real-time Monitoring
  useEffect(() => {
    if (!isSignedIn || !user) return;
    const ordersRef = ref(db, `orders/${user.id}`);
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val })) as Order[];
        list.sort((a, b) => b.timestamp - a.timestamp);
        setUserOrders(list);
      }
    });
    return () => unsubscribe();
  }, [isSignedIn, user]);

  // 3. Admin: Fetch All Orders
  useEffect(() => {
    if (!isOwner) return;
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
        setAdminOrders(fullList);
      }
    });
    return () => unsubscribe();
  }, [isOwner]);

  const hasPendingOrder = useMemo(() => userOrders.some(o => o.status === 'Pending'), [userOrders]);

  const handleAdminAction = async (e: React.MouseEvent, order: Order, newStatus: 'Accepted' | 'Rejected') => {
    e.preventDefault();
    if (!isOwner) return;

    try {
      await update(ref(db, `orders/${order.userId}/${order.id}`), { status: newStatus });
      
      if (window.emailjs && order.userEmail && newStatus === 'Accepted') {
        const params = {
          user_name: order.userName,
          user_email: order.userEmail,
          order_status: newStatus,
          service_type: order.service,
          admin_handle: "@fuadeditingzone"
        };
        window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
          .then(() => console.log("Dispatch confirmed."))
          .catch((err: any) => console.error("Neural link error:", err));
      }
      alert(`Order ${newStatus} successfully.`);
    } catch (err) {
      console.error("Firebase error:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !user || hasPendingOrder || !selectedTier) return;

    setStatus('submitting');
    const tier = SERVICE_TIERS.find(t => t.id === selectedTier);
    const orderId = `order_${Date.now()}`;
    const orderData = {
      service: tier?.name,
      message: formData.message,
      status: 'Pending',
      price: tier?.price,
      timestamp: Date.now(),
      userName: user.fullName || user.username || 'Artist',
      userEmail: user.primaryEmailAddress?.emailAddress,
      userAvatar: user.imageUrl
    };

    try {
      await set(ref(db, `orders/${user.id}/${orderId}`), orderData);
      await fetch(siteConfig.api.formspreeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ ...orderData, _subject: `NEW ORDER DISPATCHED: ${tier?.name}` })
      });
      setStatus('success');
      setFormData({ message: '' });
      setSelectedTier(null);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('idle');
    }
  };

  return (
    <section ref={intersectionRef} id="contact" className="py-24 bg-black relative z-10 select-none overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-16 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-3 block">Neural Core</span>
          <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter">
            {isOwner ? 'Overseer Terminal' : 'Select Your Mission'}
          </h2>
          <div className="mt-4 inline-block px-6 py-2 rounded-full border border-red-600/30 bg-red-600/10 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            <span className="text-[14px] font-black text-red-500 uppercase tracking-[0.4em] neon-glow-red">@fuadeditingzone</span>
            {isOwner && <span className="owner-badge ml-4 scale-90">OWNER</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          <div className="space-y-10">
            {isOwner ? (
              <div className="bg-[#080808]/95 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4 mb-8">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div> Global Signals
                 </h3>
                 <div className="space-y-4 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
                    {adminOrders.map(order => (
                      <div key={order.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <img src={order.userAvatar} className="w-10 h-10 rounded-xl border border-red-600/30 object-cover" alt="" />
                            <div>
                               <p className="text-[12px] font-black text-white uppercase tracking-widest">{order.userName}</p>
                               <p className="text-[9px] text-red-500 font-bold uppercase">{order.service}</p>
                            </div>
                          </div>
                          <div className="text-[10px] font-black text-white bg-red-600/20 px-2 py-1 rounded-lg">{order.price}</div>
                        </div>
                        <p className="text-[11px] text-gray-400 mb-6 italic leading-relaxed">"{order.message}"</p>
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
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SERVICE_TIERS.map(tier => (
                    <button 
                      key={tier.id}
                      onClick={(e) => { e.preventDefault(); setSelectedTier(tier.id); }}
                      className={`relative flex flex-col p-6 rounded-[2rem] border transition-all duration-500 text-left bg-white/5 ${selectedTier === tier.id ? 'service-card-selected' : 'border-white/10 hover:border-white/30'}`}
                    >
                      <tier.icon className="w-8 h-8 text-red-600 mb-4" />
                      <h4 className="text-[13px] font-black text-white uppercase tracking-widest mb-1">{tier.name}</h4>
                      <p className="text-[10px] text-gray-500 font-bold mb-4">Starts at <span className="text-red-500">{tier.price}</span></p>
                      <ul className="space-y-1.5 flex-1">
                        {tier.features.map(f => (
                          <li key={f} className="text-[8px] text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-medium">
                            <div className="w-1 h-1 bg-red-600 rounded-full"></div> {f}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[8px] text-gray-600 font-black uppercase">ETD: {tier.delivery}</span>
                        {selectedTier === tier.id && <CheckCircleIcon className="w-4 h-4 text-red-600" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="bg-[#080808]/95 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                   {!isSignedIn ? (
                     <SignInButton mode="modal">
                       <button onClick={(e) => e.preventDefault()} className="w-full bg-red-600 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.6em] shadow-xl">Verify Signature to Order</button>
                     </SignInButton>
                   ) : (
                     <>
                        <div className="space-y-3">
                          <label className="text-[9px] uppercase font-black text-gray-600 tracking-widest ml-1">Project Briefing</label>
                          <textarea 
                            required 
                            rows={4} 
                            value={formData.message} 
                            onChange={e => setFormData({ message: e.target.value })} 
                            className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-red-600 outline-none resize-none transition-all shadow-lg" 
                            placeholder="Describe your creative vision..." 
                          />
                        </div>
                        <button 
                          type="submit" 
                          disabled={status === 'submitting' || hasPendingOrder || !selectedTier} 
                          className={`w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.6em] transition-all flex items-center justify-center gap-4 ${
                            hasPendingOrder || !selectedTier
                              ? 'bg-yellow-600/10 text-yellow-500 cursor-not-allowed border border-yellow-500/20' 
                              : 'bg-red-600 hover:bg-red-700 text-white shadow-xl active:scale-95'
                          }`}
                        >
                          {status === 'submitting' ? <SparklesIcon className="w-5 h-5 animate-spin" /> : 
                           hasPendingOrder ? 'Active Signal Detected' : !selectedTier ? 'Select Tier Above' : 'Initiate Dispatch'}
                        </button>
                     </>
                   )}
                </div>
              </form>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[3.5rem] p-10 min-h-[500px] shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-8">
                    <h3 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-4">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                        Mission Log
                    </h3>
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{userOrders.length} Records</span>
                </div>
                <div className="space-y-6 max-h-[550px] overflow-y-auto pr-3 custom-scrollbar">
                    {userOrders.length === 0 ? (
                        <div className="py-24 text-center opacity-10 flex flex-col items-center gap-6">
                            <SparklesIcon className="w-20 h-20" />
                            <p className="text-[11px] uppercase font-black tracking-[0.8em]">Empty Grid</p>
                        </div>
                    ) : (
                        userOrders.map((order) => (
                            <motion.div key={order.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className={`p-8 rounded-[2rem] border transition-all duration-700 ${order.status === 'Pending' ? 'bg-yellow-600/5 border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.1)]' : order.status === 'Accepted' ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_35px_rgba(37,99,235,0.15)]' : 'bg-red-600/5 border-red-500/20'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[14px] font-black text-white uppercase tracking-widest mb-1 truncate">{order.service}</p>
                                        <p className="text-[9px] text-gray-700 font-bold uppercase">{new Date(order.timestamp).toLocaleString()} • {order.price}</p>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex-shrink-0 ${
                                        order.status === 'Pending' ? 'text-yellow-500 border-yellow-500/30' : 
                                        order.status === 'Accepted' ? 'text-blue-500 border-blue-500/30' :
                                        'text-red-500 border-red-500/30'
                                    }`}>
                                        {order.status}
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic border-l-2 border-white/5 pl-4 line-clamp-3">"{order.message}"</p>
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