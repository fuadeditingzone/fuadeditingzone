
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { siteConfig } from '../config';
import { EmailIcon, WhatsAppIcon, CheckCircleIcon, SparklesIcon } from './Icons';

interface ContactProps {
    onStartOrder: (platform: 'whatsapp' | 'email') => void;
}

export const Contact: React.FC<ContactProps> = ({ onStartOrder }) => {
    const { isSignedIn, user } = useUser();
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
    const [formData, setFormData] = useState({
        name: user?.fullName || '',
        email: user?.primaryEmailAddress?.emailAddress || '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isSignedIn) return;

        setStatus('submitting');
        
        try {
            const response = await fetch(siteConfig.api.formspreeEndpoint, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' 
                },
                body: JSON.stringify({
                    ...formData,
                    _subject: `FEZ Mission Brief: ${formData.name}`,
                    _source: "Fuad Editing Zone Portfolio Terminal",
                    userId: user?.id,
                    clerk_email: user?.primaryEmailAddress?.emailAddress
                })
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: user?.fullName || '', email: user?.primaryEmailAddress?.emailAddress || '', message: '' });
            } else {
                throw new Error('Transmission Failed');
            }
        } catch (error) {
            console.error("Submission Error:", error);
            alert("Signal transmission failed. Please use the WhatsApp line for immediate project inquiries.");
            setStatus('idle');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <section ref={ref} id="contact" className="py-24 bg-black relative z-10 select-none overflow-hidden">
            {/* Atmospheric VFX Visuals */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-red-600/5 blur-[120px] pointer-events-none rounded-full"></div>
            <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-red-900/5 blur-[150px] pointer-events-none rounded-full"></div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                className="container mx-auto px-6 max-w-4xl flex flex-col items-center"
            >
                {/* Minimalist Section Header */}
                <div className="mb-12 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-3 block">Transmission Port</span>
                    <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter">Start Your Mission</h2>
                    <div className="h-1 w-16 bg-red-600 mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
                </div>

                <div className="w-full bg-[#080808]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-14 shadow-[0_50px_100px_rgba(0,0,0,1)] relative overflow-hidden group">
                    {/* Inner Decorative Elements */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-1/2 h-px bg-gradient-to-l from-red-600/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-1/2 h-px bg-gradient-to-r from-red-600/50 to-transparent"></div>

                    <div className="relative z-10">
                        <AnimatePresence mode="wait">
                            {!isSignedIn ? (
                                <motion.div 
                                    key="auth-required"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="py-16 text-center space-y-8"
                                >
                                    <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto border border-red-600/20">
                                        <SparklesIcon className="w-10 h-10 text-red-600" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Identity Required</h3>
                                        <p className="text-gray-400 text-xs max-w-xs mx-auto font-medium">Please sign in with your email or phone number to transmit your project brief to the Zone.</p>
                                    </div>
                                    <SignInButton mode="modal">
                                        <button className="btn-angular bg-red-600 hover:bg-red-700 text-white font-black py-4 px-12 uppercase tracking-[0.4em] text-[11px] transition-all shadow-[0_15px_30px_rgba(220,38,38,0.3)]">
                                            Authenticate Now
                                        </button>
                                    </SignInButton>
                                </motion.div>
                            ) : status === 'success' ? (
                                <motion.div 
                                    key="success-state"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-16 text-center"
                                >
                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.15)]">
                                        <CheckCircleIcon className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Signal Received</h3>
                                    <p className="text-gray-400 text-sm max-w-xs mx-auto mb-10 font-medium">Mission acknowledged, {user?.firstName}. Your brief has been encrypted and sent. Fuad will contact you shortly.</p>
                                    <button 
                                        onClick={() => setStatus('idle')} 
                                        className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] hover:text-white transition-all"
                                    >
                                        Transmit New Data
                                    </button>
                                </motion.div>
                            ) : (
                                <form id="contact-form" onSubmit={handleSubmit} className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.3em] ml-1">Identity Tag</label>
                                            <input 
                                                required 
                                                name="name" 
                                                value={formData.name} 
                                                onChange={handleChange} 
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-7 py-5 text-sm text-white focus:border-red-600 focus:bg-black outline-none transition-all placeholder:text-gray-800 shadow-inner" 
                                                placeholder="Full Name" 
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.3em] ml-1">Return Frequency</label>
                                            <input 
                                                required 
                                                type="email" 
                                                name="email" 
                                                value={formData.email} 
                                                onChange={handleChange} 
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-7 py-5 text-sm text-white focus:border-red-600 focus:bg-black outline-none transition-all placeholder:text-gray-800 shadow-inner" 
                                                placeholder="email@address.com" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.3em] ml-1">Mission Details</label>
                                        <textarea 
                                            required 
                                            name="message" 
                                            rows={6} 
                                            value={formData.message} 
                                            onChange={handleChange} 
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-7 py-5 text-sm text-white focus:border-red-600 focus:bg-black outline-none resize-none transition-all placeholder:text-gray-800 shadow-inner" 
                                            placeholder="Describe your VFX or design requirements..."
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={status === 'submitting'} 
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl uppercase tracking-[0.5em] text-[11px] transition-all shadow-[0_20px_40px_rgba(220,38,38,0.3)] active:scale-[0.98] flex items-center justify-center gap-4 group"
                                    >
                                        {status === 'submitting' ? (
                                            <>
                                                <SparklesIcon className="w-5 h-5 animate-spin" />
                                                <span>Transmitting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-500" />
                                                <span>Transmit Brief</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Direct Connect Options */}
                <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-10 opacity-60 hover:opacity-100 transition-opacity duration-700">
                    <button onClick={() => onStartOrder('whatsapp')} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-green-500 hover:text-green-400 transition-colors group">
                        <WhatsAppIcon className="w-5 h-5 transition-transform group-hover:-translate-y-1" /> WhatsApp Line
                    </button>
                    <div className="w-1.5 h-1.5 bg-white/20 rounded-full hidden md:block"></div>
                    <button onClick={() => onStartOrder('email')} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-white transition-colors group">
                        <EmailIcon className="w-5 h-5 transition-transform group-hover:-translate-y-1" /> Direct Mail
                    </button>
                </div>
            </motion.div>
        </section>
    );
};
