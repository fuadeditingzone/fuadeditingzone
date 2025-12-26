import React, { useState } from 'react';
import { siteConfig } from '../config';
import { HomeIcon, BriefcaseIcon, EmailIcon, VfxIcon, SparklesIcon, UserCircleIcon, ChatBubbleIcon } from './Icons';

interface NavProps {
  onScrollTo: (section: 'home' | 'portfolio' | 'contact' | 'video-editing' | 'about') => void;
}

const NavLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button
      onClick={onClick}
      className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 px-4 py-2"
    >
        {children}
    </button>
);

export const DesktopHeader: React.FC<NavProps> = ({ onScrollTo }) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleLogoClick = () => {
      setIsSpinning(true);
      onScrollTo('home');
      setTimeout(() => setIsSpinning(false), 2000); // Reset after animation
  };

  return (
    <header className="hidden md:flex items-center justify-between fixed top-0 left-0 right-0 z-50 h-14 px-8 bg-black/20 backdrop-blur-md">
        <div 
            onClick={handleLogoClick}
            className="cursor-pointer group flex items-center gap-3"
        >
            <img 
                src={siteConfig.branding.logoUrl} 
                alt="Logo" 
                className={`h-8 w-8 rounded-full ${isSpinning ? 'logo-3d-spin' : ''}`}
            />
             <h1 className="font-semibold text-white text-lg leading-none">{siteConfig.branding.name}</h1>
        </div>

        <nav className="flex items-center gap-2">
            <NavLink onClick={() => onScrollTo('home')}>Home</NavLink>
            <NavLink onClick={() => onScrollTo('portfolio')}>Graphic Design</NavLink>
            <NavLink onClick={() => onScrollTo('video-editing')}>Video Editing</NavLink>
            <NavLink onClick={() => onScrollTo('about')}>About</NavLink>
            <NavLink onClick={() => onScrollTo('contact')}>Contact</NavLink>
        </nav>
        
        <div className="w-20 md:w-0"></div>
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
        <header className="md:hidden flex items-center justify-between fixed top-0 left-0 right-0 z-50 h-14 px-6 select-none pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
            <div 
                onClick={handleLogoClick} 
                className="flex items-center gap-3 pointer-events-auto"
            >
                <img 
                    src={siteConfig.branding.logoUrl} 
                    alt="Logo" 
                    className={`h-8 w-8 rounded-full ${isSpinning ? 'logo-3d-spin' : ''}`}
                />
                <div>
                    <span className="font-montserrat font-medium text-white tracking-tight block leading-none text-xs">{siteConfig.branding.name}</span>
                </div>
            </div>
        </header>
    );
};

const FooterNavLink: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-white transition-colors w-16"
    >
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </button>
);

export const MobileFooterNav: React.FC<{ 
    onScrollTo: (section: 'home' | 'portfolio' | 'contact' | 'video-editing' | 'about') => void; 
}> = ({ onScrollTo }) => {
    return (
        <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-[#111]/90 backdrop-blur-xl rounded-2xl h-16 flex justify-around items-center shadow-2xl select-none border border-white/10">
            <FooterNavLink icon={<HomeIcon className="w-5 h-5" />} label="Home" onClick={() => onScrollTo('home')} />
            <FooterNavLink icon={<BriefcaseIcon className="w-5 h-5" />} label="Graphic" onClick={() => onScrollTo('portfolio')} />
            <FooterNavLink icon={<VfxIcon className="w-5 h-5" />} label="Video" onClick={() => onScrollTo('video-editing')} />
            <FooterNavLink icon={<ChatBubbleIcon className="w-5 h-5" />} label="Contact" onClick={() => onScrollTo('contact')} />
            <FooterNavLink icon={<UserCircleIcon className="w-5 h-5" />} label="About" onClick={() => onScrollTo('about')} />
        </nav>
    );
};
