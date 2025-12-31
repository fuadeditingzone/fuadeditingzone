import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { getDatabase, ref, push, onValue, query, limitToLast, orderByChild } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { siteConfig } from '../config';
import { PhotoManipulationIcon, VfxIcon, SendIcon, CopyIcon, PlayIcon, SparklesIcon, CloseIcon, CheckCircleIcon } from './Icons';

const db = getDatabase();

interface Post {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    title: string;
    caption: string;
    tags: string[];
    timestamp: number;
}

export const ExploreFeed: React.FC = () => {
    const { user, isSignedIn } = useUser();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const postsRef = query(ref(db, 'explore_posts'), limitToLast(50));
        return onValue(postsRef, (snap) => {
            const data = snap.val();
            if (data) {
                const list = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id, ...val
                })).sort((a, b) => b.timestamp - a.timestamp);
                setPosts(list);
            }
        });
    }, []);

    const handleUpload = async () => {
        if (!user || !selectedFile || !title.trim() || !caption.trim()) return;
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('folder', 'UserPosts');

            // UPDATED WORKER URL
            const uploadRes = await fetch('https://quiet-haze-1898.fuadeditingzone.workers.dev', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const { url } = await uploadRes.json();

            const tags = caption.match(/#\w+/g) || [];

            const postData = {
                userId: user.id,
                userName: user.fullName || user.username,
                userAvatar: user.imageUrl,
                mediaUrl: url,
                mediaType: selectedFile.type.startsWith('video') ? 'video' : 'image',
                title: title.trim(),
                caption: caption.trim(),
                tags: tags,
                timestamp: Date.now()
            };

            await push(ref(db, 'explore_posts'), postData);
            
            setTitle('');
            setCaption('');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error(err);
            alert("Upload failed. Ensure Cloudflare Worker is active.");
        } finally {
            setIsUploading(false);
        }
    };

    const copyPostLink = (postId: string) => {
        const url = `${window.location.origin}/post/${postId}`;
        navigator.clipboard.writeText(url);
        setCopyFeedback(postId);
        setTimeout(() => setCopyFeedback(null), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4 space-y-10">
            {/* Create Post Box */}
            {isSignedIn && (
                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                    <div className="flex gap-4">
                        <img src={user.imageUrl} className="w-12 h-12 rounded-full border border-red-600/30" />
                        <div className="flex-1 space-y-4">
                            <input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Project Title"
                                className="w-full bg-black border border-white/5 rounded-xl p-4 text-white text-sm outline-none focus:border-red-600/50 transition-all"
                            />
                            <textarea 
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Caption & #tags..."
                                className="w-full bg-black border border-white/5 rounded-xl p-4 text-white text-sm outline-none resize-none h-24 focus:border-red-600/50 transition-all custom-scrollbar"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-white/5 pt-6">
                        <div className="flex gap-2">
                            <input 
                                type="file" 
                                hidden 
                                ref={fileInputRef} 
                                accept="image/*,video/*"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFile ? 'bg-green-600/20 text-green-500 border border-green-500/30' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                            >
                                {selectedFile ? <CheckCircleIcon className="w-4 h-4" /> : <PhotoManipulationIcon className="w-4 h-4" />}
                                {selectedFile ? 'Ready' : 'Choose Media'}
                            </button>
                        </div>
                        
                        <button 
                            disabled={isUploading || !selectedFile || !title}
                            onClick={handleUpload}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center gap-2 active:scale-95"
                        >
                            {isUploading ? 'Uploading...' : 'Upload Post'}
                            <SendIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Public Feed */}
            <div className="space-y-12">
                {posts.length === 0 ? (
                    <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                        <SparklesIcon className="w-16 h-16" />
                        <p className="font-black uppercase tracking-[0.4em] text-xs">No Transmissions Found</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <motion.div 
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-[#080808] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl"
                        >
                            {/* Post Header */}
                            <div className="p-6 flex items-center justify-between bg-black/20">
                                <div className="flex items-center gap-4 cursor-pointer group">
                                    <img src={post.userAvatar} className="w-11 h-11 rounded-full border border-white/10 group-hover:border-red-600 transition-colors" />
                                    <div>
                                        <p className="text-[13px] font-black text-white uppercase tracking-wider group-hover:text-red-500 transition-colors">{post.userName}</p>
                                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{new Date(post.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => copyPostLink(post.id)}
                                    className="p-3 rounded-full bg-white/5 text-zinc-500 hover:text-white transition-all border border-transparent hover:border-red-600/30"
                                >
                                    <CopyIcon className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Media Content */}
                            <div className="aspect-square bg-black flex items-center justify-center relative group overflow-hidden">
                                {post.mediaType === 'video' ? (
                                    <video 
                                        src={post.mediaUrl} 
                                        controls 
                                        className="w-full h-full object-contain"
                                        poster={siteConfig.branding.logoUrl}
                                    />
                                ) : (
                                    <img src={post.mediaUrl} className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105" />
                                )}
                                <AnimatePresence>
                                    {copyFeedback === post.id && (
                                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-10">
                                            <p className="text-red-500 font-black text-xs uppercase tracking-[0.5em] animate-pulse">Link Intercepted!</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Post Body */}
                            <div className="p-8 space-y-4">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter border-l-2 border-red-600 pl-4">{post.title}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                                    {post.caption}
                                </p>
                                {post.tags && post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="text-[9px] font-black text-red-600 uppercase bg-red-600/5 px-2.5 py-1 rounded-lg border border-red-600/10">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};