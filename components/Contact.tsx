import React, { useState, useEffect, useRef } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { EmailIcon, WhatsAppIcon, CheckCircleIcon, YouTubeIcon } from './Icons';

declare global {
  interface Window {
    Clerk: any;
  }
}

interface ContactProps {
    onStartOrder: (platform: 'whatsapp' | 'email') => void;
}

export const Contact: React.FC<ContactProps> = ({ onStartOrder }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
    const [isLoaded, setIsLoaded] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    useEffect(() => {
        const initClerk = async () => {
            const poll = setInterval(async () => {
                if (window.Clerk) {
                    clearInterval(poll);
                    try {
                        await window.Clerk.load({
                            appearance: {
                                baseTheme: 'dark',
                                variables: { colorPrimary: '#dc2626' }
                            }
                        });
                        
                        const currentUser = window.Clerk.user;
                        setUser(currentUser);
                        setIsLoaded(true);

                        if (currentUser) {
                            const userBtnDiv = document.getElementById('user-button');
                            if (userBtnDiv) window.Clerk.mountUserButton(userBtnDiv);
                        }
                    } catch (e) {
                        console.error(e);
                        setError("Login service is loading, please refresh.");
                        setIsLoaded(true);
                    }
                }
            }, 100);

            // Cleanup after 10 seconds if not loaded
            setTimeout(() => clearInterval(poll), 10000);
        };

        initClerk();
    }, []);

    const handleGoogleLogin = async () => {
        if (!window.Clerk) return;
        await window.Clerk.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl: window.location.href,
            redirectUrlComplete: window.location.href
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');
        const form = e.currentTarget;
        const data = new FormData(form);
        
        try {
            const response = await fetch('https://formspree.io/f/xvzovned', {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) setStatus('success');
            else throw new Error();
        } catch (err) {
            alert("Transmission failed. Please try WhatsApp.");
            setStatus('idle');
        }
    };

    return (
        <section ref={ref} id="contact" className="py-24 bg-black relative">
            <div className={`container mx-auto px-6 max-w-4xl transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter neon-text">Secure Terminal</h2>
                    <p className="text-gray-500 mt-4 uppercase tracking-[0.3em] text-xs">Fuad Editing Zone • Inquiry Portal</p>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden neon-border">
                    {/* Visual Decor */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl pointer-events-none"></div>

                    {!isLoaded ? (
                        <div className="py-20 flex flex-col items-center">
                            <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Establishing Secure Layer...</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center">
                            <p className="text-red-500 font-bold mb-4">{error}</p>
                            <button onClick={() => window.location.reload()} className="text-xs uppercase tracking-widest text-white border border-white/20 px-6 py-2 rounded-full hover:bg-white/5">Manual Sync</button>
                        </div>
                    ) : user ? (
                        /* SIGNED IN STATE - SHOW FORMSPREE */
                        <div className="fade-in">
                            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                                <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center border border-red-600/30">
                                    <CheckCircleIcon className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Authenticated</p>
                                    <p className="text-sm text-white font-bold">{user.primaryEmailAddress.emailAddress}</p>
                                </div>
                            </div>

                            {status === 'success' ? (
                                <div className="py-12 text-center">
                                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" />
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Transmission Complete</h3>
                                    <p className="text-gray-400 mt-2">Fuad will review your request shortly.</p>
                                </div>
                            ) : (
                                <form id="contact-form" onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Name</label>
                                            <input required name="name" defaultValue={user.fullName} className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-red-600 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Email</label>
                                            <input required type="email" name="email" defaultValue={user.primaryEmailAddress.emailAddress} className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-red-600 outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Requirements</label>
                                        <textarea required name="message" rows={5} className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-red-600 outline-none resize-none transition-all" placeholder="Describe your VFX or design project..."></textarea>
                                    </div>
                                    <button type="submit" disabled={status === 'submitting'} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-xl uppercase tracking-[0.4em] text-xs transition-all shadow-lg shadow-red-600/20 active:scale-95">
                                        {status === 'submitting' ? 'Encrypting...' : 'Transmit Inquiry'}
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                        /* SIGNED OUT STATE - SHOW LOGIN */
                        <div className="fade-in py-12 text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10">
                                <YouTubeIcon className="w-10 h-10 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Identity Verification</h3>
                            <p className="text-gray-400 text-xs max-w-xs mx-auto mb-10 leading-relaxed uppercase tracking-widest">Please sign in to access the direct creative terminal.</p>
                            
                            <button 
                                onClick={handleGoogleLogin}
                                className="inline-flex items-center gap-4 bg-white text-black font-black px-10 py-5 rounded-full hover:scale-105 transition-all uppercase tracking-widest text-xs shadow-xl"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                Continue with Google
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
                    <button onClick={() => onStartOrder('whatsapp')} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-green-500 hover:underline">
                        <WhatsAppIcon className="w-4 h-4" /> Direct WhatsApp
                    </button>
                    <div className="w-1.5 h-1.5 bg-white/20 rounded-full hidden md:block"></div>
                    <button onClick={() => onStartOrder('email')} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:underline">
                        <EmailIcon className="w-4 h-4" /> Professional Mail
                    </button>
                </div>
            </div>
        </section>
    );
};