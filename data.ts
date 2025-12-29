import type { GraphicWork, VideoWork, Service } from './hooks/types';

export const services: Service[] = [
    // Graphic Design Category
    { name: 'Photo Manipulation/Social Media', description: 'Creative photo edits and compelling social media post designs to grab attention and boost engagement.', category: 'Graphic Design', isMain: true, hasBadge: true },
    { name: 'YouTube Thumbnails', description: 'Click-worthy and high-quality thumbnails designed to maximize your video views and channel growth.', category: 'Graphic Design', isMain: true, hasBadge: true },
    { name: 'Logo Design & Branding', description: 'Complete branding packages including logo design, color palettes, and style guides to build a strong brand identity.', category: 'Graphic Design', isMain: true, hasBadge: true },
    { name: 'Banner Designs', description: 'Professional banners for social media profiles (YouTube/Twitter/FB), websites, and advertising campaigns.', category: 'Graphic Design', hasBadge: true },
    { name: 'Stream Packages', description: 'Custom overlays, alerts, facecam borders, and graphics for streamers on Twitch, YouTube, and Kick.', category: 'Graphic Design' },
    { name: 'Poster & Flyer Design', description: 'High-impact posters and flyers for events, promotions, or digital marketing that command attention.', category: 'Graphic Design' },
    { name: 'Social Media Kit', description: 'A complete set of matching profile pictures, covers, and post templates for a consistent online presence.', category: 'Graphic Design' },
    { name: 'Vector Tracing & Redraw', description: 'Converting low-quality images or sketches into high-quality, infinitely scalable vector graphics.', category: 'Graphic Design' },
    { name: 'Business Card & Stationery', description: 'Professional business cards, letterheads, and envelopes that leave a lasting impression on clients.', category: 'Graphic Design' },
    { name: 'UI/UX Landing Page Design', description: 'Clean and modern user interface designs for websites and landing pages focused on user experience.', category: 'Graphic Design' },
    { name: 'Merchandise Design', description: 'Creative designs for t-shirts, hoodies, and other merch tailored to your brand or personal style.', category: 'Graphic Design' },

    // Video Editing Category
    { name: 'VFX', description: 'High-end cinematic visual effects, compositing, and motion graphics that bring fantastical concepts to life.', category: 'Video Editing', isMain: true, hasBadge: true },
    { name: 'Reels Editing', description: 'Engaging and trendy short-form video editing for Instagram Reels, TikTok, and YouTube Shorts.', category: 'Video Editing', hasBadge: true },
    { name: 'AMV EDIT', description: 'Highly synchronized and stylized anime edits with complex transitions and visual effects.', category: 'Video Editing' },
    { name: 'Intros & Outros', description: 'Professional animated intros and outros to give your video content a polished and branded look.', category: 'Video Editing' },
    { name: 'Color Grading', description: 'Cinematic color correction and grading to enhance the mood and professional visual appeal of your footage.', category: 'Video Editing' },
    { name: '3D Motion Graphics', description: 'Dynamic 3D elements and animations to add depth and modern flair to your video projects.', category: 'Video Editing' },
    { name: 'Subtitles & Captions', description: 'Dynamic, accurately timed, and visually appealing subtitles to keep your audience engaged.', category: 'Video Editing' },
];

