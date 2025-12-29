import React from 'react';
import type { SocialLink, Service } from './hooks/types';
import { 
    FacebookIcon, 
    InstagramIcon, 
    BehanceIcon, 
    TikTokIcon, 
    WhatsAppIcon,
    PhotoManipulationIcon,
    ThumbnailIcon,
    VfxIcon,
    BannerIcon,
    ReelsIcon,
    LogoIcon,
    StreamPackageIcon,
    IntroOutroIcon,
    ColorGradingIcon,
    SparklesIcon,
    GlobeAltIcon,
    UserCircleIcon,
    ChatBubbleIcon,
    BriefcaseIcon,
    TextIcon
} from './components/Icons';
import { services as servicesData, graphicWorks, animeEdits, vfxEdits } from './data';

const serviceIconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    'Photo Manipulation/Social Media': PhotoManipulationIcon,
    'YouTube Thumbnails': ThumbnailIcon,
    'VFX': VfxIcon,
    'Banner Designs': BannerIcon,
    'Reels Editing': ReelsIcon,
    'Logo Design & Branding': LogoIcon,
    'Stream Packages': StreamPackageIcon,
    'Intros & Outros': IntroOutroIcon,
    'Color Grading': ColorGradingIcon,
    'Poster & Flyer Design': SparklesIcon,
    'Social Media Kit': BriefcaseIcon,
    'Vector Tracing & Redraw': TextIcon,
    'Business Card & Stationery': UserCircleIcon,
    'UI/UX Landing Page Design': GlobeAltIcon,
    'Merchandise Design': ChatBubbleIcon,
    'AMV EDIT': SparklesIcon,
    '3D Motion Graphics': VfxIcon,
    'Subtitles & Captions': TextIcon,
};

const servicesWithIcons: Service[] = servicesData.map(service => ({
    ...service,
    icon: serviceIconMap[service.name] || BriefcaseIcon,
}));

export const siteConfig = {
    branding: {
        name: "Fuad Editing Zone",
        author: "Fuad Ahmed",
        // Cloudflare R2 URLs
        logoUrl: 'https://pub-c35a446ba9db4c89b71a674f0248f02a.r2.dev/logo.png',
        profilePicUrl: 'https://pub-c35a446ba9db4c89b71a674f0248f02a.r2.dev/profile.png',
        email: 'fuadeditingzone@gmail.com',
        whatsAppNumber: '8801772723595',
        socials: [
            { name: 'Facebook', url: 'https://facebook.com/fuadeditingzone', icon: FacebookIcon },
            { name: 'Instagram', url: 'https://www.instagram.com/fuadeditingzone', icon: InstagramIcon },
            { name: 'Behance', url: 'https://behance.net/fuadeditingzone', icon: BehanceIcon },
            { name: 'TikTok', url: 'https://tiktok.com/@fuadeditingzone', icon: TikTokIcon },
            { name: 'WhatsApp', url: `https://wa.me/8801772723595`, icon: WhatsAppIcon },
        ] as SocialLink[],
        discordWebhookUrl: '',
    },
    api: {
        youtubeApiKey: 'AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY',
        channelId: 'UCFhqRIXlw0XGh3NOOvbhl6A',
        formspreeEndpoint: 'https://formspree.io/f/xvzovned'
    },
    seo: {
        title: "Fuad Editing Zone | Graphic Designer & VFX Editor | From Sylhet",
        description: "Official portfolio of Fuad Ahmed (Selected Legend). Premium FEZ VFX editing, high-impact photo manipulation, and professional design for creators globally.",
        keywords: "FEZ, Fuad Editing Zone, Selected Legend, VFX, Photo Manipulation, YouTube Thumbnails, Fuad Ahmed, fuadeditingzone"
    },
    content: {
        hero: {
            title: "Expert Photo Manipulation & VFX Editor",
        },
        about: {
            title: "Fuad Editing Zone",
            paragraph: "Fuad Editing Zone (FEZ) is a high-performance creative studio led by Fuad Ahmed. Specializing in high-octane VFX and professional graphic design since 2020."
        },
        portfolio: {
            graphicWorks,
            animeEdits,
            vfxEdits,
        },
        services: {
            all: servicesWithIcons,
        },
        introCard: {
            title: "Fuad Ahmed",
            subtitle: "Selected Legend | FEZ Artist & Designer",
            skills: ["VFX Mastery", "Graphic Design", "YouTube Thumbnail", "Photo Manipulation", "AMV EDIT", "Color Science", "Motion Graphics"],
            experience: "Over 4 years of professional experience in high-end video production and digital art at FEZ Zone. Dedicated to bringing cinematic quality to every project. Known as Selected Legend, serving clients globally via Fuad Editing Zone.",
        },
    },
};