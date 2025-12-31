import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, set, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { EmailIcon, WhatsAppIcon, SparklesIcon, CloseIcon, VfxIcon, ThumbnailIcon, BannerIcon, ChevronRightIcon } from './Icons';

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

const SERVICE_TIERS = [
  { id: 'vfx', name: 'Premium VFX', price: '50', icon: VfxIcon },
  { id: 'thumbnail', name: 'YT Thumbnails', price: '15', icon: ThumbnailIcon },
  { id: 'banner', name: 'Channel Branding', price: '25', icon: BannerIcon },
  { id: 'custom', name: 'Custom Order', price: '?', icon: SparklesIcon }
];

export const Contact: React.FC<{ onStartOrder: (platform: 'whatsapp' | 'email') => void }> = ({ onStartOrder }) => {
  const { isSignedIn, user } = useUser();
  const [intersectionRef] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
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

  const priceError = useMemo(() => {
    if (selectedTier === 'custom' && formData.customPrice) {
        const val = parseInt(formData.customPrice);
        if (isNaN(val) || val < 5) return 'Minimum order is $5';
    }
    return null;
  }, [formData.customPrice, selectedTier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !user || !selectedTier || priceError) return;

    setStatus('submitting');
    const isCustom = selectedTier === 'custom';
    const tier = SERVICE_TIERS.find(t => t.id === selectedTier);
    
    const orderData = {
      service: isCustom ? formData.customName : tier?.name,
      message: formData.message,
      status: 'Pending',
      price: isCustom ? `$${formData.customPrice}` : `$${tier?.price}`,
      delivery: isCustom ? `${formData.customTime} Days` : 'Standard',
      timestamp: Date.now(),
      userName: user.fullName || user.username,
      userAvatar: user.imageUrl
    };

    try {
      await set(ref(db, `orders/${user.id}/order_${Date.now()}`), orderData);
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
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-3 block">Work With Me</span>
          <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter">Hire For Project</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <form onSubmit={handleSubmit} className="space-y-10 min-w-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SERVICE_TIERS.map(tier => (
                    <button key={tier.id} onClick={(e) => { e.preventDefault(); setSelectedTier(tier.id); }} className={`flex flex-col p-4 rounded-[1.8rem] border transition-all duration-500 bg-white/5 ${selectedTier === tier.id ? 'border-red-600 shadow-xl' : 'border-white/10 hover:border-white/20'}`}>
                        <tier.icon className={`w-6 h-6 mb-3 ${selectedTier === tier.id ? 'text-red-500' : 'text-zinc-600'}`} />
                        <h4 className="text-[10px] font-black text-white uppercase leading-tight truncate w-full">{tier.name}</h4>
                    </button>
                ))}
            </div>

            <div className="bg-[#080808] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                {!isSignedIn ? (
                    <SignInButton mode="modal"><button className="w-full bg-red-600 py-6 rounded-2xl font-black uppercase tracking-[0.6em] text-[11px] shadow-xl hover:bg-red-700 transition-all active:scale-95">Sign in to Start</button></SignInButton>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedTier === 'custom' && (
                                <input required value={formData.customName} onChange={e => setFormData({...formData, customName: e.target.value})} placeholder="Project Name" className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-xs text-white outline-none focus:border-red-600" />
                            )}
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Budget ($)</label>
                                <input required type="text" value={formData.customPrice} onChange={e => setFormData({...formData, customPrice: e.target.value.replace(/[^0-9]/g, '')})} placeholder="e.g. 50" className={`w-full bg-black border ${priceError ? 'border-red-600' : 'border-white/10'} rounded-xl px-5 py-4 text-xs text-white outline-none focus:border-red-600`} />
                                {priceError && <p className="text-[8px] text-red-500 font-bold uppercase ml-2">{priceError}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Needed in (Days)</label>
                                <input required type="text" value={formData.customTime} onChange={e => setFormData({...formData, customTime: e.target.value.replace(/[^0-9]/g, '')})} placeholder="e.g. 3" className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-xs text-white outline-none focus:border-red-600" />
                            </div>
                        </div>
                        <textarea required rows={4} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-red-600 outline-none resize-none shadow-lg" placeholder="Tell me what you need specifically..." />
                        <button type="submit" disabled={status === 'submitting' || !selectedTier || !!priceError} className={`w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.6em] transition-all flex items-center justify-center gap-4 ${!selectedTier || !!priceError ? 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5' : 'bg-red-600 text-white shadow-xl hover:bg-red-700 active:scale-95'}`}>
                            {status === 'submitting' ? <SparklesIcon className="w-5 h-5 animate-spin" /> : 'Send Request'}
                        </button>
                    </>
                )}
            </div>
          </form>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-[3.5rem] p-10 shadow-inner relative overflow-hidden flex flex-col h-full min-h-[500px] max-h-[85vh]">
                <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-8 pb-8 border-b border-white/5 flex-shrink-0">My Requests</h3>
                <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-2">
                    {userOrders.length === 0 ? (
                        <div className="py-24 text-center opacity-10 flex flex-col items-center gap-6">
                            <SparklesIcon className="w-20 h-20" />
                            <p className="text-[11px] uppercase font-black tracking-widest">No requests yet</p>
                        </div>
                    ) : (
                        userOrders.map((order, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] shadow-lg group hover:border-red-600/20 transition-all duration-500">
                                <div className="flex justify-between items-start mb-6 gap-4">
                                    <p className="text-[15px] font-black text-white uppercase tracking-wider truncate flex-1" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{order.service}</p>
                                    <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-lg border flex-shrink-0 ${order.status === 'Pending' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5' : 'text-green-500 border-green-500/20 bg-green-500/5'}`}>{order.status}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-black/60 p-3 rounded-xl border border-white/5 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Budget: <span className="text-white">{order.price}</span></div>
                                    <div className="bg-black/60 p-3 rounded-xl border border-white/5 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Timeline: <span className="text-white">{order.delivery}</span></div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
          </div>
        </div>
        
        <div className="mt-32 flex justify-center">
            <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group flex flex-col items-center gap-4 transition-all hover:scale-105"
            >
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-600 group-hover:bg-red-600/10 transition-all">
                    <ChevronRightIcon className="w-5 h-5 -rotate-90 text-zinc-500 group-hover:text-red-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-white">Back to Top</span>
            </button>
        </div>
      </div>
    </section>
  );
};
