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

            const uploadRes = await fetch('https://quiet-haze-1898.fuadeditingzone.workers.dev', {
                method: 'POST',
                body: formData
            });

            const result = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(result.error || 'Upload failed');
            
            const { url } = result;
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
        } catch (err: any) {
            console.error(err);
            alert(`Protocol Error: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const copyPostLink = (postId: string, mediaUrl: string) => {
        navigator.clipboard.writeText(mediaUrl);
        setCopyFeedback(postId);
        setTimeout(() => setCopyFeedback(null), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4 space-y-12">
            {/* Create Post */}
            {isSignedIn && (
                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                    <div className="flex gap-4">
                        <img src={user.imageUrl} className="w-12 h-12 rounded-full border border-red-600/30" />
                        <div className="flex-1 space-y-4">
                            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project Name" className="w-full bg-black border border-white/5 rounded-xl p-4 text-white text-sm outline-none focus:border-red-600" />
                            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption & #tags..." className="w-full bg-black border border-white/5 rounded-xl p-4 text-white text-sm outline-none resize-none h-24 focus:border-red-600" />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-white/5 pt-6">
                        <input type="file" hidden ref={fileInputRef} accept="image/*,video/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                        <button onClick={() => fileInputRef.current?.click()} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase ${selectedFile ? 'bg-green-600/20 text-green-500' : 'bg-white/5 text-zinc-400'}`}>
                            {selectedFile ? 'Ready' : 'Choose Media'}
                        </button>
                        
                        <button disabled={isUploading || !selectedFile || !title} onClick={handleUpload} className="bg-red-600 text-white px-10 py-3 rounded-xl text-[10px] font-black uppercase shadow-xl">
                            {isUploading ? 'Syncing...' : 'Upload Post'}
                        </button>
                    </div>
                </div>
            )}

            {/* Feed */}
            <div className="space-y-12">
                {posts.map((post) => (
                    <motion.div key={post.id} className="bg-[#080808] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.location.href = `/@${post.userName}`}>
                                <img src={post.userAvatar} className="w-11 h-11 rounded-full border border-white/10" />
                                <div>
                                    <p className="text-[13px] font-black text-white uppercase">@{post.userName}</p>
                                    <p className="text-[9px] text-zinc-600 font-bold uppercase">{new Date(post.timestamp).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button onClick={() => copyPostLink(post.id, post.mediaUrl)} className="p-3 rounded-full bg-white/5 text-zinc-500 hover:text-white transition-all">
                                {copyFeedback === post.id ? <CheckCircleIcon className="w-4 h-4 text-red-600" /> : <CopyIcon className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="aspect-square bg-black flex items-center justify-center">
                            {post.mediaType === 'video' ? (
                                <video src={post.mediaUrl} controls className="w-full h-full object-contain" />
                            ) : <img src={post.mediaUrl} className="w-full h-full object-contain" />}
                        </div>

                        <div className="p-8 space-y-4">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter border-l-2 border-red-600 pl-4">{post.title}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">{post.caption}</p>
                            {post.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="text-[9px] font-black text-red-600 uppercase bg-red-600/5 px-2.5 py-1 rounded-lg">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};