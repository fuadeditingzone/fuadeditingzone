
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { siteConfig } from '../config';
import { EmailIcon, WhatsAppIcon, CheckCircleIcon, SparklesIcon, ChevronRightIcon } from './Icons';

interface ContactProps {
    onStartOrder: (platform: 'whatsapp' | 'email') => void;
}

const SERVICE_TEMPLATES: Record<string, string> = {
    'VFX/Video Editing': "Hi Fuad Ahmed, I'm interested in a cinematic VFX/Video Editing project. I have footage that needs professional compositing and effects. Looking forward to your details!",
    'YouTube Thumbnail': "Hi Selected Legend, I need a high-CTR YouTube thumbnail for my upcoming video. I want it to be eye-catching and consistent with my brand. What are the next steps?",
    'Photo Manipulation': "Hello! I saw your Photo Manipulation work and it's incredible. I have a concept that needs your artistic touch to bring to life. Let's discuss the vision.",
    'Banner/Design': "Hey FEZ Zone, I'm looking for a professional Banner/Graphic Design project for my social media. Can you help me create something premium?",
    'Custom Request': "Hello Fuad, I have a specific custom project in mind that combines multiple services. I'd love to share the details with you and get a quote."
};

const ABUSIVE_WORDS = [
    'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'slut', 'whore', 'bastard', 'cunt', 'faggot', 'nigger', 'retard'
];

export const Contact: React.FC<ContactProps> = ({ onStartOrder }) => {
    const { isSignedIn, user } = useUser();
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        service: '',
        message: ''
    });

    // Auto-sync form data with Clerk user info when signed in
    useEffect(() => {
        if (isSignedIn && user) {
            setFormData(prev => ({
                ...prev,
                name: user.fullName || '',
                email: user.primaryEmailAddress?.emailAddress || ''
            }));
        }
    }, [isSignedIn, user]);

    const isAbusive = (text: string) => {
        const lowerText = text.toLowerCase();
        return ABUSIVE_WORDS.some(word => lowerText.includes(word));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isSignedIn) return;

        if (isAbusive(formData.message) || isAbusive(formData.name)) {
            setErrorMessage("Your message contains prohibited language. Please keep it professional.");
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
            return;
        }

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
                    _subject: `FEZ Order Request: ${formData.service || 'New Order'} from ${formData.name}`,
                    _source: "Fuad Editing Zone Portfolio Terminal",
                    userId: user?.id,
                    clerk_email: user?.primaryEmailAddress?.emailAddress
                })
            });

            if (response.ok) {
                setStatus('success');
                setFormData(prev => ({ ...prev, message: '', service: '' }));
            } else {
                throw new Error('Transmission Failed');
            }
        } catch (error) {
            console.error("Submission Error:", error);
            alert("Signal transmission failed. Please use the WhatsApp line for immediate project inquiries.");
            setStatus('idle');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'service') {
            setFormData(prev => ({ 
                ...prev, 
                service: value,
                message: value ? SERVICE_TEMPLATES[value] || prev.message : prev.message 
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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
                    <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter">Order Now</h2>
                    <div className="h-1 w-16 bg-red-600 mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
                </div>

                <div className="w-full bg-[#080808]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-14 shadow-[0_50px_100px_rgba(0,0,0,1)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none"></div>
                    
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
                                        <p className="text-gray-400 text-xs max-w-xs mx-auto font-medium">Please sign in to your account to transmit your project brief to the Zone.</p>
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
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Order Received</h3>
                                    <p className="text-gray-400 text-sm max-w-xs mx-auto mb-10 font-medium">Mission acknowledged, {user?.firstName}. Your request has been encrypted and sent. Fuad will contact you shortly.</p>
                                    <button 
                                        onClick={() => setStatus('idle')} 
                                        className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] hover:text-white transition-all"
                                    >
                                        Place Another Order
                                    </button>
                                </motion.div>
                            ) : (
                                <form id="contact-form" onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between ml-1">
                                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.3em]">Name</label>
                                                <span className="text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">Locked</span>
                                            </div>
                                            <input 
                                                required 
                                                name="name" 
                                                readOnly
                                                tabIndex={-1}
                                                value={formData.name} 
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-7 py-5 text-sm text-white outline-none cursor-not-allowed opacity-60 grayscale shadow-inner" 
                                                placeholder="Full Name" 
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between ml-1">
                                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.3em]">Email</label>
                                                <span className="text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">Locked</span>
                                            </div>
                                            <input 
                                                required 
                                                type="email" 
                                                name="email" 
                                                readOnly
                                                tabIndex={-1}
                                                value={formData.email} 
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-7 py-5 text-sm text-white outline-none cursor-not-allowed opacity-60 grayscale shadow-inner" 
                                                placeholder="email@address.com" 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.3em] ml-1">Select Service</label>
                                        <div className="relative group/select">
                                            <select 
                                                required
                                                name="service"
                                                value={formData.service}
                                                onChange={handleChange}
                                                className="w-full bg-black/60 border border-white/10 rounded-2xl px-7 py-5 text-sm text-white focus:border-red-600 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Choose a service category...</option>
                                                <option value="VFX/Video Editing">Cinematic VFX & Video Editing</option>
                                                <option value="YouTube Thumbnail">High-CTR YouTube Thumbnail</option>
                                                <option value="Photo Manipulation">Creative Photo Manipulation</option>
                                                <option value="Banner/Design">Banner & Social Media Design</option>
                                                <option value="Custom Request">Custom Visual Project</option>
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-red-600 group-hover/select:translate-x-1 transition-transform">
                                                <ChevronRightIcon className="w-4 h-4 rotate-90" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.3em] ml-1">Mission Details</label>
                                        <textarea 
                                            required 
                                            name="message" 
                                            rows={5} 
                                            value={formData.message} 
                                            onChange={handleChange} 
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-7 py-5 text-sm text-white focus:border-red-600 focus:bg-black outline-none resize-none transition-all placeholder:text-gray-800 shadow-inner" 
                                            placeholder="Describe your VFX or design requirements..."
                                        ></textarea>
                                    </div>

                                    {status === 'error' && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center bg-red-500/10 py-3 rounded-lg border border-red-500/20">
                                            {errorMessage}
                                        </motion.p>
                                    )}

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
                                                <span>Place Order</span>
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
