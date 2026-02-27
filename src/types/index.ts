export interface User {
  id: string;
  email: string;
  profile?: {
    name?: string;
    bio?: string;
    website?: string;
    location?: string;
    avatar_url?: string;
  };
}

export interface Character {
  name: string;
  description: string;
  arc?: 'Protagonist' | 'Antagonist' | 'Supporting' | 'Minor';
}

export interface StoryConfig {
  // Basic info
  title?: string;
  subtitle?: string;
  storyType: 'novella' | 'novel' | 'memoir' | 'autobiography';
  packageType: 'normal' | 'premium';
  
  // Story details
  brief: string;
  genre?: string;
  characters?: Character[];
  themes?: string[];
  tone?: string;
  writingStyle?: string;
  setting?: string;
  recurringSentiments?: string;
  events?: string[];
  locations?: string[];
  targetWordCount: number;
  
  // Author info (for premium)
  authorInfo?: {
    name?: string;
    bio?: string;
    location?: string;
    website?: string;
    imageUrl?: string;
  };
  
  // Optional
  dedication?: string;
}

export interface Story {
  id: string;
  userId: string;
  config: StoryConfig;
  status: 'draft' | 'pending_payment' | 'generating' | 'completed' | 'error';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  progress?: {
    stage: string;
    current?: number;
    total?: number;
    message?: string;
    percent: number;
  };
  content?: {
    titlePage: {
      title: string;
      subtitle?: string;
      author: string;
      genre: string;
    };
    tableOfContents: Array<{
      number: number;
      title: string;
      wordCount: number;
    }>;
    backCover: string;
    chapters: Array<{
      number: number;
      title: string;
      content: string;
      wordCount: number;
    }>;
    aboutAuthor?: {
      text: string;
      imageUrl?: string;
    };
    illustrations?: Array<{
      type: 'cover' | 'chapter';
      chapter?: number;
      url: string;
      description?: string;
    }>;
  };
  pdfUrl?: string;
  epubUrl?: string;
  regenerationCount: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  completedAt?: string;
}

export interface Payment {
  id: string;
  storyId?: string;
  amount: number;
  currency: string;
  status: string;
  storyType?: string;
  packageType?: string;
  bundleType?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface Genre {
  id: string;
  name: string;
  description?: string;
  category: 'fiction' | 'non-fiction' | 'memoir' | 'all';
  isCustom: boolean;
}

export interface PricingOption {
  storyType: string;
  packageType: string;
  amount: number;
  displayAmount: string;
  features: string[];
}

export interface BundleOption {
  id: string;
  name: string;
  description: string;
  amount: number;
  displayAmount: string;
  savings: string;
  includes: string[];
}
