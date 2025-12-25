import React from 'react';

export interface GraphicWork {
  id: string | number;
  imageUrl: string;
  category: 'Photo Manipulation' | 'YouTube Thumbnails' | 'Banner Designs';
}

export interface VideoWork {
  id: string | number;
  url?: string;
  videoId?: string;
  thumbnailUrl?: string;
  mostViewed?: boolean;
}

export type ModalItem = GraphicWork | VideoWork;

export interface SocialLink {
  name: string;
  url:string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface Service {
  name: string;
  description: string;
  category: 'Graphic Design' | 'Video Editing';
  isMain?: boolean;
  hasBadge?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export type PortfolioTab = 'graphic' | 'vfx';
export type VfxSubTab = 'anime' | 'vfxEdits';