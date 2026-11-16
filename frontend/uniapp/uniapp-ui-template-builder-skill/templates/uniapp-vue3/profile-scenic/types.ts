import type { PageState, ProfileAction } from '../profile-gallery/types'
export type ScenicId = 'glacier' | 'coral' | 'aurora' | 'forest' | 'cloud' | 'solid'
export interface ScenicItem extends ProfileAction { value?: string }
export interface ScenicModule { id: string; kind: 'stats' | 'banner' | 'grid' | 'list' | 'feature' | 'duo' | 'progress'; title: string; subtitle?: string; action?: ProfileAction; items?: ScenicItem[]; progress?: number; streakDays?: number }
export interface ScenicProfile { id: ScenicId; theme: string; title: string; english: string; slogan: string; description: string; nickname: string; subtitle: string; avatar: string; backgroundMode?: 'image' | 'solid-rings'; image: { backgroundSrc: string; bannerSrc?: string }; modules: ScenicModule[] }
export type { PageState, ProfileAction }
