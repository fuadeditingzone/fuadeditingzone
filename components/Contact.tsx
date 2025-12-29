import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { siteConfig } from '../config';
import { EmailIcon, WhatsAppIcon, ChevronRightIcon } from './Icons';

interface ContactProps {
    onStartOrder: (platform: 'whatsapp' | 'email') => void;
}

export const Contact: React.FC<ContactProps> = ({ onStartOrder }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
    
    const animationClass = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10';
    const email = siteConfig.branding.email;

    return (
        <section 
            ref={ref} 
            id="contact" 
            className="bg-transparent relative z-10 select-none overflow-visible"
        >
            <div className={`container mx-auto px-6 text-center transition-all duration-1000 ease-out ${animationClass} py-20 flex flex-col items-center`}>
                <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Order Now</h2>
                    <p className="text-sm text-gray-400 max-w-md mx-auto font-light">Have a project in mind? <br className="hidden md:block" />Select your services and let's get started.</p>
                </div>
                
                <div className="flex flex-col items-center gap-4 w-full">
                    {/* WhatsApp Button */}
                    <button
                        onClick={() => onStartOrder('whatsapp')}
                        className="group flex items-center gap-3 btn-angular btn-3d bg-green-600/10 border border-green-600/30 text-white px-10 py-4 font-bold text-sm transition-all duration-300 hover:bg-green-600/20 shadow-lg w-full max-w-xs justify-center"
                    >
                        <WhatsAppIcon className="w-5 h-5 text-green-500" />
                        <span>Add to cart</span>
                        <ChevronRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>

                    <button
                        onClick={() => onStartOrder('email')}
                        className="group flex items-center gap-3 btn-angular btn-3d bg-white/5 border border-white/20 text-white px-10 py-4 font-bold text-sm transition-all duration-300 hover:bg-white/10 shadow-lg w-full max-w-xs justify-center"
                    >
                        <EmailIcon className="w-5 h-5 text-red-500" />
                        <span>Add to cart</span>
                        <ChevronRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                    
                    <div className="mt-4 flex flex-col items-center gap-1">
                        <p className="text-[10px] text-gray-500 font-mono tracking-tight uppercase">
                            Direct Inquiry: {email}
                        </p>
                    </div>
                </div>

                {/* Social Media Section - Minimalist Style with No Background */}
                <div className="mt-16 pt-12 border-t border-white/5 w-full max-w-xl flex flex-col items-center">
                    <div className="mb-8 text-center">
                        <p className="text-[9px] text-gray-500 font-black tracking-[0.4em] uppercase mb-2 opacity-50">Find me on social media</p>
                    </div>
                    
                    <div className="flex justify-center items-center gap-8 md:gap-10">
                        {siteConfig.branding.socials.map(social => (
                            <a
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Follow Fuad on ${social.name}`}
                                className="group relative flex items-center justify-center p-2"
                            >
                                {/* Subtle Hover Aura */}
                                <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/5 rounded-full blur-xl transition-all duration-500 scale-125"></div>
                                
                                {/* Small Simple Icon */}
                                <social.icon className="text-xl md:text-2xl text-gray-400 transition-all duration-300 group-hover:text-red-600 group-hover:-translate-y-1 relative z-10" />
                                
                                {/* Tooltip Label */}
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black uppercase tracking-widest py-1 px-2.5 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-30 translate-y-1 group-hover:translate-y-0 shadow-xl">
                                    {social.name}
                                </span>
                            </a>
                        ))}
                    </div>

                    <div className="mt-12 flex items-center gap-4 text-gray-800">
                        <span className="h-px w-6 bg-current opacity-10"></span>
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] whitespace-nowrap">FEZ • Selected Legend</span>
                        <span className="h-px w-6 bg-current opacity-10"></span>
                    </div>
                </div>
            </div>
        </section>
    );
};