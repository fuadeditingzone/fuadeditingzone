import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, set, update, push, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { SparklesIcon, VfxIcon, ThumbnailIcon, BannerIcon, ChevronRightIcon, ClockIcon } from './Icons';

const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY",
  projectId: "fuad-editing-zone",
  messagingSenderId: "832389657221",
  appId: "1:1032345523456:web:123456789",
};

if (!getApps().length) initializeApp(firebaseConfig);
const db = getDatabase();

const OWNER_HANDLE = 'fuadeditingzone';

const RECOMMENDED_TAGS = [
    "YouTube Thumbnail", "VFX Animation", "Photo Manipulation", "AMV Edit", 
    "Channel Branding", "Social Media Post", "Logo Design", "Cinematic Montage",
    "Stream Overlay", "Color Grading", "Video Editing", "After Effects Shot"
];

const SERVICE_TIERS = [
  { id: 'vfx', name: 'Premium VFX', price: '50', icon: VfxIcon, delivery: '7' },
  { id: 'thumbnail', name: 'YT Thumbnails', price: '15', icon: ThumbnailIcon, delivery: '2' },
  { id: 'banner', name: 'Channel Branding', price: '25', icon: BannerIcon, delivery: '3' },
  { id: 'custom', name: 'Custom Order', price: '?', icon: SparklesIcon, delivery: '?' }
];