export const graphicWorks: GraphicWork[] = [
    // Photo Manipulation / Social Media Posts
    { 
        id: 1, 
        imageUrl: 'https://dl.dropboxusercontent.com/scl/fi/8whz5z17ra4evztzr8tei/7cbe5e230085811.Y3JvcCwxOTk5LDE1NjQsMCwyMTc.jpg?rlkey=te4mefjp0q9xj39dzjh77swin&raw=1', 
        category: 'Photo Manipulation',
        title: 'Cyberpunk Warrior Manipulation',
        description: 'Advanced character composition with neon lighting and high-end texture blending.'
    },
    { 
        id: 2, 
        imageUrl: 'https://dl.dropboxusercontent.com/scl/fi/p739xw6vwmuwpn6x9v2vh/557950765_122151707678645113_2255706365702883316_n.jpg?rlkey=ngt1ga9dnxos9rj52zmqp66f6&raw=1', 
        category: 'Photo Manipulation',
        title: 'Ethereal Forest Concept',
        description: 'Atmospheric photo manipulation focusing on depth of field and magical lighting effects.'
    },
    { 
        id: 3, 
        imageUrl: 'https://dl.dropboxusercontent.com/scl/fi/llmz5fjru7u9xqd1dy6es/abdb99229320593.Y3JvcCwyMDQ4LDE2MDEsMCwyMjM.jpg?rlkey=1mjr7rc57esbkyptaok9ti6sr&raw=1', 
        category: 'Photo Manipulation',
        title: 'Urban Legends Edit',
        description: 'Street-style character manipulation with gritty textures and cinematic color grading.'
    },
    { 
        id: 4, 
        imageUrl: 'https://dl.dropboxusercontent.com/scl/fi/bjyqnbbr0sqvd42n64yt1/518658030_122142975902645113_5365242024363925507_n.jpg?rlkey=l7pz1oflwh5gi53oljv6fygvq&raw=1', 
        category: 'Photo Manipulation',
        title: 'Action Sequence Composite',
        description: 'Dynamic motion-blur focused manipulation for high-impact social media content.'
    },
    { 
        id: 5, 
        imageUrl: 'https://dl.dropboxusercontent.com/scl/fi/g2q7bt4e8vhlsp23we57u/694dea229321481.Y3JvcCwxMjAwLDkzOCwwLDEzMA.jpg?rlkey=fbaguh47ao4atffhlz0ya6f5w&raw=1', 
        category: 'Photo Manipulation',
        title: 'Dark Fantasy Portrait',
        description: 'Complex portrait manipulation using advanced masking and custom light sources.'
    },
    { 
        id: 7, 
        imageUrl: 'https://www.dropbox.com/scl/fi/ot4xvfzucr57b817xsbpx/Justice-For-Osman-Hadi.jpg?rlkey=14bocvhbrbcpg7pgiim7ziv35&st=72jhupwi&raw=1', 
        category: 'Photo Manipulation',
        title: 'Justice For Osman Hadi',
        description: 'A powerful tribute manipulation dedicated to the memory of Osman Hadi.'
    },

    // YouTube Thumbnails - EXACT Video Titles for SEO
    { 
        id: 12, 
        imageUrl: 'https://dl.dropboxusercontent.com/scl/fi/0mc1y78tdg0qq2yrsm8lz/6434f9234092365.Y3JvcCwxMzgwLDEwODAsMjcwLDA.jpg?rlkey=qfhr7z9vwuquacnbcb2q5pv3u&raw=1', 
        category: 'YouTube Thumbnails',
        title: 'Anime VFX Masterclass | Edit Breakdown',
        description: 'Professional YouTube thumbnail design for: Anime VFX Masterclass'
    },

    // Banner Designs
    { 
        id: 13, 
        imageUrl: 'https://dl.dropboxusercontent.com/scl/fi/bzhrxzvxv8mpv7ldad6o4/2025-09-16-7.jpg?rlkey=chpubk19uennb7yw4xnssr90f&raw=1', 
        category: 'Banner Designs',
        title: 'Futuristic Twitch Banner | FEZ Zone',
        description: 'Modern, clean banner design for streamers with integrated social handles.'
    },
    { id: 14, imageUrl: 'https://dl.dropboxusercontent.com/scl/fi/81jlduf6n6ih32b6yfpmg/2025-09-18.jpg?rlkey=f9qgajdy0wycg2araptlpqi2r&raw=1', category: 'Banner Designs', title: 'YouTube Channel Art | FEZ Branding', description: 'Professional brand banner for high-tier content creators.' },
    { id: 15, imageUrl: 'https://dl.dropboxusercontent.com/scl/fi/m5o840ywi39vm56n2chlp/2025-09-16-8.jpg?rlkey=kjk0gt52gowqx1n52ts0t6p5m&raw=1', category: 'Banner Designs', title: 'Minimalist Branding Banner', description: 'Sleek and professional branding for social media profiles.' },
    { id: 16, imageUrl: 'https://dl.dropboxusercontent.com/scl/fi/va1p1itvxjw4y5zw2mts3/2025-09-19.jpg?rlkey=ltkx333q2wiaehqp2mrtgq4e0&raw=1', category: 'Banner Designs', title: 'Gaming Community Header', description: 'Vibrant and engaging banner for gaming teams and communities.' },
    { id: 18, imageUrl: 'https://dl.dropboxusercontent.com/scl/fi/gmjmfxpf9s8pohwhhl9bl/2025-09-16-9.jpg?rlkey=crkorp8t3wq2uhh84tiwv0r1z&raw=1', category: 'Banner Designs', title: 'Creative Artist Header', description: 'Artistic and clean banner showcasing design excellence.' },
];

