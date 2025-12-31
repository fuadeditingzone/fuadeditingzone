import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, set, serverTimestamp, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { siteConfig } from '../config';
import { EmailIcon, WhatsAppIcon, SparklesIcon, CloseIcon, CheckCircleIcon, UserCircleIcon, VfxIcon, ThumbnailIcon, BannerIcon } from './Icons';

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

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getDatabase();

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
  { id: 'vfx', name: 'Cinematic VFX Mastery', price: '50', delivery: '3-5 Days', features: ['4K HDR Render', 'Motion tracking', 'Premium FX'], icon: VfxIcon },
  { id: 'thumbnail', name: 'High-CTR Thumbnails', price: '15', delivery: '24 Hours', features: ['Max Click-Rate', '3D Texturing', 'Pro Grading'], icon: ThumbnailIcon },
  { id: 'banner', name: 'Elite Branding Kit', price: '25', delivery: '2 Days', features: ['Multi-Platform', 'Source Files', 'High-Res'], icon: BannerIcon },
  { id: 'custom', name: 'Custom Order', price: 'Proposed', delivery: 'Requested', features: ['Your Briefing', 'Direct Comms', 'Bespoke Art'], icon: SparklesIcon }
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

  useEffect(() => {
    if (isSignedIn && user) {
      setUserOrders(allOrders.filter(o => o.userId === user.id));
    }
  }, [allOrders, isSignedIn, user]);

  const hasPendingOrder = useMemo(() => userOrders.some(o => o.status === 'Pending'), [userOrders]);

  const priceError = useMemo(() => {
    if (selectedTier === 'custom' && formData.customPrice) {
        const val = parseInt(formData.customPrice);
        if (isNaN(val) || val < 5) return 'Minimum order is $5';
    }
    return null;
  }, [formData.customPrice, selectedTier]);

  const handleAdminAction = async (e: React.MouseEvent, order: Order, newStatus: 'Accepted' | 'Rejected') => {
    e.preventDefault();
    if (!isOwner) return;
    try {
      await update(ref(db, `orders/${order.userId}/${order.id}`), { status: newStatus });
      alert(`Order ${newStatus.toUpperCase()}`);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !user || hasPendingOrder || !selectedTier || priceError) return;

    setStatus('submitting');
    const isCustom = selectedTier === 'custom';
    const tier = SERVICE_TIERS.find(t => t.id === selectedTier);
    
    const orderId = `order_${Date.now()}`;
    const orderData = {
      service: isCustom ? formData.customName : tier?.name,
      message: formData.message,
      status: 'Pending',
      price: isCustom ? `$${formData.customPrice}` : `$${tier?.price}`,
      delivery: isCustom ? `${formData.customTime} Days` : tier?.delivery,
      isCustom,
      timestamp: Date.now(),
      userName: user.fullName || user.username || 'Client',
      userEmail: user.primaryEmailAddress?.emailAddress,
      userAvatar: user.imageUrl
    };

    try {
      await set(ref(db, `orders/${user.id}/${orderId}`), orderData);
      setStatus('success');
      setFormData({ message: '', customName: '', customPrice: '', customTime: '' });
      setSelectedTier(null);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) { setStatus('idle'); }
  };

  return (
    <section ref={intersectionRef} id="contact" className="py-24 bg-black relative z-10 select-none overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <div className="mb-16 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-3 block">Marketplace</span>
          <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter">
            {isOwner ? 'Admin Console' : 'Place Your Order'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          <div className="space-y-10">
            {isOwner ? (
                <div className="bg-[#080808]/95 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div> Global Orders
                    </h3>
                    <div className="space-y-4">
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
                                        <button onClick={(e) => handleAdminAction(e, order, 'Accepted')} className="flex-1 bg-blue-600 text-white font-black py-2 rounded-xl text-[9px] uppercase tracking-widest transition-all">Accept</button>
                                        <button onClick={(e) => handleAdminAction(e, order, 'Rejected')} className="flex-1 bg-white/5 text-red-500 font-black py-2 rounded-xl text-[9px] uppercase tracking-widest transition-all">Reject</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {SERVICE_TIERS.map(tier => (
                            <button 
                                key={tier.id}
                                onClick={(e) => { e.preventDefault(); setSelectedTier(tier.id); }}
                                className={`flex flex-col p-4 rounded-[1.5rem] border transition-all duration-500 text-left bg-white/5 ${selectedTier === tier.id ? 'border-red-600 shadow-xl' : 'border-white/10 hover:border-white/20'}`}
                            >
                                <tier.icon className={`w-6 h-6 mb-3 ${selectedTier === tier.id ? 'text-red-500' : 'text-gray-600'}`} />
                                <h4 className="text-[10px] font-black text-white uppercase mb-1 leading-tight">{tier.name}</h4>
                                <p className="text-[8px] text-gray-500 font-bold">${tier.price}</p>
                            </button>
                        ))}
                    </div>

                    <div className="bg-[#080808]/95 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                        {!isSignedIn ? (
                            <SignInButton mode="modal"><button className="w-full bg-red-600 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.6em] shadow-xl">Sign in to Order</button></SignInButton>
                        ) : (
                            <div className="space-y-6">
                                {selectedTier === 'custom' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input required value={formData.customName} onChange={e => setFormData({...formData, customName: e.target.value})} placeholder="Service Name" className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-xs text-white focus:border-red-600 outline-none" />
                                        <div className="space-y-1">
                                            <input 
                                                required 
                                                type="text"
                                                value={formData.customPrice} 
                                                onChange={e => setFormData({...formData, customPrice: e.target.value.replace(/[^0-9]/g, '')})} 
                                                placeholder="Budget ($)" 
                                                className={`w-full bg-black border ${priceError ? 'border-red-600' : 'border-white/10'} rounded-xl px-5 py-4 text-xs text-white focus:border-red-600 outline-none`} 
                                            />
                                            {priceError && <p className="text-[8px] text-red-500 font-bold uppercase ml-2">{priceError}</p>}
                                        </div>
                                        <input 
                                            required 
                                            type="text"
                                            value={formData.customTime} 
                                            onChange={e => setFormData({...formData, customTime: e.target.value.replace(/[^0-9]/g, '')})} 
                                            placeholder="Days for Delivery" 
                                            className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-xs text-white focus:border-red-600 outline-none" 
                                        />
                                    </div>
                                )}
                                <textarea required rows={4} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-red-600 outline-none resize-none shadow-lg" placeholder="Order Description..." />
                                <button type="submit" disabled={status === 'submitting' || hasPendingOrder || !selectedTier || !!priceError} className={`w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.6em] transition-all flex items-center justify-center gap-4 ${hasPendingOrder || !selectedTier || !!priceError ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5' : 'bg-red-600 hover:bg-red-700 text-white shadow-xl'}`}>
                                    {status === 'submitting' ? <SparklesIcon className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            )}
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-[3.5rem] p-10 min-h-[500px] shadow-inner relative overflow-hidden flex flex-col max-h-[85vh]">
                <h3 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-4 border-b border-white/5 pb-8 flex-shrink-0">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div> My Orders
                </h3>
                <div className="space-y-6 overflow-y-auto pr-3 custom-scrollbar flex-1 pt-8">
                    {userOrders.length === 0 ? (
                        <div className="py-24 text-center opacity-10 flex flex-col items-center gap-6"><SparklesIcon className="w-20 h-20" /><p className="text-[11px] uppercase font-black">No Active Orders</p></div>
                    ) : (
                        userOrders.map((order) => (
                            <motion.div key={order.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className={`p-8 rounded-[2.5rem] border transition-all duration-700 ${order.status === 'Accepted' ? 'bg-red-600/5 border-red-600/20' : 'bg-white/5 border-white/10'}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[15px] font-black text-white uppercase tracking-wider truncate mb-1">{order.service}</p>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase">{new Date(order.timestamp).toLocaleString()} • {order.price}</p>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${order.status === 'Pending' ? 'text-yellow-500 border-yellow-500/30' : order.status === 'Accepted' ? 'text-blue-500 border-blue-500/30' : 'text-green-500 border-green-500/30'}`}>{order.status}</div>
                                </div>
                                <div className="space-y-4 opacity-40">
                                   <input disabled value={order.service} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-[10px] text-gray-400 font-bold uppercase" />
                                   <div className="grid grid-cols-2 gap-4">
                                       <input disabled value={order.price} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-[10px] text-gray-400 font-bold uppercase" />
                                       <input disabled value={order.delivery} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-[10px] text-gray-400 font-bold uppercase" />
                                   </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
          </div>
        </div>
      </div>
    </section>
  );
};