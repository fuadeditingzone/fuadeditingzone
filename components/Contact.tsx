
import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { siteConfig } from '../config';
import { EmailIcon, WhatsAppIcon, ChevronRightIcon } from './Icons';

interface ContactProps {
    onStartOrder: (platform: 'whatsapp' | 'email') => void;
}

export const Contact: React.FC<ContactProps> = ({ onStartOrder }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.3, triggerOnce: true });
    
    const animationClass = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10';
    const email = siteConfig.branding.email;
    const whatsapp = siteConfig.branding.whatsAppNumber;

    return (
        <section 
            ref={ref} 
            id="contact" 
            className="bg-transparent relative z-10 select-none"
        >
            <div className={`container mx-auto px-6 text-center transition-all duration-1000 ease-out ${animationClass} py-24`}>
                <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Order Now</h2>
                    <p className="text-sm text-gray-400 max-w-md mx-auto font-light">Have a project in mind? <br className="hidden md:block" />Select your services and let's get started.</p>
                </div>
                
                <div className="flex flex-col items-center gap-4">
                    {/* WhatsApp Button - On top as requested */}
                    <button
                        onClick={() => onStartOrder('whatsapp')}
                        className="group flex items-center gap-3 btn-angular btn-3d bg-green-600/10 border border-green-600/30 text-white px-10 py-4 font-bold text-sm transition-all duration-300 hover:bg-green-600/20 shadow-lg w-full max-w-xs justify-center"
                    >
                        <WhatsAppIcon className="w-5 h-5 text-green-500" />
                        <span>Contact via WhatsApp</span>
                        <ChevronRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>

                    <button
                        onClick={() => onStartOrder('email')}
                        className="group flex items-center gap-3 btn-angular btn-3d bg-white/5 border border-white/20 text-white px-10 py-4 font-bold text-sm transition-all duration-300 hover:bg-white/10 shadow-lg w-full max-w-xs justify-center"
                    >
                        <EmailIcon className="w-5 h-5 text-red-500" />
                        <span>Contact via Email</span>
                        <ChevronRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                    
                    <div className="mt-4 flex flex-col items-center gap-1">
                        <p className="text-[10px] text-gray-500 font-mono tracking-tight uppercase">
                            WA: +{whatsapp}
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono tracking-tight uppercase">
                            Direct: {email}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
