
import React, { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { siteConfig } from '../config';
import { EmailIcon, WhatsAppIcon, ChevronRightIcon, CheckCircleIcon, SparklesIcon } from './Icons';

interface ContactProps {
    onStartOrder: (platform: 'whatsapp' | 'email') => void;
}

export const Contact: React.FC<ContactProps> = ({ onStartOrder }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
    const [formState, setFormState] = useState<{
        status: 'idle' | 'submitting' | 'success' | 'error';
        message: string;
    }>({ status: 'idle', message: '' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const animationClass = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10';
    const email = siteConfig.branding.email;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormState({ status: 'submitting', message: '' });

        try {
            const response = await fetch('https://formspree.io/f/xvzovned', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setFormState({ status: 'success', message: 'Message sent successfully! I will get back to you soon.' });
                setFormData({ name: '', email: '', message: '' });
            } else {
                setFormState({ status: 'error', message: 'Oops! Something went wrong. Please try again.' });
            }
        } catch (error) {
            setFormState({ status: 'error', message: 'Network error. Please check your connection.' });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <section 
            ref={ref} 
            id="contact" 
            className="bg-transparent relative z-10 select-none overflow-visible"
        >
            <div className={`container mx-auto px-6 text-center transition-all duration-1000 ease-out ${animationClass} py-20 flex flex-col items-center`}>
                <div className="mb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Get In Touch</h2>
                    <p className="text-sm text-gray-400 max-w-md mx-auto font-light">Have a project in mind? Fill out the form below or use one of the quick contact methods.</p>
                </div>
                
                <div className="w-full max-w-2xl bg-[#0f0f0f]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 mb-12 shadow-2xl">
                    {formState.status === 'success' ? (
                        <div className="py-10 flex flex-col items-center animate-fade-in">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                                <CheckCircleIcon className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Success!</h3>
                            <p className="text-gray-400 text-sm mb-8">{formState.message}</p>
                            <button 
                                onClick={() => setFormState({ status: 'idle', message: '' })}
                                className="text-red-500 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-colors"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="text-left space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-red-600/50 transition-colors placeholder:text-gray-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                    <input 
                                        required
                                        type="email" 
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="your@email.com"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-red-600/50 transition-colors placeholder:text-gray-700"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Your Message</label>
                                <textarea 
                                    required
                                    id="message"
                                    name="message"
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Tell me about your project..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-red-600/50 transition-colors placeholder:text-gray-700 resize-none"
                                ></textarea>
                            </div>

                            {formState.status === 'error' && (
                                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{formState.message}</p>
                            )}

                            <button 
                                type="submit"
                                disabled={formState.status === 'submitting'}
                                className={`w-full btn-angular bg-red-600 hover:bg-red-700 text-white font-black py-5 px-8 flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.2)] active:scale-95 group ${formState.status === 'submitting' ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                <SparklesIcon className={`w-4 h-4 ${formState.status === 'submitting' ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
                                <span className="uppercase tracking-[0.3em] text-xs">
                                    {formState.status === 'submitting' ? 'Sending...' : 'Send Message'}
                                </span>
                            </button>
                        </form>
                    )}
                </div>

                <div className="w-full flex flex-col items-center">
                    <p className="text-[9px] text-gray-600 font-black tracking-[0.4em] uppercase mb-8">Quick Contact Channels</p>
                    
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
                        {/* WhatsApp Button */}
                        <button
                            onClick={() => onStartOrder('whatsapp')}
                            className="group flex items-center gap-3 btn-angular bg-green-600/5 border border-green-600/20 text-green-500 px-8 py-3.5 font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 hover:bg-green-600/10 w-full max-w-xs justify-center"
                        >
                            <WhatsAppIcon className="w-4 h-4" />
                            <span>WhatsApp Me</span>
                        </button>

                        <button
                            onClick={() => onStartOrder('email')}
                            className="group flex items-center gap-3 btn-angular bg-white/5 border border-white/10 text-gray-400 px-8 py-3.5 font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 hover:bg-white/10 hover:text-white w-full max-w-xs justify-center"
                        >
                            <EmailIcon className="w-4 h-4" />
                            <span>Direct Email</span>
                        </button>
                    </div>
                    
                    <div className="mt-6 flex flex-col items-center gap-1">
                        <p className="text-[8px] text-gray-700 font-mono tracking-tighter uppercase">
                            Official: {email}
                        </p>
                    </div>
                </div>

                {/* Social Media Section */}
                <div className="mt-20 pt-12 border-t border-white/5 w-full max-w-xl flex flex-col items-center">
                    <div className="mb-10 text-center">
                        <p className="text-[9px] text-gray-400 font-black tracking-[0.4em] uppercase mb-2">Social Network</p>
                        <div className="h-0.5 w-6 bg-red-600 mx-auto opacity-50"></div>
                    </div>
                    
                    <div className="flex justify-center items-center gap-8 md:gap-12">
                        {siteConfig.branding.socials.map(social => (
                            <a
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Follow Fuad on ${social.name}`}
                                className="group relative flex items-center justify-center p-2"
                            >
                                <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 rounded-full blur-2xl transition-all duration-500 scale-150"></div>
                                <social.icon className="text-2xl md:text-3xl text-white/90 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:text-red-500 group-hover:-translate-y-2 group-hover:scale-110 relative z-10" />
                                <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-30 translate-y-1 group-hover:translate-y-0 shadow-2xl border border-white/10">
                                    {social.name}
                                </span>
                            </a>
                        ))}
                    </div>

                    <div className="mt-16 flex items-center gap-4 text-gray-800">
                        <span className="h-px w-8 bg-current opacity-10"></span>
                        <span className="text-[8px] font-black uppercase tracking-[0.4em] whitespace-nowrap">FEZ • Selected Legend</span>
                        <span className="h-px w-8 bg-current opacity-10"></span>
                    </div>
                </div>
            </div>
        </section>
    );
};