export const animeEdits: VideoWork[] = [
    { id: 10, videoId: 'oAEDU-nycsE', thumbnailUrl: 'https://i.ytimg.com/vi/oAEDU-nycsE/hqdefault.jpg', mostViewed: true, title: 'Lokiverse - Legend Edit', description: 'The ultimate cinematic Lokiverse edit featuring high-octane VFX and professional grading.' },
    { id: 1, videoId: 'GiHZJkUvv6o', thumbnailUrl: 'https://i.ytimg.com/vi/GiHZJkUvv6o/hqdefault.jpg', mostViewed: true, title: 'Mortal - Legend Edit', description: 'High-energy anime edit featuring complex transitions and 2D VFX overlays.' },
    { id: 2, videoId: 'U4ge4NqBFAM', thumbnailUrl: 'https://i.ytimg.com/vi/U4ge4NqBFAM/hqdefault.jpg', mostViewed: true, title: 'Smooth Transition AMV', description: 'A seamless anime music video focusing on rhythm and flow.' },
    { id: 3, videoId: 'F-0ATxAccEI', thumbnailUrl: 'https://i.ytimg.com/vi/F-0ATxAccEI/hqdefault.jpg', mostViewed: true, title: 'Cinematic Anime Montage', description: 'Epic montage with advanced color grading and cinematic visual effects.' },
    { id: 4, videoId: '4YWUaCQkUL0', thumbnailUrl: 'https://i.ytimg.com/vi/4YWUaCQkUL0/hqdefault.jpg', title: 'Vibe Edit - Anime Music', description: 'Stylized lo-fi aesthetic anime edit with custom text animation.' },
];

export const vfxEdits: VideoWork[] = [
    { id: 101, url: 'https://dl.dropboxusercontent.com/scl/fi/04puij825k7seih7pwisl/ssstik.io_-fuadeditingzone_1761101162365-1.mp4?rlkey=bczd8sb8sze95e8qurmuzc4fc&raw=1', title: 'After Effects VFX Shot', description: 'Complex 3D tracking and object integration VFX showcase.' },
    { id: 102, url: 'https://dl.dropboxusercontent.com/scl/fi/3jkir989bp56zlg2k9uie/ssstik.io_-fuadeditingzone_1761100951741-1.mp4?rlkey=cognu1404zbja0ss0gch3qo6z&raw=1', title: 'Cinematic Compositing', description: 'Atmospheric visual effects shot with multi-layer compositing.' },
    { id: 103, url: 'https://dl.dropboxusercontent.com/scl/fi/13kcdh2keugsqmvzb4d4c/ssstik.io_-fuadeditingzone_1761101016859-1.mp4?rlkey=322uz9xfq95xqgjb9mmt3uf9w&raw=1', title: 'Motion Graphics Reel', description: 'Dynamic motion design elements for commercial and creative projects.' },
    { id: 104, url: 'https://dl.dropboxusercontent.com/scl/fi/wypkzvekmup83x8orz31r/ssstik.io_-fuadeditingzone_1761101128509-1.mp4?rlkey=xlhgik6jc0y3ph2lrrr01ue80&raw=1', title: 'Color Grading Showcase', description: 'Professional color correction and cinematic grading reel.' },
    { id: 105, url: 'https://dl.dropboxusercontent.com/scl/fi/zk5q1eehoyhawicr4gb6a/ssstik.io_-fuadeditingzone_1761139677511.mp4?rlkey=vkh5egltt3rn5ff7mv45ddxwr&raw=1', title: 'VFX Action Sequence', description: 'High-octane action sequence featuring custom particle effects and explosions.' },
];