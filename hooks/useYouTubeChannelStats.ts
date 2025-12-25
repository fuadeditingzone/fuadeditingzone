
import { useState, useEffect, useRef } from 'react';
import { siteConfig } from '../config';

interface VideoItem {
    id: string;
    title: string;
    thumbnail: string;
    viewCount: string;
    publishedAt: string;
    channelTitle?: string;
    durationSeconds: number;
    rawViewCount?: number;
}

interface ChannelStats {
    subscribers: number;
    views: number;
    videoCount: number;
    channelTitle?: string;
    channelProfilePic?: string;
}

export const useYouTubeChannelStats = () => {
    const [stats, setStats] = useState<ChannelStats>({ subscribers: 0, views: 0, videoCount: 0 });
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const hasLoadedData = useRef(false);

    // Helper to format numbers (e.g., 1.2M)
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
    };

    const parseDuration = (duration: string): number => {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) return 0;
        const hours = (parseInt(match[1] || '0'));
        const minutes = (parseInt(match[2] || '0'));
        const seconds = (parseInt(match[3] || '0'));
        return hours * 3600 + minutes * 60 + seconds;
    };

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchData = async () => {
            try {
                const apiKey = siteConfig.api.youtubeApiKey;
                const channelId = siteConfig.api.channelId;

                // OPTIMIZATION: Fetch Channel Stats and Content Details in parallel
                // This speeds up the initial render of the stats badge while videos load
                const [statsRes, contentRes] = await Promise.all([
                    fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${apiKey}`, { signal }),
                    fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`, { signal })
                ]);
                
                if (!statsRes.ok) throw new Error(`YouTube API Error: ${statsRes.status}`);
                
                const statsData = await statsRes.json();

                if (statsData.items && statsData.items.length > 0) {
                    const item = statsData.items[0];
                    const s = item.statistics;
                    const sn = item.snippet;
                    
                    // Update stats immediately so UI feels responsive
                    setStats({
                        subscribers: parseInt(s.subscriberCount),
                        views: parseInt(s.viewCount),
                        videoCount: parseInt(s.videoCount),
                        channelTitle: sn.title,
                        channelProfilePic: sn.thumbnails.medium?.url || sn.thumbnails.default?.url
                    });
                } else {
                    throw new Error("Channel stats not found");
                }

                // Process Video List (Uploads)
                if (!contentRes.ok) throw new Error(`Content API Error: ${contentRes.status}`);
                
                const contentData = await contentRes.json();
                
                if (contentData.items && contentData.items.length > 0) {
                    const uploadsPlaylistId = contentData.items[0].contentDetails.relatedPlaylists.uploads;
                    
                    // Fetch more results (50) for the sidebar browser
                    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`;
                    const playlistRes = await fetch(playlistUrl, { signal });

                    if (!playlistRes.ok) throw new Error(`Playlist API Error: ${playlistRes.status}`);
                    
                    const playlistData = await playlistRes.json();

                    if (playlistData.items) {
                        const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
                        
                        // Fetch detailed stats (View Counts & Duration) for these videos
                        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`;
                        const videosRes = await fetch(videosUrl, { signal });
                        
                        if (!videosRes.ok) throw new Error(`Video Details API Error: ${videosRes.status}`);

                        const videosData = await videosRes.json();

                        if (videosData.items) {
                            const mappedVideos: VideoItem[] = videosData.items.map((item: any) => ({
                                id: item.id,
                                title: item.snippet.title,
                                thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
                                publishedAt: item.snippet.publishedAt,
                                viewCount: formatNumber(parseInt(item.statistics.viewCount || '0')),
                                rawViewCount: parseInt(item.statistics.viewCount || '0'),
                                channelTitle: item.snippet.channelTitle,
                                durationSeconds: parseDuration(item.contentDetails.duration)
                            }));
                            setVideos(mappedVideos);
                            hasLoadedData.current = true;
                        }
                    }
                }
            } catch (error: any) {
                if (error.name === 'AbortError') return;
                // Log warning but fallback gracefully
                console.warn("YouTube API fetch failed, using fallback data.", error.message);
                if (!hasLoadedData.current) fallbackData();
            } finally {
                if (!signal.aborted) setLoading(false);
            }
        };

        const fallbackData = () => {
             setStats(prev => prev.subscribers === 0 ? { 
                 subscribers: 12500, 
                 views: 1540000, 
                 videoCount: 45,
                 channelTitle: siteConfig.branding.name,
                 channelProfilePic: siteConfig.branding.profilePicUrl 
             } : prev);

             if (!hasLoadedData.current) {
                 const fallbackVideos = siteConfig.content.portfolio.animeEdits.slice(0, 8).map(v => ({
                     id: v.videoId || '',
                     title: "Cinematic Visual Edit",
                     thumbnail: v.thumbnailUrl || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
                     publishedAt: new Date().toISOString(),
                     viewCount: v.mostViewed ? "50K" : "10K",
                     durationSeconds: 120, // Default to long form
                     rawViewCount: v.mostViewed ? 50000 : 10000
                 })).filter(v => v.id);
                 setVideos(fallbackVideos);
             }
        };

        fetchData();
        
        return () => {
            controller.abort();
        };
    }, []);

    return { stats, videos, loading, formatNumber };
};
