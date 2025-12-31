import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { getDatabase, ref, push, onValue, query, limitToLast, orderByChild } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { siteConfig } from '../config';
import { PhotoManipulationIcon, VfxIcon, SendIcon, CopyIcon, PlayIcon, SparklesIcon } from './Icons';

const db = getDatabase();

interface Post {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption: string;
    timestamp: number;
}

export const ExploreFeed: React.FC = () => {
    const { user, isSignedIn } = useUser();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isUploading, setIsUploading] = useState(false);
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
        if (!user || !selectedFile || !caption.trim()) return;
        setIsUploading(true);

        try {
            // Upload to Cloudflare R2 via your Worker
            // Expecting the worker at your domain /api/upload
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('folder', 'Explore');

            const uploadRes = await fetch('https://fuadeditingzone.pages.dev/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const { url } = await uploadRes.json();

            const postData = {
                userId: user.id,
                userName: user.fullName || user.username,
                userAvatar: user.imageUrl,
                mediaUrl: url,
                mediaType: selectedFile.type.startsWith('video') ? 'video' : 'image',
                caption: caption.trim(),
                timestamp: Date.now()
            };

            await push(ref(db, 'explore_posts'), postData);
            
            // Cleanup
            setCaption('');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error(err);
            alert("Upload failed. Ensure worker is active.");
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
                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 shadow-2xl">
                    <div className="flex gap-4 mb-6">
                        <img src={user.imageUrl} className="w-12 h-12 rounded-full border border-red-600/30" />
                        <textarea 
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="What's on your mind?"
                            className="flex-1 bg-transparent text-white border-none outline-none resize-none py-2 custom-scrollbar text-sm"
                            rows={2}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
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
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFile ? 'bg-green-600/20 text-green-500 border border-green-500/30' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                            >
                                {selectedFile ? <SparklesIcon className="w-4 h-4" /> : <PhotoManipulationIcon className="w-4 h-4" />}
                                {selectedFile ? 'File Ready' : 'Add Media'}
                            </button>
                        </div>
                        
                        <button 
                            disabled={isUploading || !selectedFile || !caption}
                            onClick={handleUpload}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center gap-2"
                        >
                            {isUploading ? 'Uploading...' : 'Post'}
                            <SendIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Public Feed */}
            <div className="space-y-8">
                {posts.map((post) => (
                    <motion.div 
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#080808] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        {/* Post Header */}
                        <div className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={post.userAvatar} className="w-10 h-10 rounded-full border border-white/10" />
                                <div>
                                    <p className="text-[12px] font-black text-white uppercase tracking-wider">{post.userName}</p>
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase">{new Date(post.timestamp).toLocaleDateString()}</p>
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
                        <div className="aspect-square bg-black flex items-center justify-center relative group">
                            {post.mediaType === 'video' ? (
                                <video 
                                    src={post.mediaUrl} 
                                    controls 
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <img src={post.mediaUrl} className="w-full h-full object-contain" />
                            )}
                            <AnimatePresence>
                                {copyFeedback === post.id && (
                                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                                        <p className="text-white font-black text-xs uppercase tracking-[0.3em]">Link Copied!</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Caption Area */}
                        <div className="p-6">
                            <p className="text-zinc-300 text-sm leading-relaxed">
                                <span className="font-black text-white mr-2 uppercase tracking-tighter">{post.userName}</span>
                                {post.caption}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};