export const Contact: React.FC<{ onStartOrder: (platform: 'whatsapp' | 'email') => void }> = ({ onStartOrder }) => {
  const { isSignedIn, user } = useUser();
  const [intersectionRef] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [currency, setCurrency] = useState('$');
  const [formData, setFormData] = useState({ message: '', customName: '', customPrice: '', customTime: '' });
  const [userOrders, setUserOrders] = useState<any[]>([]);

  useEffect(() => {
    if (isSignedIn && user) {
      const ordersRef = ref(db, `orders/${user.id}`);
      onValue(ordersRef, (snap) => {
        const data = snap.val();
        if (data) setUserOrders(Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp));
      });
    }
  }, [isSignedIn, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !user || !selectedTier) return;
    
    // Minimum Order Logic
    const budgetVal = parseInt(formData.customPrice);
    if (isNaN(budgetVal) || budgetVal < 5) {
        alert("Minimum order is $5");
        return;
    }

    setStatus('submitting');
    const isCustom = selectedTier === 'custom';
    const tier = SERVICE_TIERS.find(t => t.id === selectedTier);
    const orderKey = `order_${Date.now()}`;
    const serviceName = isCustom ? formData.customName : tier?.name;
    const finalPrice = isCustom ? formData.customPrice : tier?.price;
    const finalDelivery = isCustom ? formData.customTime : tier?.delivery;
    
    const orderData = {
      service: serviceName,
      message: formData.message,
      status: 'Pending',
      price: `${currency}${finalPrice}`,
      delivery: `${finalDelivery} Days`,
      timestamp: Date.now(),
      userName: user.fullName || user.username,
      userAvatar: user.imageUrl,
      userId: user.id
    };

    try {
      await set(ref(db, `orders/${user.id}/${orderKey}`), orderData);
      const usersSnap = await get(ref(db, 'users'));
      const ownerEntry = Object.values(usersSnap.val() || {}).find((u: any) => u.username === OWNER_HANDLE) as any;
      
      if (ownerEntry) {
          const ownerId = ownerEntry.id;
          await push(ref(db, `notifications/${ownerId}`), {
              type: 'new_order', fromId: user.id, fromName: user.fullName || user.username, fromAvatar: user.imageUrl,
              timestamp: Date.now(), read: false, orderName: serviceName, orderKey: orderKey
          });
          const chatPath = `messages/${[user.id, ownerId].sort().join('_')}`;
          await push(ref(db, chatPath), {
              senderId: user.id, senderName: user.fullName || user.username, senderAvatar: user.imageUrl,
              text: `[ORDER INQUIRY] New Project\nService: ${serviceName}\nBudget: ${currency}${finalPrice}\nDeadline: ${finalDelivery} Days\nDescription: ${formData.message}`,
              timestamp: Date.now()
          });
      }

      setStatus('success');
      setFormData({ message: '', customName: '', customPrice: '', customTime: '' });
      setSelectedTier(null);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) { setStatus('idle'); }
  };

  return (
    <section ref={intersectionRef} id="contact" className="py-20 md:py-24 bg-[#050505] relative z-10 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-12 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-3 block">Marketplace</span>
          <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">Order Project</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SERVICE_TIERS.map(tier => (
                    <button key={tier.id} type="button" onClick={() => { setSelectedTier(tier.id); if(tier.id !== 'custom') setFormData(f => ({...f, customPrice: tier.price, customTime: tier.delivery})); }} className={`flex flex-col p-5 rounded-[1.5rem] border transition-all duration-500 bg-white/5 ${selectedTier === tier.id ? 'border-red-600 shadow-xl' : 'border-white/10 hover:border-white/20'}`}>
                        <tier.icon className={`w-5 h-5 mb-4 ${selectedTier === tier.id ? 'text-red-500' : 'text-zinc-600'}`} />
                        <h4 className="text-[9px] font-black text-white uppercase truncate">{tier.name}</h4>
                    </button>
                ))}
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-10 space-y-6 shadow-2xl">
                {!isSignedIn ? (
                    <SignInButton mode="modal"><button type="button" className="w-full bg-red-600 py-6 rounded-2xl font-black uppercase tracking-[0.6em] text-[11px] hover:bg-red-700 transition-all">Connect to Order</button></SignInButton>
                ) : (
                    <>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Mission Category:</p>
                            <div className="flex flex-wrap gap-2">
                                {RECOMMENDED_TAGS.map(tag => (
                                    <button key={tag} type="button" onClick={() => setFormData({...formData, customName: tag})} className={`px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${formData.customName === tag ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'}`}>{tag}</button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Budget ($)</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-5 text-red-600 font-black text-lg">$</span>
                                    <input required type="number" min="5" value={formData.customPrice} onChange={e => setFormData({...formData, customPrice: e.target.value})} className="w-full h-16 bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-lg font-black text-white outline-none focus:border-red-600 transition-all" placeholder="Min 5" />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Delivery Time (Days)</label>
                                <div className="relative flex items-center">
                                    <ClockIcon className="absolute left-5 w-5 h-5 text-zinc-600" />
                                    <input required type="number" min="1" value={formData.customTime} onChange={e => setFormData({...formData, customTime: e.target.value})} className="w-full h-16 bg-black border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-lg font-black text-white outline-none focus:border-red-600 transition-all" placeholder="Days" />
                                </div>
                            </div>
                        </div>
                        
                        <textarea required rows={4} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-sm text-white outline-none focus:border-red-600 transition-all shadow-inner resize-none" placeholder="Project details and mission goals..." />
                        
                        <button type="submit" disabled={status === 'submitting' || !selectedTier} className={`w-full py-6 md:py-8 rounded-2xl text-[11px] font-black uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-4 ${!selectedTier ? 'bg-white/5 text-zinc-600 cursor-not-allowed' : 'bg-red-600 text-white shadow-xl hover:bg-red-700 active:scale-95'}`}>
                            {status === 'submitting' ? <SparklesIcon className="w-5 h-5 animate-spin" /> : 'Deploy Order'}
                        </button>
                    </>
                )}
            </div>
          </form>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col h-full min-h-[500px] max-h-[80vh]">
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest mb-8 pb-8 border-b border-white/5 flex-shrink-0">Order Database</h3>
                <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 pr-2">
                    {userOrders.length === 0 ? (
                        <div className="py-24 text-center opacity-10 flex flex-col items-center gap-6">
                            <SparklesIcon className="w-16 h-16 md:w-20 md:h-20" />
                            <p className="text-[11px] uppercase font-black tracking-widest">Awaiting Command</p>
                        </div>
                    ) : (
                        userOrders.map((order, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-[2rem] shadow-lg group hover:border-red-600/30 transition-all duration-500">
                                <div className="flex justify-between items-start mb-6 gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] md:text-[15px] font-black text-white uppercase tracking-wider truncate">{order.service}</p>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-lg border flex-shrink-0 ${order.status === 'Pending' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5' : order.status === 'Accepted' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>{order.status}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 opacity-80">
                                    <div className="bg-black/60 p-4 rounded-xl border border-white/5 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Budget: <span className="text-white">{order.price}</span></div>
                                    <div className="bg-black/60 p-4 rounded-xl border border-white/5 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Time: <span className="text-white">{order.delivery}</span></div>
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