import React, { useState, useEffect } from 'react';
import type { GraphicWork, VideoWork, ModalItem } from '../hooks/types';
import { LazyImage } from './LazyImage';
import { 
    CloseIcon, ZoomInIcon, ZoomOutIcon, PlayIcon, 
    SearchIcon, MicrophoneIcon, Bars3Icon, UserCircleIcon, 
    HomeIcon, ReelsIcon, PlaylistIcon, YouTubeIcon,
    ThreeDotsIcon, CheckCircleIcon, InstagramIcon, HeartHoverIcon,
    CommentIcon, ShareIcon, BookmarkIcon
} from './Icons';
import { siteConfig } from '../config';

interface ModalViewerProps {
  state: { items: ModalItem[]; currentIndex: number };
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const InstagramMockup: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const channelPic = siteConfig.branding.profilePicUrl;
    const channelName = siteConfig.branding.author.toLowerCase().replace(/\s+/g, '_');

    if (isMobile) {
        // --- INSTAGRAM MOBILE MOCKUP ---
        return (
            <div className="w-full max-w-[320px] sm:max-w-[360px] bg-black rounded-[2.5rem] overflow-hidden border-[6px] md:border-[8px] border-[#1a1a1a] shadow-2xl flex flex-col aspect-[9/19.5] max-h-[85vh] self-center">
                {/* Status Bar */}
                <div className="h-6 flex justify-between items-center px-6 pt-1">
                    <span className="text-[10px] font-bold text-white">12:00</span>
                    <div className="flex gap-1.5 items-center">
                        <i className="fa-solid fa-signal text-[8px]"></i>
                        <i className="fa-solid fa-wifi text-[8px]"></i>
                        <i className="fa-solid fa-battery-full text-[10px]"></i>
                    </div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                    <span className="font-serif text-xl font-bold tracking-tight text-white">Instagram</span>
                    <div className="flex items-center gap-4 text-white">
                        <i className="fa-regular fa-heart text-xl"></i>
                        <i className="fa-regular fa-comment-dots text-xl"></i>
                    </div>
                </div>

                {/* Stories Bar */}
                <div className="flex gap-4 px-4 py-3 overflow-hidden border-b border-white/5 no-scrollbar">
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                            <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-gray-800">
                                <img src={channelPic} alt="" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <span className="text-[9px] text-white">Your story</span>
                    </div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0 opacity-40">
                            <div className="w-14 h-14 rounded-full p-[2px] bg-white/20">
                                <div className="w-full h-full rounded-full border-2 border-black bg-gray-900"></div>
                            </div>
                            <div className="w-8 h-1.5 bg-white/20 rounded"></div>
                        </div>
                    ))}
                </div>

                {/* Feed Post */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-black">
                    <div className="flex items-center justify-between px-3 py-2.5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                                <img src={channelPic} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                    <span className="text-[12px] font-bold text-white">{channelName}</span>
                                    <CheckCircleIcon className="w-3 h-3 text-blue-500" />
                                </div>
                                <span className="text-[9px] text-gray-400">Sylhet, Bangladesh</span>
                            </div>
                        </div>
                        <ThreeDotsIcon className="w-4 h-4 text-white" />
                    </div>

                    <div className="aspect-square w-full bg-[#121212] flex items-center justify-center">
                        <img src={imageUrl} alt="" className="w-full h-full object-contain" />
                    </div>

                    <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <i className="fa-solid fa-heart text-red-600 text-xl"></i>
                                <i className="fa-regular fa-comment text-xl text-white"></i>
                                <i className="fa-regular fa-paper-plane text-xl text-white"></i>
                            </div>
                            <i className="fa-regular fa-bookmark text-xl text-white"></i>
                        </div>
                        <div className="text-[12px] font-bold text-white">12,402 likes</div>
                        <div className="text-[12px] leading-tight">
                            <span className="font-bold text-white mr-2">{channelName}</span>
                            <span className="text-gray-200">New cinematic manipulation piece. Bringing art to life at FEZ Zone! 🎨🔥 #VFX #DigitalArt</span>
                        </div>
                        <div className="text-[11px] text-gray-500 uppercase mt-1">2 hours ago</div>
                    </div>
                </div>

                {/* Bottom Nav */}
                <div className="h-12 border-t border-white/10 flex justify-around items-center px-2">
                    <i className="fa-solid fa-house text-xl text-white"></i>
                    <i className="fa-solid fa-magnifying-glass text-xl text-gray-400"></i>
                    <i className="fa-regular fa-square-plus text-2xl text-gray-400"></i>
                    <i className="fa-solid fa-clapperboard text-xl text-gray-400"></i>
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20">
                        <img src={channelPic} alt="" className="w-full h-full object-cover" />
                    </div>
                </div>
                <div className="h-4 flex justify-center items-end pb-1">
                    <div className="w-24 h-1 bg-white/40 rounded-full"></div>
                </div>
            </div>
        );
    } else {
        // --- INSTAGRAM DESKTOP MOCKUP ---
        return (
            <div className="w-full max-w-5xl mx-auto bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col border border-white/10 max-h-[90vh]">
                <div className="flex flex-1 min-h-0">
                    {/* Sidebar */}
                    <div className="w-20 lg:w-60 flex flex-col p-4 border-r border-white/10 gap-8">
                        <div className="px-2 py-4 mb-4">
                            <span className="hidden lg:block font-serif text-2xl font-bold text-white">Instagram</span>
                            <InstagramIcon className="lg:hidden w-7 h-7 text-white" />
                        </div>
                        <nav className="flex flex-col gap-2">
                            {[
                                { icon: 'fa-house', label: 'Home', active: true },
                                { icon: 'fa-magnifying-glass', label: 'Search' },
                                { icon: 'fa-compass', label: 'Explore' },
                                { icon: 'fa-clapperboard', label: 'Reels' },
                                { icon: 'fa-paper-plane', label: 'Messages' },
                                { icon: 'fa-heart', label: 'Notifications' },
                                { icon: 'fa-square-plus', label: 'Create' }
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors group">
                                    <i className={`fa-solid ${item.icon} text-xl ${item.active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}></i>
                                    <span className={`hidden lg:block font-medium ${item.active ? 'text-white font-bold' : 'text-gray-400 group-hover:text-white'}`}>{item.label}</span>
                                </div>
                            ))}
                        </nav>
                        <div className="mt-auto flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg cursor-pointer group">
                             <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20">
                                <img src={channelPic} alt="" className="w-full h-full object-cover" />
                             </div>
                             <span className="hidden lg:block text-gray-400 group-hover:text-white font-medium">Profile</span>
                        </div>
                    </div>

                    {/* Feed Content */}
                    <div className="flex-1 bg-black p-4 md:p-10 overflow-y-auto custom-scrollbar flex justify-center">
                        <div className="w-full max-w-md space-y-4">
                            {/* Desktop Post */}
                            <div className="border border-white/10 rounded-lg overflow-hidden bg-black">
                                <div className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full overflow-hidden p-[1.5px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                                            <img src={channelPic} alt="" className="w-full h-full rounded-full border border-black object-cover" />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-bold text-white hover:opacity-70 cursor-pointer">{channelName}</span>
                                                <CheckCircleIcon className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="text-xs text-gray-500">• 2h</span>
                                            </div>
                                            <span className="text-[11px] text-gray-300">Original Audio</span>
                                        </div>
                                    </div>
                                    <ThreeDotsIcon className="w-4 h-4 text-white cursor-pointer" />
                                </div>
                                
                                <div className="aspect-square bg-white/5 flex items-center justify-center">
                                    <img src={imageUrl} alt="" className="w-full h-full object-contain" />
                                </div>

                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <i className="fa-solid fa-heart text-red-600 text-2xl cursor-pointer"></i>
                                            <i className="fa-regular fa-comment text-2xl text-white cursor-pointer hover:text-gray-400"></i>
                                            <i className="fa-regular fa-paper-plane text-2xl text-white cursor-pointer hover:text-gray-400"></i>
                                        </div>
                                        <i className="fa-regular fa-bookmark text-2xl text-white cursor-pointer hover:text-gray-400"></i>
                                    </div>
                                    <div className="text-sm font-bold text-white">12,402 likes</div>
                                    <div className="text-sm">
                                        <span className="font-bold text-white mr-2">{channelName}</span>
                                        <span className="text-gray-200">The evolution of digital composite. Visualizing the impossible at FEZ Zone. ✨</span>
                                    </div>
                                    <div className="text-xs text-gray-500 cursor-pointer">View all 145 comments</div>
                                    <input type="text" placeholder="Add a comment..." className="w-full bg-transparent border-none text-sm text-white focus:outline-none pt-2 border-t border-white/5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

const YouTubeMockup: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const channelPic = siteConfig.branding.profilePicUrl;
    const channelName = siteConfig.branding.author;

    if (isMobile) {
        // --- MOBILE APP MOCKUP ---
        return (
            <div className="w-full max-w-[320px] sm:max-w-[360px] bg-[#0f0f0f] rounded-[2.5rem] overflow-hidden border-[6px] md:border-[8px] border-[#1a1a1a] shadow-2xl flex flex-col aspect-[9/19.5] max-h-[85vh] self-center">
                {/* Status Bar Area */}
                <div className="h-6 md:h-8 flex justify-between items-center px-6 pt-1 md:pt-2">
                    <span className="text-[10px] font-bold text-white">9:41</span>
                    <div className="flex gap-1.5 items-center">
                        <div className="w-3.5 h-2 border border-white/40 rounded-[2px]"></div>
                        <div className="w-2.5 h-2.5 bg-white/80 rounded-full scale-75"></div>
                    </div>
                </div>

                {/* Mobile Header */}
                <div className="flex items-center justify-between px-4 py-2 md:py-3 bg-[#0f0f0f]">
                    <div className="flex items-center gap-1">
                        <YouTubeIcon className="w-6 h-6 md:w-7 md:h-7 text-red-600" />
                        <span className="font-bold text-base md:text-lg tracking-tighter text-white">YouTube</span>
                    </div>
                    <div className="flex items-center gap-3 md:gap-5 text-white">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        <SearchIcon className="w-4 h-4 md:w-5 md:h-5" />
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10">
                            <img src={channelPic} alt="" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* Categories Bar */}
                <div className="flex gap-2 px-4 py-1.5 md:py-2 overflow-hidden whitespace-nowrap border-b border-white/5 no-scrollbar">
                    {['All', 'Design', 'VFX', 'Anime', 'Gaming'].map((cat, i) => (
                        <span key={cat} className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-[9px] md:text-[10px] font-bold ${i === 0 ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>{cat}</span>
                    ))}
                </div>

                {/* Main Feed Content */}
                <div className="flex-1 overflow-y-auto bg-[#0f0f0f] custom-scrollbar">
                    {/* Featured Video (The Artwork) */}
                    <div className="w-full">
                        <div className="aspect-video w-full bg-black">
                            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3 flex gap-3">
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden flex-shrink-0">
                                <img src={channelPic} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[12px] md:text-[13px] font-bold text-white leading-tight line-clamp-2">Premium Thumbnail Design for YouTube Content Creators</h3>
                                <div className="mt-1 text-[9px] md:text-[10px] text-gray-400 font-medium">
                                    <span>{channelName}</span>
                                    <span className="mx-1">•</span>
                                    <span>1.2M views</span>
                                    <span className="mx-1">•</span>
                                    <span>2 hours ago</span>
                                </div>
                            </div>
                            <button className="text-white pt-1">
                                <ThreeDotsIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Placeholder Feed Card */}
                    <div className="w-full opacity-20 mt-4">
                        <div className="aspect-video w-full bg-white/5"></div>
                        <div className="p-3 flex gap-3">
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/10"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-2.5 bg-white/10 rounded w-3/4"></div>
                                <div className="h-1.5 bg-white/10 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="h-12 md:h-14 bg-[#0f0f0f] border-t border-white/10 flex justify-around items-center px-2">
                    <div className="flex flex-col items-center gap-0.5 md:gap-1 text-white">
                        <HomeIcon className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="text-[8px] font-medium">Home</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 md:gap-1 text-gray-400">
                        <ReelsIcon className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="text-[8px] font-medium">Shorts</span>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 border border-white/20 rounded-full flex items-center justify-center text-white">
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 md:gap-1 text-gray-400">
                        <PlaylistIcon className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="text-[8px] font-medium">Subs</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 md:gap-1 text-gray-400">
                        <UserCircleIcon className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="text-[8px] font-medium">Library</span>
                    </div>
                </div>
                <div className="h-4 md:h-6 flex justify-center items-end pb-1 md:pb-2">
                    <div className="w-24 md:w-32 h-1 bg-white/40 rounded-full"></div>
                </div>
            </div>
        );
    } else {
        // --- DESKTOP BROWSER MOCKUP ---
        return (
            <div className="w-full max-w-5xl mx-auto bg-[#0f0f0f] rounded-xl overflow-hidden shadow-2xl flex flex-col border border-white/10 max-h-[90vh]">
                {/* Desktop Header */}
                <div className="h-14 flex items-center justify-between px-4 bg-[#0f0f0f] flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                            <Bars3Icon className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-0.5">
                            <YouTubeIcon className="w-8 h-8 text-red-600" />
                            <span className="font-bold text-xl tracking-tighter text-white">YouTube</span>
                            <span className="text-[10px] text-gray-500 font-medium ml-1 mt-1">PK</span>
                        </div>
                    </div>

                    <div className="flex-1 max-w-2xl flex items-center gap-4 px-10">
                        <div className="flex-1 flex items-center bg-[#121212] border border-[#333] rounded-full overflow-hidden">
                            <input type="text" placeholder="Search" className="flex-1 bg-transparent px-4 py-1.5 text-sm text-white focus:outline-none" />
                            <button className="bg-[#222] border-l border-[#333] px-5 py-1.5 text-white hover:bg-[#333]">
                                <SearchIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <button className="bg-[#181818] p-2.5 rounded-full text-white hover:bg-[#222]">
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                         <button className="p-2 text-white hover:bg-white/10 rounded-full"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></button>
                         <button className="p-2 text-white hover:bg-white/10 rounded-full"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></button>
                         <div className="w-8 h-8 rounded-full overflow-hidden ml-2 border border-white/10">
                            <img src={channelPic} alt="" className="w-full h-full object-cover" />
                         </div>
                    </div>
                </div>

                <div className="flex flex-1 min-h-0">
                    {/* Left Sidebar (Compact) */}
                    <div className="w-16 flex flex-col items-center py-4 gap-6 bg-[#0f0f0f] border-r border-white/5">
                         <div className="flex flex-col items-center gap-1 text-white">
                            <HomeIcon className="w-6 h-6" />
                            <span className="text-[9px]">Home</span>
                         </div>
                         <div className="flex flex-col items-center gap-1 text-gray-400">
                            <ReelsIcon className="w-6 h-6" />
                            <span className="text-[9px]">Shorts</span>
                         </div>
                         <div className="flex flex-col items-center gap-1 text-gray-400">
                            <PlaylistIcon className="w-6 h-6" />
                            <span className="text-[9px]">Subs</span>
                         </div>
                         <div className="flex flex-col items-center gap-1 text-gray-400">
                            <UserCircleIcon className="w-6 h-6" />
                            <span className="text-[9px]">You</span>
                         </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-[#0f0f0f] p-4 md:p-8 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Featured Card */}
                            <div className="col-span-1 space-y-3 group cursor-pointer">
                                <div className="aspect-video w-full rounded-xl overflow-hidden relative shadow-lg">
                                    <img src={imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1 rounded font-medium">10:45</span>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 mt-1 ring-1 ring-white/10">
                                        <img src={channelPic} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">High-End Thumbnail Design & VFX Portfolio Breakdown | Fuad Editing Zone</h3>
                                        <div className="text-xs text-gray-400 flex flex-col">
                                            <span className="flex items-center gap-1 hover:text-white transition-colors">
                                                {channelName}
                                                <CheckCircleIcon className="w-3 h-3 text-gray-500" />
                                            </span>
                                            <span>1.2M views • 2 hours ago</span>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 group-hover:text-white self-start opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ThreeDotsIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Placeholder Cards */}
                            {[1, 2].map(i => (
                                <div key={i} className="col-span-1 space-y-3 opacity-10">
                                    <div className="aspect-video w-full bg-white/5 rounded-xl"></div>
                                    <div className="flex gap-3">
                                        <div className="w-9 h-9 rounded-full bg-white/10 flex-shrink-0"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-white/10 rounded w-3/4"></div>
                                            <div className="h-2 bg-white/10 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

export const ModalViewer: React.FC<ModalViewerProps> = ({ state, onClose, onNext, onPrev }) => {
    const { items, currentIndex } = state;
    const currentItem = items[currentIndex];
    const [isZoomed, setIsZoomed] = useState(false);
    
    useEffect(() => {
        // Reset zoom state when the image changes
        setIsZoomed(false);
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, onClose]);

    const isImage = (item: ModalItem): item is GraphicWork => 'imageUrl' in item;
    const isVideo = (item: ModalItem): item is VideoWork => ('url' in item || 'videoId' in item);
    
    const isYouTubeThumbnail = isImage(currentItem) && currentItem.category === 'YouTube Thumbnails';
    const isInstagramMockup = isImage(currentItem) && currentItem.category === 'Photo Manipulation';

    const videoUrl = isVideo(currentItem) 
        ? (currentItem.url ? currentItem.url : `https://www.youtube.com/embed/${currentItem.videoId}?autoplay=1&rel=0`)
        : '';

    return (
        <div 
            className="fixed inset-0 bg-black z-[70] flex items-center justify-center animate-fade-in p-4 md:p-12 overflow-hidden"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            {isImage(currentItem) && (
                <div 
                    className="absolute inset-0 w-full h-full bg-cover bg-center filter blur-3xl brightness-50 scale-110 transition-all duration-300 opacity-60"
                    style={{ backgroundImage: `url(${currentItem.imageUrl})` }}
                />
            )}

            <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                {isImage(currentItem) ? (
                    isYouTubeThumbnail ? (
                        <div className="w-full h-full flex items-center justify-center p-2 md:p-0">
                            <YouTubeMockup imageUrl={currentItem.imageUrl} />
                        </div>
                    ) : isInstagramMockup ? (
                        <div className="w-full h-full flex items-center justify-center p-2 md:p-0">
                            <InstagramMockup imageUrl={currentItem.imageUrl} />
                        </div>
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isZoomed ? 'overflow-auto custom-scrollbar' : 'overflow-hidden'}`}>
                            <img 
                                src={currentItem.imageUrl} 
                                alt="Portfolio work" 
                                className={`rounded-lg drop-shadow-2xl transition-all duration-300 ${isZoomed ? 'flex-shrink-0 max-w-none' : 'max-w-full max-h-full object-contain'}`}
                            />
                        </div>
                    )
                ) : isVideo(currentItem) ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-full max-w-5xl aspect-video bg-black rounded-lg shadow-2xl overflow-hidden">
                            {currentItem.url ? (
                                <video 
                                    src={currentItem.url} 
                                    controls 
                                    autoPlay 
                                    className="w-full h-full"
                                />
                            ) : (
                                <iframe
                                    src={videoUrl}
                                    title="Portfolio Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2 z-[100]">
                 {isImage(currentItem) && !isYouTubeThumbnail && !isInstagramMockup && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
                        aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                        className="text-white/70 hover:text-white transition-colors p-2.5 rounded-full bg-black/50 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white border border-white/10 backdrop-blur-sm"
                    >
                        {isZoomed ? <ZoomOutIcon className="h-6 w-6 md:h-8 md:w-8" /> : <ZoomInIcon className="h-6 w-6 md:h-8 md:w-8" />}
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    aria-label="Close viewer"
                    className="text-white/70 hover:text-white transition-colors p-2.5 rounded-full bg-black/50 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white border border-white/10 backdrop-blur-sm"
                >
                    <CloseIcon className="h-6 w-6 md:h-8 md:w-8" />
                </button>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                aria-label="Previous item"
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2 md:p-3 rounded-full bg-black/50 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white z-[100] border border-white/10 backdrop-blur-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            
            <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                aria-label="Next item"
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2 md:p-3 rounded-full bg-black/50 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white z-[100] border border-white/10 backdrop-blur-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    );
};


interface GalleryGridModalProps {
    items: ModalItem[];
    onClose: () => void;
    onItemClick: (index: number) => void;
}

export const GalleryGridModal: React.FC<GalleryGridModalProps> = ({ items, onClose, onItemClick }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const getThumbnail = (item: ModalItem) => {
        if ('imageUrl' in item) return item.imageUrl;
        if ('thumbnailUrl' in item) return item.thumbnailUrl;
        if ('videoId' in item) return `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`;
        return ''; // Fallback
    };

    return (
        <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center animate-fade-in p-4 sm:p-8"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-gray-900 rounded-xl w-full h-full max-w-7xl flex flex-col shadow-2xl border border-white/5"
                style={{ animation: 'fade-in-scale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-2xl md:text-3xl font-bold font-teko text-white tracking-widest uppercase">Works Gallery</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close gallery"
                        className="text-white/70 hover:text-white transition-colors p-2 rounded-full bg-black/50 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white border border-white/10"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
                    {/* Masonry Grid */}
                    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                        {items.map((item, index) => (
                            <button 
                                key={index} 
                                onClick={() => onItemClick(index)}
                                className="group relative break-inside-avoid overflow-hidden rounded-lg shadow-lg block w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 border border-white/10"
                            >
                                <LazyImage 
                                    src={getThumbnail(item) || ''} 
                                    alt={`Work ${index}`} 
                                    className="w-full h-auto object-contain transition-transform duration-500 ease-in-out group-hover:scale-105"
                                    loadIndex={index}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    {('url' in item || 'videoId' in item) && (
                                        <PlayIcon className="w-10 h-10 text-white drop-shadow-lg" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};