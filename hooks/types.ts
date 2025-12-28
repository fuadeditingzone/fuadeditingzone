
import React from 'react';

export interface GraphicWork {
  id: string | number;
  imageUrl: string;
  category: 'Photo Manipulation' | 'YouTube Thumbnails' | 'Banner Designs';
  // FIX: Added title and description to support detailed item metadata used in data.ts and App.tsx
  title?: string;
  description?: string;
}

export interface VideoWork {
  id: string | number;
  url?: string;
  videoId?: string;
  thumbnailUrl?: string;
  mostViewed?: boolean;
  // FIX: Added title and description to support detailed item metadata used in data.ts and App.tsx
  title?: string;
  description?: string;
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
