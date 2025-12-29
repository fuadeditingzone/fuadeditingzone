import React, { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { EmailIcon, WhatsAppIcon, CheckCircleIcon, SparklesIcon, UserCircleIcon } from './Icons';
import { auth, googleProvider } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';

interface ContactProps {
    onStartOrder: (platform: 'whatsapp' | 'email') => void;
}

export const Contact: React.FC<ContactProps> = ({ onStartOrder }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setFormData(prev => ({
                    ...prev,
                    name: currentUser.displayName || '',
                    email: currentUser.email || ''
                }));
            }
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed:", error);
            alert("Secure authentication failed. Check your connection.");
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            alert("Please sign in to transmit your inquiry.");
            return;
        }
        
        setStatus('submitting');
        
        try {
            const response = await fetch('https://formspree.io/f/xvzovned', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatus('success');
                setFormData(prev => ({ ...prev, message: '' }));
            } else {
                throw new Error('Signal lost');
            }
        } catch (error) {
            alert("Transmission failed. Please try WhatsApp.");
            setStatus('idle');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const animationClass = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10';

    return (
        <section ref={ref} id="contact" className="py-24 bg-black relative z-10 select-none overflow-visible">
            <div className={`container mx-auto px-6 max-w-4xl transition-all duration-1000 ease-out ${animationClass} flex flex-col items-center`}>
                
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter neon-text">Secure Terminal</h2>
                    <p className="text-gray-500 mt-4 uppercase tracking-[0.3em] text-xs">Fuad Editing Zone • Authenticated Inquiry Portal</p>
                </div>

                <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden neon-border">
                    {/* Atmospheric Red Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] pointer-events-none"></div>

                    <div className="animate-fade-in">
                        {loadingAuth ? (
                            <div className="py-20 flex flex-col items-center">
                                <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">Syncing Encrypted Layer...</p>
                            </div>
                        ) : !user ? (
                            /* LOGIN PROMPT */
                            <div className="py-12 text-center flex flex-col items-center">
                                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 border border-white/10">
                                    <UserCircleIcon className="w-10 h-10 text-gray-600" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Authentication Required</h3>
                                <p className="text-gray-400 text-xs max-w-xs mx-auto mb-10 leading-relaxed uppercase tracking-widest">Sign in via Google to verify your identity and access the secure transmission line.</p>
                                
                                <button 
                                    onClick={handleLogin}
                                    className="flex items-center gap-4 bg-white text-black font-black px-10 py-5 rounded-full hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-[10px] shadow-xl group"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                    Continue with Google
                                </button>
                            </div>
                        ) : status === 'success' ? (
                            /* SUCCESS STATE */
                            <div className="py-16 text-center">
                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                                    <CheckCircleIcon className="w-10 h-10 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Transmission Successful</h3>
                                <p className="text-gray-400 mt-2 text-sm">Fuad has received your signal and will respond shortly.</p>
                                <div className="flex flex-col items-center gap-4 mt-10">
                                    <button onClick={() => setStatus('idle')} className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] hover:underline">Compose New Message</button>
                                    <button onClick={handleLogout} className="text-gray-600 font-bold text-[8px] uppercase tracking-widest hover:text-white transition-colors">Sign Out Interface</button>
                                </div>
                            </div>
                        ) : (
                            /* FORM STATE */
                            <div className="space-y-10">
                                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                    <div className="flex items-center gap-4">
                                        <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Signed In As</p>
                                            <p className="text-white font-bold text-sm leading-none mt-1">{user.displayName || user.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={handleLogout} className="text-[9px] font-black text-gray-500 hover:text-red-600 uppercase tracking-widest transition-colors">Sign Out</button>
                                </div>

                                <form id="contact-form" onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Identity</label>
                                            <input 
                                                required 
                                                name="name" 
                                                value={formData.name} 
                                                onChange={handleChange} 
                                                className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-red-600 outline-none transition-all placeholder:text-gray-800" 
                                                placeholder="Your Name" 
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Secure Email</label>
                                            <input 
                                                required 
                                                type="email" 
                                                name="email" 
                                                value={formData.email} 
                                                onChange={handleChange} 
                                                className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-red-600 outline-none transition-all placeholder:text-gray-800" 
                                                placeholder="email@address.com" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Project Brief / Transmission</label>
                                        <textarea 
                                            required 
                                            name="message" 
                                            rows={6} 
                                            value={formData.message} 
                                            onChange={handleChange} 
                                            className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-red-600 outline-none resize-none transition-all placeholder:text-gray-800" 
                                            placeholder="Describe your VFX or design requirements in detail..."
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={status === 'submitting'} 
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-2xl uppercase tracking-[0.5em] text-xs transition-all shadow-xl shadow-red-600/20 active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        <SparklesIcon className={status === 'submitting' ? 'animate-spin' : ''} />
                                        {status === 'submitting' ? 'Encrypting Signal...' : 'Transmit Inquiry'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8 opacity-40 hover:opacity-100 transition-opacity duration-500">
                    <button onClick={() => onStartOrder('whatsapp')} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-green-500 hover:text-green-400">
                        <WhatsAppIcon className="w-4 h-4" /> Reach WhatsApp
                    </button>
                    <div className="w-1.5 h-1.5 bg-white/20 rounded-full hidden md:block"></div>
                    <button onClick={() => onStartOrder('email')} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-white">
                        <EmailIcon className="w-4 h-4" /> Professional Mail
                    </button>
                </div>
            </div>
        </section>
    );
};