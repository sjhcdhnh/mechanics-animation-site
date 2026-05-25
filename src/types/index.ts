export type Category = 'four-bar' | 'serial-robot' | 'aerospace' | 'engineering' | 'other';

export interface AnimationMeta {
  slug: string;
  title: string;
  subtitle: string;
  category: Category;
  tags: string[];
  mechanismType: string;
  fileName: string;
  source: 'builtin' | 'uploaded';
  uploadDate?: string;
  fileSize?: number;
  description?: string;
  author?: string;
  institution?: string;
  course?: string;
  modelDescription?: string;
  coverImage?: string;
  likes?: number;
  downloadable?: boolean;
  blobUrl?: string;
}

export interface CategoryInfo {
  slug: Category;
  label: string;
  description: string;
  icon?: string;
}

export interface UploadResult {
  success: boolean;
  slug?: string;
  error?: string;
  validationErrors?: string[];
}

export interface ExplainRequest {
  slug: string;
  question: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface PresetQuestion {
  id: string;
  text: string;
  category: Category | 'all';
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}
