
import React, { useState } from 'react';
import { siteConfig } from '../config';
import { HomeIcon, BriefcaseIcon, VfxIcon, UserCircleIcon, ChatBubbleIcon } from './Icons';

interface NavProps {
  onScrollTo: (section: 'home' | 'portfolio' | 'contact' | 'video-editing' | 'about') => void;
}

const NavLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button
      onClick={onClick}
      className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-all duration-300 px-4 py-2 hover:translate-y-[-1px] active:translate-y-[1px]"
    >
        {children}
    </button>
);

export const DesktopHeader: React.FC<NavProps> = ({ onScrollTo }) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleLogoClick = () => {
      setIsSpinning(true);
      onScrollTo('home');
      setTimeout(() => setIsSpinning(false), 2000);
  };

  return (
    <header className="hidden md:flex items-center justify-between fixed top-0 left-0 right-0 z-50 h-16 px-10 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div 
            onClick={handleLogoClick}
            className="cursor-pointer group flex items-center gap-4"
        >
            <div className="relative">
                <div className="absolute -inset-1 bg-red-600/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img 
                    src={siteConfig.branding.logoUrl} 
                    alt="Logo" 
                    className={`h-9 w-9 rounded-full relative z-10 ${isSpinning ? 'logo-3d-spin' : ''}`}
                />
            </div>
             <h1 className="font-black text-white text-base uppercase tracking-[0.2em]">{siteConfig.branding.name}</h1>
        </div>

        <nav className="flex items-center gap-4">
            <NavLink onClick={() => onScrollTo('home')}>Terminal</NavLink>
            <NavLink onClick={() => onScrollTo('portfolio')}>Graphics</NavLink>
            <NavLink onClick={() => onScrollTo('video-editing')}>VFX Edits</NavLink>
            <NavLink onClick={() => onScrollTo('about')}>About</NavLink>
            <NavLink onClick={() => onScrollTo('contact')}>Contact</NavLink>
        </nav>
        
        <div className="flex items-center gap-6">
            <button 
                onClick={() => onScrollTo('contact')}
                className="btn-angular bg-red-600 hover:bg-red-700 text-white text-[10px] font-black px-6 py-2 uppercase tracking-[0.3em] transition-all shadow-[0_10px_20px_rgba(220,38,38,0.2)] hover:shadow-[0_15px_30px_rgba(220,38,38,0.4)]"
            >
                Get Started
            </button>
        </div>
    </header>
  );
};

export const MobileHeader: React.FC<NavProps> = ({ onScrollTo }) => {
    const [isSpinning, setIsSpinning] = useState(false);

    const handleLogoClick = () => {
        setIsSpinning(true);
        onScrollTo('home');
        setTimeout(() => setIsSpinning(false), 2000);
    };

    return (
        <header className="md:hidden flex items-center justify-between fixed top-0 left-0 right-0 z-50 h-16 px-6 select-none bg-black/60 backdrop-blur-md border-b border-white/5">
            <div 
                onClick={handleLogoClick} 
                className="flex items-center gap-3"
            >
                <img 
                    src={siteConfig.branding.logoUrl} 
                    alt="Logo" 
                    className={`h-8 w-8 rounded-full ${isSpinning ? 'logo-3d-spin' : ''}`}
                />
                <span className="font-black text-white tracking-widest text-[10px] uppercase">FEZ ZONE</span>
            </div>
            
            <button 
                onClick={() => onScrollTo('contact')}
                className="text-[10px] font-black text-red-500 uppercase tracking-widest"
            >
                Contact
            </button>
        </header>
    );
};

const FooterNavLink: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-red-500 transition-all duration-300 w-16 group"
    >
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-[8px] font-black uppercase tracking-wider">{label}</span>
    </button>
);

export const MobileFooterNav: React.FC<{ 
    onScrollTo: (section: 'home' | 'portfolio' | 'contact' | 'video-editing' | 'about') => void; 
}> = ({ onScrollTo }) => {
    return (
        <nav className="md:hidden fixed bottom-6 left-6 right-6 z-40 bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-2xl h-16 flex justify-around items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] select-none border border-white/10">
            <FooterNavLink icon={<HomeIcon className="w-5 h-5" />} label="Home" onClick={() => onScrollTo('home')} />
            <FooterNavLink icon={<BriefcaseIcon className="w-5 h-5" />} label="Design" onClick={() => onScrollTo('portfolio')} />
            <FooterNavLink icon={<VfxIcon className="w-5 h-5" />} label="VFX" onClick={() => onScrollTo('video-editing')} />
            <FooterNavLink icon={<ChatBubbleIcon className="w-5 h-5" />} label="Link" onClick={() => onScrollTo('contact')} />
            <FooterNavLink icon={<UserCircleIcon className="w-5 h-5" />} label="Profile" onClick={() => onScrollTo('about')} />
        </nav>
    );
};
