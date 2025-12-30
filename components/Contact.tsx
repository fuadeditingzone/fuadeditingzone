import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onValue, set, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { siteConfig } from '../config';
import { EmailIcon, WhatsAppIcon, CheckCircleIcon, SparklesIcon, PlayIcon, CloseIcon } from './Icons';

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
emailjs.init("Z-tNNcQWjE-izOeae");

interface Order {
  id: string;
  service: string;
  message: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed';
  timestamp: number;
}

export const Contact: React.FC<{ onStartOrder: (platform: 'whatsapp' | 'email') => void }> = ({ onStartOrder }) => {
  const { isSignedIn, user } = useUser();
  const [intersectionRef] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [notifiedOrderId, setNotifiedOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', service: '', message: '' });

  // 1. Automatic User Sync to Firebase (Crucial for Search)
  useEffect(() => {
    if (isSignedIn && user) {
      const userRef = ref(db, `users/${user.id}`);
      set(userRef, {
        id: user.id,
        name: user.fullName || 'Legend',
        username: user.username || user.firstName?.toLowerCase() || 'legend',
        avatar: user.imageUrl,
        email: user.primaryEmailAddress?.emailAddress,
        lastSeen: serverTimestamp()
      });
      setFormData(prev => ({ 
        ...prev, 
        name: user.fullName || '', 
        email: user.primaryEmailAddress?.emailAddress || '' 
      }));
    }
  }, [isSignedIn, user]);

  // 2. Real-time Order Monitoring & EmailJS Automation
  useEffect(() => {
    if (!isSignedIn || !user) return;
    const ordersRef = ref(db, `orders/${user.id}`);
    
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val })) as Order[];
        list.sort((a, b) => b.timestamp - a.timestamp);
        
        // Automation: Detect Status Change for Email Notifications
        list.forEach(newOrder => {
          const oldOrder = userOrders.find(o => o.id === newOrder.id);
          
          // Trigger when status changes from Pending to Accepted/Rejected
          if (oldOrder && oldOrder.status === 'Pending' && (newOrder.status === 'Accepted' || newOrder.status === 'Rejected')) {
            setNotifiedOrderId(newOrder.id);
            
            // EmailJS Notification Logic
            const emailParams = {
              user_name: user.fullName,
              user_email: user.primaryEmailAddress?.emailAddress,
              order_status: newOrder.status,
              service_type: newOrder.service,
              admin_handle: "@fuadeditingzone"
            };

            emailjs.send("service_default", "template_order_status", emailParams)
              .then(() => console.log("Status Email Transmitted"))
              .catch((err) => console.error("Email System Offline:", err));

            // Sound Alert
            new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play().catch(() => {});
          }
        });
        
        setUserOrders(list);
      }
    });
    return () => unsubscribe();
  }, [isSignedIn, user, userOrders]);

  const hasPendingOrder = useMemo(() => userOrders.some(o => o.status === 'Pending'), [userOrders]);

  // 3. Form Submission (Firebase + Formspree)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Anti-Scroll Fixed
    if (!isSignedIn || !user || hasPendingOrder) return;

    setStatus('submitting');
    const orderId = `order_${Date.now()}`;
    const orderData = {
      service: formData.service,
      message: formData.message,
      status: 'Pending',
      timestamp: Date.now(),
      userName: user.fullName,
      userEmail: user.primaryEmailAddress?.emailAddress
    };

    try {
      // Step A: Save to Firebase RTDB
      await set(ref(db, `orders/${user.id}/${orderId}`), orderData);
      
      // Step B: Direct Email Alert via Formspree
      await fetch(siteConfig.api.formspreeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ ...orderData, _subject: `NEW ORDER ALERT: ${formData.service} from ${user.fullName}` })
      });

      setStatus('success');
      setFormData(prev => ({ ...prev, message: '', service: '' }));
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error("Critical Failure:", error);
      setStatus('idle');
    }
  };

  return (
    <section ref={intersectionRef} id="contact" className="py-24 bg-black relative z-10 select-none overflow-hidden">
      {/* STATUS CHANGE POPUP */}
      <AnimatePresence>
        {notifiedOrderId && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[500] w-full max-w-sm px-6"
          >
            <div className="bg-blue-600 text-white p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(37,99,235,0.5)] border border-blue-400/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SparklesIcon className="w-6 h-6 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest">Order Status Updated!</p>
              </div>
              <button onClick={() => setNotifiedOrderId(null)} className="p-1 hover:rotate-90 transition-transform">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-16 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-3 block">Neural Operations</span>
          <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter">Mission Briefing</h2>
          <div className="mt-4 inline-block px-6 py-2 rounded-full border border-red-600/30 bg-red-600/10 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
            <span className="text-[12px] font-black text-red-500 uppercase tracking-[0.4em]">@fuadeditingzone</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* SECURE ORDER TERMINAL */}
          <div className="bg-[#080808]/90 border border-white/10 rounded-[3.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <SparklesIcon className="w-24 h-24 text-red-600" />
            </div>

            {!isSignedIn ? (
              <div className="py-24 text-center space-y-10">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                  <PlayIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Identity Authentication Required</h3>
                <SignInButton mode="modal">
                  <button className="bg-red-600 hover:bg-red-700 text-white font-black py-5 px-14 uppercase tracking-[0.5em] text-[11px] rounded-2xl transition-all shadow-[0_10px_40px_rgba(220,38,38,0.3)]">Verify Signature</button>
                </SignInButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] uppercase font-black text-gray-600 tracking-widest ml-1">Authorized Name</label>
                    <input readOnly value={formData.name} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-gray-500 outline-none" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] uppercase font-black text-gray-600 tracking-widest ml-1">Signal Protocol</label>
                    <input readOnly value={formData.email} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-gray-500 outline-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] uppercase font-black text-gray-600 tracking-widest ml-1">Operation Type</label>
                  <select 
                    required 
                    name="service" 
                    value={formData.service} 
                    onChange={e => setFormData(p => ({ ...p, service: e.target.value }))} 
                    className="w-full bg-black border border-blue-600/30 rounded-2xl px-6 py-5 text-sm text-white focus:border-red-600 outline-none transition-all cursor-pointer shadow-lg"
                  >
                    <option value="" disabled>Select Objective...</option>
                    <option value="Cinematic VFX Mastery">Cinematic VFX Mastery</option>
                    <option value="High-CTR YouTube Thumbnail">High-CTR YouTube Thumbnail</option>
                    <option value="Elite Photo Manipulation">Elite Photo Manipulation</option>
                    <option value="Legendary Anime Edit">Legendary Anime Edit (AMV)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] uppercase font-black text-gray-600 tracking-widest ml-1">Mission Details</label>
                  <textarea 
                    required 
                    rows={4} 
                    value={formData.message} 
                    onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} 
                    className="w-full bg-black border border-blue-600/30 rounded-2xl px-6 py-5 text-sm text-white focus:border-red-600 outline-none resize-none transition-all shadow-lg" 
                    placeholder="Describe your creative vision..." 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'submitting' || hasPendingOrder} 
                  className={`w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.6em] transition-all flex items-center justify-center gap-4 ${
                    hasPendingOrder 
                      ? 'bg-yellow-600/10 text-yellow-500 cursor-not-allowed border border-yellow-500/20' 
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_20px_50px_rgba(220,38,38,0.4)] active:scale-95'
                  }`}
                >
                  {status === 'submitting' ? <SparklesIcon className="w-5 h-5 animate-spin" /> : 
                   hasPendingOrder ? 'Mission In Progress' : 'Initiate Protocol'}
                </button>
                
                {hasPendingOrder && (
                  <p className="text-[9px] text-center text-yellow-500/60 uppercase font-black tracking-widest mt-4">
                    Active order detected. Please await completion of current mission.
                  </p>
                )}
              </form>
            )}
          </div>

          {/* REAL-TIME DASHBOARD */}
          <div className="space-y-8">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 min-h-[500px] shadow-inner">
                <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                    <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-4">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                        Mission History
                    </h3>
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{userOrders.length} Files Found</span>
                </div>

                <div className="space-y-6 max-h-[550px] overflow-y-auto pr-3 custom-scrollbar">
                    {userOrders.length === 0 ? (
                        <div className="py-24 text-center opacity-20 flex flex-col items-center gap-6">
                            <SparklesIcon className="w-16 h-16" />
                            <p className="text-[10px] uppercase font-black tracking-[0.5em]">No Missions Recorded</p>
                        </div>
                    ) : (
                        userOrders.map((order) => (
                            <motion.div 
                                key={order.id} 
                                initial={{ opacity: 0, x: 30 }} 
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-8 rounded-3xl border transition-all duration-500 ${
                                    order.status === 'Pending' ? 'bg-yellow-600/5 border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]' :
                                    order.status === 'Accepted' ? 'bg-blue-600/5 border-blue-500/30 shadow-[0_0_30px_rgba(37,99,235,0.15)]' :
                                    order.status === 'Rejected' ? 'bg-red-600/5 border-red-500/20' :
                                    'bg-green-600/5 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)]'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[13px] font-black text-white uppercase tracking-widest mb-1">{order.service}</p>
                                        <p className="text-[9px] text-gray-600 font-bold uppercase">{new Date(order.timestamp).toLocaleString()}</p>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                        order.status === 'Pending' ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5' :
                                        order.status === 'Accepted' ? 'text-blue-500 border-blue-500/30 bg-blue-500/5' :
                                        order.status === 'Rejected' ? 'text-red-500 border-red-500/30 bg-red-500/5' :
                                        'text-green-500 border-green-500/30 bg-green-500/5'
                                    }`}>
                                        {order.status}
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic border-l-2 border-white/5 pl-4">
                                  "{order.message.length > 100 ? order.message.slice(0, 100) + '...' : order.message}"
                                </p>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* EXTERNAL COMMS */}
            <div className="grid grid-cols-2 gap-6">
                <button onClick={() => onStartOrder('whatsapp')} className="p-8 bg-green-600/10 border border-green-600/20 rounded-[2.5rem] text-center group hover:bg-green-600/20 transition-all shadow-xl">
                    <WhatsAppIcon className="w-8 h-8 text-green-500 mx-auto mb-4 transition-transform group-hover:-translate-y-2" />
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">WhatsApp Direct</p>
                </button>
                <button onClick={() => onStartOrder('email')} className="p-8 bg-red-600/10 border border-red-600/20 rounded-[2.5rem] text-center group hover:bg-red-600/20 transition-all shadow-xl">
                    <EmailIcon className="w-8 h-8 text-red-500 mx-auto mb-4 transition-transform group-hover:-translate-y-2" />
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Official Email</p>
                </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
