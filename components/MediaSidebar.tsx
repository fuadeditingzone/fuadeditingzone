
import React, { useState, useEffect } from 'react';
import { useYouTubeChannelStats } from '../hooks/useYouTubeChannelStats';
import { CloseIcon, YouTubeIcon } from './Icons';
import { siteConfig } from '../config';

interface MediaSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    forcePaused?: boolean;
}

export const MediaSidebar: React.FC<MediaSidebarProps> = ({ isOpen, onClose, forcePaused }) => {
    const { videos, loading, stats, formatNumber } = useYouTubeChannelStats();
    const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

    useEffect(() => {
        if (videos.length > 0 && !currentVideoId) {
            setCurrentVideoId(videos[0].id);
        }
    }, [videos, currentVideoId]);

    // Use API data if available, otherwise fallback to config
    const channelName = stats.channelTitle || siteConfig.branding.name;
    const channelImage = stats.channelProfilePic || siteConfig.branding.profilePicUrl;

    return (
        <div 
            className={`fixed inset-y-0 right-0 z-[80] w-full max-w-md bg-[#0f0f0f] border-l border-white/10 shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col select-none ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            {/* Header (Mini Browser Bar) */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <YouTubeIcon className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-bold text-white tracking-tight">YouTube</span>
                    </div>
                </div>
                
                <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Browser Content */}
            <div className="flex-1 flex flex-col min-h-0 relative bg-[#0f0f0f]">
                
                {/* Player Container */}
                <div className="flex-shrink-0 bg-black aspect-video relative border-b border-white/5 shadow-lg z-10">
                    {currentVideoId && !forcePaused ? (
                        <iframe 
                            src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=${isOpen ? 1 : 0}&rel=0&modestbranding=1&enablejsapi=1`}
                            title="YouTube Video Player"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; identity-credentials-get"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col gap-2">
                            {forcePaused ? (
                                <span className="text-xs uppercase tracking-widest animate-pulse">Paused for Intro Media</span>
                            ) : (
                                <>
                                    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs">Loading Player...</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Playlist / Feed */}
                <div className="flex-1 overflow-y-auto p-0 scrollbar-thin">
                    {/* Channel Info & Stats Header */}
                    <div className="sticky top-0 bg-[#0f0f0f]/95 backdrop-blur z-10 border-b border-white/5">
                         <div className="p-4 flex items-center justify-between gap-3 border-b border-white/5">
                            <div className="flex items-center gap-3 min-w-0">
                                <img src={channelImage} alt={channelName} className="w-10 h-10 rounded-full object-cover object-top bg-gray-800 ring-1 ring-white/10" />
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-white break-words leading-tight">{channelName}</h3>
                                    <div className={`text-xs text-gray-400 flex items-center gap-1 ${loading && !stats.subscribers ? 'shimmer-bg rounded' : ''}`}>
                                        {loading && !stats.subscribers ? (
                                            <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                        ) : (
                                            <>
                                                <span>{formatNumber(stats.subscribers)} subscribers</span>
                                                <span className="w-0.5 h-0.5 bg-gray-500 rounded-full"></span>
                                                <span>{stats.videoCount} videos</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <a 
                                href={`https://www.youtube.com/channel/${siteConfig.api.channelId}?sub_confirmation=1`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-angular btn-3d bg-red-600 text-white hover:bg-red-700 px-5 py-2 text-xs font-bold transition-colors flex-shrink-0 shadow-lg"
                            >
                                Subscribe
                            </a>
                         </div>
                         
                         <div className="px-4 py-3 bg-[#0f0f0f]">
                             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Latest Uploads</h3>
                         </div>
                    </div>
                    
                    <div className="p-4 space-y-3 pt-2">
                        {loading ? (
                             <div className="space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex gap-3 animate-pulse">
                                        <div className="w-28 h-16 bg-white/5 rounded-md"></div>
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-3 bg-white/5 rounded w-3/4"></div>
                                            <div className="h-2 bg-white/5 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        ) : (
                            videos.map((video) => (
                                <button
                                    key={video.id}
                                    onClick={() => setCurrentVideoId(video.id)}
                                    className={`w-full flex gap-3 p-2 rounded-lg transition-all text-left group border border-transparent ${currentVideoId === video.id ? 'bg-white/10 border-white/5' : 'hover:bg-white/5'}`}
                                >
                                    <div className="relative w-32 aspect-video rounded-md overflow-hidden flex-shrink-0 bg-gray-800">
                                        <img src={video.thumbnail} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        {currentVideoId === video.id && (
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-center">
                                        {/* Allowed title to wrap fully */}
                                        <h4 className={`text-sm font-medium leading-snug mb-1 break-words ${currentVideoId === video.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                            {video.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{video.viewCount} views</span>
                                            <span className="w-0.5 h-0.5 bg-gray-500 rounded-full"></span>
                                            <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
