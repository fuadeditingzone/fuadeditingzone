import React, { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { EmailIcon, WhatsAppIcon, CheckCircleIcon, SparklesIcon, UserCircleIcon, CloseIcon } from './Icons';
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
            console.error("Auth Error:", error);
            alert("Secure authentication signal lost. Please check your connection.");
        }
    };

    const handleLogout = async () => {
        if (confirm("Sign out of the secure terminal?")) {
            try {
                await signOut(auth);
            } catch (error) {
                console.error("Logout Error:", error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;
        
        setStatus('submitting');
        
        try {
            const response = await fetch('https://formspree.io/f/xvzovned', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    firebase_uid: user.uid,
                    auth_provider: 'google'
                })
            });

            if (response.ok) {
                setStatus('success');
                setFormData(prev => ({ ...prev, message: '' }));
            } else {
                throw new Error('Signal lost');
            }
        } catch (error) {
            alert("Transmission failed. Please use the WhatsApp direct link below.");
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
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter neon-text">Inquiry Terminal</h2>
                    <p className="text-gray-500 mt-4 uppercase tracking-[0.3em] text-xs">Fuad Editing Zone • Secure Access Point</p>
                </div>

                <div className="w-full bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden neon-border">
                    {/* Background Visual: Subtle Grid & Glow */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 blur-[120px] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>

                    <div className="animate-fade-in relative z-10">
                        {loadingAuth ? (
                            <div className="py-24 flex flex-col items-center">
                                <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-[0.5em] animate-pulse">Syncing Encrypted Identity...</p>
                            </div>
                        ) : !user ? (
                            /* LOGGED OUT: TERMINAL LOCKED */
                            <div className="py-12 text-center flex flex-col items-center">
                                <div className="w-24 h-24 bg-red-600/10 rounded-[2.5rem] flex items-center justify-center mb-10 border border-red-600/20 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                                    <UserCircleIcon className="w-12 h-12 text-red-600" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-4">Identity Verification Required</h3>
                                <p className="text-gray-400 text-[10px] md:text-xs max-w-sm mx-auto mb-12 leading-relaxed uppercase tracking-[0.2em]">Please sign in with Google to access the professional inquiry portal and prevent spam transmissions.</p>
                                
                                <button 
                                    onClick={handleLogin}
                                    className="flex items-center gap-4 bg-white text-black font-black px-12 py-5 rounded-full hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] text-[11px] shadow-[0_0_40px_rgba(255,255,255,0.2)] group"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                    Verify with Google
                                </button>
                                
                                <div className="mt-12 pt-12 border-t border-white/5 w-full flex justify-center">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-red-600/5 rounded-full border border-red-600/10">
                                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                                        <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest">Awaiting Authenticated Signal</span>
                                    </div>
                                </div>
                            </div>
                        ) : status === 'success' ? (
                            /* SUCCESS STATE */
                            <div className="py-20 text-center animate-fade-in">
                                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
                                    <CheckCircleIcon className="w-12 h-12 text-green-500" />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Signal Received</h3>
                                <p className="text-gray-400 text-sm max-w-xs mx-auto mb-12">Your mission brief has been encrypted and transmitted. Fuad Ahmed will review the details shortly.</p>
                                <div className="flex flex-col items-center gap-5">
                                    <button onClick={() => setStatus('idle')} className="text-red-600 font-black text-[11px] uppercase tracking-[0.4em] hover:text-white transition-colors">Compose New Brief</button>
                                    <button onClick={handleLogout} className="text-gray-700 font-bold text-[9px] uppercase tracking-widest hover:text-gray-400">Exit Interface</button>
                                </div>
                            </div>
                        ) : (
                            /* LOGGED IN: TERMINAL UNLOCKED */
                            <div className="space-y-12">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-10">
                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <img src={user.photoURL || ''} alt="" className="w-14 h-14 rounded-2xl border border-white/20 shadow-xl" />
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-black"></div>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Authenticated Client</p>
                                            <h4 className="text-lg text-white font-bold leading-none">{user.displayName || 'Creator'}</h4>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleLogout} 
                                        className="text-[10px] font-black text-gray-600 hover:text-red-600 uppercase tracking-widest transition-all px-6 py-3 rounded-xl border border-white/5 hover:border-red-600/30 bg-white/5"
                                    >
                                        Exit Terminal
                                    </button>
                                </div>

                                <form id="contact-form" onSubmit={handleSubmit} className="space-y-10 text-left">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase font-black text-gray-600 tracking-[0.3em] ml-1">Identity Tag</label>
                                            <input 
                                                required 
                                                name="name" 
                                                value={formData.name} 
                                                onChange={handleChange} 
                                                className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-red-600 outline-none transition-all placeholder:text-gray-800" 
                                                placeholder="Your Name" 
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase font-black text-gray-600 tracking-[0.3em] ml-1">Return Frequency</label>
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
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase font-black text-gray-600 tracking-[0.3em] ml-1">Project Specification</label>
                                        <textarea 
                                            required 
                                            name="message" 
                                            rows={6} 
                                            value={formData.message} 
                                            onChange={handleChange} 
                                            className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-red-600 outline-none resize-none transition-all placeholder:text-gray-800" 
                                            placeholder="Describe your VFX or graphic design requirements in professional detail..."
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={status === 'submitting'} 
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-7 rounded-2xl uppercase tracking-[0.6em] text-[11px] transition-all shadow-[0_20px_40px_rgba(220,38,38,0.2)] active:scale-[0.98] flex items-center justify-center gap-4 group"
                                    >
                                        <SparklesIcon className={`${status === 'submitting' ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform`} />
                                        {status === 'submitting' ? 'Encrypting Signal...' : 'Transmit Inquiry'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Secondary Actions */}
                <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-10 opacity-50 hover:opacity-100 transition-opacity duration-700">
                    <button onClick={() => onStartOrder('whatsapp')} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-green-500 hover:text-green-400 group">
                        <WhatsAppIcon className="w-5 h-5 transition-transform group-hover:-translate-y-1" /> WhatsApp Line
                    </button>
                    <div className="w-1.5 h-1.5 bg-white/20 rounded-full hidden md:block"></div>
                    <button onClick={() => onStartOrder('email')} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-white group">
                        <EmailIcon className="w-5 h-5 transition-transform group-hover:-translate-y-1" /> Professional Mail
                    </button>
                </div>
            </div>
        </section>
    );
};
