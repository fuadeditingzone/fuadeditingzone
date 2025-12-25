import React from 'react';
import { siteConfig } from '../config';
import { InteractiveCard } from './InteractiveCard';
import { CheckCircleIcon } from './Icons';

export const IntroCard = () => {
    const { introCard } = siteConfig.content;
    const { branding } = siteConfig;
    const proSkills = ['VFX Mastery', 'Graphic Design', 'YouTube Thumbnail', 'Photo Manipulation', 'Banner Designs', 'Social Media Post', 'AMV EDIT'];

    // Sort skills to ensure PRO tags come first
    const sortedAboutSkills = [...introCard.skills].sort((a, b) => {
        const aIsPro = proSkills.includes(a);
        const bIsPro = proSkills.includes(b);
        if (aIsPro && !bIsPro) return -1;
        if (!aIsPro && bIsPro) return 1;
        return 0;
    });

    return (
        <section id="about" className="py-16 md:py-24 relative overflow-hidden">
            {/* Subtle background decorative element using the photo */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-2/3 opacity-10 pointer-events-none blur-3xl overflow-hidden hidden lg:block">
                <img src={branding.profilePicUrl} alt="" className="w-full h-full object-cover object-top scale-150 rotate-12" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter">
                        The Person Behind <span className="text-red-600">FEZ</span>
                    </h2>
                    <div className="w-16 md:w-20 h-1 md:h-1.5 bg-red-600 mx-auto mt-3 rounded-full"></div>
                </div>

                <InteractiveCard className="relative w-full max-w-5xl mx-auto bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2rem] border border-white/10 p-6 md:p-16 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                        
                        {/* Profile Picture Container with stylized frame */}
                        <div className="relative flex-shrink-0 group">
                            <div className="relative w-36 h-36 md:w-64 md:h-64 rounded-xl md:rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                                <img 
                                    src={branding.profilePicUrl} 
                                    alt={introCard.title} 
                                    className="w-full h-full object-cover object-top" 
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                            </div>
                            
                            {/* Animated glowing rings behind the photo */}
                            <div className="absolute -inset-3 md:-inset-4 rounded-2xl md:rounded-3xl ring-1 ring-red-600/30 animate-pulse pointer-events-none"></div>
                            <div className="absolute -inset-6 md:-inset-8 rounded-[2rem] md:rounded-[2.5rem] ring-1 ring-white/5 animate-float-3d pointer-events-none" style={{ animationDuration: '15s' }}></div>

                            {/* Official Badge (Changed from Verified) */}
                            <div className="absolute -bottom-2 -right-2 md:-bottom-4 md:-right-4 bg-red-600 text-white p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-xl flex items-center gap-1.5 border border-white/20">
                                <CheckCircleIcon className="w-3.5 h-3.5 md:w-5 md:h-5" />
                                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest pr-1">Official Artist</span>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="text-center md:text-left flex-1">
                            <div className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 bg-red-600/10 border border-red-600/20 rounded-md md:rounded-lg mb-3 md:mb-4">
                                <span className="text-[10px] md:text-xs font-bold text-red-500 uppercase tracking-[0.3em]">Fuad Editing Zone</span>
                            </div>
                            <h3 className="text-2xl md:text-5xl font-bold text-white mb-1 md:mb-2 tracking-tight">
                                {introCard.title}
                            </h3>
                            <p className="text-base md:text-xl text-gray-400 font-medium mb-4 md:mb-6 italic">
                                "{introCard.subtitle}"
                            </p>
                            
                            <div className="w-full h-px bg-gradient-to-r from-red-600/50 via-white/10 to-transparent mb-6 md:mb-8"></div>
                            
                            <p className="text-gray-300 text-sm md:text-lg leading-relaxed max-w-2xl break-keep hyphens-none mb-6 md:mb-8 font-light">
                                {introCard.experience}
                            </p>
                            
                            {/* Skills Tags */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 mb-8 md:mb-10">
                                {sortedAboutSkills.map(skill => (
                                    <span 
                                        key={skill}
                                        className="flex items-center bg-white/5 border border-white/10 text-gray-300 text-[9px] md:text-xs font-bold px-3 py-1.5 md:px-5 md:py-2 rounded transition-all duration-300 cursor-default hover:bg-red-600 hover:text-white hover:border-red-600"
                                    >
                                        {skill}
                                        {proSkills.includes(skill) && (
                                            <span className="ml-1.5 bg-red-600 text-white text-[7px] md:text-[9px] px-1 py-0 rounded-sm font-black ring-1 ring-white/20">PRO</span>
                                        )}
                                    </span>
                                ))}
                            </div>

                            {/* Social Connectivity */}
                            <div className="flex justify-center md:justify-start gap-6 md:gap-8 border-t border-white/5 pt-6 md:pt-8">
                                {branding.socials.map(link => (
                                    <a
                                        key={link.name}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={link.name}
                                        className="group relative"
                                    >
                                        <link.icon className="text-xl md:text-2xl text-gray-500 transition-all duration-300 group-hover:text-red-600 group-hover:scale-125 group-hover:-translate-y-1" />
                                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                                            {link.name}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </InteractiveCard>
            </div>
        </section>
    );
};