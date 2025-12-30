import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, set, serverTimestamp, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { siteConfig } from '../config';
import { EmailIcon, WhatsAppIcon, SparklesIcon, PlayIcon, CloseIcon, CheckCircleIcon } from './Icons';

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

// PLACEHOLDERS FOR EMAILJS - FILL THESE IN THE CODE OR ENV
const EMAILJS_SERVICE_ID = 'service_default'; // Replace with yours
const EMAILJS_TEMPLATE_ID = 'template_order_status'; // Replace with yours

declare global {
  interface Window {
    emailjs: any;
  }
}

interface Order {
  id: string;
  userId: string;
  service: string;
  message: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed';
  timestamp: number;
  userName?: string;
  userEmail?: string;
}

export const Contact: React.FC<{ onStartOrder: (platform: 'whatsapp' | 'email') => void }> = ({ onStartOrder }) => {
  const { isSignedIn, user } = useUser();
  const [intersectionRef] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  
  const [notifiedOrderId, setNotifiedOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', service: '', message: '' });

  const isOwner = user?.username === 'fuadeditingzone';

  // 1. Sync User to Firebase
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

  // 2. Fetch User Orders & Monitor Status for Client Notifications
  useEffect(() => {
    if (!isSignedIn || !user) return;
    const ordersRef = ref(db, `orders/${user.id}`);
    
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val })) as Order[];
        list.sort((a, b) => b.timestamp - a.timestamp);
        
        // Automation: Trigger EmailJS logic on status change
        list.forEach(newOrder => {
          const oldOrder = userOrders.find(o => o.id === newOrder.id);
          
          if (oldOrder && oldOrder.status === 'Pending' && (newOrder.status === 'Accepted' || newOrder.status === 'Rejected')) {
            console.log(`[EmailJS] Status Change Detected: ${newOrder.status} for Order ID: ${newOrder.id}`);
            alert(`Order Status Updated: ${newOrder.status}. Sending Email...`);
            
            setNotifiedOrderId(newOrder.id);
            
            // Send EmailJS Notification
            if (window.emailjs && user.primaryEmailAddress?.emailAddress) {
              const emailParams = {
                user_name: user.fullName,
                user_email: user.primaryEmailAddress.emailAddress,
                order_status: newOrder.status,
                service_type: newOrder.service,
                admin_handle: "@fuadeditingzone"
              };

              console.log("[EmailJS] Transmitting with params:", emailParams);

              window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailParams)
                .then(() => {
                  console.log("[EmailJS] Success: Notification Sent to Client");
                  alert("Success: Status Notification Transmitted.");
                })
                .catch((err: any) => {
                  console.error("[EmailJS] Failure:", err);
                  alert("Error: EmailJS failed to transmit. Check console.");
                });
            }

            new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play().catch(() => {});
          }
        });
        
        setUserOrders(list);
      }
    });
    return () => unsubscribe();
  }, [isSignedIn, user, userOrders]);

  // 3. Admin Panel Logic: Fetch ALL Orders
  useEffect(() => {
    if (!isOwner) return;
    console.log("[Admin] Logged in as OWNER. Fetching Global Order Stream...");
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

  // Admin: Update Status Trigger
  const handleAdminAction = async (e: React.MouseEvent, order: Order, newStatus: 'Accepted' | 'Rejected') => {
    e.preventDefault();
    if (!isOwner) return;

    console.log(`[Admin] Updating Order ${order.id} to ${newStatus}...`);
    alert(`Updating ${order.userName}'s order to ${newStatus}. This will trigger an email notification.`);

    try {
      await update(ref(db, `orders/${order.userId}/${order.id}`), { status: newStatus });
      console.log("[Firebase] Order status updated successfully.");
    } catch (err) {
      console.error("[Firebase] Update failed:", err);
      alert("Error: Firebase update failed.");
    }
  };

  // Client: Submit Order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !user || hasPendingOrder) return;

    console.log("[Order] Initiating order dispatch...");
    alert("Initiating order dispatch. Please wait for signal verification.");
    
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
      // Step A: Save to Firebase
      await set(ref(db, `orders/${user.id}/${orderId}`), orderData);
      console.log("[Firebase] Order record created.");

      // Step B: Alert Owner via Formspree
      await fetch(siteConfig.api.formspreeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ ...orderData, _subject: `MISSION RECEIVED: ${formData.service}` })
      });
      console.log("[Formspree] Owner alert transmitted.");

      setStatus('success');
      alert("Order Successful: Mission details recorded in the neural link.");
      setFormData(prev => ({ ...prev, message: '', service: '' }));
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error("[Order] Fatal Error:", error);
      alert("Fatal Error: Could not transmit order data.");
      setStatus('idle');
    }
  };

  return (
    <section ref={intersectionRef} id="contact" className="py-24 bg-black relative z-10 select-none overflow-hidden">
      {/* STATUS CHANGE POPUP (CLIENT SIDE) */}
      <AnimatePresence>
        {notifiedOrderId && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[500] w-full max-w-sm px-6"
          >
            <div className="bg-blue-600 text-white p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(37,99,235,0.5)] border border-blue-400/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SparklesIcon className="w-6 h-6 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest">Protocol Signal Received!</p>
              </div>
              <button onClick={(e) => { e.preventDefault(); setNotifiedOrderId(null); }} className="p-1 hover:rotate-90 transition-transform">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-16 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-3 block">Command Terminal</span>
          <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter">
            {isOwner ? 'Overseer Console' : 'Establish Protocol'}
          </h2>
          <div className="mt-4 inline-block px-6 py-2 rounded-full border border-red-600/30 bg-red-600/10 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            <span className="text-[14px] font-black text-red-500 uppercase tracking-[0.4em] neon-glow-red">@fuadeditingzone</span>
            {isOwner && <span className="owner-badge ml-4 scale-90">OWNER</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* LEFT: ADMIN LOG (OWNER) OR FORM (USER) */}
          <div className="bg-[#080808]/95 border border-white/10 rounded-[3.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
            {isOwner ? (
                /* OWNER VIEW: ADMIN DASHBOARD */
                <div className="space-y-8">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4 mb-8">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                        Global Order Stream
                    </h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
                        {adminOrders.length === 0 ? (
                            <p className="text-gray-500 text-[10px] uppercase font-black text-center py-20 tracking-widest">No Signals Detected</p>
                        ) : (
                            adminOrders.map(order => (
                                <div key={order.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="min-w-0">
                                            <p className="text-[12px] font-black text-white uppercase tracking-widest truncate">{order.userName}</p>
                                            <p className="text-[9px] text-red-500 font-bold uppercase">@{order.service}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                            order.status === 'Pending' ? 'text-yellow-500 border-yellow-500/20' : 
                                            order.status === 'Accepted' ? 'text-blue-500 border-blue-500/20' :
                                            'text-red-500 border-red-500/20'
                                        }`}>{order.status}</div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium mb-6 line-clamp-2 leading-relaxed">"{order.message}"</p>
                                    
                                    {order.status === 'Pending' && (
                                        <div className="flex gap-2">
                                            <button 
                                              onClick={(e) => handleAdminAction(e, order, 'Accepted')} 
                                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-2 rounded-xl text-[9px] uppercase tracking-widest transition-all shadow-lg"
                                            >
                                              Accept Mission
                                            </button>
                                            <button 
                                              onClick={(e) => handleAdminAction(e, order, 'Rejected')} 
                                              className="flex-1 bg-red-600/10 hover:bg-red-600 text-white border border-red-600/20 font-black py-2 rounded-xl text-[9px] uppercase tracking-widest transition-all"
                                            >
                                              Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                /* USER VIEW: CLIENT ORDER FORM */
                !isSignedIn ? (
                    <div className="py-24 text-center space-y-10">
                        <SparklesIcon className="w-16 h-16 text-red-600 mx-auto opacity-40" />
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Access Token Required</h3>
                        <SignInButton mode="modal">
                            <button onClick={(e) => e.preventDefault()} className="bg-red-600 hover:bg-red-700 text-white font-black py-5 px-14 uppercase tracking-[0.5em] text-[11px] rounded-2xl transition-all shadow-xl">Verify Signature</button>
                        </SignInButton>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[9px] uppercase font-black text-gray-600 tracking-widest ml-1">Legend ID</label>
                                <input readOnly value={formData.name} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-gray-500 outline-none" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] uppercase font-black text-gray-600 tracking-widest ml-1">Neural Relay</label>
                                <input readOnly value={formData.email} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-gray-500 outline-none" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] uppercase font-black text-gray-600 tracking-widest ml-1">Objective Type</label>
                            <select required name="service" value={formData.service} onChange={e => setFormData(p => ({ ...p, service: e.target.value }))} className="w-full bg-black border border-blue-600/40 rounded-2xl px-6 py-5 text-sm text-white focus:border-red-600 outline-none transition-all shadow-lg">
                                <option value="" disabled>Select Mission...</option>
                                <option value="Cinematic VFX Mastery">Cinematic VFX Mastery</option>
                                <option value="High-CTR YouTube Thumbnail">High-CTR YouTube Thumbnail</option>
                                <option value="Elite Photo Manipulation">Elite Photo Manipulation</option>
                                <option value="Legendary AMV Edit">Legendary AMV Edit</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] uppercase font-black text-gray-600 tracking-widest ml-1">Mission Briefing</label>
                            <textarea required rows={4} value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} className="w-full bg-black border border-blue-600/40 rounded-2xl px-6 py-5 text-sm text-white focus:border-red-600 outline-none resize-none transition-all shadow-lg" placeholder="Enter your creative details..." />
                        </div>
                        <button 
                          type="submit" 
                          disabled={status === 'submitting' || hasPendingOrder} 
                          className={`w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.6em] transition-all flex items-center justify-center gap-4 ${
                            hasPendingOrder 
                              ? 'bg-yellow-600/10 text-yellow-500 cursor-not-allowed border border-yellow-500/20' 
                              : 'bg-red-600 hover:bg-red-700 text-white shadow-xl active:scale-95'
                          }`}
                        >
                            {status === 'submitting' ? <SparklesIcon className="w-5 h-5 animate-spin" /> : 
                             hasPendingOrder ? 'Signal In Progress' : 'Dispatch Mission'}
                        </button>
                        {hasPendingOrder && (
                          <p className="text-[9px] text-center text-yellow-500/60 uppercase font-black tracking-widest mt-4">
                            Waiting for overseer clearance. Please await completion.
                          </p>
                        )}
                    </form>
                )
            )}
          </div>

          {/* RIGHT: PERSONAL MISSION LOG */}
          <div className="space-y-8">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[3.5rem] p-10 min-h-[500px] shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-8">
                    <h3 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-4">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                        Mission History
                    </h3>
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{userOrders.length} Files</span>
                </div>
                <div className="space-y-6 max-h-[550px] overflow-y-auto pr-3 custom-scrollbar">
                    {userOrders.length === 0 ? (
                        <div className="py-24 text-center opacity-10 flex flex-col items-center gap-6">
                            <SparklesIcon className="w-20 h-20" />
                            <p className="text-[11px] uppercase font-black tracking-[0.8em]">No Signals Detected</p>
                        </div>
                    ) : (
                        userOrders.map((order) => (
                            <motion.div key={order.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className={`p-8 rounded-[2rem] border transition-all duration-700 ${order.status === 'Pending' ? 'bg-yellow-600/5 border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.1)]' : order.status === 'Accepted' ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_35px_rgba(37,99,235,0.15)] status-update' : order.status === 'Rejected' ? 'bg-red-600/10 border-red-500/30' : 'bg-green-600/5 border-green-500/20'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[14px] font-black text-white uppercase tracking-widest mb-1 truncate">{order.service}</p>
                                        <p className="text-[9px] text-gray-700 font-bold uppercase">{new Date(order.timestamp).toLocaleString()}</p>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex-shrink-0 ${order.status === 'Pending' ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10' : order.status === 'Accepted' ? 'text-blue-500 border-blue-500/40 bg-blue-500/20' : order.status === 'Rejected' ? 'text-red-500 border-red-500/30 bg-red-500/10' : 'text-green-500 border-green-500/30 bg-green-500/10'}`}>
                                        {order.status}
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic border-l-2 border-white/5 pl-4 line-clamp-3">"{order.message}"</p>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <button onClick={(e) => { e.preventDefault(); onStartOrder('whatsapp'); }} className="p-8 bg-green-600/10 border border-green-600/20 rounded-[3rem] text-center group hover:bg-green-600/20 transition-all shadow-xl active:scale-95">
                  <WhatsAppIcon className="w-8 h-8 text-green-500 mx-auto mb-4 transition-transform group-hover:-translate-y-2" />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Neural WhatsApp</p>
                </button>
                <button onClick={(e) => { e.preventDefault(); onStartOrder('email'); }} className="p-8 bg-red-600/10 border border-red-600/20 rounded-[3rem] text-center group hover:bg-red-600/20 transition-all shadow-xl active:scale-95">
                  <EmailIcon className="w-8 h-8 text-red-500 mx-auto mb-4 transition-transform group-hover:-translate-y-2" />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Official Comms</p>
                </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};