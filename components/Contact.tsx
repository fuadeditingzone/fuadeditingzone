import React, { useState, useEffect, useRef } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { EmailIcon, WhatsAppIcon, CheckCircleIcon, YouTubeIcon, UserCircleIcon, CloseIcon } from './Icons';

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
    const authContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initClerk = async () => {
            const poll = setInterval(async () => {
                if (window.Clerk) {
                    clearInterval(poll);
                    try {
                        // Standard load pattern for Vanilla SDK
                        await window.Clerk.load({
                            appearance: {
                                baseTheme: 'dark',
                                variables: { 
                                    colorPrimary: '#dc2626',
                                    colorBackground: '#0a0a0a',
                                    colorText: '#ffffff'
                                }
                            }
                        });
                        
                        const currentUser = window.Clerk.user;
                        setUser(currentUser);
                        setIsLoaded(true);

                        if (currentUser) {
                            const userBtnDiv = document.getElementById('user-button');
                            if (userBtnDiv) window.Clerk.mountUserButton(userBtnDiv);
                        } else {
                            // If not logged in, mount the SignIn component into the container
                            // This handles the Google button and flow far more reliably
                            if (authContainerRef.current) {
                                window.Clerk.mountSignIn(authContainerRef.current);
                            }
                        }
                    } catch (e) {
                        console.error("Clerk Load Error:", e);
                        setError("Login service synchronization delayed. Please refresh.");
                        setIsLoaded(true);
                    }
                }
            }, 100);

            setTimeout(() => {
                clearInterval(poll);
                if (!window.Clerk) {
                    setError("Clerk SDK timed out. Check your connection.");
                    setIsLoaded(true);
                }
            }, 10000);
        };

        initClerk();
    }, []);

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
            <div className={`container mx-auto px-6 max-w-4xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter neon-text">Secure Terminal</h2>
                    <p className="text-gray-500 mt-4 uppercase tracking-[0.3em] text-xs">Fuad Editing Zone • Inquiry Portal</p>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden neon-border">
                    {/* Visual Decor */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl pointer-events-none"></div>

                    {!isLoaded ? (
                        <div className="py-24 flex flex-col items-center">
                            <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.5em] animate-pulse">Establishing Secure Layer...</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center fade-in">
                            <CloseIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold mb-6 text-sm uppercase tracking-widest">{error}</p>
                            <button onClick={() => window.location.reload()} className="text-[10px] font-black uppercase tracking-[0.3em] text-white border border-white/20 px-8 py-3 rounded-full hover:bg-white/5 transition-all">Manual Sync</button>
                        </div>
                    ) : user ? (
                        /* SIGNED IN STATE - SHOW FORMSPREE */
                        <div className="fade-in">
                            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                                <div className="w-12 h-12 bg-red-600/20 rounded-2xl flex items-center justify-center border border-red-600/30">
                                    <CheckCircleIcon className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Authenticated Creator</p>
                                    <p className="text-sm text-white font-bold">{user.primaryEmailAddress.emailAddress}</p>
                                </div>
                            </div>

                            {status === 'success' ? (
                                <div className="py-16 text-center">
                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                                        <CheckCircleIcon className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Transmission Successful</h3>
                                    <p className="text-gray-400 mt-2 text-sm">Fuad has received your signal and will respond shortly.</p>
                                    <button onClick={() => setStatus('idle')} className="mt-8 text-red-600 font-black text-[10px] uppercase tracking-[0.4em] hover:underline">Compose New Message</button>
                                </div>
                            ) : (
                                <form id="contact-form" onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Creator Identity</label>
                                            <input required name="name" defaultValue={user.fullName} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-sm focus:border-red-600 outline-none transition-all placeholder:text-gray-700" placeholder="Your Name" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Secure Email</label>
                                            <input required type="email" name="email" defaultValue={user.primaryEmailAddress.emailAddress} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-sm focus:border-red-600 outline-none transition-all placeholder:text-gray-700" placeholder="email@address.com" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Project Brief / Transmission</label>
                                        <textarea required name="message" rows={6} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-sm focus:border-red-600 outline-none resize-none transition-all placeholder:text-gray-700" placeholder="Describe your VFX or design requirements in detail..."></textarea>
                                    </div>
                                    <button type="submit" disabled={status === 'submitting'} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-2xl uppercase tracking-[0.5em] text-xs transition-all shadow-xl shadow-red-600/20 active:scale-[0.98]">
                                        {status === 'submitting' ? 'Encrypting Signal...' : 'Transmit Inquiry'}
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                        /* SIGNED OUT STATE - SHOW EMBEDDED CLERK SIGNIN */
                        <div className="fade-in py-10 flex flex-col items-center">
                            <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-10 border border-white/10 rotate-3 shadow-2xl">
                                <UserCircleIcon className="w-12 h-12 text-gray-600" />
                            </div>
                            <div className="text-center mb-10">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3">Identity Required</h3>
                                <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed tracking-widest">Sign in via Google to access the professional creative terminal.</p>
                            </div>
                            
                            {/* Mount Point for the Official Clerk SignIn flow */}
                            <div ref={authContainerRef} className="w-full min-h-[400px] flex justify-center"></div>
                        </div>
                    )}
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