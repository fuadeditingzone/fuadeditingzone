
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { getDatabase, ref, push, onValue, query, limitToLast, set, update, get, remove } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { siteConfig } from '../config';
import { PhotoManipulationIcon, SendIcon, CopyIcon, PlayIcon, SparklesIcon, CloseIcon, CheckCircleIcon, ChatBubbleIcon, EyeIcon } from './Icons';

const db = getDatabase();
const OWNER_HANDLE = 'fuadeditingzone';
const ADMIN_HANDLE = 'studiomuzammil';

interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    timestamp: number;
}

interface Post {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'text';
    title?: string;
    caption: string;
    tags: string[];
    timestamp: number;
    likes?: Record<string, boolean>;
    comments?: Record<string, Comment>;
}

export const ExploreFeed: React.FC<{ onOpenProfile?: (id: string) => void }> = ({ onOpenProfile }) => {
    const { user, isSignedIn } = useUser();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
    const [activeCommentsPost, setActiveCommentsPost] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const postsRef = query(ref(db, 'explore_posts'), limitToLast(100));
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
        if (!user || !caption.trim()) return;

        // Check 5 post limit
        const today = new Date().toISOString().split('T')[0];
        const userPostCountRef = ref(db, `post_limits/${user.id}/${today}`);
        const currentCountSnap = await get(userPostCountRef);
        const currentCount = currentCountSnap.val() || 0;

        if (currentCount >= 5) {
            alert("Transmission Limit Reached: Only 5 posts per day allowed.");
            return;
        }

        setIsUploading(true);
        let mediaUrl = "";
        let mediaType: 'image' | 'video' | 'text' = 'text';

        try {
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('folder', 'UserPosts');

                const uploadRes = await fetch('https://quiet-haze-1898.fuadeditingzone.workers.dev', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadRes.ok) throw new Error('Upload protocol failed');
                const result = await uploadRes.json();
                mediaUrl = result.url;
                mediaType = selectedFile.type.startsWith('video') ? 'video' : 'image';
            }

            const tags = caption.match(/#\w+/g) || [];
            const postData = {
                userId: user.id,
                userName: user.username || user.fullName,
                userAvatar: user.imageUrl,
                mediaUrl,
                mediaType,
                title: title.trim(),
                caption: caption.trim(),
                tags,
                timestamp: Date.now()
            };

            await push(ref(db, 'explore_posts'), postData);
            await set(userPostCountRef, currentCount + 1);
            
            setTitle('');
            setCaption('');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
            console.error(err);
            alert(`Signal Interrupt: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleLike = async (postId: string, isLiked: boolean) => {
        if (!user) return;
        const likeRef = ref(db, `explore_posts/${postId}/likes/${user.id}`);
        if (isLiked) await remove(likeRef);
        else await set(likeRef, true);
    };

    const handleComment = async (postId: string) => {
        if (!user || !newComment.trim()) return;
        const commentData = {
            userId: user.id,
            userName: user.username || user.fullName,
            userAvatar: user.imageUrl,
            text: newComment.trim(),
            timestamp: Date.now()
        };
        await push(ref(db, `explore_posts/${postId}/comments`), commentData);
        setNewComment('');
    };

    const renderCaption = (text: string) => {
        const parts = text.split(/(@\w+|#\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                const handle = part.substring(1);
                return <span key={i} onClick={() => onOpenProfile?.(handle)} className="mention-link">{part}</span>;
            } else if (part.startsWith('#')) {
                return <span key={i} className="text-red-500 font-bold">{part}</span>;
            }
            return part;
        });
    };

    const isVerified = (username: string) => username === OWNER_HANDLE || username === ADMIN_HANDLE;

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
                                placeholder="Project Title (Optional)"
                                className="w-full bg-black border border-white/5 rounded-xl p-4 text-white text-sm outline-none focus:border-red-600/50 transition-all"
                            />
                            <textarea 
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="What's happening? Use @username to mention or #hashtags..."
                                className="w-full bg-black border border-white/5 rounded-xl p-4 text-white text-sm outline-none resize-none h-24 focus:border-red-600/50 transition-all custom-scrollbar"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-white/5 pt-6">
                        <div className="flex gap-2">
                            <input type="file" hidden ref={fileInputRef} accept="image/*,video/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                            <button onClick={() => fileInputRef.current?.click()} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFile ? 'bg-green-600/20 text-green-500' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                                {selectedFile ? <CheckCircleIcon className="w-4 h-4" /> : <PhotoManipulationIcon className="w-4 h-4" />}
                                {selectedFile ? 'Ready' : 'Media'}
                            </button>
                        </div>
                        
                        <button disabled={isUploading || !caption.trim()} onClick={handleUpload} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center gap-2">
                            {isUploading ? 'Uploading...' : 'Upload Post'}
                            <SendIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Marketplace Feed</span>
                <div className="flex-1 h-px bg-white/5"></div>
            </div>

            {/* Public Feed */}
            <div className="space-y-12">
                {posts.map((post) => {
                    const postLikes = Object.keys(post.likes || {}).length;
                    const isLikedByMe = user ? !!post.likes?.[user.id] : false;
                    const commentsCount = Object.keys(post.comments || {}).length;

                    return (
                        <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#080808] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                            {/* Header */}
                            <div className="p-6 flex items-center justify-between bg-black/20">
                                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onOpenProfile?.(post.userName)}>
                                    <img src={post.userAvatar} className="w-11 h-11 rounded-full border border-white/10 group-hover:border-red-600 transition-colors" />
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-[13px] font-black text-white uppercase tracking-wider group-hover:text-red-500 transition-colors">@{post.userName}</p>
                                            {isVerified(post.userName) && (
                                                <i className={`fa-solid fa-circle-check text-[11px] ${post.userName === OWNER_HANDLE ? 'verified-badge-owner' : 'verified-badge-admin'}`}></i>
                                            )}
                                        </div>
                                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{new Date(post.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`); setCopyFeedback(post.id); setTimeout(() => setCopyFeedback(null), 2000); }} className="p-3 rounded-full bg-white/5 text-zinc-500 hover:text-white transition-all">
                                        <CopyIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Media */}
                            {post.mediaType !== 'text' && post.mediaUrl && (
                                <div className="aspect-square bg-black flex items-center justify-center relative group overflow-hidden">
                                    {post.mediaType === 'video' ? (
                                        <video src={post.mediaUrl} controls className="w-full h-full object-contain" />
                                    ) : (
                                        <img src={post.mediaUrl} className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105" />
                                    )}
                                </div>
                            )}

                            {/* Body */}
                            <div className="p-8 space-y-4">
                                {post.title && <h3 className="text-xl font-black text-white uppercase tracking-tighter border-l-2 border-red-600 pl-4">{post.title}</h3>}
                                <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                                    {renderCaption(post.caption)}
                                </p>
                                
                                {/* Social Actions */}
                                <div className="flex items-center gap-6 pt-6 border-t border-white/5">
                                    <button onClick={() => handleLike(post.id, isLikedByMe)} className={`flex items-center gap-2 transition-all ${isLikedByMe ? 'text-red-600' : 'text-zinc-500 hover:text-white'}`}>
                                        <i className={`fa-${isLikedByMe ? 'solid' : 'regular'} fa-heart text-xl`}></i>
                                        <span className="text-xs font-black">{postLikes}</span>
                                    </button>
                                    <button onClick={() => setActiveCommentsPost(activeCommentsPost === post.id ? null : post.id)} className={`flex items-center gap-2 transition-all ${activeCommentsPost === post.id ? 'text-red-500' : 'text-zinc-500 hover:text-white'}`}>
                                        <ChatBubbleIcon className="w-6 h-6" />
                                        <span className="text-xs font-black">{commentsCount}</span>
                                    </button>
                                </div>

                                {/* Comments Section */}
                                <AnimatePresence>
                                    {activeCommentsPost === post.id && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-6 space-y-6 overflow-hidden">
                                            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                                {Object.values(post.comments || {}).sort((a,b) => a.timestamp - b.timestamp).map((c) => (
                                                    <div key={c.id} className="flex gap-3">
                                                        <img src={c.userAvatar} className="w-8 h-8 rounded-full flex-shrink-0" />
                                                        <div className="bg-white/5 p-3 rounded-2xl flex-1">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <p className="text-[10px] font-black text-white uppercase">@{c.userName}</p>
                                                                {isVerified(c.userName) && (
                                                                    <i className={`fa-solid fa-circle-check text-[9px] ${c.userName === OWNER_HANDLE ? 'verified-badge-owner' : 'verified-badge-admin'}`}></i>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-zinc-400">{c.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {isSignedIn && (
                                                <div className="flex gap-2">
                                                    <input 
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        placeholder="Write a comment..."
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-red-600"
                                                    />
                                                    <button onClick={() => handleComment(post.id)} className="p-2 bg-red-600 text-white rounded-xl"><SendIcon className="w-4 h-4" /></button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
