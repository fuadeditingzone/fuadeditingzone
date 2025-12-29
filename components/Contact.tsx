
import React, { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { siteConfig } from '../config';
import { EmailIcon, WhatsAppIcon, CheckCircleIcon, SparklesIcon } from './Icons';

interface ContactProps {
    onStartOrder: (platform: 'whatsapp' | 'email') => void;
}

export const Contact: React.FC<ContactProps> = ({ onStartOrder }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');
        
        try {
            const response = await fetch(siteConfig.api.formspreeEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    _subject: `New Project Inquiry from ${formData.name}`,
                    _source: "FEZ Portfolio Site"
                })
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error("Formspree Error:", error);
            alert("Transmission failed. Please use WhatsApp or Email for direct contact.");
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
                
                {/* Minimalist Section Label */}
                <div className="mb-10 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600">Get in Touch</span>
                    <h2 className="text-white text-xl font-bold uppercase mt-2 tracking-tight">Project Inquiry</h2>
                </div>

                <div className="w-full bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden neon-border">
                    {/* Atmospheric VFX elements */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 blur-[120px] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>

                    <div className="animate-fade-in relative z-10">
                        {status === 'success' ? (
                            <div className="py-20 text-center">
                                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
                                    <CheckCircleIcon className="w-12 h-12 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Message Sent</h3>
                                <p className="text-gray-400 text-xs max-w-xs mx-auto mb-12">Your inquiry has been successfully transmitted. Fuad Ahmed will review your brief and respond shortly.</p>
                                <button 
                                    onClick={() => setStatus('idle')} 
                                    className="text-red-600 font-bold text-[10px] uppercase tracking-[0.3em] hover:text-white transition-colors"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                <form id="contact-form" onSubmit={handleSubmit} className="space-y-8 text-left">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Your Name</label>
                                            <input 
                                                required 
                                                name="name" 
                                                value={formData.name} 
                                                onChange={handleChange} 
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-sm text-white focus:border-red-600 outline-none transition-all placeholder:text-gray-800" 
                                                placeholder="John Doe" 
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Email Address</label>
                                            <input 
                                                required 
                                                type="email" 
                                                name="email" 
                                                value={formData.email} 
                                                onChange={handleChange} 
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-sm text-white focus:border-red-600 outline-none transition-all placeholder:text-gray-800" 
                                                placeholder="john@example.com" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Project Details</label>
                                        <textarea 
                                            required 
                                            name="message" 
                                            rows={5} 
                                            value={formData.message} 
                                            onChange={handleChange} 
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-sm text-white focus:border-red-600 outline-none resize-none transition-all placeholder:text-gray-800" 
                                            placeholder="Tell me about your project, VFX needs, or graphic design requirements..."
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={status === 'submitting'} 
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-[11px] transition-all shadow-[0_10px_25px_rgba(220,38,38,0.2)] active:scale-[0.98] flex items-center justify-center gap-3 group"
                                    >
                                        <SparklesIcon className={`w-4 h-4 ${status === 'submitting' ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform text-white`} />
                                        {status === 'submitting' ? 'Transmitting...' : 'Send Message'}
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
                        <EmailIcon className="w-5 h-5 transition-transform group-hover:-translate-y-1" /> Direct Mail
                    </button>
                </div>
            </div>
        </section>
    );
};
