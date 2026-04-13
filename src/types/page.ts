import { Publication } from '@/types/publication';

export interface BasePageConfig {
    type: 'about' | 'publication' | 'card' | 'text';
    title: string;
    description?: string;
}

export interface PublicationPageConfig extends BasePageConfig {
    type: 'publication';
    source: string;
}

export interface TextPageConfig extends BasePageConfig {
    type: 'text';
    source: string;
}

export interface CardItem {
    title: string;
    subtitle?: string;
    date?: string;
    content?: string;
    tags?: string[];
    link?: string;
    image?: string;
}

export interface CardPageConfig extends BasePageConfig {
    type: 'card';
    items: CardItem[];
}

// Shared types for section and page data
export interface SectionConfig {
    id: string;
    type: 'markdown' | 'publications' | 'list';
    title?: string;
    source?: string;
    filter?: string;
    limit?: number;
    content?: string;
    publications?: Publication[];
    items?: NewsItem[];
}

export interface NewsItem {
    date: string;
    content: string;
}

export type PageData =
    | { type: 'about'; id: string; sections: SectionConfig[] }
    | { type: 'publication'; id: string; config: PublicationPageConfig; publications: Publication[] }
    | { type: 'text'; id: string; config: TextPageConfig; content: string }
    | { type: 'card'; id: string; config: CardPageConfig };
